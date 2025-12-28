import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const GymContext = createContext();

export const useGym = () => useContext(GymContext);

export const GymProvider = ({ children }) => {
    const [members, setMembers] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [user, setUser] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchData = async () => {
        if (!user) return;

        const { data: membersData } = await supabase.from('members').select('*');
        if (membersData) setMembers(membersData);

        const { data: classesData } = await supabase.from('classes').select('*');
        if (classesData) setClasses(classesData);

        const { data: attendanceData } = await supabase.from('attendance').select('*');
        if (attendanceData) {
            // Group attendance by member_id
            const attendanceMap = {};
            attendanceData.forEach(record => {
                if (!attendanceMap[record.member_id]) {
                    attendanceMap[record.member_id] = [];
                }
                attendanceMap[record.member_id].push(record.date);
            });
            setAttendance(attendanceMap);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const addMember = async (member) => {
        const { data, error } = await supabase.from('members').insert([{
            ...member,
            join_date: new Date().toISOString(),
            profile: `https://i.pravatar.cc/150?u=${member.name + Date.now()}`
        }]).select();

        if (!error && data) {
            setMembers([...members, data[0]]);
            return data[0];
        }
        console.error("Error adding member:", error);
        return null;
    };

    const updateMember = async (id, updates) => {
        const { error } = await supabase.from('members').update(updates).eq('id', id);
        if (!error) {
            setMembers(members.map(m => m.id === id ? { ...m, ...updates } : m));
        } else {
            console.error("Error updating member:", error);
        }
    };

    const removeMember = async (id) => {
        const { error } = await supabase.from('members').delete().eq('id', id);
        if (!error) {
            setMembers(members.filter(m => m.id !== id));
            // Also update local attendance state if needed
            const newAttendance = { ...attendance };
            delete newAttendance[id];
            setAttendance(newAttendance);
        } else {
            console.error("Error removing member:", error);
        }
    };

    const markAttendance = async (id) => {
        const today = new Date().toDateString();
        const memberAttendance = attendance[id] || [];

        if (memberAttendance.includes(today)) {
            return { success: false, message: 'Already marked for today' };
        }

        const { error } = await supabase.from('attendance').insert([
            { member_id: id, date: today }
        ]);

        if (!error) {
            setAttendance({
                ...attendance,
                [id]: [...memberAttendance, today]
            });
            return { success: true, message: 'Attendance marked!' };
        } else {
            console.error("Error marking attendance:", error);
            return { success: false, message: 'Error marking attendance' };
        }
    };

    const getMemberAttendance = (id) => {
        return attendance[id] || [];
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            console.error("Login error:", error);
            return false;
        }
        return true;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const addClass = async (newClass) => {
        const { data, error } = await supabase.from('classes').insert([newClass]).select();
        if (!error && data) {
            setClasses([...classes, data[0]]);
            return data[0];
        } else {
            console.error("Error adding class:", error);
            return null;
        }
    };

    const removeClass = async (id) => {
        const { error } = await supabase.from('classes').delete().eq('id', id);
        if (!error) {
            setClasses(classes.filter(c => c.id !== id));
        } else {
            console.error("Error removing class:", error);
        }
    };

    return (
        <GymContext.Provider value={{
            members,
            attendance,
            addMember,
            updateMember,
            removeMember,
            markAttendance,
            getMemberAttendance,
            user,
            loading,
            classes,
            login,
            logout,
            addClass,
            removeClass
        }}>
            {children}
        </GymContext.Provider>
    );
};

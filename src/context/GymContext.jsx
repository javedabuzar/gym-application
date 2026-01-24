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

    // Core Settings
    const [baseGymFee, setBaseGymFee] = useState(3000); // Base Monthly Membership (PKR)

    // New System Settings (Mock Database)
    const [supplementSettings, setSupplementSettings] = useState({
        creatine: { price: 100, isAuto: true },
        whey: { price: 300, isAuto: true },
        preworkout: { price: 200, isAuto: true }
    });

    const [cardioSettings, setCardioSettings] = useState({
        weeklyPrice: 1000,
        monthlyPrice: 3000,
        unlimitedMultiplier: 1.5, // 50% extra for unlimited
        manualOverride: false
    });

    const [ptSettings, setPtSettings] = useState({
        rates: {
            one_month: 20000,
            six_months: 100000,
            one_year: 180000
        }
    });

    // Subscriptions State (Mock Database)
    const [cardioSubscriptions, setCardioSubscriptions] = useState({});
    const [ptSubscriptions, setPtSubscriptions] = useState({});

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

        let { data: membersData } = await supabase.from('members').select('*');

        if (membersData) {
            // Check for monthly reset
            const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
            const lastReset = localStorage.getItem('gym_last_reset');

            if (lastReset !== currentMonth) {
                console.log("New month detected. Resetting payment status...");

                // Reset all 'Paid' members to 'Unpaid'
                const updates = membersData.map(async (member) => {
                    if (member.payment === 'Paid') {
                        const { error } = await supabase
                            .from('members')
                            .update({ payment: 'Unpaid' })
                            .eq('id', member.id);

                        if (!error) {
                            return { ...member, payment: 'Unpaid' };
                        }
                    }
                    return member;
                });

                // Wait for all updates to complete
                membersData = await Promise.all(updates);

                // Update local storage
                localStorage.setItem('gym_last_reset', currentMonth);
            }

            setMembers(membersData);
        }

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

        // --- NEW: Load Settings from Supabase ---
        const { data: settingsData } = await supabase.from('gym_settings').select('*');
        if (settingsData) {
            settingsData.forEach(setting => {
                if (setting.category === 'supplement') setSupplementSettings(setting.settings);
                if (setting.category === 'cardio') setCardioSettings(setting.settings);
                if (setting.category === 'pt') setPtSettings(setting.settings);
            });
        }

        // --- NEW: Load Cardio Subscriptions ---
        const { data: cardioData } = await supabase.from('cardio_subscriptions').select('*').eq('status', 'Active');
        if (cardioData) {
            const cardioMap = {};
            cardioData.forEach(sub => {
                cardioMap[sub.member_id] = {
                    duration: sub.duration,
                    type: sub.type,
                    price: sub.price,
                    active: sub.status === 'Active',
                    startDate: sub.start_date
                };
            });
            setCardioSubscriptions(cardioMap);
        }

        // --- NEW: Load PT Subscriptions ---
        const { data: ptData } = await supabase.from('training_plans').select('*').eq('status', 'Active');
        if (ptData) {
            const ptMap = {};
            ptData.forEach(plan => {
                ptMap[plan.member_id] = {
                    duration: plan.plan_type,
                    price: plan.price,
                    active: plan.status === 'Active',
                    startDate: new Date(plan.start_date || plan.created_at).toLocaleDateString()
                };
            });
            setPtSubscriptions(ptMap);
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
        // Optimistic update for UI responsiveness
        setMembers(members.map(m => m.id === id ? { ...m, ...updates } : m));

        const { error } = await supabase.from('members').update(updates).eq('id', id);
        if (error) {
            console.error("Error updating member:", error);
            // Optionally revert here if strictly needed, but for 'extra' fields not in DB, we keep them locally
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

    const unmarkAttendance = async (id) => {
        const today = new Date().toDateString();
        const memberAttendance = attendance[id] || [];

        if (!memberAttendance.includes(today)) {
            return { success: false, message: 'Not marked for today' };
        }

        const { error } = await supabase.from('attendance')
            .delete()
            .eq('member_id', id)
            .eq('date', today);

        if (!error) {
            setAttendance({
                ...attendance,
                [id]: memberAttendance.filter(date => date !== today)
            });
            return { success: true, message: 'Attendance unmarked!' };
        } else {
            console.error("Error unmarking attendance:", error);
            return { success: false, message: 'Error unmarking attendance' };
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

    // --- Persistence Helpers ---

    const saveSettings = async (category, newSettings) => {
        // Optimistic Update
        if (category === 'supplement') setSupplementSettings(newSettings);
        if (category === 'cardio') setCardioSettings(newSettings);
        if (category === 'pt') setPtSettings(newSettings);

        // Save to Supabase
        const { error } = await supabase.from('gym_settings').upsert(
            { category, settings: newSettings },
            { onConflict: 'category' }
        );

        if (error) {
            console.error(`Error saving ${category} settings:`, error);
        }
    };

    const assignCardioPlan = async (memberId, plan) => {
        // Optimistic Update
        setCardioSubscriptions(prev => ({
            ...prev,
            [memberId]: plan
        }));

        // Save to Supabase
        const { error } = await supabase.from('cardio_subscriptions').insert({
            member_id: memberId,
            duration: plan.duration,
            type: plan.type,
            price: plan.price,
            start_date: new Date().toISOString(),
            status: 'Active'
        });

        if (error) console.error("Error assigning cardio plan:", error);
    };

    const assignPtPlan = async (memberId, plan) => {
        // Optimistic Update
        setPtSubscriptions(prev => ({
            ...prev,
            [memberId]: plan
        }));

        // Save to Supabase (training_plans table)
        const { error } = await supabase.from('training_plans').insert({
            member_id: memberId,
            plan_name: 'Personal Training',
            plan_type: plan.duration,
            trainer_name: 'Assigned Trainer', // Default or pass in
            price: plan.price,
            start_date: new Date().toISOString(),
            status: 'Active'
        });

        if (error) console.error("Error assigning PT plan:", error);
    };

    return (
        <GymContext.Provider value={{
            members,
            attendance,
            addMember,
            updateMember,
            removeMember,
            markAttendance,
            unmarkAttendance, // NEW
            getMemberAttendance,
            user,
            loading,
            classes,
            login,
            logout,
            addClass,
            removeClass,
            baseGymFee, setBaseGymFee,
            supplementSettings,
            setSupplementSettings: (val) => saveSettings('supplement', val),
            cardioSettings,
            setCardioSettings: (val) => saveSettings('cardio', val),
            ptSettings,
            setPtSettings: (val) => saveSettings('pt', val),
            cardioSubscriptions,
            setCardioSubscriptions, // Keep original for now or remove if unused externally
            assignCardioPlan, // NEW exposed function
            ptSubscriptions,
            setPtSubscriptions, // Keep original for now
            assignPtPlan // NEW exposed function
        }}>
            {children}
        </GymContext.Provider>
    );
};

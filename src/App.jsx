import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Schedule from './pages/Schedule';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Landing from './pages/Landing';
import PendingApproval from './pages/PendingApproval';
import AttendanceQR from './pages/AttendanceQR';
import Supplements from './pages/Supplements';
import Cardio from './pages/Cardio';
import PersonalTraining from './pages/PersonalTraining';
import TrainingPlan from './pages/TrainingPlan';
import Invoice from './pages/Invoice';
import MemberStatus from './pages/MemberStatus';
import PaymentStatus from './pages/PaymentStatus';
import { useGym } from './context/GymContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading, adminStatusLoading, isAdminApproved } = useGym();
    if (loading || adminStatusLoading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    }
    if (!user) return <Navigate to="/login" />;
    if (!isAdminApproved) return <Navigate to="/pending-approval" />;
    return children;
};

const AuthOnlyRoute = ({ children }) => {
    const { user, loading, adminStatusLoading, isAdminApproved } = useGym();
    if (loading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    }
    if (adminStatusLoading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    }
    if (!user) return <Navigate to="/login" />;
    if (isAdminApproved) return <Navigate to="/app" />;
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/pending-approval" element={<AuthOnlyRoute><PendingApproval /></AuthOnlyRoute>} />
                <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="members" element={<Members />} />
                    <Route path="schedule" element={<Schedule />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="scan" element={<AttendanceQR />} />
                    <Route path="supplements" element={<Supplements />} />
                    <Route path="cardio" element={<Cardio />} />
                    <Route path="training" element={<PersonalTraining />} />
                    <Route path="plans" element={<TrainingPlan />} />
                    <Route path="invoice" element={<Invoice />} />
                    <Route path="status" element={<MemberStatus />} />
                    <Route path="payment" element={<PaymentStatus />} />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

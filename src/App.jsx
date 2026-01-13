import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Schedule from './pages/Schedule';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import AttendanceQR from './pages/AttendanceQR';
import Creatine from './pages/Creatine';
import Cardio from './pages/Cardio';
import PersonalTraining from './pages/PersonalTraining';
import TrainingPlan from './pages/TrainingPlan';
import { useGym } from './context/GymContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useGym();
    if (!user) return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="members" element={<Members />} />
                    <Route path="schedule" element={<Schedule />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="scan" element={<AttendanceQR />} />
                    <Route path="creatine" element={<Creatine />} />
                    <Route path="cardio" element={<Cardio />} />
                    <Route path="training" element={<PersonalTraining />} />
                    <Route path="plans" element={<TrainingPlan />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

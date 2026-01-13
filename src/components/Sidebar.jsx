import React from 'react';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, FileText, QrCode, FlaskConical, Bike, Dumbbell, Notebook } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGym } from '../context/GymContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useGym();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Members', path: '/members' },
        { icon: Calendar, label: 'Schedule', path: '/schedule' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: QrCode, label: 'QR Scan', path: '/scan' },
        { icon: FlaskConical, label: 'Creatine', path: '/creatine' },
        { icon: Bike, label: 'Cardio', path: '/cardio' },
        { icon: Dumbbell, label: 'Training', path: '/training' },
        { icon: Notebook, label: 'Plans', path: '/plans' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-screen w-64 bg-[#1a1a1a] border-r border-white/10 flex flex-col p-6 fixed left-0 top-0">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 bg-gym-neon rounded-lg shadow-[0_0_10px_#39ff14]"></div>
                <h1 className="text-2xl font-bold text-white tracking-wider">GYM<span className="text-gym-neon">PRO</span></h1>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-gym-neon/10 text-gym-neon shadow-[0_0_15px_rgba(57,255,20,0.1)]'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'drop-shadow-[0_0_5px_#39ff14]' : ''} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-6 border-t border-white/10 space-y-2">
                <Link to="/settings" className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    <Settings size={20} />
                    <span className="font-medium">Settings</span>
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

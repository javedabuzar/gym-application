import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGym } from '../context/GymContext';

const PendingApproval = () => {
    const navigate = useNavigate();
    const { adminAccount, logout, refreshAdminAccount } = useGym();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-black/70 text-white flex items-center justify-center px-4">
            <div className="w-full max-w-xl bg-gym-card border border-white/10 rounded-2xl p-8">
                <h1 className="text-3xl font-bold mb-2">Approval Pending</h1>
                <p className="text-gray-400 mb-6">
                    Your account exists, but access is blocked until payment is approved by super admin.
                </p>

                <div className="space-y-2 text-sm bg-black/20 rounded-xl p-4 border border-white/10">
                    <div>Email: <span className="text-gym-neon">{adminAccount?.email || 'N/A'}</span></div>
                    <div>Plan: <span className="text-gym-neon capitalize">{(adminAccount?.plan_type || 'N/A').replace('_', ' ')}</span></div>
                    <div>Payment: <span className="text-yellow-400 capitalize">{adminAccount?.payment_status || 'pending'}</span></div>
                    <div>Approval: <span className="text-yellow-400 capitalize">{adminAccount?.approval_status || 'pending'}</span></div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={refreshAdminAccount}
                        className="bg-gym-neon text-black py-3 rounded-xl font-bold hover:bg-[#2ecc11]"
                    >
                        Refresh Status
                    </button>
                    <button
                        onClick={handleLogout}
                        className="border border-white/10 py-3 rounded-xl font-semibold hover:bg-white/5"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;

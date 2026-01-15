import React, { useState, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { Settings, Bike, Timer, Zap, CheckCircle, Save } from 'lucide-react';

const Cardio = () => {
    const { members, cardioSettings, setCardioSettings, cardioSubscriptions, setCardioSubscriptions } = useGym();
    const [showSettings, setShowSettings] = useState(false);

    // Local state for settings
    const [localSettings, setLocalSettings] = useState({ ...cardioSettings });

    useEffect(() => {
        setLocalSettings(cardioSettings);
    }, [cardioSettings]);

    const handleSaveSettings = () => {
        setCardioSettings(localSettings);
        alert("Settings Saved Successfully!");
        setShowSettings(false);
    };

    // Calculator State - Locked to Monthly Unlimited
    const [calculator] = useState({
        duration: 'Monthly',
        type: 'Unlimited'
    });

    const calculatePrice = () => {
        // Price is Monthly Base * Unlimited Multiplier
        return (localSettings.monthlyPrice * localSettings.unlimitedMultiplier).toFixed(2);
    };

    const handleSubscribe = (memberId) => {
        const price = calculatePrice();
        setCardioSubscriptions(prev => ({
            ...prev,
            [memberId]: {
                duration: 'Monthly',
                type: 'Unlimited',
                price: price,
                active: true,
                startDate: new Date().toLocaleDateString()
            }
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bike className="text-gym-neon" size={32} />
                        Cardio Membership
                    </h2>
                    <p className="text-gray-400 mt-1">Manage cardio machine access and subscriptions</p>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 ${showSettings ? 'bg-gym-neon text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
                >
                    <Settings size={20} />
                    Admin Settings
                </button>
            </div>

            {/* Admin Settings */}
            {showSettings && (
                <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 animate-fadeIn">
                    <h3 className="text-xl font-bold text-white mb-4">Pricing Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">Monthly Base Price (PKR)</label>
                            <input
                                type="number"
                                value={localSettings.monthlyPrice}
                                onChange={(e) => setLocalSettings(prev => ({ ...prev, monthlyPrice: parseFloat(e.target.value) }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">Unlimited Multiplier (x)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={localSettings.unlimitedMultiplier}
                                onChange={(e) => setLocalSettings(prev => ({ ...prev, unlimitedMultiplier: parseFloat(e.target.value) }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSaveSettings}
                            className="bg-gym-neon text-black px-6 py-2 rounded-xl font-bold hover:bg-[#2ecc11] transition-colors shadow-[0_0_15px_rgba(57,255,20,0.3)] flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Calculator / Plan Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="text-gym-neon" />
                        Plan Details
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-black/30 p-4 rounded-xl flex justify-between items-center">
                            <span className="text-gray-400">Duration</span>
                            <span className="font-bold text-white">Monthly</span>
                        </div>
                        <div className="bg-black/30 p-4 rounded-xl flex justify-between items-center">
                            <span className="text-gray-400">Access Type</span>
                            <span className="font-bold text-gym-neon">Unlimited</span>
                        </div>
                        <div className="pt-4 border-t border-white/10 text-center">
                            <p className="text-gray-400 text-sm">Total Price</p>
                            <div className="text-4xl font-bold text-white mt-1">
                                Rs. {calculatePrice()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-gym-neon/10 rounded-full flex items-center justify-center text-gym-neon mb-2">
                        <Timer size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Monthly Unlimited</h3>
                    <p className="text-gray-400 max-w-xs">
                        Full access to all cardio equipment with no time restrictions.
                        Valid for 30 days from sign-up.
                    </p>
                </div>
            </div>

            {/* Member Management Table */}
            <div className="bg-gym-card backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-xl font-bold text-white">Active Subscriptions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-gray-400 text-sm">
                                <th className="px-6 py-4 font-medium">Member</th>
                                <th className="px-6 py-4 font-medium">Current Plan</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Start Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {members.map((member) => {
                                const sub = cardioSubscriptions[member.id];
                                return (
                                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={member.profile} alt={member.name} className="w-10 h-10 rounded-full bg-white/10" />
                                                <span className="text-white font-medium">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub ? (
                                                <span className="bg-gym-neon/10 text-gym-neon px-3 py-1 rounded-full text-xs font-bold border border-gym-neon/20">
                                                    {sub.duration}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 text-sm italic">No Plan</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub ? (
                                                <span className="text-white text-sm">{sub.type}</span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {sub ? sub.startDate : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {sub ? (
                                                <div className="flex items-center justify-end gap-2 text-green-400 font-bold text-sm">
                                                    <CheckCircle size={16} /> Active
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleSubscribe(member.id)}
                                                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    Assign Plan
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Cardio;

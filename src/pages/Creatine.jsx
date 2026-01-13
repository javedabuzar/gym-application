import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Settings, Calculator, DollarSign, Save, FlaskConical } from 'lucide-react';

const Creatine = () => {
    const { members, creatineSettings, setCreatineSettings } = useGym();
    const [showSettings, setShowSettings] = useState(false);

    // Local state to track member specific creatine data (mocking DB)
    const [memberData, setMemberData] = useState({});

    // Plan definitions
    const PLANS = {
        Basic: { grams: 3, name: 'Basic' },
        Standard: { grams: 5, name: 'Standard' },
        Premium: { grams: 10, name: 'Premium' }
    };

    const handlePlanChange = (memberId, planName) => {
        const plan = PLANS[planName];
        setMemberData(prev => ({
            ...prev,
            [memberId]: {
                ...prev[memberId],
                plan: planName,
                dailyGrams: plan.grams,
                // If auto, cost is calculated in render. If manual, we might want to initialize it.
                customCost: prev[memberId]?.customCost || 0
            }
        }));
    };

    const handleManualChange = (memberId, field, value) => {
        setMemberData(prev => ({
            ...prev,
            [memberId]: {
                ...prev[memberId],
                [field]: value
            }
        }));
    };

    const calculateCost = (memberId) => {
        const data = memberData[memberId];
        if (!data) return 0;

        if (!creatineSettings.isAuto) {
            return data.customCost || 0;
        }

        // Auto Formula: Daily Grams * 30 days * Price/Gram
        const grams = data.dailyGrams || 0;
        return (grams * 30 * creatineSettings.pricePerGram).toFixed(2);
    };

    const getMonthlyUsage = (memberId) => {
        const data = memberData[memberId];
        if (!data) return 0;
        return (data.dailyGrams || 0) * 30;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FlaskConical className="text-gym-neon" size={32} />
                        Creatine System
                    </h2>
                    <p className="text-gray-400 mt-1">Manage creatine distribution and billing</p>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 ${showSettings ? 'bg-gym-neon text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
                >
                    <Settings size={20} />
                    Admin Settings
                </button>
            </div>

            {/* Admin Settings Panel */}
            {showSettings && (
                <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 animate-fadeIn">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Calculator size={20} className="text-gym-neon" />
                        Cost Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">Calculation Mode</label>
                            <div className="flex bg-white/5 p-1 rounded-xl">
                                <button
                                    onClick={() => setCreatineSettings(prev => ({ ...prev, isAuto: true }))}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${creatineSettings.isAuto ? 'bg-gym-neon text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Automatic
                                </button>
                                <button
                                    onClick={() => setCreatineSettings(prev => ({ ...prev, isAuto: false }))}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!creatineSettings.isAuto ? 'bg-gym-neon text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Manual
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">Price per Gram ($)</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="number"
                                    value={creatineSettings.pricePerGram}
                                    onChange={(e) => setCreatineSettings(prev => ({ ...prev, pricePerGram: parseFloat(e.target.value) }))}
                                    disabled={!creatineSettings.isAuto}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-gym-neon focus:outline-none disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>
                    {!creatineSettings.isAuto && (
                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-200 text-sm">
                            ⚠️ Manual Mode Active: You must set the price manually for each member.
                        </div>
                    )}
                </div>
            )}

            {/* Members Table */}
            <div className="bg-gym-card backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-gray-400 text-sm">
                                <th className="px-6 py-4 font-medium">Member</th>
                                <th className="px-6 py-4 font-medium">Plan (Scope)</th>
                                <th className="px-6 py-4 font-medium">Daily (g)</th>
                                <th className="px-6 py-4 font-medium">Monthly (g)</th>
                                <th className="px-6 py-4 font-medium">Monthly Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {members.map((member) => {
                                const mData = memberData[member.id] || { dailyGrams: 0, plan: '' };
                                const cost = calculateCost(member.id);

                                return (
                                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={member.profile} alt={member.name} className="w-10 h-10 rounded-full bg-white/10" />
                                                <span className="text-white font-medium">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={mData.plan}
                                                onChange={(e) => handlePlanChange(member.id, e.target.value)}
                                                className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:border-gym-neon focus:outline-none"
                                            >
                                                <option value="">Select Plan</option>
                                                {Object.keys(PLANS).map(plan => (
                                                    <option key={plan} value={plan}>{plan}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            {creatineSettings.isAuto ? (
                                                <span className="text-gray-300 font-mono">{mData.dailyGrams}g</span>
                                            ) : (
                                                <input
                                                    type="number"
                                                    value={mData.dailyGrams || 0}
                                                    onChange={(e) => handleManualChange(member.id, 'dailyGrams', parseFloat(e.target.value))}
                                                    className="w-20 bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white text-sm"
                                                />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 font-mono">
                                            {getMonthlyUsage(member.id)}g
                                        </td>
                                        <td className="px-6 py-4">
                                            {creatineSettings.isAuto ? (
                                                <span className="text-gym-neon font-bold text-lg">${cost}</span>
                                            ) : (
                                                <div className="relative w-24">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                                    <input
                                                        type="number"
                                                        value={mData.customCost || 0}
                                                        onChange={(e) => handleManualChange(member.id, 'customCost', parseFloat(e.target.value))}
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg pl-5 pr-2 py-1 text-gym-neon font-bold text-sm focus:border-gym-neon outline-none"
                                                    />
                                                </div>
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

export default Creatine;

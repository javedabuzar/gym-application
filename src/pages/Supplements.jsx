import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { FlaskConical, Calculator, Save, Settings, Users } from 'lucide-react';

const Supplements = () => {
    const { members, updateMember, supplementSettings, setSupplementSettings } = useGym();
    const [showSettings, setShowSettings] = useState(false);
    const [activeTab, setActiveTab] = useState('creatine'); // creatine, whey, preworkout

    // Local state for settings to allow "Save" action
    const [localSettings, setLocalSettings] = useState({ ...supplementSettings });

    // Sync local state when context changes
    React.useEffect(() => {
        setLocalSettings(supplementSettings);
    }, [supplementSettings]);

    const handleSaveSettings = () => {
        setSupplementSettings(localSettings);
        alert("Settings Saved Successfully!");
        setShowSettings(false);
    };

    const handleUpdateMember = (id, field, value) => {
        // Dynamic field update based on active tab
        // Fields: scoops_creatine, scoops_whey, scoops_preworkout
        // Fields: cost_creatine, cost_whey, cost_preworkout
        const key = `${field}_${activeTab}`;
        updateMember(id, { ...members.find(m => m.id === id), [key]: value });
    };

    const calculateCost = (memberId) => {
        const member = members.find(m => m.id === memberId);
        if (!member) return 0;

        const currentSettings = supplementSettings[activeTab];
        if (!currentSettings.isAuto) {
            return member[`cost_${activeTab}`] || 0;
        }

        const scoops = member[`scoops_${activeTab}`] || 0;
        return (scoops * currentSettings.price).toFixed(0);
    };

    const tabs = [
        { id: 'creatine', label: 'Creatine', icon: FlaskConical },
        { id: 'whey', label: 'Whey Protein', icon: Users }, // Using generic icon
        { id: 'preworkout', label: 'Pre-Workout', icon: Calculator } // Using generic icon
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FlaskConical className="text-gym-neon" size={32} />
                        Supplements Management
                    </h2>
                    <p className="text-gray-400 mt-1">Track usage and calculate monthly billing</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 ${showSettings ? 'bg-gym-neon text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
                    >
                        <Settings size={20} />
                        Admin Settings
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 bg-white/5 p-1 rounded-xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-gym-neon text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Admin Settings Panel */}
            {showSettings && (
                <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Configuration: {tabs.find(t => t.id === activeTab)?.label}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">Calculation Mode</label>
                            <div className="flex bg-black/30 p-1 rounded-xl">
                                <button
                                    onClick={() => setLocalSettings(prev => ({
                                        ...prev,
                                        [activeTab]: { ...prev[activeTab], isAuto: true }
                                    }))}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${localSettings[activeTab].isAuto ? 'bg-gym-neon text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Auto (Formula)
                                </button>
                                <button
                                    onClick={() => setLocalSettings(prev => ({
                                        ...prev,
                                        [activeTab]: { ...prev[activeTab], isAuto: false }
                                    }))}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!localSettings[activeTab].isAuto ? 'bg-gym-neon text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Manual (Fixed)
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">Price per Scoop (PKR)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rs.</span>
                                <input
                                    type="number"
                                    value={localSettings[activeTab].price}
                                    onChange={(e) => setLocalSettings(prev => ({
                                        ...prev,
                                        [activeTab]: { ...prev[activeTab], price: parseFloat(e.target.value) }
                                    }))}
                                    disabled={!localSettings[activeTab].isAuto}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-gym-neon focus:outline-none disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSaveSettings}
                            className="bg-gym-neon text-black px-6 py-2 rounded-xl font-bold hover:bg-[#2ecc11] transition-colors shadow-[0_0_15px_rgba(57,255,20,0.3)] flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save {tabs.find(t => t.id === activeTab)?.label} Settings
                        </button>
                    </div>
                </div>
            )}

            {/* Members List */}
            <div className="bg-gym-card backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users size={20} className="text-gym-neon" />
                        Member Usage ({tabs.find(t => t.id === activeTab)?.label})
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-gray-400 text-sm">
                                <th className="px-6 py-4 font-medium">Member</th>
                                <th className="px-6 py-4 font-medium">Total Scoops</th>
                                <th className="px-6 py-4 font-medium">Total Usage</th>
                                <th className="px-6 py-4 font-medium">Total Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{member.name}</div>
                                        <div className="text-xs text-gray-500">{member.status}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleUpdateMember(member.id, 'scoops', Math.max(0, (member[`scoops_${activeTab}`] || 0) - 1))}
                                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-white font-bold text-lg">{member[`scoops_${activeTab}`] || 0}</span>
                                            <button
                                                onClick={() => handleUpdateMember(member.id, 'scoops', (member[`scoops_${activeTab}`] || 0) + 1)}
                                                className="w-8 h-8 rounded-lg bg-gym-neon hover:bg-[#2ecc11] text-black flex items-center justify-center font-bold shadow-[0_0_10px_rgba(57,255,20,0.2)]"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <div className="text-gray-400">Total Usage: <span className="text-white font-bold">{member[`scoops_${activeTab}`] || 0} scoops</span></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {supplementSettings[activeTab].isAuto ? (
                                            <span className="text-gym-neon font-bold text-lg">Rs. {calculateCost(member.id)}</span>
                                        ) : (
                                            <div className="relative w-28">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Rs.</span>
                                                <input
                                                    type="number"
                                                    value={member[`cost_${activeTab}`] || 0}
                                                    onChange={(e) => handleUpdateMember(member.id, 'cost', parseFloat(e.target.value))}
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg pl-8 pr-2 py-1 text-gym-neon font-bold text-sm focus:border-gym-neon outline-none"
                                                />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Supplements;

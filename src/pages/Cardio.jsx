import React, { useState, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { Settings, Bike, Timer, Zap, CheckCircle, Save, Plus, X, Calendar, DollarSign } from 'lucide-react';

const Cardio = () => {
    const { members, cardioSettings, setCardioSettings, cardioSubscriptions, setCardioSubscriptions } = useGym();
    
    const [showSettings, setShowSettings] = useState(false);
    const [showAddPlan, setShowAddPlan] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    
    // Local settings state
    const [localSettings, setLocalSettings] = useState({
        weeklyPrice: cardioSettings?.weeklyPrice || 1000,
        monthlyPrice: cardioSettings?.monthlyPrice || 3000,
        unlimitedMultiplier: cardioSettings?.unlimitedMultiplier || 1.5,
        manualOverride: cardioSettings?.manualOverride || false
    });

    // New plan state
    const [newPlan, setNewPlan] = useState({
        duration: 'Monthly',
        type: 'Unlimited',
        customPrice: null
    });

    useEffect(() => {
        if (cardioSettings) {
            setLocalSettings({
                weeklyPrice: cardioSettings.weeklyPrice || 1000,
                monthlyPrice: cardioSettings.monthlyPrice || 3000,
                unlimitedMultiplier: cardioSettings.unlimitedMultiplier || 1.5,
                manualOverride: cardioSettings.manualOverride || false
            });
        }
    }, [cardioSettings]);

    const calculatePrice = (duration = newPlan.duration, type = newPlan.type) => {
        if (newPlan.customPrice) return newPlan.customPrice;
        
        const basePrice = duration === 'Weekly' ? localSettings.weeklyPrice : localSettings.monthlyPrice;
        return type === 'Unlimited' ? Math.round(basePrice * localSettings.unlimitedMultiplier) : basePrice;
    };

    const handleSaveSettings = () => {
        setCardioSettings(localSettings);
        setShowSettings(false);
    };

    const handleSubscribe = (memberId) => {
        const price = calculatePrice();
        const startDate = new Date();
        const endDate = new Date();
        
        if (newPlan.duration === 'Weekly') {
            endDate.setDate(startDate.getDate() + 7);
        } else {
            endDate.setMonth(startDate.getMonth() + 1);
        }

        const plan = {
            id: Date.now(),
            memberId: memberId,
            duration: newPlan.duration,
            type: newPlan.type,
            price: price,
            startDate: startDate.toLocaleDateString(),
            endDate: endDate.toLocaleDateString(),
            active: true,
            createdAt: new Date().toISOString()
        };

        setCardioSubscriptions(prev => ({
            ...prev,
            [memberId]: plan
        }));

        setShowAddPlan(false);
        setSelectedMember(null);
        setNewPlan({
            duration: 'Monthly',
            type: 'Unlimited',
            customPrice: null
        });
    };

    const handleRemoveSubscription = (memberId) => {
        setCardioSubscriptions(prev => {
            const updated = { ...prev };
            delete updated[memberId];
            return updated;
        });
    };

    const openAddPlan = (member) => {
        setSelectedMember(member);
        setShowAddPlan(true);
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">Weekly Price (PKR)</label>
                            <input
                                type="number"
                                value={localSettings.weeklyPrice}
                                onChange={(e) => setLocalSettings(prev => ({ ...prev, weeklyPrice: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">Monthly Price (PKR)</label>
                            <input
                                type="number"
                                value={localSettings.monthlyPrice}
                                onChange={(e) => setLocalSettings(prev => ({ ...prev, monthlyPrice: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">Unlimited Multiplier (x)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={localSettings.unlimitedMultiplier}
                                onChange={(e) => setLocalSettings(prev => ({ ...prev, unlimitedMultiplier: parseFloat(e.target.value) || 1 }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="manualOverride"
                            checked={localSettings.manualOverride}
                            onChange={(e) => setLocalSettings(prev => ({ ...prev, manualOverride: e.target.checked }))}
                            className="w-4 h-4 text-gym-neon bg-white/5 border-white/10 rounded focus:ring-gym-neon"
                        />
                        <label htmlFor="manualOverride" className="text-gray-400 text-sm">
                            Allow manual price override
                        </label>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={() => setShowSettings(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
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

            {/* Add Plan Modal */}
            {showAddPlan && selectedMember && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Add Cardio Plan</h3>
                            <button
                                onClick={() => setShowAddPlan(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="text-center p-4 bg-white/5 rounded-xl">
                                <img 
                                    src={selectedMember.profile || `https://i.pravatar.cc/150?u=${selectedMember.name}`} 
                                    alt={selectedMember.name} 
                                    className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                                />
                                <h4 className="text-white font-bold">{selectedMember.name}</h4>
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm">Duration</label>
                                <select
                                    value={newPlan.duration}
                                    onChange={(e) => setNewPlan(prev => ({ ...prev, duration: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                                >
                                    <option value="Weekly" className="bg-gray-800">Weekly (7 days)</option>
                                    <option value="Monthly" className="bg-gray-800">Monthly (30 days)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm">Access Type</label>
                                <select
                                    value={newPlan.type}
                                    onChange={(e) => setNewPlan(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                                >
                                    <option value="Standard" className="bg-gray-800">Standard Access</option>
                                    <option value="Unlimited" className="bg-gray-800">Unlimited Access</option>
                                </select>
                            </div>

                            {localSettings.manualOverride && (
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm">Custom Price (Optional)</label>
                                    <input
                                        type="number"
                                        placeholder="Leave empty for auto-calculation"
                                        value={newPlan.customPrice || ''}
                                        onChange={(e) => setNewPlan(prev => ({ ...prev, customPrice: e.target.value ? parseFloat(e.target.value) : null }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                                    />
                                </div>
                            )}

                            <div className="bg-black/30 p-4 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Total Price:</span>
                                    <span className="text-2xl font-bold text-gym-neon">
                                        Rs. {calculatePrice()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowAddPlan(false)}
                                className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSubscribe(selectedMember.id)}
                                className="flex-1 bg-gym-neon text-black px-6 py-2 rounded-xl font-bold hover:bg-[#2ecc11] transition-colors"
                            >
                                Add Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Calculator / Plan Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Timer className="text-gym-neon" />
                        Weekly Plan
                    </h3>
                    <div className="space-y-3">
                        <div className="bg-black/30 p-3 rounded-xl flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Duration</span>
                            <span className="font-bold text-white">7 Days</span>
                        </div>
                        <div className="bg-black/30 p-3 rounded-xl flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Standard</span>
                            <span className="font-bold text-white">Rs. {localSettings.weeklyPrice}</span>
                        </div>
                        <div className="bg-black/30 p-3 rounded-xl flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Unlimited</span>
                            <span className="font-bold text-gym-neon">Rs. {Math.round(localSettings.weeklyPrice * localSettings.unlimitedMultiplier)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar className="text-gym-neon" />
                        Monthly Plan
                    </h3>
                    <div className="space-y-3">
                        <div className="bg-black/30 p-3 rounded-xl flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Duration</span>
                            <span className="font-bold text-white">30 Days</span>
                        </div>
                        <div className="bg-black/30 p-3 rounded-xl flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Standard</span>
                            <span className="font-bold text-white">Rs. {localSettings.monthlyPrice}</span>
                        </div>
                        <div className="bg-black/30 p-3 rounded-xl flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Unlimited</span>
                            <span className="font-bold text-gym-neon">Rs. {Math.round(localSettings.monthlyPrice * localSettings.unlimitedMultiplier)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-gym-neon/10 rounded-full flex items-center justify-center text-gym-neon mb-2">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Premium Access</h3>
                    <p className="text-gray-400 text-sm">
                        Unlimited access to all cardio equipment including treadmills, bikes, ellipticals, and rowing machines.
                    </p>
                    <div className="text-center">
                        <p className="text-gray-400 text-xs">Peak Hours</p>
                        <p className="text-gym-neon font-bold">5:00 PM - 9:00 PM</p>
                    </div>
                </div>
            </div>

            {/* Member Management Table */}
            <div className="bg-gym-card backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Member Subscriptions</h3>
                    <div className="text-sm text-gray-400">
                        {Object.keys(cardioSubscriptions || {}).length} active subscriptions
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-gray-400 text-sm">
                                <th className="px-6 py-4 font-medium">Member</th>
                                <th className="px-6 py-4 font-medium">Plan</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Start Date</th>
                                <th className="px-6 py-4 font-medium">End Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {members && members.length > 0 ? members.map((member) => {
                                const sub = cardioSubscriptions?.[member.id];
                                return (
                                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={member.profile || `https://i.pravatar.cc/150?u=${member.name}`} 
                                                    alt={member.name} 
                                                    className="w-10 h-10 rounded-full bg-white/10 object-cover"
                                                />
                                                <div>
                                                    <span className="text-white font-medium">{member.name}</span>
                                                    <div className="text-xs text-gray-400">{member.email}</div>
                                                </div>
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
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    sub.type === 'Unlimited' 
                                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {sub.type}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub ? (
                                                <span className="text-white font-bold">Rs. {sub.price}</span>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {sub ? sub.startDate : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {sub ? sub.endDate : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {sub ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="flex items-center gap-1 text-green-400 font-bold text-xs">
                                                        <CheckCircle size={14} /> Active
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveSubscription(member.id)}
                                                        className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                                                        title="Remove Subscription"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => openAddPlan(member)}
                                                    className="bg-gym-neon/10 hover:bg-gym-neon/20 text-gym-neon border border-gym-neon/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                >
                                                    <Plus size={14} />
                                                    Add Plan
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <Bike size={48} className="text-gray-600" />
                                            <p>No members found</p>
                                            <p className="text-sm">Add members first to manage cardio subscriptions</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Cardio;

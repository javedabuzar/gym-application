import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useGym } from '../context/GymContext';

const Settings = () => {
    const { baseGymFee, setBaseGymFee } = useGym();

    // Local state
    const [gymName, setGymName] = useState('Ultimate Cyber Blue Gym');
    const [localFee, setLocalFee] = useState(baseGymFee);

    useEffect(() => {
        setLocalFee(baseGymFee);
    }, [baseGymFee]);

    const handleSave = () => {
        setBaseGymFee(parseFloat(localFee));
        alert('Settings Saved!');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Settings</h2>
                <p className="text-gray-400 mt-1">Configure your gym settings</p>
            </div>

            <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 max-w-2xl">
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2">Gym Name</label>
                        <input
                            type="text"
                            value={gymName}
                            onChange={(e) => setGymName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Default Member Fee (Rs)</label>
                        <input
                            type="number"
                            value={localFee}
                            onChange={(e) => setLocalFee(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                        />
                    </div>
                    <div className="pt-4">
                        <button onClick={handleSave} className="bg-gym-neon text-black px-6 py-2.5 rounded-xl font-bold hover:bg-[#2ecc11] transition-colors flex items-center gap-2">
                            <Save size={20} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

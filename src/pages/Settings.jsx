import React, { useState } from 'react';
import { Save } from 'lucide-react';

const Settings = () => {
    const [gymName, setGymName] = useState('Ultimate Cyber Blue Gym');
    const [defaultFee, setDefaultFee] = useState(50);

    const handleSave = () => {
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
                        <label className="block text-gray-400 mb-2">Default Member Fee ($)</label>
                        <input
                            type="number"
                            value={defaultFee}
                            onChange={(e) => setDefaultFee(e.target.value)}
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

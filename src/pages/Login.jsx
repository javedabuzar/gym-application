import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGym } from '../context/GymContext';
import { Lock, User } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useGym();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (await login(username, password)) {
            navigate('/');
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/60 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gym-neon/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="bg-gym-card backdrop-blur-xl p-8 rounded-2xl border border-white/10 w-full max-w-md relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="text-center mb-8">
                    <img src="/logo.jpg" alt="PRO FLEX FITNESS GYM" className="h-24 w-auto mx-auto mb-6 object-contain drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]" />
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to manage your gym</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gym-neon transition-colors"
                                placeholder="Enter username"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gym-neon transition-colors"
                                placeholder="Enter password"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-gym-neon text-black py-3 rounded-xl font-bold hover:bg-[#2ecc11] transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

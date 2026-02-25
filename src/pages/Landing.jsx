import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, QrCode, ShieldCheck } from 'lucide-react';
import { useGym } from '../context/GymContext';

const plans = [
    {
        id: 'monthly',
        name: 'Monthly',
        price: 5000,
        description: 'Best for getting started'
    },
    {
        id: 'six_months',
        name: '6 Months',
        price: 25000,
        description: 'Best value for growing gyms'
    },
    {
        id: 'yearly',
        name: 'Yearly',
        price: 45000,
        description: 'Best for long-term owners'
    }
];

const Landing = () => {
    const navigate = useNavigate();
    const { registerAdmin } = useGym();

    const [selectedPlan, setSelectedPlan] = useState('monthly');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [form, setForm] = useState({
        fullName: '',
        gymName: '',
        email: '',
        password: ''
    });

    const selectedPlanMeta = plans.find((p) => p.id === selectedPlan);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.fullName || !form.gymName || !form.email || !form.password) {
            setMessage('Please fill all fields.');
            return;
        }

        setLoading(true);
        setMessage('');

        const result = await registerAdmin({
            ...form,
            planType: selectedPlan
        });

        if (result.success) {
            setMessage('Signup submitted. Pay using QR and wait for super admin approval.');
            setForm({ fullName: '', gymName: '', email: '', password: '' });
        } else {
            setMessage(result.message || 'Failed to create account.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black/60 text-white">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Gym Admin Software</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Choose a subscription plan, create your admin account, pay via QR, and get access after super admin approval.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {plans.map((plan) => (
                        <button
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`text-left p-6 rounded-2xl border transition-all ${selectedPlan === plan.id
                                ? 'border-gym-neon bg-gym-neon/10'
                                : 'border-white/10 bg-gym-card hover:bg-white/5'
                                }`}
                        >
                            <div className="text-xl font-bold mb-2">{plan.name}</div>
                            <div className="text-3xl font-black text-gym-neon mb-2">Rs. {plan.price.toLocaleString()}</div>
                            <div className="text-gray-400 text-sm">{plan.description}</div>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                        <h2 className="text-2xl font-bold mb-4">Create Admin Account</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Full name"
                                value={form.fullName}
                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                            />
                            <input
                                type="text"
                                placeholder="Gym name"
                                value={form.gymName}
                                onChange={(e) => setForm({ ...form, gymName: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                            />

                            <div className="text-sm text-gray-400">
                                Selected plan: <span className="text-gym-neon font-bold">{selectedPlanMeta?.name}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gym-neon text-black py-3 rounded-xl font-bold hover:bg-[#2ecc11] disabled:opacity-70"
                            >
                                {loading ? 'Submitting...' : 'Create Account & Submit'}
                            </button>
                        </form>

                        {message && (
                            <div className="mt-4 text-sm text-white bg-white/5 border border-white/10 rounded-xl p-3">
                                {message}
                            </div>
                        )}

                        <button
                            onClick={() => navigate('/login')}
                            className="mt-4 w-full border border-white/10 py-3 rounded-xl font-semibold hover:bg-white/5"
                        >
                            Already registered? Login
                        </button>
                    </div>

                    <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                        <h2 className="text-2xl font-bold mb-4">Payment (QR)</h2>
                        <p className="text-gray-400 mb-4">
                            Scan this QR to pay for your selected plan. Super admin will approve your account after payment verification.
                        </p>

                        <div className="w-64 h-64 mx-auto rounded-2xl border-2 border-dashed border-white/20 bg-black/20 flex items-center justify-center">
                            <div className="text-center text-gray-400">
                                <QrCode size={56} className="mx-auto mb-3" />
                                <div>QR Placeholder</div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-300">
                                <CheckCircle size={16} className="text-gym-neon" /> Create account
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <CheckCircle size={16} className="text-gym-neon" /> Pay with QR
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <ShieldCheck size={16} className="text-gym-neon" /> Wait for super admin approval
                            </div>
                        </div>

                        <div className="mt-6 text-xs text-gray-500">
                            After signup, your request is automatically sent to the super admin for approval.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;

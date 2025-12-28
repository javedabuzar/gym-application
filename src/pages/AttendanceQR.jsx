import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { QrCode, CheckCircle, XCircle } from 'lucide-react';

const AttendanceQR = () => {
    const { markAttendance, members } = useGym();
    const [scanInput, setScanInput] = useState('');
    const [scanResult, setScanResult] = useState(null);

    const handleScan = async (e) => {
        e.preventDefault();
        const memberId = Number(scanInput);
        const member = members.find(m => m.id === memberId);

        if (!member) {
            setScanResult({ success: false, message: 'Member not found' });
            return;
        }

        const result = await markAttendance(memberId);
        setScanResult(result);
        setScanInput('');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">QR Attendance</h2>
                <p className="text-gray-400 mt-1">Scan member QR code to mark attendance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gym-card backdrop-blur-xl p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gym-neon/10 rounded-full flex items-center justify-center mb-6 text-gym-neon">
                        <QrCode size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Scan QR Code</h3>
                    <p className="text-gray-400 mb-6">Use a barcode scanner or enter the Member ID manually below.</p>

                    <form onSubmit={handleScan} className="w-full max-w-xs">
                        <input
                            type="text"
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                            placeholder="Enter Member ID"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-center focus:outline-none focus:border-gym-neon mb-4"
                            autoFocus
                        />
                        <button type="submit" className="w-full bg-gym-neon text-black py-3 rounded-xl font-bold hover:bg-[#2ecc11] transition-colors">
                            Mark Attendance
                        </button>
                    </form>
                </div>

                <div className="bg-gym-card backdrop-blur-xl p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                    {scanResult ? (
                        <div className="animate-fadeIn">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${scanResult.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {scanResult.success ? <CheckCircle size={40} /> : <XCircle size={40} />}
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${scanResult.success ? 'text-green-500' : 'text-red-500'}`}>
                                {scanResult.success ? 'Success!' : 'Error'}
                            </h3>
                            <p className="text-gray-400">{scanResult.message}</p>
                        </div>
                    ) : (
                        <div className="text-gray-500">
                            <p>Scan result will appear here...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceQR;

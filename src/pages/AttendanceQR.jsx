import React, { useState, useEffect, useRef } from 'react';
import { useGym } from '../context/GymContext';
import { QrCode, CheckCircle, XCircle, Camera, Printer, Download, Users, RefreshCw } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';

const AttendanceQR = () => {
    const { markAttendance, members } = useGym();
    const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'card'
    const [scanInput, setScanInput] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [cardPreview, setCardPreview] = useState(null);

    // --- Scanner Logic ---
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef(null);
    const isScanningRef = useRef(false); // Ref to track scanning state synchronously

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (scannerRef.current && isScanningRef.current) {
                scannerRef.current.stop()
                    .then(() => scannerRef.current.clear())
                    .catch(err => console.error("Failed to stop scanner on unmount", err));
            }
        };
    }, []);

    const startScanner = async () => {
        try {
            if (isScanningRef.current) return;

            const { Html5Qrcode } = await import('html5-qrcode');

            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("reader");
            }

            await scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    handleAttendanceMark(Number(decodedText));
                },
                (errorMessage) => {
                    // ignore errors for better UX
                }
            );

            isScanningRef.current = true;
            setIsScanning(true);
        } catch (err) {
            console.error("Error starting scanner:", err);
            setScanResult({ success: false, message: "Camera access denied or error. " + err.message });
            isScanningRef.current = false;
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && isScanningRef.current) {
            try {
                await scannerRef.current.stop();
                // html5-qrcode documentation recommends clearing if you want to remove the UI elements or restart consistently
                // However, for just stopping, stop() is usually enough. 
                // We will just mark as stopped.
                isScanningRef.current = false;
                setIsScanning(false);
            } catch (err) {
                console.error("Error stopping scanner:", err);
                // Force state update even if error
                isScanningRef.current = false;
                setIsScanning(false);
            }
        }
    };

    const handleAttendanceMark = async (memberId) => {
        const member = members.find(m => m.id === memberId);

        if (!member) {
            setScanResult({ success: false, message: `Member ID ${memberId} not found` });
            return;
        }

        const result = await markAttendance(memberId);
        setScanResult({
            ...result,
            memberName: member.name,
            memberId: member.id,
            timestamp: new Date().toLocaleTimeString()
        });

        // Clear result after 5 seconds
        setTimeout(() => setScanResult(null), 5000);
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        const memberId = Number(scanInput);
        await handleAttendanceMark(memberId);
        setScanInput('');
    };

    // --- Card Generation Logic ---
    const cardRef = useRef(null);

    const handleDownloadCard = async () => {
        if (cardRef.current) {
            try {
                const canvas = await html2canvas(cardRef.current, {
                    backgroundColor: '#000000', // Ensure dark background
                    scale: 2 // High resolution
                });

                const image = canvas.toDataURL("image/png");
                const link = document.createElement('a');
                link.href = image;
                link.download = `GymCard_${selectedMember.name.replace(/\s+/g, '_')}.png`;
                link.click();
            } catch (error) {
                console.error("Error generating card image:", error);
            }
        }
    };

    const handlePrintCard = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Attendance & Cards</h2>
                    <p className="text-gray-400 mt-1">Scan for attendance or issue member cards</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('scan')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'scan' ? 'bg-gym-neon text-black font-bold' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Camera size={20} />
                        Scan
                    </button>
                    <button
                        onClick={() => setActiveTab('card')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'card' ? 'bg-gym-neon text-black font-bold' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Users size={20} />
                        Cards
                    </button>
                </div>
            </div>

            {activeTab === 'scan' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Scanner Section */}
                    <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 flex flex-col items-center">
                        <div className="w-full bg-black/50 rounded-xl overflow-hidden mb-6 relative" style={{ minHeight: '300px' }}>
                            <div id="reader" className="w-full h-full"></div>
                            {!isScanning && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                        onClick={startScanner}
                                        className="bg-gym-neon text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#2ecc11] transition-all transform hover:scale-105"
                                    >
                                        <Camera size={24} />
                                        Start Camera
                                    </button>
                                </div>
                            )}
                        </div>

                        {isScanning && (
                            <button
                                onClick={stopScanner}
                                className="text-red-500 text-sm hover:underline"
                            >
                                Stop Camera
                            </button>
                        )}
                    </div>

                    {/* Manual Entry & Results */}
                    <div className="space-y-6">
                        {/* Result Card */}
                        <div className={`bg-gym-card backdrop-blur-xl p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center h-64 transition-all ${scanResult ? (scanResult.success ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5') : ''
                            }`}>
                            {scanResult ? (
                                <div className="animate-fadeIn">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto ${scanResult.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {scanResult.success ? <CheckCircle size={40} /> : <XCircle size={40} />}
                                    </div>
                                    <h3 className={`text-2xl font-bold mb-2 ${scanResult.success ? 'text-green-500' : 'text-red-500'}`}>
                                        {scanResult.success ? 'Passed!' : 'Failed'}
                                    </h3>
                                    <p className="text-white text-lg font-medium">{scanResult.memberName}</p>
                                    <p className="text-gray-400">{scanResult.message}</p>
                                    <p className="text-xs text-gray-500 mt-4">{scanResult.timestamp}</p>
                                </div>
                            ) : (
                                <div className="text-gray-500 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <QrCode size={30} />
                                    </div>
                                    <p>Ready to Scan...</p>
                                </div>
                            )}
                        </div>

                        {/* Manual Entry */}
                        <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-4">Manual Entry</h3>
                            <form onSubmit={handleManualSubmit} className="flex gap-4">
                                <input
                                    type="number"
                                    value={scanInput}
                                    onChange={(e) => setScanInput(e.target.value)}
                                    placeholder="Enter Member ID"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                                />
                                <button type="submit" className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                            <label className="block text-gray-400 mb-2">Select Member</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon mb-4"
                                onChange={(e) => setSelectedMember(members.find(m => m.id === Number(e.target.value)))}
                                value={selectedMember?.id || ''}
                            >
                                <option value="">-- Choose Member --</option>
                                {members.map(member => (
                                    <option key={member.id} value={member.id}>
                                        {member.name} (ID: {member.id})
                                    </option>
                                ))}
                            </select>

                            {selectedMember && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-sm text-gray-400">Status</p>
                                        <p className={`font-bold ${selectedMember.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                                            {selectedMember.status}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDownloadCard}
                                        className="w-full bg-gym-neon text-black py-3 rounded-xl font-bold hover:bg-[#2ecc11] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download size={20} />
                                        Download PNG
                                    </button>
                                    <button
                                        onClick={handlePrintCard}
                                        className="w-full bg-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Printer size={20} />
                                        Print Card
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card Preview */}
                    <div className="lg:col-span-2 flex items-center justify-center bg-black/20 rounded-2xl p-8 border border-white/5">
                        {selectedMember ? (
                            <div className="print-area">
                                <div
                                    ref={cardRef}
                                    className="w-[400px] h-[250px] bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gym-neon/30 relative overflow-hidden shadow-2xl flex"
                                >
                                    {/* Background Accents */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gym-neon/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                                    {/* Left Side: Info */}
                                    <div className="w-2/3 p-6 flex flex-col justify-between z-10">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-8 bg-gym-neon rounded-full"></div>
                                                <h1 className="text-xl font-bold text-white tracking-wider">GYM CARD</h1>
                                            </div>
                                            <p className="text-xs text-gym-neon uppercase tracking-widest ml-4">Access Pass</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400 uppercase mb-1">Member Name</p>
                                            <h2 className="text-2xl font-bold text-white truncate">{selectedMember.name}</h2>
                                            <div className="flex gap-4 mt-3">
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase">ID No.</p>
                                                    <p className="text-lg font-mono text-white">{String(selectedMember.id).padStart(4, '0')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase">Joined</p>
                                                    <p className="text-sm text-white mt-1">{new Date(selectedMember.join_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: QR */}
                                    <div className="w-1/3 bg-white/5 backdrop-blur-sm flex items-center justify-center border-l border-white/5 z-10">
                                        <div className="bg-white p-2 rounded-xl">
                                            <QRCodeCanvas
                                                value={String(selectedMember.id)}
                                                size={100}
                                                level={"H"}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <p>Select a member to preview their card</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print-area, .print-area * {
                            visibility: visible;
                        }
                        .print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: white;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default AttendanceQR;

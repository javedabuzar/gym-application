import React, { useState, useRef } from 'react';
import { Search, Plus, MoreVertical, Trash2, CheckCircle, FileText, Download, QrCode, X, Camera, User, Phone } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { jsPDF } from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';

const Members = () => {
    try {
        const { members, addMember, removeMember, markAttendance, unmarkAttendance, updateMember, getMemberAttendance } = useGym();

        console.log('✅ Members component loaded!', { members });

        const [searchTerm, setSearchTerm] = useState('');
        const [showAddForm, setShowAddForm] = useState(false);
        const [isEditing, setIsEditing] = useState(false);
        const [currentMemberId, setCurrentMemberId] = useState(null);
        const [newMember, setNewMember] = useState({ name: '', contact: '', fee: '', payment: 'Paid', status: 'Active', profile: '' });
        const [selectedMemberQR, setSelectedMemberQR] = useState(null);
        const [isCameraOpen, setIsCameraOpen] = useState(false);
        const videoRef = useRef(null);
        const canvasRef = useRef(null);

        const handleSaveMember = async () => {
            if (!newMember.name || !newMember.fee) return alert('Please fill all fields');

            if (isEditing && currentMemberId) {
                await updateMember(currentMemberId, newMember);
                setIsEditing(false);
                setCurrentMemberId(null);
            } else {
                const res = await addMember(newMember);
                if (!res) return alert('Failed to add member');
            }

            setNewMember({ name: '', contact: '', fee: '', payment: 'Paid', status: 'Active', profile: '' });
            setShowAddForm(false);
        };

        const openEditForm = (member) => {
            setNewMember({
                name: member.name,
                contact: member.contact || '',
                fee: member.fee,
                payment: member.payment,
                status: member.status,
                profile: member.profile || ''
            });
            setCurrentMemberId(member.id);
            setIsEditing(true);
            setShowAddForm(true);
        };

        const handleMarkAttendance = async (id) => {
            const today = new Date().toISOString().split('T')[0];
            const attendance = getMemberAttendance(id);
            const isPresent = attendance.includes(today);

            if (isPresent) {
                if (window.confirm("Unmark attendance for today?")) {
                    const result = await unmarkAttendance(id);
                    alert(result.message);
                }
            } else {
                const result = await markAttendance(id);
                alert(result.message);
            }
        };

        const exportCSV = () => {
            if (!members || members.length === 0) return alert("No members");
            let csv = 'Name,Contact,Fee (Rs),Payment,Status\n';
            members.forEach(m => { csv += `${m.name},${m.contact || ''},${m.fee},${m.payment},${m.status}\n`; });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'members.csv';
            a.click();
            URL.revokeObjectURL(url);
        };

        const exportPDF = () => {
            if (!members || members.length === 0) return alert("No members");
            const doc = new jsPDF();
            doc.setFontSize(12);
            doc.text("Gym Members", 14, 20);
            let y = 30;
            members.forEach(m => {
                doc.text(`${m.name} | ${m.contact || 'No Contact'} | Rs. ${m.fee} | ${m.status}`, 14, y);
                y += 10;
            });
            doc.save('members.pdf');
        };

        const filteredMembers = (members || []).filter(member =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const startCamera = async () => {
            setIsCameraOpen(true);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Could not access camera");
                setIsCameraOpen(false);
            }
        };

        const stopCamera = () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            setIsCameraOpen(false);
        };

        const capturePhoto = () => {
            if (videoRef.current && canvasRef.current) {
                const context = canvasRef.current.getContext('2d');
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;

                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

                const imageDateUrl = canvasRef.current.toDataURL('image/jpeg');
                setNewMember({ ...newMember, profile: imageDateUrl });
                stopCamera();
            }
        };

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Member Management</h2>
                        <p className="text-gray-400 mt-1">Manage your gym members and their subscriptions</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={exportCSV} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <FileText size={20} /> CSV
                        </button>
                        <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2">
                            <Download size={20} /> PDF
                        </button>
                        <button
                            onClick={() => {
                                setShowAddForm(!showAddForm);
                                setIsEditing(false);
                                setNewMember({ name: '', contact: '', fee: '', payment: 'Paid', status: 'Active', profile: '' });
                                stopCamera();
                            }}
                            className="bg-gym-neon text-black px-6 py-2.5 rounded-xl font-bold hover:bg-[#2ecc11] transition-colors shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Add Member
                        </button>
                    </div>
                </div>

                {/* Add Member Form */}
                {showAddForm && (
                    <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 animate-fadeIn">
                        <h3 className="text-xl font-bold text-white mb-4">{isEditing ? 'Edit Member' : 'Add New Member'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Camera Section */}
                            <div className="md:col-span-2 flex flex-col items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                {isCameraOpen ? (
                                    <div className="relative w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border-2 border-gym-neon">
                                        <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                            <button
                                                onClick={stopCamera}
                                                className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600"
                                                title="Cancel"
                                            >
                                                <X size={24} />
                                            </button>
                                            <button
                                                onClick={capturePhoto}
                                                className="bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-200 border-4 border-gray-300"
                                                title="Take Photo"
                                            >
                                                <div className="w-6 h-6 bg-black rounded-full" />
                                            </button>
                                        </div>
                                        <canvas ref={canvasRef} className="hidden" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-32 h-32 rounded-full overflow-hidden bg-black/50 border-2 border-dashed border-gray-500 flex items-center justify-center relative group">
                                            {newMember.profile ? (
                                                <img src={newMember.profile} alt="Profile Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={48} className="text-gray-500" />
                                            )}
                                        </div>
                                        <button
                                            onClick={startCamera}
                                            className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 flex items-center gap-2 transition-colors"
                                        >
                                            <Camera size={20} />
                                            {newMember.profile ? 'Retake Photo' : 'Take Photo'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Form Fields */}
                            <input
                                type="text"
                                placeholder="Member Name"
                                value={newMember.name}
                                onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                            />
                            <input
                                type="text"
                                placeholder="Contact Number"
                                value={newMember.contact}
                                onChange={e => setNewMember({ ...newMember, contact: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                            />
                            <input
                                type="number"
                                placeholder="Fee Amount"
                                value={newMember.fee}
                                onChange={e => setNewMember({ ...newMember, fee: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                            />
                            <select
                                value={newMember.payment}
                                onChange={e => setNewMember({ ...newMember, payment: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                            >
                                <option value="Paid" className="bg-gray-800">Paid</option>
                                <option value="Unpaid" className="bg-gray-800">Unpaid</option>
                            </select>
                            <select
                                value={newMember.status}
                                onChange={e => setNewMember({ ...newMember, status: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                            >
                                <option value="Active" className="bg-gray-800">Active</option>
                                <option value="Inactive" className="bg-gray-800">Inactive</option>
                            </select>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => { setShowAddForm(false); stopCamera(); }} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                            <button onClick={handleSaveMember} className="bg-gym-neon text-black px-6 py-2 rounded-xl font-bold hover:bg-[#2ecc11]">{isEditing ? 'Update Member' : 'Save Member'}</button>
                        </div>
                    </div>
                )}

                {/* Members Table */}
                <div className="bg-gym-card backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-gym-neon/50 focus:ring-1 focus:ring-gym-neon/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-gray-400 text-sm">
                                    <th className="px-6 py-4 font-medium">Member</th>
                                    <th className="px-6 py-4 font-medium">Fee</th>
                                    <th className="px-6 py-4 font-medium">Payment</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Joined Date</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredMembers && filteredMembers.length > 0 ? (
                                    filteredMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={member.profile || `https://i.pravatar.cc/150?u=${member.name}`} alt={member.name} className="w-10 h-10 rounded-full bg-white/10 object-cover" />
                                                    <div>
                                                        <h4 className="text-white font-medium">{member.name}</h4>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <Phone size={12} />
                                                            <span>{member.contact || 'No Contact'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white">Rs. {member.fee}</td>
                                            <td className="px-6 py-4">
                                                <span className={`font-medium ${member.payment === 'Paid' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {member.payment}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-medium ${member.status === 'Active' ? 'text-gym-neon' : 'text-gray-400'}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {new Date(member.join_date || Date.now()).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button onClick={() => openEditForm(member)} className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors" title="Edit Member">
                                                    <MoreVertical size={20} />
                                                </button>
                                                <button onClick={() => setSelectedMemberQR(member)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Show QR">
                                                    <QrCode size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleMarkAttendance(member.id)}
                                                    className={`p-2 rounded-lg transition-colors ${getMemberAttendance(member.id).includes(new Date().toISOString().split('T')[0])
                                                        ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20'
                                                        : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'
                                                        }`}
                                                    title={getMemberAttendance(member.id).includes(new Date().toISOString().split('T')[0]) ? "Unmark Attendance" : "Mark Attendance"}
                                                >
                                                    {getMemberAttendance(member.id).includes(new Date().toISOString().split('T')[0]) ? <CheckCircle size={20} fill="currentColor" className="text-green-500" /> : <CheckCircle size={20} />}
                                                </button>
                                                <button onClick={() => removeMember(member.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Remove Member">
                                                    <Trash2 size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                            {members === undefined || members === null ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gym-neon"></div>
                                                    <p>Loading members...</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-3">
                                                    <User size={48} className="text-gray-600" />
                                                    <p>No members found</p>
                                                    <p className="text-sm">Click "Add Member" to get started</p>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* QR Modal */}
                {selectedMemberQR && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedMemberQR(null)}>
                        <div className="bg-white p-8 rounded-2xl text-center relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setSelectedMemberQR(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                                <X size={24} />
                            </button>
                            <h3 className="text-2xl font-bold text-black mb-2">{selectedMemberQR.name}</h3>
                            <p className="text-gray-500 mb-6">Scan to mark attendance</p>
                            <div className="flex justify-center mb-6">
                                <QRCodeCanvas value={String(selectedMemberQR.id)} size={200} />
                            </div>
                            <p className="text-xs text-gray-400">ID: {selectedMemberQR.id}</p>
                        </div>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('❌ Members component error:', error);
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Members</h2>
                    <p className="text-gray-400 mb-4">{error.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gym-neon text-black px-6 py-2 rounded-xl font-bold"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }
};

export default Members;
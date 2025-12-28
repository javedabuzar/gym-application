import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Trash2, CheckCircle, FileText, Download, QrCode, X } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { jsPDF } from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';

const Members = () => {
    const { members, addMember, removeMember, markAttendance, updateMember } = useGym();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', fee: '', payment: 'Paid', status: 'Active' });
    const [selectedMemberQR, setSelectedMemberQR] = useState(null);

    const handleAddMember = async () => {
        if (!newMember.name || !newMember.fee) return alert('Please fill all fields');
        const res = await addMember(newMember);
        if (res) {
            setNewMember({ name: '', fee: '', payment: 'Paid', status: 'Active' });
            setShowAddForm(false);
        } else {
            alert('Failed to add member');
        }
    };

    const handleMarkAttendance = async (id) => {
        const result = await markAttendance(id);
        alert(result.message);
    };

    const exportCSV = () => {
        if (members.length === 0) return alert("No members");
        let csv = 'Name,Fee,Payment,Status\n';
        members.forEach(m => { csv += `${m.name},${m.fee},${m.payment},${m.status}\n`; });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'members.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportPDF = () => {
        if (members.length === 0) return alert("No members");
        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text("Gym Members", 14, 20);
        let y = 30;
        members.forEach(m => {
            doc.text(`${m.name} | Fee: ${m.fee} | Payment: ${m.payment} | Status: ${m.status}`, 14, y);
            y += 10;
        });
        doc.save('members.pdf');
    };

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
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
                    <button onClick={() => setShowAddForm(!showAddForm)} className="bg-gym-neon text-black px-6 py-2.5 rounded-xl font-bold hover:bg-[#2ecc11] transition-colors shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-center gap-2">
                        <Plus size={20} />
                        Add Member
                    </button>
                </div>
            </div>

            {showAddForm && (
                <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 animate-fadeIn">
                    <h3 className="text-xl font-bold text-white mb-4">Add New Member</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Member Name"
                            value={newMember.name}
                            onChange={e => setNewMember({ ...newMember, name: e.target.value })}
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
                        <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        <button onClick={handleAddMember} className="bg-gym-neon text-black px-6 py-2 rounded-xl font-bold hover:bg-[#2ecc11]">Save Member</button>
                    </div>
                </div>
            )}

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
                            {filteredMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={member.profile} alt={member.name} className="w-10 h-10 rounded-full bg-white/10" />
                                            <div>
                                                <h4 className="text-white font-medium">{member.name}</h4>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white">${member.fee}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={member.payment}
                                            onChange={(e) => updateMember(member.id, { payment: e.target.value })}
                                            className={`bg-transparent border-none focus:ring-0 text-sm font-medium ${member.payment === 'Paid' ? 'text-green-400' : 'text-red-400'}`}
                                        >
                                            <option value="Paid" className="bg-gray-800">Paid</option>
                                            <option value="Unpaid" className="bg-gray-800">Unpaid</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={member.status}
                                            onChange={(e) => updateMember(member.id, { status: e.target.value })}
                                            className={`bg-transparent border-none focus:ring-0 text-sm font-medium ${member.status === 'Active' ? 'text-gym-neon' : 'text-gray-400'}`}
                                        >
                                            <option value="Active" className="bg-gray-800">Active</option>
                                            <option value="Inactive" className="bg-gray-800">Inactive</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {new Date(member.joinDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button onClick={() => setSelectedMemberQR(member)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Show QR">
                                            <QrCode size={20} />
                                        </button>
                                        <button onClick={() => handleMarkAttendance(member.id)} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Mark Attendance">
                                            <CheckCircle size={20} />
                                        </button>
                                        <button onClick={() => removeMember(member.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Remove Member">
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

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
};

export default Members;

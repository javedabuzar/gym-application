import React, { useState, useRef } from 'react';
import { useGym } from '../context/GymContext';
import { FileText, Printer, Download, DollarSign, User } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const Invoice = () => {
    const { members, baseGymFee, supplementSettings, cardioSubscriptions, ptSubscriptions } = useGym();
    const [selectedMemberId, setSelectedMemberId] = useState('');

    const member = members.find(m => m.id === parseInt(selectedMemberId));

    const calculateBill = () => {
        if (!member) return { total: 0, breakdown: [] };

        const items = [];
        let total = 0;

        // 1. Base Gym Fee
        // Use member.fee if available (overrides base), otherwise global baseGymFee
        // Assuming member.fee is stored as string/number in member object
        let fee = member.fee ? parseFloat(member.fee) : baseGymFee;
        items.push({ name: 'Gym Membership', price: fee });
        total += fee;

        // 2. Supplements (Creatine, Whey, Pre-workout)
        // Iterate through supplement types
        ['creatine', 'whey', 'preworkout'].forEach(type => {
            let cost = 0;
            const settings = supplementSettings[type];
            // Format name nicely (e.g., 'whey' -> 'Whey Protein')
            const displayName = type === 'whey' ? 'Whey Protein' : type === 'preworkout' ? 'Pre-Workout' : 'Creatine';

            if (settings.isAuto) {
                const scoops = member[`scoops_${type}`] || 0;
                cost = scoops * settings.price;
                if (cost > 0) {
                    items.push({
                        name: `${displayName} (${scoops} Scoops)`,
                        price: cost
                    });
                }
            } else {
                cost = member[`cost_${type}`] || 0;
                if (cost > 0) {
                    items.push({
                        name: `${displayName} (Manual)`,
                        price: cost
                    });
                }
            }
            total += cost;
        });

        // 3. Cardio
        const cardioSub = cardioSubscriptions[member.id];
        if (cardioSub && cardioSub.active) {
            const price = parseFloat(cardioSub.price);
            items.push({
                name: `Cardio (${cardioSub.duration} - ${cardioSub.type})`,
                price: price
            });
            total += price;
        }

        // 4. Personal Training
        const ptSub = ptSubscriptions[member.id];
        if (ptSub && ptSub.active) {
            const price = parseFloat(ptSub.price);
            items.push({
                name: `Personal Training (${ptSub.duration.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())})`,
                price: price
            });
            total += price;
        }

        return { total, items };
    };

    const { total, items } = calculateBill();

    const invoiceRef = useRef(null);

    const downloadImage = async () => {
        if (!invoiceRef.current || !member) return;

        try {
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2, // Higher quality
                backgroundColor: '#ffffff'
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `Invoice_${member.name.replace(/\s+/g, '_')}.png`;
            link.click();
        } catch (error) {
            console.error("Error generating image:", error);
            alert("Failed to download image.");
        }
    };

    const printSlip = () => {
        if (!member) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text("GYM INVOICE", 105, 20, null, null, "center");

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text("Official Monthly Slip", 105, 28, null, null, "center");

        // Member Info
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        doc.setFontSize(12);
        doc.text(`Member: ${member.name}`, 20, 45);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 45);
        doc.text(`Status: ${member.status || 'Active'}`, 20, 52);

        // Table Header
        let y = 65;
        doc.setFillColor(240, 240, 240);
        doc.rect(20, y - 5, 170, 10, 'F');
        doc.setFont(undefined, 'bold');
        doc.text("Description", 25, y);
        doc.text("Amount (PKR)", 150, y);

        // Items
        y += 15;
        doc.setFont(undefined, 'normal');
        items.forEach(item => {
            doc.text(item.name, 25, y);
            doc.text(item.price.toLocaleString(), 150, y);
            y += 10;
        });

        // Total
        y += 5;
        doc.setLineWidth(0.5);
        doc.line(20, y, 190, y);
        y += 10;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text("TOTAL DUE:", 25, y);
        doc.text(`Rs. ${total.toLocaleString()}`, 150, y);

        // Footer
        doc.setFontSize(10);
        doc.setFont(undefined, 'italic');
        doc.text("Thank you for training with us!", 105, y + 20, null, null, "center");

        doc.save(`Invoice_${member.name.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FileText className="text-gym-neon" size={32} />
                        Invoice Generator
                    </h2>
                    <p className="text-gray-400 mt-1">Generate and print monthly slips for members</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Selection & Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <User size={20} className="text-gym-neon" />
                            Select Member
                        </h3>
                        <div className="space-y-4">
                            <select
                                value={selectedMemberId}
                                onChange={(e) => setSelectedMemberId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                            >
                                <option value="" className="bg-gray-800">-- Choose Member --</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id} className="bg-gray-800">
                                        {m.name}
                                    </option>
                                ))}
                            </select>

                            {member && (
                                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="text-sm text-gray-400">Status</div>
                                    <div className={`font-bold ${member.payment === 'Paid' ? 'text-green-400' : 'text-red-400'}`}>
                                        {member.payment || 'Unpaid'}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-2">Joined</div>
                                    <div className="text-white font-mono">
                                        {new Date(member.join_date || Date.now()).toLocaleDateString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={printSlip}
                        disabled={!member}
                        className="w-full bg-gym-neon text-black py-4 rounded-xl font-bold hover:bg-[#2ecc11] transition-colors shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Printer size={24} />
                        Print Final Slip
                    </button>
                    <button
                        onClick={downloadImage}
                        disabled={!member}
                        className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
                    >
                        <Download size={24} />
                        Download Image
                    </button>
                </div>

                {/* Preview */}
                <div className="lg:col-span-2">
                    <div ref={invoiceRef} className="bg-white text-black p-8 rounded-2xl shadow-2xl min-h-[500px] flex flex-col relative">
                        {member ? (
                            <>
                                <div className="text-center border-b-2 border-black pb-4 mb-6">
                                    <h1 className="text-3xl font-bold tracking-wider">GYM INVOICE</h1>
                                    <p className="text-gray-600 uppercase tracking-widest text-sm mt-1">Official Monthly Slip</p>
                                </div>

                                <div className="flex justify-between mb-8">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Billed To</p>
                                        <h2 className="text-xl font-bold">{member.name}</h2>
                                        <p className="text-gray-600">{member.status || 'Active Member'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Date</p>
                                        <p className="font-mono">{new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <table className="w-full mb-8">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="text-left py-2 px-4 font-bold uppercase text-xs text-gray-600">Description</th>
                                            <th className="text-right py-2 px-4 font-bold uppercase text-xs text-gray-600">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="py-3 px-4 text-sm">{item.name}</td>
                                                <td className="py-3 px-4 text-right font-mono">Rs. {item.price.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="mt-auto border-t-2 border-black pt-4 flex justify-between items-end">
                                    <div className="text-sm text-gray-500 italic">
                                        Thank you for your business.
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Total Due</p>
                                        <p className="text-3xl font-bold text-black">Rs. {total.toLocaleString()}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <FileText size={48} className="mb-4 opacity-20" />
                                <p>Select a member to view invoice preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoice;

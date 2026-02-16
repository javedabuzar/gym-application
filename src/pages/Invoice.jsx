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
                backgroundColor: '#0a0a0a' // Dark background for image
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
                    <div ref={invoiceRef} className="bg-black/80 backdrop-blur-2xl text-white p-10 rounded-sm shadow-2xl min-h-[700px] flex flex-col relative border border-white/10 overflow-hidden">
                        {/* Abstract Background Shapes */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gym-neon/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                        {member ? (
                            <>
                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-12 border-b border-white/10 pb-8">
                                        <div className="flex flex-col">
                                            <div className="mb-4">
                                                <img src="/logo.jpg" alt="PRO FLEX FITNESS GYM" className="h-32 w-auto object-contain drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]" />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <h1 className="text-5xl font-black text-white tracking-tighter mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">GYM FEE</h1>
                                            <p className="text-sm text-gray-400 font-mono">#{String(Date.now()).slice(-8)}</p>
                                        </div>
                                    </div>

                                    {/* Client & Date Info */}
                                    <div className="flex justify-between mb-12">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Billed To</p>
                                            <h3 className="text-3xl font-bold text-white mb-1">{member.name}</h3>
                                            <p className="text-gray-400 text-sm">Member ID: GS-{String(member.id).padStart(4, '0')}</p>
                                            <p className="text-gym-neon text-sm mt-1 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-gym-neon animate-pulse"></span>
                                                {member.status || 'Active Member'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Issue Date</p>
                                                <p className="text-xl font-medium text-white">{new Date().toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Due Date</p>
                                                <p className="text-xl font-medium text-white">{new Date().toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="flex-1">
                                        <div className="w-full">
                                            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-white/10 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                <div className="col-span-1 text-center">No.</div>
                                                <div className="col-span-7">Description</div>
                                                <div className="col-span-2 text-center">Qty</div>
                                                <div className="col-span-2 text-right">Price</div>
                                            </div>
                                            <div className="mt-4 space-y-4">
                                                {items.map((item, index) => (
                                                    <div key={index} className="grid grid-cols-12 gap-4 items-center text-sm group">
                                                        <div className="col-span-1 text-center text-gray-600 font-mono group-hover:text-gym-neon transition-colors">{(index + 1).toString().padStart(2, '0')}</div>
                                                        <div className="col-span-7 font-medium text-white">{item.name}</div>
                                                        <div className="col-span-2 text-center text-gray-400">1</div>
                                                        <div className="col-span-2 text-right text-white font-mono">Rs. {item.price.toLocaleString()}</div>
                                                    </div>
                                                ))}
                                                {items.length === 0 && (
                                                    <div className="text-center py-10 text-gray-600 italic">No items billed</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer / Total */}
                                    <div className="mt-8 pt-8 border-t border-white/10">
                                        <div className="flex justify-between items-end">
                                            <div className="max-w-xs">
                                                <h4 className="text-sm font-bold text-white mb-2">Payment Details</h4>
                                                <p className="text-xs text-gray-500 mb-4">Please pay within 30 days of receiving this invoice.</p>

                                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                                    <div>
                                                        <p className="font-bold text-white mb-0.5">Contact</p>
                                                        <p className="font-mono">+92 300 1234567</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 min-w-[300px]">
                                                <div className="flex justify-between text-sm mb-3">
                                                    <span className="text-gray-400">Subtotal</span>
                                                    <span className="text-white font-mono">Rs. {total.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm mb-3">
                                                    <span className="text-gym-neon">Discount</span>
                                                    <span className="text-gym-neon font-mono">- Rs. 0</span>
                                                </div>
                                                <div className="w-full h-px bg-white/10 my-4"></div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-bold text-white">Grand Total</span>
                                                    <span className="text-3xl font-black text-gym-neon font-mono tracking-tight">
                                                        Rs. {total.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Neon Bar */}
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gym-neon to-transparent opacity-50"></div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 relative z-10">
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <FileText size={48} className="text-white/20" />
                                </div>
                                <p className="text-xl font-medium text-white/40">Select a member to generate invoice</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoice;

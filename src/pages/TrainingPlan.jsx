import React, { useState } from 'react';
import { FileText, Activity, Download, Printer, Edit2, RotateCw } from 'lucide-react';
import { jsPDF } from 'jspdf';

const TrainingPlan = () => {
    // User Inputs
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        weight: '',
        height: '',
        goal: 'Weight Loss', // Weight Loss, Muscle Gain, Strength, General Fitness
        experience: 'Beginner' // Beginner, Intermediate, Advanced
    });

    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Plan Templates (Simple Logic)
    const generatePlan = () => {
        const { goal, experience } = formData;
        let plan = {};

        if (goal === 'Weight Loss') {
            plan = {
                Monday: 'Full Body Circuit (3 rounds)\n- Squats: 15 reps\n- Pushups: 10 reps\n- Lunges: 12/leg\n- Plank: 45s\n- 20 mins Cardio',
                Tuesday: 'Cardio + Core\n- 30 mins Jogging\n- Crunches: 3x15\n- Leg Raises: 3x12',
                Wednesday: 'Active Rest or Yoga',
                Thursday: 'Lower Body Focus\n- Goblet Squats: 3x12\n- Deadlifts: 3x10\n- Step-ups: 3x12',
                Friday: 'Upper Body Focus\n- DB Press: 3x12\n- Rows: 3x12\n- Shoulder Press: 3x12\n- 15 mins HIIT',
                Saturday: 'Long Cardio (45 mins walk/run)',
                Sunday: 'Rest Day'
            };
        } else if (goal === 'Muscle Gain') {
            plan = {
                Monday: 'Chest & Triceps\n- Bench Press: 4x8-10\n- Incline DB Press: 3x10\n- Cable Flyes: 3x12\n- Tricep Pushdowns: 3x12',
                Tuesday: 'Back & Biceps\n- Pull-ups: 3xMax\n- Barbell Rows: 4x8\n- Lat Pulldowns: 3x10\n- Barbell Curls: 3x10',
                Wednesday: 'Leg Day\n- Squats: 4x6-8\n- Leg Press: 3x10\n- RDL: 3x10\n- Calf Raises: 4x15',
                Thursday: 'Shoulders & Abs\n- Overhead Press: 4x8\n- Lateral Raises: 3x12\n- Face Pulls: 3x15\n- Hanging Leg Raises: 3x10',
                Friday: 'Arm Day (Optional)\n- Skullcrushers: 3x10\n- Hammer Curls: 3x10\n- Dips: 3xMax',
                Saturday: 'Active Recovery',
                Sunday: 'Rest Day'
            };
        } else {
            // General Fitness / Strength (Simplified)
            plan = {
                Monday: 'Strength - Upper\n- Bench Press: 5x5\n- Rows: 5x5\n- Overhead Press: 3x8',
                Tuesday: 'Conditioning\n- 20 mins Rowing/Running\n- Kettlebell Swings: 4x15',
                Wednesday: 'Strength - Lower\n- Squats: 5x5\n- Deadlifts: 3x5',
                Thursday: 'Rest or Mobility',
                Friday: 'Full Body Hypertrophy\n- DB Incline: 3x10\n- Lunges: 3x10\n- Pull-ups: 3xMax',
                Saturday: 'Outdoor Activity',
                Sunday: 'Rest Day'
            };
        }

        // Adjust for Experience
        if (experience === 'Advanced') {
            Object.keys(plan).forEach(day => {
                if (plan[day] !== 'Rest Day') plan[day] += '\n+ Advanced Finisher (Dropset)';
            });
        }

        setGeneratedPlan(plan);
        setIsEditing(false);
    };

    const handlePlanEdit = (day, value) => {
        setGeneratedPlan(prev => ({
            ...prev,
            [day]: value
        }));
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(`Training Plan: ${formData.goal}`, 20, 20);

        doc.setFontSize(12);
        doc.text(`Member: ${formData.name}`, 20, 30);
        doc.text(`Stats: ${formData.age}yrs | ${formData.weight}kg | ${formData.height}cm`, 20, 38);
        doc.text(`Experience: ${formData.experience}`, 20, 46);

        let y = 60;
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');

        Object.keys(generatedPlan).forEach(day => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(day, 20, y);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(11);

            const lines = doc.splitTextToSize(generatedPlan[day], 170);
            doc.text(lines, 20, y + 7);

            y += 10 + (lines.length * 5) + 10;
            doc.setFont(undefined, 'bold');
            doc.setFontSize(14);
        });

        doc.save(`${formData.name || 'Member'}_Training_Plan.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Activity className="text-gym-neon" size={32} />
                        Training Plan Generator
                    </h2>
                    <p className="text-gray-400 mt-1">Create personalized workout routines automatically</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-1 bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 h-fit">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <FileText className="text-gym-neon" />
                        Member Details
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm">Age</label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-gym-neon outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm">Weight (kg)</label>
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-gym-neon outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm">Height (cm)</label>
                                <input
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-gym-neon outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">Primary Goal</label>
                            <select
                                value={formData.goal}
                                onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                            >
                                <option className="bg-gray-800" value="Weight Loss">Weight Loss</option>
                                <option className="bg-gray-800" value="Muscle Gain">Muscle Gain</option>
                                <option className="bg-gray-800" value="Strength">Strength & Power</option>
                                <option className="bg-gray-800" value="General Fitness">General Fitness</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">Experience Level</label>
                            <div className="flex bg-white/5 p-1 rounded-xl">
                                {['Beginner', 'Intermediate', 'Advanced'].map(exp => (
                                    <button
                                        key={exp}
                                        onClick={() => setFormData(prev => ({ ...prev, experience: exp }))}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.experience === exp ? 'bg-gym-neon text-black' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {exp}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={generatePlan}
                            className="w-full mt-4 bg-gym-neon text-black py-3 rounded-xl font-bold hover:bg-[#2ecc11] transition-colors shadow-[0_0_15px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2"
                        >
                            <RotateCw size={20} />
                            Generate Plan
                        </button>
                    </div>
                </div>

                {/* Plan Display */}
                <div className="lg:col-span-2 space-y-4">
                    {generatedPlan ? (
                        <div className="bg-gym-card backdrop-blur-xl p-8 rounded-2xl border border-white/5 animate-fadeIn">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-white">{formData.goal} Plan</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-gym-neon text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button
                                        onClick={downloadPDF}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <Download size={20} /> PDF
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(generatedPlan).map(([day, routine]) => (
                                    <div key={day} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <h4 className="text-gym-neon font-bold mb-2">{day}</h4>
                                        {isEditing ? (
                                            <textarea
                                                value={routine}
                                                onChange={(e) => handlePlanEdit(day, e.target.value)}
                                                className="w-full h-32 bg-black/30 text-white text-sm p-2 rounded-lg border border-white/10 focus:border-gym-neon outline-none resize-none"
                                            />
                                        ) : (
                                            <div className="text-gray-300 text-sm whitespace-pre-line">
                                                {routine}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gym-card backdrop-blur-xl p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                            <Activity size={64} className="text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-400">No Plan Generated</h3>
                            <p className="text-gray-500 mt-2">Fill out the details on the left and click "Generate Plan"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainingPlan;

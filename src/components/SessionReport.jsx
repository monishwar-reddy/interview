import React, { useRef } from 'react';
import { Download, CheckCircle, AlertTriangle, XCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SessionReport = ({ results, role, mode = 'Voice' }) => {
    const reportRef = useRef(null);

    // Calculate Summary Stats
    const totalQuestions = results.length;
    const avgScore = Math.round(results.reduce((acc, curr) => acc + (curr.scores?.total || 0), 0) / totalQuestions);

    // Identify strengths and weaknesses based on average component scores
    const components = ['clarity', 'structure', 'completeness', 'situation', 'task', 'action', 'result', 'reflection'];
    const componentScores = components.reduce((acc, key) => {
        const sum = results.reduce((s, r) => s + (r.scores?.[key] || 0), 0);
        // Normalize: situational components are usually max 2, qualities max 5. 
        // We'll just look at raw averages for now or rely on the feedback text.
        acc[key] = sum / totalQuestions;
        return acc;
    }, {});

    const downloadPDF = async () => {
        const input = reportRef.current;
        if (!input) return;

        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`Interview_Report_${role}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
            {/* Actions Bar */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-8">
                <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium">
                    <Home size={20} /> Back to Home
                </Link>
                <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition"
                >
                    <Download size={20} /> Download Report (PDF)
                </button>
            </div>

            {/* Report Content (To be captured) */}
            <div ref={reportRef} className="bg-white w-full max-w-4xl p-12 rounded-3xl shadow-xl space-y-8 text-slate-900">
                {/* Header */}
                <div className="border-b border-slate-200 pb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Interview Session Report</h1>
                        <p className="text-slate-500 text-lg">Role: <span className="font-semibold text-indigo-600">{role}</span> • Mode: <span className="font-semibold">{mode}</span></p>
                        <p className="text-slate-400 text-sm mt-1">{new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Overall Score</div>
                        <div className={`text-6xl font-black ${avgScore >= 80 ? 'text-emerald-500' : avgScore >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                            {avgScore}
                        </div>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <CheckCircle className="text-emerald-500" size={20} /> Key Strengths
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            {componentScores.structure > 3 && <li>• Good structural adherence to STAR method.</li>}
                            {componentScores.clarity > 3 && <li>• Clear and concise communication style.</li>}
                            {avgScore >= 70 && <li>• Strong overall problem-solving demonstration.</li>}
                            {(componentScores.result || 0) > 1 && <li>• Effectively utilized data/metrics in results.</li>}
                            {/* Fallback if no specific strengths detected high enough */}
                            {avgScore < 50 && <li>• Keep practicing to identify specific strengths.</li>}
                        </ul>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-amber-500" size={20} /> Areas for Improvement
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            {componentScores.situation < 1 && <li>• Need more specific context setting (Situation).</li>}
                            {componentScores.task < 1 && <li>• Clarify your specific role and objectives (Task).</li>}
                            {componentScores.action < 1 && <li>• Detail your personal contributions more (Action).</li>}
                            {componentScores.reflection < 1 && <li>• Include what you learned from the experience (Reflection).</li>}
                            {(componentScores.bodyLanguage || 0) < 70 && <li>• Work on consistent eye contact and pacing.</li>}
                            {avgScore >= 90 && <li>• You are doing great! Focus on subtle refinements.</li>}
                        </ul>
                    </div>
                </div>

                {/* Detailed Question Breakdown */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 pt-4 border-t border-slate-100">Detailed Breakdown</h2>
                    <div className="space-y-8">
                        {results.map((item, index) => (
                            <div key={index} className="break-inside-avoid">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">{item.question}</h3>
                                </div>

                                <div className="ml-12 p-5 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="mb-4">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Answer</div>
                                        <p className="text-slate-600 italic">"{item.answer}"</p>
                                    </div>

                                    {item.feedback && (
                                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Scores</div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge label="Total" score={item.scores?.total} />
                                                    <Badge label="Clarity" score={(item.scores?.clarity / 5) * 100} />
                                                    <Badge label="Structure" score={(item.scores?.structure / 5) * 100} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">AI Feedback</div>
                                                <ul className="text-sm text-slate-600 space-y-1">
                                                    {item.suggestions?.slice(0, 2).map((s, i) => (
                                                        <li key={i}>• {s.replace("🎯 ", "").replace("💡 ", "")}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-12 text-center text-slate-400 text-sm border-t border-slate-200 mt-8">
                    Genereted by BehaviouralSync AI Coach
                </div>
            </div>
        </div>
    );
};

const Badge = ({ label, score }) => (
    <span className={`px-2 py-1 rounded text-xs font-bold ${score >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
        }`}>
        {label}: {score ? Math.round(score) : 'N/A'}
    </span>
);

export default SessionReport;

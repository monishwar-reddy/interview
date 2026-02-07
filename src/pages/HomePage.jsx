import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mic, ArrowRight, BookOpen, Star, Volume2 } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden relative">
            {/* Background Grain/Noise Effect (Optional) */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>

            {/* Navbar */}
            <header className="px-8 py-6 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/50">
                        B
                    </div>
                    <span className="font-bold text-xl tracking-tight">Behavioural<span className="text-indigo-400">Sync</span></span>
                </div>

            </header>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">

                {/* Left Content */}
                <div className="space-y-8 animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 backdrop-blur-sm text-xs font-bold text-indigo-400 uppercase tracking-widest shadow-lg">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        AI Active
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                        Ready for your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">dream job?</span>
                    </h1>

                    <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                        Master your behavioural interview skills with our advanced AI coach. Get real-time feedback on your answers, body language, andSTAR structure.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link to="/voice-simulator" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 group">
                            <Mic className="group-hover:scale-110 transition-transform" /> Start Voice Interview
                        </Link>
                        <Link to="/simulator" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group">
                            <MessageSquare className="group-hover:scale-110 transition-transform" /> Text Practice
                        </Link>
                    </div>


                </div>

                {/* Right Image/Visual */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 rounded-3xl blur-3xl -z-10 animate-pulse"></div>

                    {/* Main Card with Image */}
                    <div className="relative rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl bg-slate-800/30 backdrop-blur-sm">
                        <img
                            src="/ai-avatar.png"
                            alt="AI Interviewer"
                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Overlay UI Elements on Image */}
                        <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center animate-pulse">
                                <Volume2 size={20} className="text-white" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="h-1.5 w-3/4 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-400 w-2/3 animate-[shimmer_2s_infinite]"></div>
                                </div>
                                <div className="h-1.5 w-1/2 bg-slate-700 rounded-full"></div>
                            </div>
                        </div>

                        <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-500/90 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-md">
                            98% Match Score
                        </div>
                    </div>

                    {/* Floating Cards (Decorative) */}
                    <div className="absolute -left-12 top-1/4 p-4 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl hidden lg:block animate-bounce" style={{ animationDuration: '3s' }}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                                <Star size={16} fill="currentColor" />
                            </div>
                            <div className="text-sm font-bold">STAR Method</div>
                        </div>
                        <div className="text-xs text-slate-400">Structure Validation</div>
                    </div>

                    <div className="absolute -right-8 bottom-1/3 p-4 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl hidden lg:block animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                <BookOpen size={16} />
                            </div>
                            <div className="text-sm font-bold">Feedback</div>
                        </div>
                        <div className="text-xs text-slate-400">Instant Grading</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;

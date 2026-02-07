import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, RotateCcw, Award, ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { scoreAnswer } from '../utils/scoring';
import SessionReport from '../components/SessionReport';

// Version 2.1 - Force Refresh
const QUESTIONS = [
    "Tell me about a time you disagreed with a coworker’s approach or decision. How did you handle the situation?",
    "Describe a complex problem you faced where you didn't have all the information. How did you proceed?",
    "Give me an example of a time you had to persuade a stakeholder or team member to see things your way.",
    "Tell me about a mistake you made that had a real impact. How did you address it and what did you learn?",
    "Describe a time when you had to prioritize multiple conflicting deadlines. How did you decide what to focus on?"
];

const SimulatorPage = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [sessionResults, setSessionResults] = useState([]);

    const messagesEndRef = useRef(null);
    const hasInitialized = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Reset full state on mount
        setMessages([]);
        setQuestionIndex(0);
        setSessionComplete(false);
        setSessionResults([]);

        // Initial bot message - ensure it only runs once
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            simulateAgentResponse(null, true);
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const simulateAgentResponse = (userAnswer, isFirst = false) => {
        setIsTyping(true);

        if (isFirst) {
            setTimeout(() => {
                const initialMsg = {
                    role: 'agent',
                    content: `Hello! I'm your behavioural interview coach. Let's practice. \n\n${QUESTIONS[0]}`,
                    feedback: null
                };
                setMessages([initialMsg]);
                setIsTyping(false);
            }, 1000);
            return;
        }

        // 1. Scoring & Analysis (Processing delay)
        setTimeout(() => {
            try {
                const currentQuestion = QUESTIONS[questionIndex] || "General Question";
                const result = scoreAnswer(userAnswer, currentQuestion);

                // Store result
                setSessionResults(prev => [...prev, {
                    question: currentQuestion,
                    answer: userAnswer,
                    scores: result.scores,
                    feedback: result.feedback,
                    suggestions: result.suggestions
                }]);

                // 2. Send Feedback Message FIRST
                const feedbackMsg = {
                    role: 'agent',
                    content: "Here is my feedback based on the STAR rubric:",
                    feedback: {
                        clarity: result.scores.clarity,
                        structure: result.scores.structure,
                        completeness: result.scores.completeness,
                        suggestions: result.suggestions // Pass full list
                    },
                    isFeedbackOnly: true
                };
                setMessages(prev => [...prev, feedbackMsg]);

                // 3. Send Next Question AFTER short delay
                setTimeout(() => {
                    if (questionIndex + 1 < QUESTIONS.length) {
                        const nextQ = QUESTIONS[questionIndex + 1];
                        const nextMsg = {
                            role: 'agent',
                            content: nextQ,
                            feedback: null
                        };
                        setMessages(prev => [...prev, nextMsg]);
                        setQuestionIndex(prev => prev + 1);
                        setIsTyping(false);
                    } else {
                        const finalMsg = {
                            role: 'agent',
                            content: "Great job! We've completed the session. Click below to view your full report.",
                            feedback: null,
                            isFinal: true
                        };
                        setMessages(prev => [...prev, finalMsg]);
                        setIsTyping(false);
                    }
                }, 2000);

            } catch (err) {
                console.error("Simulator Error:", err);
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    role: 'agent',
                    content: "I encountered a small error analyzing that. Let's move on.",
                    feedback: null
                }]);
                // Advance anyway
                setQuestionIndex(prev => prev + 1);
            }

        }, 1500); // Initial analysis delay
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        // Validation: prevent skipping with short answers
        if (inputValue.trim().split(/\s+/).length < 3) {
            const warningMsg = {
                role: 'agent',
                content: "That answer is a bit too short. Please elaborate so I can give you proper feedback."
            };
            const userMsg = { role: 'user', content: inputValue };
            setMessages(prev => [...prev, userMsg, warningMsg]);
            setInputValue('');
            return;
        }

        const userMsg = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        simulateAgentResponse(inputValue);
    };

    if (sessionComplete) {
        return <SessionReport results={sessionResults} role="General" mode="Text" />;
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* Header */}
            <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                <Link to="/" className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">B</div>
                    BehaviouralSync
                </Link>
                <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                        Question {Math.min(questionIndex + 1, QUESTIONS.length)} / {QUESTIONS.length}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white shadow-xl my-4 rounded-2xl overflow-hidden border border-slate-200/60">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'agent' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                    {msg.role === 'agent' ? <Bot size={20} /> : <User size={20} />}
                                </div>
                                <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>

                                    {/* Feedback Card */}
                                    {msg.feedback && (
                                        <div className="mt-2 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl w-full max-w-md animate-fade-in">
                                            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm mb-3">
                                                <Award size={16} />
                                                Rubric Analysis (STAR Method)
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 mb-3">
                                                {/* Scoring.js returns 0-5 for components, multiply by 2 to match 0-10 badges if needed, or just show /5 */}
                                                <ScoreBadge label="Clarity" score={msg.feedback.clarity} max={5} />
                                                <ScoreBadge label="Structure" score={msg.feedback.structure} max={5} />
                                                <ScoreBadge label="Completeness" score={msg.feedback.completeness} max={5} />
                                            </div>

                                            {/* Scrollable Suggestions List */}
                                            <div className="text-xs text-emerald-700 bg-emerald-100/50 p-3 rounded-lg flex flex-col gap-2">
                                                <div className="font-bold uppercase text-[10px] text-emerald-600/70 mb-1">Improvement Suggestions</div>
                                                {msg.feedback.suggestions && msg.feedback.suggestions.length > 0 ? (
                                                    msg.feedback.suggestions.slice(0, 3).map((s, i) => (
                                                        <div key={i} className="flex gap-2 items-start">
                                                            <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                                                            <span>{s.replace("🎯 ", "").replace("💡 ", "").replace("⚠️ ", "")}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex gap-2 items-start">
                                                        <Check size={14} className="mt-0.5 shrink-0" />
                                                        {msg.feedback.suggestion || "Good answer!"}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* View Report Button for Final Message */}
                                    {msg.isFinal && (
                                        <button
                                            onClick={() => setSessionComplete(true)}
                                            className="mt-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg"
                                        >
                                            View Full Session Report
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-4 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                                    <Bot size={20} />
                                </div>
                                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 text-sm rounded-tl-none">
                                    Analyzing response...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="relative max-w-4xl mx-auto flex gap-2 items-end">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Type your answer here... (Press Enter to send)"
                                disabled={sessionResults.length >= QUESTIONS.length}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-400 disabled:opacity-50 min-h-[80px] resize-none"
                                autoFocus
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isTyping || sessionResults.length >= QUESTIONS.length}
                                className="mb-2 aspect-square h-12 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shrink-0"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <div className="text-center mt-2 text-xs text-slate-400">
                            Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const ScoreBadge = ({ label, score, max = 10 }) => (
    <div className="flex flex-col items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
        <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">{label}</span>
        <div className={`text-lg font-bold ${score >= (max * 0.8) ? 'text-emerald-500' : score >= (max * 0.5) ? 'text-amber-500' : 'text-red-500'}`}>
            {score}/{max}
        </div>
    </div>
);

export default SimulatorPage;

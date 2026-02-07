import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Award, ArrowLeft, Volume2, VolumeX, User, AlertCircle, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import { pickSessionQuestions, getAllRoles } from '../data/questions';
import { scoreAnswer } from '../utils/scoring';

import SessionReport from '../components/SessionReport';

const VoiceSimulatorPage = () => {
    const [role, setRole] = useState('SWE');
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [recognition, setRecognition] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [sessionResults, setSessionResults] = useState([]);
    const webcamRef = useRef(null);

    const [interimTranscript, setInterimTranscript] = useState('');

    // Initialize questions
    useEffect(() => {
        const qs = pickSessionQuestions(role);
        setQuestions(qs);
        setCurrentQIndex(0);
        setFeedback(null);
        setTranscript('');
        setInterimTranscript('');
        setSessionComplete(false);
        setSessionResults([]); // Reset results on new session
    }, [role]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognizer = new SpeechRecognition();
            recognizer.continuous = true;
            recognizer.interimResults = true;
            recognizer.lang = 'en-US';

            recognizer.onresult = (event) => {
                let final = '';
                let interim = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final += event.results[i][0].transcript;
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }

                if (final) {
                    setTranscript(prev => (prev ? prev + ' ' + final : final));
                }
                setInterimTranscript(interim);
            };

            recognizer.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                if (event.error === 'not-allowed') {
                    alert('Microphone access denied. Please allow microphone permissions.');
                }
                // Don't always stop on error, sometimes it's just 'no-speech'
                if (event.error === 'aborted' || event.error === 'not-allowed') {
                    setIsRecording(false);
                }
            };

            recognizer.onend = () => {
                setIsRecording(false);
                setInterimTranscript('');
            };

            setRecognition(recognizer);
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }
    }, []);

    const toggleRecording = () => {
        if (!recognition) return;

        if (isRecording) {
            recognition.stop();
            // State update handled in onend
        } else {
            // Don't auto-clear transcript, let user build on it.
            try {
                recognition.start();
                setIsRecording(true);
            } catch (e) {
                console.error("Error starting recognition:", e);
                setIsRecording(false);
            }
        }
    };

    const speakQuestion = (text) => {
        if ('speechSynthesis' in window) {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                return;
            }
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => setIsSpeaking(false);
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSubmitAnswer = () => {
        if (isRecording && recognition) {
            recognition.stop();
        }

        // Combine final + interim
        const fullAnswer = (transcript + ' ' + interimTranscript).trim();

        if (!fullAnswer) return;

        const currentQuestion = questions[currentQIndex];
        const result = scoreAnswer(fullAnswer, currentQuestion.question);

        setFeedback(result);
        setInterimTranscript('');

        // Add to session results
        setSessionResults(prev => [...prev, {
            question: currentQuestion.question,
            answer: fullAnswer,
            scores: result.scores,
            feedback: result.feedback,
            suggestions: result.suggestions
        }]);
    };

    const nextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
            setTranscript('');
            setInterimTranscript('');
            setFeedback(null);
        } else {
            setSessionComplete(true);
        }
    };

    const currentQuestionText = questions[currentQIndex]?.question || "Loading...";

    if (sessionComplete) {
        return <SessionReport results={sessionResults} role={role} mode="Voice" />;
    }

    return (
        <div className="bg-slate-900 min-h-screen text-white overflow-hidden flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center shadow-lg bg-slate-800/50 backdrop-blur-md sticky top-0 z-50">
                <Link to="/" className="font-bold text-lg text-white flex items-center gap-2 hover:text-indigo-400 transition">
                    <ArrowLeft size={20} />
                    Exit Session
                </Link>
                <div className="flex items-center gap-4">
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {getAllRoles().map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>
            </header>

            <main className="flex-1 p-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)]">

                {/* Left Column: Question & Controls */}
                <div className="flex-1 flex flex-col gap-6 h-full overflow-y-auto">
                    {/* Question Card */}
                    <div className="bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-700 animate-slide-up">
                        <div className="flex justify-between items-start mb-6">
                            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Question {currentQIndex + 1} / {questions.length}</div>
                            <div className="flex gap-2">
                                {questions[currentQIndex]?.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 text-[10px] rounded-full font-medium uppercase tracking-wide">#{tag}</span>
                                ))}
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold leading-relaxed mb-8">
                            "{currentQuestionText}"
                        </h2>
                        <button
                            onClick={() => speakQuestion(currentQuestionText)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isSpeaking ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >
                            {isSpeaking ? <><VolumeX size={16} /> Stop Reading</> : <><Volume2 size={16} /> Read Question</>}
                        </button>
                    </div>

                    {/* Transcript / Input */}
                    <div className="flex-1 bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-700 flex flex-col min-h-[200px]">
                        <label className="text-sm font-bold text-slate-400 mb-4 block flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></span>
                            TRANSCRIPT (Live)
                        </label>
                        <textarea
                            className={`flex-1 w-full bg-transparent border-none resize-none focus:outline-none text-lg ${isRecording ? 'text-slate-400 cursor-progress' : 'text-slate-200 placeholder:text-slate-500'}`}
                            placeholder="Press 'Start Answering' to speak, or type your answer here..."
                            value={isRecording ? (transcript + (interimTranscript ? ' ' + interimTranscript : '')) : transcript}
                            onChange={(e) => !isRecording && setTranscript(e.target.value)}
                            readOnly={isRecording}
                        ></textarea>
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={toggleRecording}
                                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${isRecording
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                                    }`}
                            >
                                {isRecording ? <><Square size={20} fill="currentColor" /> Stop Recording</> : <><Mic size={20} /> Start Answering</>}
                            </button>
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={(!transcript && !interimTranscript)}
                                className="px-6 rounded-xl font-bold bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRecording ? "Stop & Analyze" : "Analyze Text"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Video & Feedback */}
                <div className="lg:w-[480px] flex flex-col gap-6 h-full overflow-y-auto">
                    {/* Webcam Feed */}
                    <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-slate-800 aspect-video lg:aspect-[4/3] shrink-0">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover"
                            mirrored
                        />
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            Camera Active
                        </div>
                        {isRecording && (
                            <div className="absolute top-4 right-4 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
                                REC
                            </div>
                        )}
                    </div>

                    {/* Real-time Analysis / Results */}
                    <div className="flex-1 bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-700 overflow-y-auto">
                        {!feedback ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-8">
                                <Camera size={48} className="mb-4 opacity-20" />
                                <p>AI is watching your <br />body language & facial cues.</p>
                                <p className="text-xs mt-4 opacity-50">Score will appear after submission.</p>
                            </div>
                        ) : (
                            <div className="animate-fade-in space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                                    <h3 className="text-xl font-bold">Feedback</h3>
                                    <div className="text-3xl font-extrabold text-emerald-400">{feedback.scores.total}</div>
                                </div>

                                {/* Body Language Section */}
                                <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                                    <h4 className="text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2">
                                        <User size={16} /> Body Language Analysis
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                                        <div className="bg-slate-800 p-2 rounded-lg">
                                            <div className="text-slate-400 mb-1">Confidence Score</div>
                                            <div className="text-lg text-white">{feedback.scores.bodyLanguage}/100</div>
                                        </div>
                                        <div className="bg-slate-800 p-2 rounded-lg">
                                            <div className="text-slate-400 mb-1">Eye Contact</div>
                                            <div className="text-emerald-400">{feedback.feedback.bodyLanguage.eyeContact.includes("Good") ? "Strong" : "Needs Work"}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-xs text-slate-300 italic">
                                        "{feedback.feedback.bodyLanguage.eyeContact}"
                                    </div>
                                </div>

                                {/* STAR Analysis Summary */}
                                <div className="space-y-3">
                                    <ScoreBar label="Clarity" score={feedback.scores.clarity} max={5} />
                                    <ScoreBar label="Structure (STAR)" score={feedback.scores.structure} max={5} />
                                    <ScoreBar label="Completeness" score={feedback.scores.completeness} max={5} />
                                </div>

                                <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-sm">
                                    <div className="font-bold text-indigo-300 mb-2">Top Recommendation:</div>
                                    <ul className="list-disc pl-4 space-y-1 text-indigo-100">
                                        {feedback.suggestions.slice(0, 2).map((s, i) => (
                                            <li key={i}>{s.replace("🎯 ", "").replace("💡 ", "")}</li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={nextQuestion}
                                    className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
                                >
                                    Next Question
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const ScoreBar = ({ label, score, max }) => (
    <div>
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
            <span>{label}</span>
            <span>{score}/{max}</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${(score / max) * 100}%` }}
            ></div>
        </div>
    </div>
);

export default VoiceSimulatorPage;

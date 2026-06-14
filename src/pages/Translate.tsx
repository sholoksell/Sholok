
import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import { ArrowRightLeft, Mic, Image as ImageIcon, Copy, RotateCw, Volume2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const Translate = () => {
    const [sourceText, setSourceText] = useState("");
    const [targetText, setTargetText] = useState("");
    const [sourceLang, setSourceLang] = useState("English");
    const [targetLang, setTargetLang] = useState("Bangla");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const languageMap: Record<string, string> = {
        "English": "en",
        "Bangla": "bn",
        "Spanish": "es",
        "Korean": "ko",
        "Auto Detect": "Autodetect"
    };

    const speechLangMap: Record<string, string> = {
        "English": "en-US",
        "Bangla": "bn-BD",
        "Spanish": "es-ES",
        "Korean": "ko-KR",
        "Auto Detect": "en-US"
    };

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setSourceText(prev => prev + (prev ? ' ' : '') + transcript);
                setIsListening(false);
                // Auto-translate after voice input
                setTimeout(() => {
                    handleTranslateVoice(transcript);
                }, 100);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                alert('Voice recognition error: ' + event.error);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const handleVoiceInput = () => {
        if (!recognitionRef.current) {
            alert('Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.lang = speechLangMap[sourceLang] || 'en-US';
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error('Error starting recognition:', error);
                alert('Could not start voice recognition. Please try again.');
            }
        }
    };

    const handleTextToSpeech = () => {
        if (!targetText) return;

        const utterance = new SpeechSynthesisUtterance(targetText);
        utterance.lang = speechLangMap[targetLang] || 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    };

    const handleTranslate = async () => {
        if (!sourceText.trim()) return;

        setIsLoading(true);
        try {
            const sourceCode = languageMap[sourceLang] || "en";
            const targetCode = languageMap[targetLang] || "bn";

            const langPair = sourceCode === "Autodetect" ? `Autodetect|${targetCode}` : `${sourceCode}|${targetCode}`;

            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${langPair}`);
            const data = await response.json();

            if (data.responseStatus === 200) {
                setTargetText(data.responseData.translatedText);
            } else {
                setTargetText("Error: Could not translate. " + (data.responseDetails || ""));
            }
        } catch (error) {
            console.error("Translation error:", error);
            setTargetText("Error: Connection failed. Please check your internet.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTranslateVoice = async (text: string) => {
        if (!text.trim()) return;

        setIsLoading(true);
        try {
            const sourceCode = languageMap[sourceLang] || "en";
            const targetCode = languageMap[targetLang] || "bn";

            const langPair = sourceCode === "Autodetect" ? `Autodetect|${targetCode}` : `${sourceCode}|${targetCode}`;

            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`);
            const data = await response.json();

            if (data.responseStatus === 200) {
                setTargetText(data.responseData.translatedText);
            } else {
                setTargetText("Error: Could not translate. " + (data.responseDetails || ""));
            }
        } catch (error) {
            console.error("Translation error:", error);
            setTargetText("Error: Connection failed. Please check your internet.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwap = () => {
        if (sourceLang === "Auto Detect") return; // Can't swap auto
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        setSourceText(targetText);
        setTargetText(sourceText);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Sholok Translate</h1>
                    <p className="text-muted-foreground">
                        AI-powered translation for text, voice, and images
                        {isListening && <span className="ml-2 text-red-500 font-semibold animate-pulse">🎤 Listening...</span>}
                    </p>
                </div>

                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                    {/* Controls */}
                    <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-secondary/30">
                        <div className="flex items-center gap-4 flex-1">
                            <select
                                value={sourceLang}
                                onChange={(e) => setSourceLang(e.target.value)}
                                className="bg-transparent font-medium hover:text-primary cursor-pointer outline-none"
                            >
                                <option>English</option>
                                <option>Bangla</option>
                                <option>Spanish</option>
                                <option>Korean</option>
                                <option>Auto Detect</option>
                            </select>
                        </div>

                        <button onClick={handleSwap} className="p-2 hover:bg-secondary rounded-full transition-colors" disabled={sourceLang === "Auto Detect"}>
                            <ArrowRightLeft className={`w-4 h-4 ${sourceLang === "Auto Detect" ? "opacity-50" : ""}`} />
                        </button>

                        <div className="flex items-center justify-end gap-4 flex-1">
                            <select
                                value={targetLang}
                                onChange={(e) => setTargetLang(e.target.value)}
                                className="bg-transparent font-medium hover:text-primary cursor-pointer text-primary outline-none"
                            >
                                <option>Bangla</option>
                                <option>English</option>
                                <option>Spanish</option>
                                <option>Korean</option>
                            </select>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="grid md:grid-cols-2 h-[400px] divide-y md:divide-y-0 md:divide-x divide-border">
                        {/* Source */}
                        <div className="p-4 flex flex-col">
                            <textarea
                                value={sourceText}
                                onChange={(e) => setSourceText(e.target.value)}
                                placeholder="Enter text to translate..."
                                className="flex-1 w-full bg-transparent resize-none outline-none text-lg"
                            ></textarea>
                            <div className="flex items-center justify-between mt-4 text-muted-foreground">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleVoiceInput}
                                        className={`p-2 hover:bg-secondary rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : ''}`} 
                                        title={isListening ? "Recording... Click to stop" : "Voice Input"}
                                    >
                                        <Mic className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 hover:bg-secondary rounded-full" title="Image Translation">
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <span className="text-xs">{sourceText.length} / 5000</span>
                            </div>
                        </div>

                        {/* Target */}
                        <div className="p-4 flex flex-col bg-secondary/10">
                            <div className="flex-1 w-full text-lg">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground animate-pulse">
                                        Translating...
                                    </div>
                                ) : targetText ? (
                                    <p>{targetText}</p>
                                ) : (
                                    <p className="text-muted-foreground/50 italic">Translation will appear here...</p>
                                )}
                            </div>
                            <div className="flex items-center justify-between mt-4 text-muted-foreground">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleTextToSpeech}
                                        disabled={!targetText}
                                        className="p-2 hover:bg-secondary rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Listen to translation"
                                    >
                                        <Volume2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => { 
                                            if (targetText) {
                                                navigator.clipboard.writeText(targetText);
                                                alert('Copied to clipboard!');
                                            }
                                        }}
                                        disabled={!targetText}
                                        className="p-2 hover:bg-secondary rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Copy translation"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleTranslate}
                        disabled={isLoading}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-70 disabled:pointer-events-none flex items-center gap-2"
                    >
                        {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : null}
                        {isLoading ? "Translating..." : "Translate Now"}
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Translate;

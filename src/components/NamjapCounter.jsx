import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function NamjapCounter() {
    const [count, setCount] = useState(() => {
        const sessionCount = sessionStorage.getItem("namjapSessionCount");
        const savedCount = localStorage.getItem("namjapCount");
        if (sessionCount) return parseInt(sessionCount, 10);
        if (savedCount) return parseInt(savedCount, 10);
        return 0;
    });

    const [totalCount, setTotalCount] = useState(() => {
        const savedTotal = localStorage.getItem("namjapTotalCount");
        return savedTotal ? parseInt(savedTotal, 10) : 0;
    });

    const [soundEnabled, setSoundEnabled] = useState(true);
    const [ripples, setRipples] = useState([]);

    // Load sound setting on mount
    useEffect(() => {
        const savedSound = localStorage.getItem("namjapSound");
        if (savedSound !== null) {
            setSoundEnabled(savedSound === "true");
        }
    }, []);

    // Save current session count + total to storage
    useEffect(() => {
        localStorage.setItem("namjapCount", count.toString());
        sessionStorage.setItem("namjapSessionCount", count.toString());
        localStorage.setItem("namjapTotalCount", totalCount.toString());
    }, [count, totalCount]);

    // Save sound preference
    useEffect(() => {
        localStorage.setItem("namjapSound", soundEnabled.toString());
    }, [soundEnabled]);

    const playSound = () => {
        if (!soundEnabled) return;

        try {
            const audioContext = new (window.AudioContext ||
                window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime + 0.1
            );

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.log("Audio not available", error);
        }
    };

    const createRipple = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple = {
            id: Date.now() + Math.random(),
            x,
            y,
        };

        setRipples((prev) => [...prev, newRipple]);

        setTimeout(() => {
            setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
        }, 600);
    };

    const increment = (e) => {
        setCount((prev) => prev + 1);
        setTotalCount((prev) => prev + 1);
        playSound();
        createRipple(e);
    };

    const toggleSound = (e) => {
        e.stopPropagation();
        setSoundEnabled((prev) => !prev);
    };

    const resetCounter = (e) => {
        e.stopPropagation();
        setCount(0);
        sessionStorage.removeItem("namjapSessionCount");
        localStorage.removeItem("namjapCount");
        // 👇 do not reset total here, only session
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4 select-none cursor-pointer relative overflow-hidden"
            onClick={increment}
            style={{ touchAction: "manipulation" }}
        >
            {/* Ripple Effects */}
            {ripples.map((ripple) => (
                <div
                    key={ripple.id}
                    className="absolute pointer-events-none"
                    style={{
                        left: ripple.x - 50,
                        top: ripple.y - 50,
                        width: 100,
                        height: 100,
                    }}
                >
                    <div className="w-full h-full bg-blue-300/40 rounded-full animate-ping"></div>
                </div>
            ))}

            {/* Sound Toggle - Top Right */}
            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={toggleSound}
                    className={`p-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm border border-blue-300/30 ${soundEnabled
                            ? "bg-blue-500/80 hover:bg-blue-500 text-white"
                            : "bg-slate-500/80 hover:bg-slate-500 text-white"
                        }`}
                >
                    {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </button>
            </div>

            {/* Reset Button - Top Left */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={resetCounter}
                    className="p-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm border border-red-300/30 bg-red-500/80 hover:bg-red-500 text-white"
                    title="Reset Counter"
                >
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9s.67 1.5 1.5 1.5zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                </button>
            </div>

            <div className="text-center space-y-6 z-10">
                {/* Title */}
                <div className="mb-6">
                    <h1 className="text-3xl md:text-6xl font-bold text-white mb-4 tracking-wider">
                        NAMJAP COUNTER
                    </h1>
                </div>

                {/* Counter Display */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-blue-300/20 shadow-2xl">
                    <div className="text-3xl md:text-9xl font-bold text-white font-mono tracking-wider drop-shadow-lg">
                        {count.toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, useRef, useState } from "react";

export default function TimerCircle({ initialSeconds = 1500 }) { // 25 минут по умолчанию
    const [seconds, setSeconds] = useState(initialSeconds);
    const [running, setRunning] = useState(false);
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const elapsed = 1 - seconds / initialSeconds;
    const dashoffset = circumference * (1 - elapsed);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!running) return;
        intervalRef.current = setInterval(() => {
            setSeconds((s) => {
                if (s <= 1) {
                    clearInterval(intervalRef.current);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [running]);

    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");

    const reset = () => { setSeconds(initialSeconds); setRunning(false); };
    const toggle = () => setRunning((r) => !r);

    return (
        <div className="d-flex flex-column align-items-center">
            <svg width="180" height="180">
                <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="10"/>
                <circle
                    cx="90" cy="90" r={radius} fill="none"
                    stroke="url(#grad)" strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 90 90)"
                />
                <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#7c5cff"/><stop offset="100%" stopColor="#4dd6ff"/>
                    </linearGradient>
                </defs>
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="28" fill="#fff" fontWeight="700">
                    {mm}:{ss}
                </text>
            </svg>

            <div className="d-flex gap-2 mt-3">
                <button className="btn btn-primary btn-sm" onClick={toggle}>{running ? "Pause" : "Start"}</button>
                <button className="btn btn-outline-primary btn-sm" onClick={reset}>Reset</button>
            </div>
        </div>
    );
}

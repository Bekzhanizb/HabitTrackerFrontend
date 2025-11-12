import React from "react";

export default function Logo({ size = 22 }) {
    return (
        <div className="d-flex align-items-center gap-2">
            <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
                <defs>
                    <linearGradient id="df-g" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c5cff"/>
                        <stop offset="100%" stopColor="#4dd6ff"/>
                    </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="28" fill="url(#df-g)" opacity="0.25"/>
                <path
                    d="M18 34c5-10 23-12 28-9 3 2 3 6-3 8-7 2-14 6-18 12"
                    stroke="url(#df-g)" strokeWidth="4" fill="none" strokeLinecap="round"
                />
                <circle cx="24" cy="45" r="3" fill="url(#df-g)"/>
            </svg>
            <span className="fw-bold" style={{letterSpacing:".3px"}}>DreamyFocus</span>
        </div>
    );
}

import React, { useEffect, useState } from "react";

const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
        .toString()
        .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};

const TimerCircle = ({ durationSeconds = 1500, label = "Focus" }) => {
    const [remaining, setRemaining] = useState(durationSeconds);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        if (!running) return;
        if (remaining <= 0) {
            setRunning(false);
            return;
        }
        const id = setInterval(() => {
            setRemaining((r) => r - 1);
        }, 1000);
        return () => clearInterval(id);
    }, [running, remaining]);

    const progress = 1 - remaining / durationSeconds;

    const handleToggle = () => {
        if (remaining <= 0) {
            setRemaining(durationSeconds);
            setRunning(true);
        } else {
            setRunning((r) => !r);
        }
    };

    return (
        <div className="d-flex flex-column align-items-center">
            <div className="timer-circle mb-3" onClick={handleToggle}>
                <div
                    className="timer-circle-inner"
                    style={{
                        background: `conic-gradient(#47d16c ${progress * 360}deg, rgba(255,255,255,.06) 0deg)`,
                    }}
                >
                    <div className="timer-circle-content">
                        <div className="timer-circle-time">{formatTime(remaining)}</div>
                        <div className="timer-circle-label">{label}</div>
                    </div>
                </div>
            </div>
            <small className="footer-muted">
                Нажми на круг, чтобы {remaining <= 0 ? "перезапустить" : running ? "поставить на паузу" : "запустить"}
            </small>
        </div>
    );
};

export default TimerCircle;

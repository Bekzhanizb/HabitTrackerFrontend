import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slices/userSlice";
import { API_BASE } from "../config";

const joinUrl = (base, path) => {
    if (!base) return path || "";
    if (!path) return base;
    const b = base.endsWith("/") ? base.slice(0, -1) : base;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${b}${p}`;
};

// 🔥 Placeholder avatar для fallback
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%234a5568' width='100' height='100'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='40' fill='%23e2e8f0' text-anchor='middle'%3E%3F%3C/text%3E%3C/svg%3E";

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useSelector((state) => state.user);
    
    // 🔥 Отслеживаем ошибки загрузки изображения
    const [imageError, setImageError] = useState(false);

    const handleLogout = () => {
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        } catch {}
        dispatch(logout());
        navigate("/login", { replace: true, state: { from: location } });
    };

    // 🔥 Улучшенная логика для аватара
    const getAvatarSrc = () => {
        // Если была ошибка загрузки, используем placeholder
        if (imageError) return DEFAULT_AVATAR;
        
        // Если нет пользователя или картинки
        if (!user?.picture || user.picture === "/uploads/default.png") {
            return DEFAULT_AVATAR;
        }
        
        // Если URL полный (http/https)
        if (user.picture.startsWith("http")) {
            return user.picture;
        }
        
        // Если относительный путь
        return joinUrl(API_BASE, user.picture);
    };

    const avatarSrc = getAvatarSrc();
    const isAdmin = isAuthenticated && user?.role === "admin";

    // 🔥 Обработчик ошибки загрузки изображения
    const handleImageError = (e) => {
        console.warn("Avatar load failed:", avatarSrc);
        setImageError(true);
        // Предотвращаем повторные попытки загрузки
        e.currentTarget.onerror = null;
    };

    return (
        <nav
            className="navbar navbar-expand-lg shadow-sm"
            style={{
                backgroundColor: "rgba(16,23,39,.5)",
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid rgba(255,255,255,.08)",
            }}
        >
            <div className="container">
                <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
                    <div
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: "999px",
                            background:
                                "radial-gradient(circle at 0% 0%, #4dd6ff 0%, #7c5cff 40%, #171c2b 100%)",
                            boxShadow: "0 0 18px rgba(124,92,255,.8)",
                        }}
                    />
                    <span style={{ color: "#e8ecf3", fontSize: "1.3rem" }}>DreamyFocus</span>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon" />
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">
                        <li className="nav-item me-3">
                            <Link className="nav-link fw-medium" to="/">
                                Habits
                            </Link>
                        </li>
                        <li className="nav-item me-3">
                            <Link className="nav-link fw-medium" to="/diary">
                                Diary
                            </Link>
                        </li>

                        {isAdmin && (
                            <li className="nav-item me-3">
                                <Link className="nav-link fw-medium" to="/admin">
                                    Admin
                                </Link>
                            </li>
                        )}

                        {isAuthenticated ? (
                            <>
                                <li className="nav-item d-flex align-items-center me-3">
                                    <Link className="nav-link d-flex align-items-center" to="/profile">
                                        <img
                                            src={avatarSrc}
                                            alt="Profile"
                                            width="36"
                                            height="36"
                                            className="rounded-circle me-2 border"
                                            style={{ objectFit: "cover", borderColor: "#6C63FF" }}
                                            onError={handleImageError}
                                        />
                                        <span className="fw-semibold" style={{ color: "#e8ecf3" }}>
                                            {user?.username || user?.email || "User"}
                                        </span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className="btn btn-sm"
                                        onClick={handleLogout}
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #7c5cff 0%, #4dd6ff 100%)",
                                            color: "white",
                                            borderRadius: "999px",
                                            border: "none",
                                            padding: "6px 16px",
                                        }}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link fw-medium" to="/login" style={{ color: "#e8ecf3" }}>
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item ms-2">
                                    <Link
                                        className="btn btn-sm text-white"
                                        to="/register"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #7c5cff 0%, #4dd6ff 100%)",
                                            borderRadius: "999px",
                                            padding: "6px 16px",
                                            border: "none",
                                        }}
                                    >
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
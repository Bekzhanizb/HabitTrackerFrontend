// src/components/Navbar.jsx
import React from "react";
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

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useSelector((state) => state.user);

    const handleLogout = () => {
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("csrf_token"); // 🔴 ДОБАВИЛИ
        } catch {}
        dispatch(logout());
        navigate("/login", { replace: true, state: { from: location } });
    };

    // ---- НОРМАЛИЗУЕМ ПУТЬ К АВАТАРУ ----
    const rawPicture = user?.picture || "";
    const normalizedPicture = rawPicture.replace(/\\/g, "/"); // '\' -> '/'

    const avatarSrc = normalizedPicture
        ? normalizedPicture.startsWith("http")
            ? normalizedPicture
            : joinUrl(
                API_BASE,
                normalizedPicture.startsWith("/")
                    ? normalizedPicture
                    : `/${normalizedPicture}`
            )
        : "/default-avatar.png";

    return (
        <nav
            className="navbar navbar-expand-lg shadow-sm"
            style={{
                backgroundColor: "#F5F6FA",
                borderBottom: "2px solid #E0E0E0",
            }}
        >
            <div className="container">
                <Link
                    className="navbar-brand fw-bold"
                    to="/"
                    style={{ color: "#6C63FF", fontSize: "1.4rem" }}
                >
                    DreamyFocus
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
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">
                        {isAuthenticated ? (
                            <>
                                <li className="nav-item d-flex align-items-center me-3">
                                    <Link
                                        className="nav-link d-flex align-items-center"
                                        to="/profile"
                                    >
                                        <img
                                            src={avatarSrc}
                                            alt="Profile"
                                            width="36"
                                            height="36"
                                            className="rounded-circle me-2 border"
                                            style={{
                                                objectFit: "cover",
                                                borderColor: "#6C63FF",
                                            }}
                                            onError={(e) => {
                                                e.currentTarget.src = "/default-avatar.png";
                                            }}
                                        />
                                        <span
                                            className="fw-semibold"
                                            style={{ color: "#333" }}
                                        >
                                            {user?.username || user?.email || "User"}
                                        </span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className="btn btn-sm"
                                        onClick={handleLogout}
                                        style={{
                                            backgroundColor: "#6C63FF",
                                            color: "white",
                                            borderRadius: "8px",
                                            border: "none",
                                            padding: "6px 14px",
                                        }}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link
                                        className="nav-link fw-medium"
                                        to="/login"
                                        style={{ color: "#333" }}
                                    >
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item ms-2">
                                    <Link
                                        className="btn btn-sm text-white"
                                        to="/register"
                                        style={{
                                            backgroundColor: "#6C63FF",
                                            borderRadius: "8px",
                                            padding: "6px 14px",
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

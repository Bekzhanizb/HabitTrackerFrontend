import React, { useMemo } from "react";
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

const NavItem = ({ to, label }) => {
    const location = useLocation();
    const active = useMemo(() => {
        if (to === "/") return location.pathname === "/";
        return location.pathname.startsWith(to);
    }, [location.pathname, to]);

    return (
        <li className="nav-item">
            <Link
                to={to}
                className={`nav-link fw-medium ${active ? "active" : ""}`}
                style={{
                    color: active ? "#fff" : "var(--muted)",
                    borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
                    paddingBottom: "6px",
                    transition: "color .2s ease, border-color .2s ease",
                }}
            >
                {label}
            </Link>
        </li>
    );
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
        } catch {}
        dispatch(logout());
        navigate("/login", { replace: true, state: { from: location } });
    };

    const avatarSrc = user?.picture
        ? user.picture.startsWith("http")
            ? user.picture
            : joinUrl(API_BASE, user.picture)
        : "/default-avatar.png";

    return (
        <nav
            className="navbar navbar-expand-lg shadow-sm"
            style={{
                background: "rgba(16,23,39,.5)",
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid var(--border)",
            }}
        >
            <div className="container">
                {/* Brand */}
                <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/" style={{ color: "#fff" }}>
          <span
              style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background:
                      "radial-gradient(circle at 40% 40%, var(--primary), var(--primary-2))",
                  boxShadow: "0 0 10px rgba(124,92,255,.8)",
                  display: "inline-block",
              }}
          />
                    <span style={{ letterSpacing: ".3px" }}>HabitTracker</span>
                </Link>

                {/* Toggler */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                    style={{ borderColor: "var(--border)" }}
                >
                    <span className="navbar-toggler-icon" />
                </button>

                {/* Nav */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center gap-2">
                        <NavItem to="/" label="Habits" />
                        {!isAuthenticated && (
                            <>
                                <NavItem to="/login" label="Login" />
                                <li className="nav-item">
                                    <Link className="btn btn-sm btn-primary px-3" to="/register">
                                        Get Started
                                    </Link>
                                </li>
                            </>
                        )}

                        {isAuthenticated && (
                            <>
                                <NavItem to="/profile" label="Profile" />
                                <li className="nav-item d-flex align-items-center">
                                    <Link className="nav-link d-flex align-items-center" to="/profile" style={{ color: "#fff" }}>
                                        <img
                                            src={avatarSrc}
                                            alt="Profile"
                                            width="36"
                                            height="36"
                                            className="rounded-circle me-2"
                                            style={{
                                                objectFit: "cover",
                                                border: "1px solid var(--border)",
                                                boxShadow: "var(--shadow)",
                                            }}
                                            onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
                                        />
                                        <span className="fw-semibold">
                      {user?.username || user?.email || "User"}
                    </span>
                                    </Link>
                                </li>
                                <li className="nav-item ms-1">
                                    <button className="btn btn-sm btn-primary px-3" onClick={handleLogout}>
                                        Logout
                                    </button>
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

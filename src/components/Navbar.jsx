import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slices/userSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm"
      style={{
        backgroundColor: "#F5F6FA",
        borderBottom: "2px solid #E0E0E0",
      }}
    >
      <div className="container">
        {/* Логотип */}
        <Link
          className="navbar-brand fw-bold"
          to="/"
          style={{ color: "#6C63FF", fontSize: "1.4rem" }}
        >
          HabitTracker
        </Link>

        {/* Кнопка меню (мобилка) */}
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

        {/* Основные ссылки */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {isAuthenticated ? (
              <>
                <li className="nav-item d-flex align-items-center me-3">
                  <Link className="nav-link d-flex align-items-center" to="/profile">
                    <img
                      src={
                        user?.picture
                          ? `http://localhost:8080${user.picture}`
                          : "/default-avatar.png"
                      }
                      alt="Profile"
                      width="36"
                      height="36"
                      className="rounded-circle me-2 border"
                      style={{
                        objectFit: "cover",
                        borderColor: "#6C63FF",
                      }}
                    />
                    <span
                      className="fw-semibold"
                      style={{ color: "#333" }}
                    >
                      {user?.username || "User"}
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

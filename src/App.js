import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import Main from "./pages/Main";
import Diary from "./pages/Diary";
import AdminPanel from "./pages/AdminPanel";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/theme.css";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.user);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

function App() {
    const { user } = useSelector((s)=>s.user);
    const isAdmin = user?.role === "admin";

    return (
        <Router>
            <Navbar />
            <div className="container container-page">
                <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/diary" element={<Diary />} />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route
                        path="/profile"
                        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                {isAdmin ? <AdminPanel /> : <Navigate to="/" replace />}
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// UI
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/theme.css";

// Pages
import Landing from "./pages/Landing";
import Main from "./pages/Main";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
    const { isAuthenticated } = useSelector((state) => state.user);

    return (
        <Router>
            <Navbar />
            <div className="container container-page">
                <Routes>
                    {/* Главная: гостям — лендинг, авторизованным — список привычек */}
                    <Route path="/" element={isAuthenticated ? <Main /> : <Landing />} />

                    {/* Логин/Регистрация: если уже вошёл — на главную */}
                    <Route
                        path="/login"
                        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
                    />
                    <Route
                        path="/register"
                        element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />}
                    />

                    {/* Профиль: только для авторизованных */}
                    <Route
                        path="/profile"
                        element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />}
                    />

                    {/* Фоллбек */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

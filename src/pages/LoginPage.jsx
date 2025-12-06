// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import api from "../api/axios";
import { login } from "../slices/userSlice"; // 👈 ВАЖНО: login, а не loginSuccess

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // бекенд слушает POST /login (без /api)
            const res = await api.post("/login", {
                username,
                password,
            });

            const token =
                res.data?.token ||
                res.data?.access_token ||
                res.data?.jwt;

            if (!token) {
                throw new Error("Token not found in response");
            }

            const user = res.data.user || {};

            // сохраняем в localStorage
            try {
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
            } catch {}

            // 👇 вызываем экшен login из userSlice
            dispatch(
                login({
                    user,
                    token,
                })
            );

            navigate("/", { replace: true });
        } catch (err) {
            console.error("Login error:", err);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Неверный логин или пароль"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center mt-5">
            <Card
                className="rounded-2xl shadow-soft"
                style={{ maxWidth: 420, width: "100%" }}
            >
                <Card.Body>
                    <h3 className="mb-3 text-center">Вход</h3>
                    {error && (
                        <Alert
                            variant="danger"
                            dismissible
                            onClose={() => setError("")}
                            className="mb-3"
                        >
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                className="input-dark"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Введите логин"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                className="input-dark"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Введите пароль"
                            />
                        </Form.Group>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-100"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Вхожу...
                                </>
                            ) : (
                                "Войти"
                            )}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default LoginPage;

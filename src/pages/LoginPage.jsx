import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { login } from "../slices/userSlice";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/axios";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // ВАЖНО: отправляем как x-www-form-urlencoded (совместимо с c.PostForm)
            const body = new URLSearchParams();
            body.set("username", username);
            body.set("password", password);

            const res = await api.post("/login", body, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            const token =
                res.data?.token ||
                res.data?.access_token ||
                res.data?.jwt ||
                res.data?.data?.token;

            const rawUser =
                res.data?.user ||
                res.data?.data?.user || {
                    id: res.data?.id ?? res.data?.user_id,
                    username: res.data?.username ?? username,
                    role: res.data?.role ?? "user",
                    email: res.data?.email,
                    picture: res.data?.picture ?? res.data?.avatar ?? null,
                };

            const user = { ...rawUser, picture: rawUser.picture ?? rawUser.avatar ?? null };

            if (!token || !user) {
                throw new Error("Некорректный ответ сервера: отсутствует токен или пользователь");
            }

            dispatch(login({ user, token }));
            try {
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
            } catch {}

            const to = location.state?.from?.pathname || "/profile";
            navigate(to, { replace: true });
        } catch (err) {
            console.error("Login error:", err);
            const message =
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                "Неверное имя пользователя или пароль";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <h3 className="text-center mb-4">Вход в систему</h3>

                    {error && (
                        <Alert variant="danger" className="text-center">
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label>Имя пользователя</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Введите имя пользователя"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Пароль</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type={showPass ? "text" : "password"}
                                    placeholder="Введите пароль"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                                <Button
                                    variant="outline-secondary"
                                    type="button"
                                    onClick={() => setShowPass((s) => !s)}
                                >
                                    {showPass ? "Скрыть" : "Показать"}
                                </Button>
                            </div>
                        </Form.Group>

                        <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner size="sm" animation="border" className="me-2" />
                                    Входим...
                                </>
                            ) : (
                                "Войти"
                            )}
                        </Button>

                        <div className="text-center mt-3">
                            <small>
                                Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
                            </small>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;

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
        const res = await api.post("/login", {
            username,
            password,
        });

        const token = res.data?.token;
        const user = res.data?.user;

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
            "Incorrecr name or password";
        setError(message);
    } finally {
        setLoading(false);
    }
};


    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <h3 className="text-center mb-4">Login</h3>

                    {error && (
                        <Alert variant="danger" className="text-center">
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter the username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type={showPass ? "text" : "password"}
                                    placeholder="Password"
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
                                    {showPass ? "Hide" : "Show"}
                                </Button>
                            </div>
                        </Form.Group>

                        <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner size="sm" animation="border" className="me-2" />
                                    Logging...
                                </>
                            ) : (
                                "Login"
                            )}
                        </Button>

                        <div className="text-center mt-3">
                            <small>
                                Don't you have an account? <Link to="/register">Register</Link>
                            </small>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;

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
      // Интерцептор сам получит свежий CSRF-токен перед запросом
      const res = await api.post("/api/login", { username, password });

      const token = res.data?.token || res.data?.access_token || res.data?.jwt;
      const rawUser = res.data?.user || res.data?.data?.user || {
        id: res.data?.id ?? res.data?.user_id,
        username: res.data?.username ?? username,
        role: res.data?.role ?? "user",
        city_id: res.data?.city_id,
        picture: res.data?.picture,
      };

      if (!token) throw new Error("Токен не пришёл с сервера");

      dispatch(login({ user: rawUser, token }));
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(rawUser));

      const redirectTo = location.state?.from?.pathname || "/profile";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Неверное имя пользователя или пароль";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ... остальной JSX без изменений
  return (
    // твой красивый JSX остаётся тем же
    <Container className="container-page">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="card rounded-2xl p-4 shadow-soft hero">
            <h3 className="text-center mb-3">Вход в DreamyFocus</h3>
            <p className="text-center footer-muted mb-4">
              Вернись к своим привычкам и заметкам.
            </p>

            {error && <Alert variant="danger" className="text-center">{error}</Alert>}

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Имя пользователя</Form.Label>
                <Form.Control
                  className="input-dark"
                  type="text"
                  placeholder="Введите имя пользователя"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Пароль</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    className="input-dark"
                    type={showPass ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPass(s => !s)}
                  >
                    {showPass ? "Скрыть" : "Показать"}
                  </Button>
                </div>
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100 mb-3" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Входим...
                  </>
                ) : "Войти"}
              </Button>

              <div className="text-center footer-muted">
                Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
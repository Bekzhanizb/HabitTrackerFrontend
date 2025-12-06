// src/pages/RegisterPage.jsx
import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../slices/userSlice";
import api from "../api/axios";

const MAX_AVATAR_BYTES = 3 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        city_id: "",
        avatar: null,
    });

    const [cities, setCities] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(true);
    const [citiesError, setCitiesError] = useState("");

    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            setCitiesLoading(true);
            setCitiesError("");
            try {
                const res = await api.get("/api/cities", { signal: controller.signal });
                const list = Array.isArray(res.data) ? res.data : (res.data?.cities || []);
                setCities(list);
            } catch (err) {
                if (err?.code !== "ERR_CANCELED") {
                    const status = err.response?.status;
                    const payload = err.response?.data;
                    setCitiesError(
                        `Не удалось загрузить список городов` +
                        (status ? ` (HTTP ${status})` : "") +
                        (payload ? `: ${typeof payload === "string" ? payload : JSON.stringify(payload)}` : "")
                    );
                }
            } finally {
                setCitiesLoading(false);
            }
        })();
        return () => controller.abort();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "avatar") {
            const file = files?.[0];
            if (file) {
                if (!ALLOWED_MIME.includes(file.type)) {
                    setError("Разрешены только JPG, PNG или WEBP");
                    return;
                }
                if (file.size > MAX_AVATAR_BYTES) {
                    setError("Файл слишком большой (макс. 3 МБ)");
                    return;
                }
            }
            setError("");
            setFormData((s) => ({ ...s, avatar: file || null }));
        } else {
            setFormData((s) => ({ ...s, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.username.trim()) {
            setError("Введите имя пользователя");
            return;
        }
        if ((formData.password || "").length < 3) {
            setError("Пароль должен быть не менее 3 символов");
            return;
        }
        if (!formData.city_id) {
            setError("Выберите город");
            return;
        }

        setSending(true);
        try {
            const data = new FormData();
            data.append("username", formData.username.trim());
            data.append("password", formData.password);
            data.append("city_id", String(Number(formData.city_id)));

            if (formData.avatar) {
                data.append("avatar", formData.avatar);
            }

            // ✅ БЭК: POST /api/register (public)
            const res = await api.post("/api/register", data, {
                headers: { "Content-Type": "multipart/form-data" },
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
                    username: res.data?.username ?? formData.username,
                    role: res.data?.role ?? "user",
                    picture: res.data?.picture ?? res.data?.avatar ?? null,
                    city_id: Number(formData.city_id),
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

            // 🔴 ДОБАВИЛИ: сразу после регистрации получить CSRF-токен
            try {
                const csrfRes = await api.get("/api/csrf");
                const csrfToken =
                    csrfRes.data?.csrf_token ||
                    csrfRes.data?.token ||
                    csrfRes.headers["x-csrf-token"];
                if (csrfToken) {
                    localStorage.setItem("csrf_token", csrfToken);
                }
            } catch (csrfErr) {
                console.error("CSRF init failed after register:", csrfErr);
            }

            navigate("/profile", { replace: true });
        } catch (err) {
            console.error("Ошибка при регистрации:", err);
            const status = err.response?.status;
            const payload = err.response?.data;
            setError(
                (payload?.error || payload?.message || err.message || "Ошибка при регистрации") +
                (status ? ` (HTTP ${status})` : "")
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <h3 className="text-center mb-4">Регистрация</h3>

                    {(error || citiesError) && (
                        <Alert variant="danger" className="text-center">
                            {error || citiesError}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Имя пользователя</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                placeholder="Введите имя пользователя"
                                value={formData.username}
                                onChange={handleChange}
                                maxLength={60}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Пароль</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type={showPass ? "text" : "password"}
                                    name="password"
                                    placeholder="Введите пароль"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
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

                        <Form.Group className="mb-3">
                            <Form.Label>Город</Form.Label>
                            <Form.Select
                                name="city_id"
                                value={formData.city_id}
                                onChange={handleChange}
                                required
                                disabled={citiesLoading}
                            >
                                <option value="">
                                    {citiesLoading ? "Загрузка..." : "Выберите город..."}
                                </option>
                                {cities.map((city) => (
                                    <option key={city.id} value={city.id}>
                                        {city.name}
                                    </option>
                                ))}
                            </Form.Select>
                            {citiesLoading && (
                                <div className="mt-2">
                                    <Spinner size="sm" animation="border" /> Загрузка городов...
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Аватар (JPG/PNG/WEBP, до 3 МБ)</Form.Label>
                            <Form.Control
                                type="file"
                                name="avatar"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleChange}
                            />
                            <Form.Text muted>
                                Сейчас можно пропустить. Фото добавим в профиле.
                            </Form.Text>
                        </Form.Group>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-100"
                            disabled={sending || citiesLoading}
                        >
                            {sending ? (
                                <>
                                    <Spinner size="sm" animation="border" className="me-2" />
                                    Отправка...
                                </>
                            ) : (
                                "Зарегистрироваться"
                            )}
                        </Button>

                        <div className="text-center mt-3">
                            <small>
                                Уже есть аккаунт? <Link to="/login">Войти</Link>
                            </small>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

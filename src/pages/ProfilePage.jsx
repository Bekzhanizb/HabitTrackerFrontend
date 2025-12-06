// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Image,
    Spinner,
    Alert,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/axios";
import { updateUser } from "../slices/userSlice";
import { API_BASE } from "../config";

const joinUrl = (base, path) => {
    if (!base) return path || "";
    if (!path) return base;
    const b = base.endsWith("/") ? base.slice(0, -1) : base;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${b}${p}`;
};

const DEFAULT_AVATAR =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect fill='%234a5568' width='150' height='150'/%3E%3Ctext x='75' y='85' font-family='Arial' font-size='60' fill='%23e2e8f0' text-anchor='middle'%3E%3F%3C/text%3E%3C/svg%3E";

const ProfilePage = () => {
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [username, setUsername] = useState(user?.username || "");
    const [cityId, setCityId] = useState(user?.city_id ?? "");
    const [cities, setCities] = useState([]);
    const [picture, setPicture] = useState(null);
    const [preview, setPreview] = useState(user?.picture || "");
    const [loading, setLoading] = useState(false);
    const [listLoading, setListLoading] = useState(true);
    const [error, setError] = useState("");
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setUsername(user?.username || "");
        setCityId(user?.city_id ?? "");
        setPreview(user?.picture || "");
        setImageError(false);
    }, [user]);

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            setListLoading(true);
            try {
                // ✅ БЭК: GET /api/cities
                const res = await api.get("/api/cities", { signal: controller.signal });
                setCities(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Ошибка при загрузке городов:", err);
                setError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Не удалось загрузить список городов"
                );
            } finally {
                setListLoading(false);
            }
        })();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        return () => {
            if (preview && preview.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handlePictureChange = (e) => {
        const file = e.target.files?.[0] || null;
        setPicture(file);

        if (preview && preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }

        if (file) {
            setPreview(URL.createObjectURL(file));
            setImageError(false);
        } else {
            setPreview(user?.picture || "");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("username", username);
            if (cityId !== "" && cityId !== null && cityId !== undefined) {
                formData.append("city_id", String(Number(cityId)));
            }
            if (picture) formData.append("picture", picture);

            // ✅ БЭК: PUT /api/profile
            const res = await api.put("/api/profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const updated = res.data?.user || res.data?.data?.user || res.data;
            if (!updated) throw new Error("Некорректный ответ сервера");

            dispatch(updateUser(updated));

            try {
                const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...savedUser, ...updated }));
            } catch {}

            if (updated.picture && !updated.picture.startsWith("http")) {
                setPreview(updated.picture);
            }

            setImageError(false);
            alert("Профиль успешно обновлен!");
        } catch (err) {
            console.error("Ошибка при обновлении профиля:", err);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                "Ошибка при обновлении профиля"
            );
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <Container className="container-page text-center">
                <h4>Пожалуйста, войдите в систему, чтобы просмотреть профиль</h4>
            </Container>
        );
    }

    const getAvatarSrc = () => {
        if (imageError) return DEFAULT_AVATAR;

        if (preview && preview.startsWith("blob:")) {
            return preview;
        }

        if (!preview || preview === "/uploads/default.png") {
            return DEFAULT_AVATAR;
        }

        if (preview.startsWith("http")) {
            return preview;
        }

        return joinUrl(API_BASE, preview.startsWith("/") ? preview : `/${preview}`);
    };

    const avatarSrc = getAvatarSrc();

    const handleImageError = (e) => {
        console.warn("Avatar load failed:", avatarSrc);
        setImageError(true);
        e.currentTarget.onerror = null;
    };

    return (
        <Container className="container-page">
            <Row className="justify-content-center">
                <Col md={7} lg={6}>
                    <div className="card rounded-2xl p-4 shadow-soft">
                        <div className="text-center mb-4">
                            <Image
                                src={avatarSrc}
                                roundedCircle
                                width={140}
                                height={140}
                                alt="User Avatar"
                                className="shadow-sm"
                                style={{ objectFit: "cover" }}
                                onError={handleImageError}
                            />
                            <h3 className="mt-3">{user.username}</h3>
                            <p className="text-muted mb-0">{user.role}</p>
                        </div>

                        {error && (
                            <Alert
                                variant="danger"
                                className="mb-3"
                                dismissible
                                onClose={() => setError("")}
                            >
                                {error}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Имя пользователя</Form.Label>
                                <Form.Control
                                    className="input-dark"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    maxLength={60}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Город</Form.Label>
                                <Form.Select
                                    className="input-dark"
                                    value={cityId}
                                    onChange={(e) => setCityId(e.target.value)}
                                    disabled={listLoading}
                                >
                                    <option value="">Выберите город...</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {city.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                {listLoading && (
                                    <div className="mt-2">
                                        <Spinner size="sm" animation="border" /> Загрузка городов...
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Фото профиля</Form.Label>
                                <Form.Control
                                    className="input-dark"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handlePictureChange}
                                />
                                <Form.Text muted>
                                    Поддерживаются изображения (jpg, png, webp, до 3MB).
                                </Form.Text>
                            </Form.Group>

                            <div className="d-grid">
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Сохранение...
                                        </>
                                    ) : (
                                        "Сохранить изменения"
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;

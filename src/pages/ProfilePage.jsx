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
import { updateUser } from "../slices/userSlice";
import api from "../api/axios";
import { API_BASE } from "../config";

const joinUrl = (base, path) => {
    if (!base) return path || "";
    if (!path) return base;
    const b = base.endsWith("/") ? base.slice(0, -1) : base;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${b}${p}`;
};

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

    useEffect(() => {
        setUsername(user?.username || "");
        setCityId(user?.city_id ?? "");
        setPreview(user?.picture || "");
    }, [user]);

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            setListLoading(true);
            try {
                const res = await api.get("/api/cities", { signal: controller.signal });
                setCities(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                if (err?.code !== "ERR_CANCELED") {
                    console.error("Ошибка при загрузке городов:", err);
                    setError(
                        err.response?.data?.message ||
                        err.response?.data?.error ||
                        "Не удалось загрузить список городов"
                    );
                }
            } finally {
                setListLoading(false);
            }
        })();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        return () => {
            if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handlePictureChange = (e) => {
        const file = e.target.files?.[0];
        setPicture(file || null);
        if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
        setPreview(file ? URL.createObjectURL(file) : user?.picture || "");
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

            const res = await api.post("/update-profile", formData);

            const updatedRaw = res.data?.user || res.data?.data?.user || res.data;
            if (!updatedRaw) throw new Error("Некорректный ответ сервера");

            const updated = {
                ...updatedRaw,
                picture: updatedRaw.picture ?? updatedRaw.avatar ?? updatedRaw?.Picture ?? "",
            };

            dispatch(updateUser(updated));

            try {
                const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...savedUser, ...updated }));
            } catch {}

            if (updated.picture && !updated.picture.startsWith("http")) {
                setPreview(updated.picture);
            }

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
            <Container className="mt-5 text-center">
                <h4>Пожалуйста, войдите в систему, чтобы просмотреть профиль</h4>
            </Container>
        );
    }

    const avatarSrc = preview
        ? preview.startsWith("http")
            ? preview
            : joinUrl(API_BASE, preview.startsWith("/") ? preview : `/${preview}`)
        : "https://via.placeholder.com/150";

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <div className="text-center mb-4">
                        <Image
                            src={avatarSrc}
                            roundedCircle
                            width={150}
                            height={150}
                            alt="User Avatar"
                            className="shadow-sm object-fit-cover"
                            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150")}
                        />
                        <h3 className="mt-3">{user.username}</h3>
                        <p className="text-muted">{user.role}</p>
                    </div>

                    {error && (
                        <Alert variant="danger" className="mb-3">
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Имя пользователя</Form.Label>
                            <Form.Control
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

                        <Form.Group className="mb-3">
                            <Form.Label>Фото профиля</Form.Label>
                            <Form.Control type="file" accept="image/*" onChange={handlePictureChange} />
                            <Form.Text muted>
                                Поддерживаются изображения (jpg, png, webp). Размер — по правилам бэкенда.
                            </Form.Text>
                        </Form.Group>

                        <div className="d-grid">
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : "Сохранить изменения"}
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;

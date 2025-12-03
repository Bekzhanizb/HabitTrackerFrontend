import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, Container, Row, Col, Modal, Form, Alert, Spinner } from "react-bootstrap";
import api from "../api/axios";
import TimerCircle from "../components/TimerCircle";

const Main = () => {
    const [habits, setHabits] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        frequency: "daily",
    });

    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    })();
    const userId = user?.id ?? null;

    const fetchHabits = useCallback(async () => {
        if (!userId) {
            setHabits([]);
            setSelected(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/api/habits", { params: { user_id: userId } });
            const list = Array.isArray(res.data) ? res.data : [];
            setHabits(list);
            setSelected(list[0] || null);
        } catch (err) {
            console.error("Ошибка при загрузке привычек:", err);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Не удалось загрузить привычки"
            );
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((s) => ({ ...s, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            await api.post("/habit", { ...formData, user_id: userId });
            setShowModal(false);
            setFormData({ title: "", description: "", frequency: "daily" });
            await fetchHabits();
        } catch (err) {
            console.error("Ошибка при сохранении привычки:", err);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Ошибка при сохранении привычки"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleAdd = () => {
        setFormData({ title: "", description: "", frequency: "daily" });
        setShowModal(true);
    };

    return (
        <Container className="container-page">
            <Row className="mb-4">
                <Col lg={7}>
                    <div className="hero rounded-2xl p-4 shadow-soft">
                        <span className="badge badge-soft mb-2">DreamyFocus · Habits</span>
                        <h2 className="mb-2">Собери свои привычки в одном месте</h2>
                        <p className="footer-muted mb-0">
                            Выбирай привычку, запускай фокус-таймер и возвращайся к ней каждый день.
                        </p>
                    </div>
                </Col>
                <Col lg={5} className="d-flex justify-content-lg-end align-items-center mt-3 mt-lg-0">
                    <Button
                        variant="primary"
                        className="shadow-soft"
                        onClick={handleAdd}
                        disabled={!userId}
                    >
                        + Добавить привычку
                    </Button>
                </Col>
            </Row>

            {!userId && (
                <Alert variant="warning" className="mb-3">
                    Вы не вошли в систему. Пожалуйста,{" "}
                    <a href="/login" className="link-cta">
                        войдите
                    </a>
                    , чтобы просматривать и изменять привычки.
                </Alert>
            )}

            {error && (
                <Alert variant="danger" className="mb-3">
                    {error}
                </Alert>
            )}

            <Row>
                <Col lg={7} className="mb-4">
                    {loading ? (
                        <div className="d-flex justify-content-center py-5">
                            <Spinner animation="border" role="status" />
                        </div>
                    ) : habits.length === 0 ? (
                        <div className="empty rounded-2xl p-4 text-center">
                            <h5 className="mb-1">Пока нет привычек</h5>
                            <p className="footer-muted mb-0">
                                Нажми «Добавить привычку», чтобы начать свой трекер.
                            </p>
                        </div>
                    ) : (
                        <Row>
                            {habits.map((habit) => {
                                const isActive = selected?.id === habit.id;
                                return (
                                    <Col md={6} key={habit.id} className="mb-3">
                                        <Card
                                            className={`rounded-2xl shadow-soft ${
                                                isActive ? "border border-primary" : ""
                                            }`}
                                            onClick={() => setSelected(habit)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <div className="habit-title">{habit.title}</div>
                                                        {habit.description && (
                                                            <div className="habit-meta mt-1">{habit.description}</div>
                                                        )}
                                                    </div>
                                                    <span className="badge badge-soft">
                            {habit.frequency === "daily"
                                ? "Ежедневно"
                                : habit.frequency === "weekly"
                                    ? "Еженедельно"
                                    : habit.frequency === "monthly"
                                        ? "Ежемесячно"
                                        : habit.frequency}
                          </span>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}
                </Col>

                <Col lg={5}>
                    <div className="card rounded-2xl p-4 shadow-soft h-100 d-flex flex-column align-items-center justify-content-center">
                        {selected ? (
                            <>
                                <h5 className="mb-3 text-center">
                                    Фокус по привычке: <span className="habit-title">{selected.title}</span>
                                </h5>
                                <TimerCircle
                                    durationSeconds={25 * 60}
                                    label={
                                        selected.frequency === "daily"
                                            ? "Ежедневный фокус"
                                            : selected.frequency === "weekly"
                                                ? "Фокус недели"
                                                : "Фокус месяца"
                                    }
                                />
                            </>
                        ) : (
                            <div className="text-center footer-muted">
                                Выберите привычку слева, чтобы запустить таймер.
                            </div>
                        )}
                    </div>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Новая привычка</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Название</Form.Label>
                            <Form.Control
                                className="input-dark"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                className="input-dark"
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Частота</Form.Label>
                            <Form.Select
                                className="input-dark"
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleChange}
                                required
                            >
                                <option value="daily">Каждый день</option>
                                <option value="weekly">Каждую неделю</option>
                                <option value="monthly">Каждый месяц</option>
                            </Form.Select>
                        </Form.Group>

                        <Button type="submit" variant="primary" className="w-100" disabled={saving || !userId}>
                            {saving ? "Сохранение..." : "Добавить привычку"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Main;

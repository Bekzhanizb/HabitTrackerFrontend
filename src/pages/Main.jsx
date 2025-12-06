// src/pages/Main.jsx
import React, { useCallback, useEffect, useState } from "react";
import {
    Button,
    Card,
    Container,
    Row,
    Col,
    Modal,
    Form,
    Alert,
    Spinner,
} from "react-bootstrap";
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
            console.log("🚀 Fetching habits for user:", userId);

            // ✅ БЭК: GET /habits (без /api)
            const res = await api.get("/habits");

            console.log("✅ Habits response:", res.data);

            const list = Array.isArray(res.data) ? res.data : [];
            setHabits(list);
            setSelected(list[0] || null);
        } catch (err) {
            console.error("❌ Ошибка при загрузке привычек:", err);
            console.error("Response data:", err.response?.data);
            console.error("Response status:", err.response?.status);

            setError(
                err.response?.data?.error ||
                err.response?.data?.details ||
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
            console.log("📝 Creating habit:", formData);

            // ✅ БЭК: POST /habit
            await api.post("/habit", {
                ...formData,
                user_id: userId,
            });

            console.log("✅ Habit created successfully");

            setShowModal(false);
            setFormData({ title: "", description: "", frequency: "daily" });
            await fetchHabits();
        } catch (err) {
            console.error("❌ Ошибка при сохранении привычки:", err);
            console.error("Response:", err.response?.data);

            setError(
                err.response?.data?.error ||
                err.response?.data?.details ||
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

    const handleDelete = async (habitId) => {
        if (!window.confirm("Вы уверены, что хотите удалить эту привычку?")) {
            return;
        }

        try {
            console.log("🗑️ Deleting habit:", habitId);

            // ✅ БЭК: DELETE /habit/:id
            await api.delete(`/habit/${habitId}`);

            console.log("✅ Habit deleted");

            if (selected?.id === habitId) {
                setSelected(null);
            }

            await fetchHabits();
        } catch (err) {
            console.error("❌ Ошибка при удалении:", err);
            alert(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Ошибка при удалении привычки"
            );
        }
    };

    const handleToggleActive = async (habitId, currentStatus) => {
        try {
            console.log("🔄 Toggling habit status:", habitId);

            // ✅ БЭК: PUT /habit/:id
            await api.put(`/habit/${habitId}`, {
                is_active: !currentStatus,
            });

            console.log("✅ Status toggled");

            await fetchHabits();
        } catch (err) {
            console.error("❌ Ошибка при изменении статуса:", err);
            alert("Ошибка при изменении статуса привычки");
        }
    };

    const handleLog = async (habitId, isCompleted = true) => {
        try {
            console.log("📊 Logging habit:", habitId, "completed:", isCompleted);

            // ✅ БЭК: POST /habit/log
            await api.post("/habit/log", {
                habit_id: habitId,
                is_completed: isCompleted,
            });

            console.log("✅ Habit logged");

            await fetchHabits();
        } catch (err) {
            console.error("❌ Ошибка при отметке привычки:", err);
            alert("Ошибка при отметке привычки");
        }
    };

    return (
        <Container className="container-page">
            <Row className="mb-4">
                <Col lg={7}>
                    <div className="hero rounded-2xl p-4 shadow-soft">
                        <span className="badge badge-soft mb-2">DreamyFocus · Habits</span>
                        <h2 className="mb-2">Собери свои привычки в одном месте</h2>
                        <p className="footer-muted mb-0">
                            Выбирай привычку, запускай фокус-таймер и возвращайся к ней
                            каждый день.
                        </p>
                    </div>
                </Col>
                <Col
                    lg={5}
                    className="d-flex justify-content-lg-end align-items-center mt-3 mt-lg-0"
                >
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
                <Alert
                    variant="danger"
                    className="mb-3"
                    dismissible
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
            )}

            <Row>
                <Col lg={7} className="mb-4">
                    {loading ? (
                        <div className="d-flex justify-content-center py-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Загрузка...</span>
                            </Spinner>
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
                                const isHabitActive = habit.is_active !== false;

                                return (
                                    <Col md={6} key={habit.id} className="mb-3">
                                        <Card
                                            className={`rounded-2xl shadow-soft ${
                                                isActive ? "border border-primary" : ""
                                            } ${!isHabitActive ? "opacity-50" : ""}`}
                                            onClick={() => setSelected(habit)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div className="flex-grow-1">
                                                        <div className="habit-title">
                                                            {habit.title}
                                                            {!isHabitActive && (
                                                                <span className="badge bg-secondary ms-2">
                                  Неактивна
                                </span>
                                                            )}
                                                        </div>
                                                        {habit.description && (
                                                            <div className="habit-meta mt-1">
                                                                {habit.description}
                                                            </div>
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

                                                <div
                                                    className="mt-3 d-flex gap-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="outline-success"
                                                        onClick={() => handleLog(habit.id, true)}
                                                        disabled={!isHabitActive}
                                                    >
                                                        ✓ Выполнено
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline-secondary"
                                                        onClick={() =>
                                                            handleToggleActive(habit.id, isHabitActive)
                                                        }
                                                    >
                                                        {isHabitActive ? "⏸ Пауза" : "▶ Активировать"}
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        onClick={() => handleDelete(habit.id)}
                                                    >
                                                        🗑️
                                                    </Button>
                                                </div>

                                                {habit.logs && habit.logs.length > 0 && (
                                                    <div className="mt-2 small text-muted">
                                                        📊 Записей: {habit.logs.length}
                                                    </div>
                                                )}
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
                                    Фокус по привычке:{" "}
                                    <span className="habit-title">{selected.title}</span>
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
                                <div className="mt-3 text-center">
                                    <Button
                                        variant="success"
                                        onClick={() => handleLog(selected.id, true)}
                                        className="me-2"
                                    >
                                        ✓ Отметить выполненной
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center footer-muted">
                                Выберите привычку слева, чтобы запустить таймер.
                            </div>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Модальное окно создания привычки */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Новая привычка</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && (
                        <Alert
                            variant="danger"
                            dismissible
                            onClose={() => setError("")}
                        >
                            {error}
                        </Alert>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Название</Form.Label>
                            <Form.Control
                                className="input-dark"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                maxLength={100}
                                required
                                placeholder="Например: Медитация"
                            />
                            <Form.Text className="text-muted">
                                Максимум 100 символов
                            </Form.Text>
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
                                maxLength={500}
                                placeholder="Необязательное описание привычки"
                            />
                            <Form.Text className="text-muted">
                                Максимум 500 символов (необязательно)
                            </Form.Text>
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

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-100"
                            disabled={saving || !userId || !formData.title.trim()}
                        >
                            {saving ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Сохранение...
                                </>
                            ) : (
                                "Добавить привычку"
                            )}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Main;

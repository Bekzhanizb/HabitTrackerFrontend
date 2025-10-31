import React, { useEffect, useMemo, useState } from "react";
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
    ProgressBar,
} from "react-bootstrap";
import api from "../api/axios";

const toYMD = (date) => date.toISOString().slice(0, 10);

function calcStats(habit) {
    const logs = Array.isArray(habit?.Logs) ? habit.Logs : habit?.logs || [];
    if (!logs.length) return { progress: 0, streak: 0 };

    const completed = logs
        .filter((l) => l.is_completed || l.IsCompleted)
        .map((l) => toYMD(new Date(l.date || l.Date)));

    const set = new Set(completed);
    const today = new Date();

    // 7-дневный прогресс
    let count = 0;
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (set.has(toYMD(d))) count++;
    }
    const progress = Math.round((count / 7) * 100);

    let streak = 0;
    for (let i = 0; ; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (set.has(toYMD(d))) streak++;
        else break;
    }

    return { progress, streak };
}

const Main = () => {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        frequency: "daily",
    });

    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    }, []);
    const userId = user?.id ?? null;

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        fetchHabits();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const fetchHabits = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/habits", { params: { user_id: userId } });
            setHabits(Array.isArray(res.data) ? res.data : []);
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
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((s) => ({ ...s, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            if (editMode && selectedHabit?.id) {
                await api.put(`/habit/${selectedHabit.id}`, formData);
            } else {
                await api.post("/habit", { ...formData, user_id: userId });
            }
            setShowModal(false);
            setEditMode(false);
            setSelectedHabit(null);
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

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить привычку?")) return;
        try {
            await api.delete(`/habit/${id}`);
            await fetchHabits();
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            alert(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Ошибка при удалении"
            );
        }
    };

    const handleEdit = (habit) => {
        setEditMode(true);
        setSelectedHabit(habit);
        setFormData({
            title: habit.title ?? "",
            description: habit.description ?? "",
            frequency: habit.frequency ?? "daily",
        });
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditMode(false);
        setSelectedHabit(null);
        setFormData({ title: "", description: "", frequency: "daily" });
        setShowModal(true);
    };

    return (
        <Container className="container-page">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h2 className="fw-bold m-0">My Habits</h2>
                    <div className="footer-muted">Build streaks, keep momentum.</div>
                </div>
                <Button variant="primary" onClick={handleAdd} disabled={!userId}>
                    + New habit
                </Button>
            </div>

            {!userId && (
                <Alert variant="warning" className="mb-4">
                    Вы не вошли в систему. Пожалуйста,{" "}
                    <a className="link-cta" href="/login">
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

            {loading ? (
                <div className="d-flex justify-content-center py-5">
                    <Spinner animation="border" role="status" />
                </div>
            ) : habits.length === 0 ? (
                <div className="empty rounded-2xl p-5 text-center">
                    <h5 className="mb-2">Пока пусто</h5>
                    <div className="footer-muted mb-3">
                        Создайте свою первую привычку и начните стрик сегодня.
                    </div>
                    <Button variant="primary" onClick={handleAdd} disabled={!userId}>
                        Add a habit
                    </Button>
                </div>
            ) : (
                <Row className="g-4">
                    {habits.map((habit) => {
                        const { progress, streak } = calcStats(habit);
                        return (
                            <Col md={6} lg={4} key={habit.id}>
                                <Card className="rounded-2xl h-100">
                                    <Card.Body>
                                        <div className="d-flex align-items-start justify-content-between">
                                            <div>
                                                <div className="habit-title">{habit.title}</div>
                                                <div className="habit-meta mt-1">
                                                    {habit.frequency === "daily"
                                                        ? "Every day"
                                                        : habit.frequency === "weekly"
                                                            ? "Every week"
                                                            : habit.frequency === "monthly"
                                                                ? "Every month"
                                                                : habit.frequency}
                                                </div>
                                            </div>
                                            <span className="badge badge-soft rounded-pill">
                        🔥 {streak}d
                      </span>
                                        </div>

                                        {habit.description && (
                                            <div className="mt-3" style={{ color: "var(--muted)" }}>
                                                {habit.description}
                                            </div>
                                        )}

                                        <div className="mt-3">
                                            <ProgressBar now={progress} />
                                            <div className="d-flex justify-content-between mt-1 footer-muted">
                                                <span>7-day</span>
                                                <span>{progress}%</span>
                                            </div>
                                        </div>

                                        <div className="d-flex gap-2 mt-4">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleEdit(habit)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(habit.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {/* МОДАЛКА */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editMode ? "Редактировать привычку" : "Новая привычка"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
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
                            <Form.Label>Description</Form.Label>
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
                            <Form.Label>Frequency</Form.Label>
                            <Form.Select
                                className="input-dark"
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleChange}
                                required
                            >
                                <option value="daily">Every day</option>
                                <option value="weekly">Every week</option>
                                <option value="monthly">Every month</option>
                            </Form.Select>
                        </Form.Group>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-100"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editMode
                                    ? "Сохранить изменения"
                                    : "Добавить привычку"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Main;

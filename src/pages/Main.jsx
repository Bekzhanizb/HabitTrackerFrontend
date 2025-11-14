import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Container, Row, Col, Modal, Form, Alert, Spinner, ProgressBar } from "react-bootstrap";
import api from "../api/axios";
import TimerCircle from "../components/TimerCircle";

const toYMD = (date) => date.toISOString().slice(0, 10);

function calcStats(habit) {
    const logs = Array.isArray(habit?.Logs) ? habit.Logs : habit?.logs || [];
    if (!logs.length) return { progress: 0, streak: 0 };
    const completed = logs
        .filter((l) => l.is_completed || l.IsCompleted)
        .map((l) => toYMD(new Date(l.date || l.Date)));
    const set = new Set(completed);
    const today = new Date();

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
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: "", description: "", frequency: "daily" });

    const user = useMemo(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } }, []);
    const userId = user?.id ?? null;

    useEffect(() => {
        if (!userId) { setLoading(false); return; }
        fetchHabits();
    }, [userId]);

    const fetchHabits = async () => {
        setLoading(true); setError("");
        try {
            const res = await api.get("/habits");
            const data = Array.isArray(res.data) ? res.data : [];
            setHabits(data);
            setSelected(null); // ничего не выбрано по умолчанию
        } catch (err) {
            console.error("Ошибка при загрузке привычек:", err);
            setError(err.response?.data?.error || err.response?.data?.message || "Не удалось загрузить привычки");
        } finally { setLoading(false); }
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
            setError(err.response?.data?.error || err.response?.data?.message || "Ошибка при сохранении привычки");
        } finally { setSaving(false); }
    };

    return (
        <Container className="container-page">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h2 className="fw-bold m-0">Habits</h2>
                    <div className="footer-muted">Choose a habit to focus. If none selected, the stage is empty.</div>
                </div>
                <Button variant="primary" onClick={() => setShowModal(true)} disabled={!userId}>+ New habit</Button>
            </div>

            {!userId && (
                <Alert variant="warning" className="mb-4">
                    Вы не вошли в систему. <a className="link-cta" href="/login">Войти</a>
                </Alert>
            )}

            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

            {loading ? (
                <div className="d-flex justify-content-center py-5"><Spinner animation="border"/></div>
            ) : (
                <Row className="g-4">
                    {/* Список слева */}
                    <Col lg={4}>
                        <Card className="rounded-2xl">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <div className="fw-bold">My Habits</div>
                                    <span className="badge badge-soft rounded-pill">{habits.length}</span>
                                </div>
                                {habits.length === 0 ? (
                                    <div className="footer-muted">Список пуст.</div>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        {habits.map((h) => {
                                            const { progress, streak } = calcStats(h);
                                            const active = selected?.id === h.id;
                                            return (
                                                <button
                                                    key={h.id}
                                                    className="btn text-start"
                                                    style={{
                                                        background: active ? "rgba(255,255,255,.08)" : "transparent",
                                                        border: "1px solid var(--border)",
                                                        color: "#fff",
                                                        borderRadius: 12,
                                                        padding: "10px 12px"
                                                    }}
                                                    onClick={() => setSelected(h)}
                                                >
                                                    <div className="d-flex justify-content-between">
                                                        <div className="fw-semibold">{h.title}</div>
                                                        <span className="badge badge-soft rounded-pill">🔥 {streak}d</span>
                                                    </div>
                                                    <div className="footer-muted">
                                                        {h.frequency === "daily" ? "Every day" : h.frequency === "weekly" ? "Every week" : h.frequency === "monthly" ? "Every month" : h.frequency}
                                                    </div>
                                                    <ProgressBar className="mt-2" now={progress}/>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={8}>
                        {!selected ? (
                            <div className="empty rounded-2xl p-5 text-center">
                                <h5 className="mb-2">Ничего не выбрано</h5>
                                <div className="footer-muted">Выберите привычку слева, чтобы начать таймер и видеть детали.</div>
                            </div>
                        ) : (
                            <Card className="rounded-2xl h-100">
                                <Card.Body>
                                    <div className="d-flex align-items-start justify-content-between">
                                        <div>
                                            <div className="habit-title">{selected.title}</div>
                                            <div className="habit-meta mt-1">
                                                {selected.frequency === "daily" ? "Every day" : selected.frequency === "weekly" ? "Every week" : selected.frequency === "monthly" ? "Every month" : selected.frequency}
                                            </div>
                                        </div>
                                    </div>

                                    {selected.description && <div className="mt-3" style={{color:"var(--muted)"}}>{selected.description}</div>}

                                    <div className="my-4 d-flex justify-content-center">
                                        <TimerCircle initialSeconds={25 * 60} />
                                    </div>

                                    <div className="mt-3">
                                        <div className="footer-muted mb-1">7-day progress</div>
                                        <ProgressBar now={calcStats(selected).progress}/>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Новая привычка</Modal.Title></Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control className="input-dark" type="text" name="title" value={formData.title} onChange={(e)=>setFormData(s=>({...s, title:e.target.value}))} required/>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control className="input-dark" as="textarea" rows={3} name="description" value={formData.description} onChange={(e)=>setFormData(s=>({...s, description:e.target.value}))}/>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Frequency</Form.Label>
                            <Form.Select className="input-dark" name="frequency" value={formData.frequency} onChange={(e)=>setFormData(s=>({...s, frequency:e.target.value}))} required>
                                <option value="daily">Every day</option>
                                <option value="weekly">Every week</option>
                                <option value="monthly">Every month</option>
                            </Form.Select>
                        </Form.Group>
                        <Button type="submit" variant="primary" className="w-100" disabled={saving}>
                            {saving ? "Saving..." : "Добавить привычку"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Main;

import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Form, Button, Card, ListGroup } from "react-bootstrap";

const STORAGE_KEY = "df_diary_entries";

const todayISO = () => new Date().toISOString().slice(0, 10);

const Diary = () => {
    const [selectedDate, setSelectedDate] = useState(todayISO());
    const [entries, setEntries] = useState([]);
    const [mode, setMode] = useState("list"); // list | view | edit
    const [current, setCurrent] = useState(null);
    const [form, setForm] = useState({ title: "", body: "" });

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                setEntries(JSON.parse(raw));
            }
        } catch {
            setEntries([]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch {}
    }, [entries]);

    const entriesForDay = useMemo(
        () => entries.filter((e) => e.date === selectedDate),
        [entries, selectedDate]
    );

    const handleChangeForm = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const handleCreate = () => {
        setMode("edit");
        setCurrent(null);
        setForm({ title: "", body: "" });
    };

    const handleSave = () => {
        if (!form.title.trim() && !form.body.trim()) return;

        if (current) {
            setEntries((list) =>
                list.map((e) =>
                    e.id === current.id ? { ...e, title: form.title, body: form.body } : e
                )
            );
        } else {
            const newEntry = {
                id: Date.now(),
                date: selectedDate,
                title: form.title || "Без названия",
                body: form.body,
            };
            setEntries((list) => [newEntry, ...list]);
            setCurrent(newEntry);
            setMode("view");
            return;
        }
        setMode("view");
    };

    const handleOpen = (entry) => {
        setCurrent(entry);
        setForm({ title: entry.title, body: entry.body });
        setMode("view");
    };

    const handleDelete = (entry) => {
        if (!window.confirm("Удалить запись?")) return;
        setEntries((list) => list.filter((e) => e.id !== entry.id));
        setCurrent(null);
        setMode("list");
    };

    const handleBackToList = () => {
        setCurrent(null);
        setMode("list");
    };

    return (
        <Container className="container-page">
            <Row className="mb-4">
                <Col lg={4} className="mb-3">
                    <div className="card rounded-2xl p-3 shadow-soft">
                        <h5 className="mb-3">Календарь</h5>
                        <Form.Group className="mb-3">
                            <Form.Label className="footer-muted">Выберите дату</Form.Label>
                            <Form.Control
                                className="input-dark"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </Form.Group>

                        <Button variant="primary" className="w-100" onClick={handleCreate}>
                            + Новая запись
                        </Button>
                    </div>
                </Col>

                <Col lg={8}>
                    {mode === "list" && (
                        <Card className="rounded-2xl shadow-soft">
                            <Card.Body>
                                <h5 className="mb-3">
                                    Записи за{" "}
                                    <span className="habit-title">
                    {new Date(selectedDate).toLocaleDateString()}
                  </span>
                                </h5>
                                {entriesForDay.length === 0 ? (
                                    <div className="empty rounded-2xl p-4 text-center">
                                        <p className="mb-0 footer-muted">
                                            В этот день пока нет записей. Нажмите «Новая запись», чтобы добавить.
                                        </p>
                                    </div>
                                ) : (
                                    <ListGroup variant="flush">
                                        {entriesForDay.map((entry) => (
                                            <ListGroup.Item
                                                key={entry.id}
                                                className="bg-transparent text-white d-flex justify-content-between align-items-center"
                                                style={{ borderColor: "rgba(255,255,255,.08)" }}
                                            >
                                                <div onClick={() => handleOpen(entry)} style={{ cursor: "pointer" }}>
                                                    <div className="habit-title">{entry.title}</div>
                                                    {entry.body && (
                                                        <div className="footer-muted">
                                                            {entry.body.length > 80
                                                                ? entry.body.slice(0, 80) + "..."
                                                                : entry.body}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(entry)}
                                                >
                                                    🗑
                                                </Button>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Card.Body>
                        </Card>
                    )}

                    {(mode === "view" || mode === "edit") && (
                        <Card className="rounded-2xl shadow-soft">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <Button variant="outline-secondary" size="sm" onClick={handleBackToList}>
                                        ← К списку
                                    </Button>
                                    <small className="footer-muted">
                                        {new Date(selectedDate).toLocaleDateString()}
                                    </small>
                                </div>

                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Заголовок</Form.Label>
                                        <Form.Control
                                            className="input-dark"
                                            type="text"
                                            name="title"
                                            value={form.title}
                                            onChange={handleChangeForm}
                                            placeholder="Например, «Как прошёл день»"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Текст записи</Form.Label>
                                        <Form.Control
                                            className="input-dark"
                                            as="textarea"
                                            rows={8}
                                            name="body"
                                            value={form.body}
                                            onChange={handleChangeForm}
                                            placeholder="Поделись мыслями, планами, успехами..."
                                        />
                                    </Form.Group>

                                    <div className="d-flex justify-content-between">
                                        {current && (
                                            <Button
                                                variant="outline-danger"
                                                type="button"
                                                onClick={() => handleDelete(current)}
                                            >
                                                Удалить
                                            </Button>
                                        )}
                                        <div className="ms-auto d-flex gap-2">
                                            {mode === "view" && (
                                                <Button
                                                    variant="outline-primary"
                                                    type="button"
                                                    onClick={() => setMode("edit")}
                                                >
                                                    Редактировать
                                                </Button>
                                            )}
                                            <Button variant="primary" type="button" onClick={handleSave}>
                                                Сохранить
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Diary;

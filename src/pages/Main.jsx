import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Container, Row, Col, Modal, Form, Alert } from "react-bootstrap";

const Main = () => {
  const [habits, setHabits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    frequency: "daily",
  });
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // 🔹 Загружаем привычки при старте
  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/habits?user_id=${userId}`);
      setHabits(res.data);
    } catch (err) {
      console.error("Ошибка при загрузке привычек:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Создать или обновить привычку
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editMode) {
        // ✏️ Редактирование привычки
        await axios.put(`http://localhost:8080/habit/${selectedHabit.id}`, formData);
      } else {
        // ➕ Создание новой привычки
        await axios.post("http://localhost:8080/habit", {
          ...formData,
          user_id: userId,
        });
      }

      setShowModal(false);
      setEditMode(false);
      setFormData({ title: "", description: "", frequency: "daily" });
      fetchHabits();
    } catch (err) {
      setError("Ошибка при сохранении привычки");
    }
  };

  // 🔹 Удаление привычки
  const handleDelete = async (id) => {
    if (!window.confirm("Удалить привычку?")) return;

    try {
      await axios.delete(`http://localhost:8080/habit/${id}`);
      fetchHabits();
    } catch (err) {
      console.error("Ошибка при удалении:", err);
    }
  };

  // 🔹 Открыть модалку для редактирования
  const handleEdit = (habit) => {
    setEditMode(true);
    setSelectedHabit(habit);
    setFormData({
      title: habit.title,
      description: habit.description,
      frequency: habit.frequency,
    });
    setShowModal(true);
  };

  // 🔹 Открыть модалку для добавления
  const handleAdd = () => {
    setEditMode(false);
    setSelectedHabit(null);
    setFormData({ title: "", description: "", frequency: "daily" });
    setShowModal(true);
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">My Habits</h2>

      <div className="text-center mb-4">
        <Button variant="success" onClick={handleAdd}>
          Add a habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <p className="text-center text-muted">Empty</p>
      ) : (
        <Row>
          {habits.map((habit) => (
            <Col md={4} key={habit.id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{habit.title}</Card.Title>
                  <Card.Text>{habit.description}</Card.Text>
                  <Card.Text>
                    <strong>Frequency:</strong> {habit.frequency}
                  </Card.Text>

                  <div className="d-flex justify-content-between">
                    <Button variant="outline-primary" size="sm" onClick={() => handleEdit(habit)}>
                      ✏️
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(habit.id)}>
                      🗑️
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 🔹 Модальное окно */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Редактировать привычку" : "Новая привычка"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
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
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Frequency</Form.Label>
              <Form.Select name="frequency" value={formData.frequency} onChange={handleChange}>
                <option value="daily">Everyday</option>
                <option value="weekly">Everyweek</option>
                <option value="monthly">Everymonth</option>
              </Form.Select>
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              {editMode ? "Сохранить изменения" : "Добавить привычку"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Main;

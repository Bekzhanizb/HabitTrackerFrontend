import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../slices/userSlice";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    city_id: "",
    avatar: null,
  });
  const [cities, setCities] = useState([]);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/cities")
      .then((res) => setCities(res.data.cities || res.data))
      .catch((err) => console.error("Ошибка при загрузке городов:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setFormData({ ...formData, avatar: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("password", formData.password);
      data.append("city_id", formData.city_id);
      if (formData.avatar) data.append("avatar", formData.avatar);

      const res = await axios.post("http://localhost:8080/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 🔹 Обновляем Redux и localStorage
      dispatch(login({ user: res.data.user, token: res.data.token }));

      // 🔹 Переходим на профиль без alert
      navigate("/profile");
    } catch (err) {
      console.error("Ошибка при регистрации:", err);
      setError(err.response?.data?.error || "Ошибка при регистрации");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h3 className="text-center mb-4">Регистрация</h3>

          {error && <Alert variant="danger" className="text-center">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Имя пользователя</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Город</Form.Label>
              <Form.Select
                name="city_id"
                value={formData.city_id}
                onChange={handleChange}
                required
              >
                <option value="">Выберите город...</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Аватар</Form.Label>
              <Form.Control
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleChange}
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              Зарегистрироваться
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Image, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../slices/userSlice";

const ProfilePage = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [username, setUsername] = useState(user?.username || "");
  const [cityId, setCityId] = useState(user?.city_id || "");
  const [cities, setCities] = useState([]);
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState(user?.picture || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8080/api/cities")
      .then(res => setCities(res.data))
      .catch(err => console.error("Ошибка при загрузке городов:", err));
  }, []);

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    setPicture(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("city_id", cityId);
    if (picture) formData.append("picture", picture);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:8080/update-profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(updateUser(res.data.user));
      alert("Профиль успешно обновлен!");
    } catch (err) {
      console.error("Ошибка при обновлении профиля:", err);
      alert(err.response?.data?.error || "Ошибка при обновлении профиля");
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

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="text-center mb-4">
            
            <Image
  src={
    preview
      ? preview.startsWith("http")
        ? preview
        : `http://localhost:8080/${preview.startsWith("/") ? preview.slice(1) : preview}`
      : "https://via.placeholder.com/150" // fallback, если фото нет
  }
  roundedCircle
  width={150}
  height={150}
  alt="User Avatar"
  className="shadow-sm"
/>

            <h3 className="mt-3">{user.username}</h3>
            <p className="text-muted">{user.role}</p>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Имя пользователя</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Город</Form.Label>
              <Form.Select value={cityId} onChange={(e) => setCityId(e.target.value)}>
                <option value="">Выберите город...</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Фото профиля</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handlePictureChange} />
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

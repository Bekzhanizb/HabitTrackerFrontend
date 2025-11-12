import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Form, Button, Image, Spinner, Alert, Card } from "react-bootstrap";
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

export default function ProfilePage(){
    const { user } = useSelector(s=>s.user);
    const dispatch = useDispatch();

    const [username, setUsername] = useState(user?.username || "");
    const [cityId, setCityId] = useState(user?.city_id ?? "");
    const [cities, setCities] = useState([]);
    const [picture, setPicture] = useState(null);
    const [preview, setPreview] = useState(user?.picture || "");
    const [loading, setLoading] = useState(false);
    const [listLoading, setListLoading] = useState(true);
    const [error, setError] = useState("");

    const token = useMemo(() => localStorage.getItem("token") || null, []);

    useEffect(()=>{
        (async ()=>{
            setListLoading(true);
            try{
                const res = await api.get("/api/cities");
                setCities(Array.isArray(res.data)? res.data : []);
            }catch(e){
                setError(e.response?.data?.error || "Не удалось загрузить города");
            }finally{ setListLoading(false); }
        })();
    },[]);

    useEffect(()=> ()=>{ if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

    const avatarSrc = preview
        ? (preview.startsWith("http") ? preview : joinUrl(API_BASE, preview.startsWith("/")? preview : `/${preview}`))
        : "https://via.placeholder.com/150";

    const handlePictureChange = (e) => {
        const file = e.target.files?.[0];
        setPicture(file || null);
        if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
        setPreview(file ? URL.createObjectURL(file) : user?.picture || "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setLoading(true);
        try{
            const form = new FormData();
            form.append("username", username);
            if (cityId !== "" && cityId !== null && cityId !== undefined) {
                form.append("city_id", String(Number(cityId)));
            }
            if (picture) form.append("picture", picture);

            const res = await api.post("/update-profile", form);
            const updated = res.data?.user || res.data;
            if (!updated) throw new Error("Некорректный ответ сервера");

            dispatch(updateUser(updated));
            try {
                const saved = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...saved, ...updated }));
            } catch {}
            if (updated.picture && !updated.picture.startsWith("http")) setPreview(updated.picture);
        } catch (err){
            setError(err.response?.data?.error || err.message || "Ошибка при обновлении профиля");
        } finally { setLoading(false); }
    };

    if (!user) {
        return (
            <Container className="container-page text-center">
                <h4>Пожалуйста, войдите в систему, чтобы просмотреть профиль</h4>
            </Container>
        );
    }

    return (
        <Container className="container-page">
            <Row className="g-4">
                <Col lg={4}>
                    <Card className="rounded-2xl h-100">
                        <Card.Body className="text-center">
                            <Image
                                src={avatarSrc} roundedCircle width={150} height={150} alt="User Avatar"
                                className="shadow-sm object-fit-cover"
                                onError={(e)=> e.currentTarget.src="https://via.placeholder.com/150"}
                            />
                            <h4 className="mt-3">{user.username}</h4>
                            <div className="footer-muted">{user.role}</div>

                            <div className="mt-3">
                                <Form.Label className="mb-1">Сменить аватар</Form.Label>
                                <Form.Control type="file" accept="image/*" onChange={handlePictureChange}/>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="rounded-2xl h-100">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Profile settings</h5>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Имя пользователя</Form.Label>
                                            <Form.Control className="input-dark" value={username} onChange={(e)=>setUsername(e.target.value)} required/>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Город</Form.Label>
                                            <Form.Select className="input-dark" value={cityId} onChange={(e)=>setCityId(e.target.value)} disabled={listLoading}>
                                                <option value="">{listLoading ? "Загрузка..." : "Выберите город..."}</option>
                                                {cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-end mt-4">
                                    <Button type="submit" variant="primary" disabled={loading}>
                                        {loading ? <Spinner size="sm" animation="border"/> : "Сохранить изменения"}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

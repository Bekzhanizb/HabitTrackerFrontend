import React, { useEffect, useState } from "react";
import {
    Alert,
    Badge,
    Card,
    Col,
    Container,
    Row,
    Spinner,
    Table,
    Tabs,
    Tab,
    Button,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import api from "../api/axios";
export default function AdminPanel() {
    const { user: currentUser } = useSelector((state) => state.user);

    // --- состояния ---
    const [activeTab, setActiveTab] = useState("habits");
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const [habits, setHabits] = useState([]);
    const [habitsLoading, setHabitsLoading] = useState(false);

    const [diary, setDiary] = useState([]);
    const [diaryLoading, setDiaryLoading] = useState(false);

    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const [error, setError] = useState("");

    // --- ВСЕ useEffect должны стоять ДО return ---
    useEffect(() => {
        loadUsers();
        loadHabits();
        loadDiary();
        loadLogs();
    }, []);

    // ❗ Условный рендер — ТОЛЬКО ПОСЛЕ хуков!
    if (!currentUser || currentUser.role !== "admin") {
        return (
            <Container className="container-page">
                <Alert variant="danger">
                    Доступ разрешён только admin
                </Alert>
            </Container>
        );
    }

    const loadUsers = async () => {
        setUsersLoading(true);
        setError("");
        try {
            // 👉 Пытаемся получить всех пользователей
            const res = await api.get("/admin/users");
            const list = Array.isArray(res.data) ? res.data : [];
            setUsers(list);
        } catch (err) {
            console.warn("admin/users endpoint not ready, using fallback");
            // fallback – хотя бы текущий юзер, чтобы UI не ломался
            setUsers([
                {
                    id: currentUser.id,
                    username: currentUser.username || "admin",
                    email: currentUser.email || "-",
                    role: currentUser.role,
                    city: currentUser.city || null,
                    created_at: currentUser.created_at,
                },
            ]);
        } finally {
            setUsersLoading(false);
        }
    };

    const loadHabits = async () => {
        setHabitsLoading(true);
        setError("");
        try {
            // 👉 основная попытка – специально /admin/habits (в будущем)
            let res;
            try {
                res = await api.get("/admin/habits");
            } catch (err) {
                console.warn("admin/habits endpoint not ready, fallback to /habits");
                // fallback – текущие привычки (только этого пользователя)
                res = await api.get("/habits");
            }
            const list = Array.isArray(res.data) ? res.data : [];
            setHabits(list);
        } catch (err) {
            console.error("Ошибка при загрузке привычек (admin):", err);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Не удалось загрузить привычки"
            );
        } finally {
            setHabitsLoading(false);
        }
    };

    const loadDiary = async () => {
        setDiaryLoading(true);
        setError("");
        try {
            // 👉 когда сделаешь backend, можно будет раскомментировать
            // const res = await api.get("/admin/diary");
            // setDiary(Array.isArray(res.data) ? res.data : []);

            // Пока backend не готов – пример данных-заглушек:
            setDiary([
                {
                    id: 1,
                    date: "2025-12-01",
                    title: "Утренний фокус",
                    content: "Делал медитацию и планирование дня.",
                    author: { id: 1, username: "demo_user" },
                },
            ]);
        } catch (err) {
            console.error("Ошибка при загрузке дневника:", err);
            setError("Не удалось загрузить записи дневника");
        } finally {
            setDiaryLoading(false);
        }
    };

    const loadLogs = async () => {
        setLogsLoading(true);
        setError("");
        try {
            // 👉 можно будет сделать /admin/logs
            // const res = await api.get("/admin/logs");
            // setLogs(Array.isArray(res.data) ? res.data : []);

            // Пока как раньше – демо-логи:
            setLogs([
                {
                    id: 1,
                    at: "2025-11-12 10:15",
                    actor: "admin",
                    action: "CREATE_HABIT",
                    details: '{"title":"Morning run"}',
                },
                {
                    id: 2,
                    at: "2025-11-12 10:17",
                    actor: "admin",
                    action: "UPDATE_PROFILE",
                    details: '{"username":"newname"}',
                },
            ]);
        } catch (err) {
            console.error("Ошибка при загрузке логов:", err);
            setError("Не удалось загрузить логи");
        } finally {
            setLogsLoading(false);
        }
    };

    // ===== ДЕЙСТВИЯ АДМИНА =====

    // 2–3. Админ НЕ создаёт и НЕ редактирует привычки – ТОЛЬКО delete
    const handleDeleteHabit = async (habit) => {
        if (!habit) return;
        if (!window.confirm(`Удалить привычку «${habit.title}»?`)) return;

        try {
            await api.delete(`/habit/${habit.id}`);
            await loadHabits();
        } catch (err) {
            console.error("Ошибка при удалении привычки админом:", err);
            alert(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Не удалось удалить привычку"
            );
        }
    };

    // 4. Diary – только просмотр и удаление
    const handleDeleteDiary = async (entry) => {
        if (!entry) return;
        if (!window.confirm(`Удалить запись дневника «${entry.title}»?`)) return;

        try {
            // когда сделаешь backend:
            // await api.delete(`/admin/diary/${entry.id}`);
            // await loadDiary();

            // пока просто убираем из стейта, чтобы UI работал
            setDiary((prev) => prev.filter((d) => d.id !== entry.id));
        } catch (err) {
            console.error("Ошибка при удалении записи дневника:", err);
            alert("Не удалось удалить запись дневника");
        }
    };

    // ===== РЕНДЕР ТАБОВ =====

    const renderUsersTab = () => (
        <Card className="rounded-2xl shadow-soft">
            <Card.Body>
                <h5 className="mb-3">Пользователи</h5>
                {usersLoading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" size="sm" /> Загрузка пользователей...
                    </div>
                ) : users.length === 0 ? (
                    <div className="empty rounded-2xl p-3 text-center">
                        <p className="mb-0 footer-muted">Пользователи не найдены.</p>
                    </div>
                ) : (
                    <Table responsive hover variant="dark" size="sm">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Город</th>
                            <th>Роль</th>
                            <th>Создан</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.username || "-"}</td>
                                <td>{u.email || "-"}</td>
                                <td>
                                    {u.city?.name ||
                                        u.city_name ||
                                        u.city ||
                                        <span className="footer-muted">—</span>}
                                </td>
                                <td>
                                    <Badge bg={u.role === "admin" ? "warning" : "secondary"}>
                                        {u.role || "user"}
                                    </Badge>
                                </td>
                                <td>
                                    {u.created_at
                                        ? String(u.created_at).slice(0, 19).replace("T", " ")
                                        : "—"}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );

    const renderHabitsTab = () => (
        <Card className="rounded-2xl shadow-soft">
            <Card.Body>
                <h5 className="mb-3">Все привычки</h5>
                <p className="footer-muted mb-3">
                    Админ <b>не может создавать или редактировать</b> привычки. Только
                    просмотр и удаление.
                </p>
                {habitsLoading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" size="sm" /> Загрузка привычек...
                    </div>
                ) : habits.length === 0 ? (
                    <div className="empty rounded-2xl p-3 text-center">
                        <p className="mb-0 footer-muted">Привычки не найдены.</p>
                    </div>
                ) : (
                    <Table responsive hover variant="dark" size="sm">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Название</th>
                            <th>Автор</th>
                            <th>Частота</th>
                            <th>Статус</th>
                            <th>Создана</th>
                            <th style={{ width: 80 }}>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {habits.map((h) => (
                            <tr key={h.id}>
                                <td>{h.id}</td>
                                <td>{h.title}</td>
                                <td>
                                    {h.user?.username ||
                                        h.username ||
                                        h.user_name ||
                                        "—"}
                                </td>
                                <td>
                                    {h.frequency === "daily"
                                        ? "Ежедневно"
                                        : h.frequency === "weekly"
                                            ? "Еженедельно"
                                            : h.frequency === "monthly"
                                                ? "Ежемесячно"
                                                : h.frequency}
                                </td>
                                <td>
                                    {h.is_active === false ? (
                                        <Badge bg="secondary">Неактивна</Badge>
                                    ) : (
                                        <Badge bg="success">Активна</Badge>
                                    )}
                                </td>
                                <td>
                                    {h.created_at
                                        ? String(h.created_at).slice(0, 19).replace("T", " ")
                                        : "—"}
                                </td>
                                <td>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteHabit(h)}
                                    >
                                        🗑
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );

    const renderDiaryTab = () => (
        <Card className="rounded-2xl shadow-soft">
            <Card.Body>
                <h5 className="mb-3">Дневник пользователей</h5>
                <p className="footer-muted mb-3">
                    Админ видит записи и может только <b>удалять</b> их. Создавать и
                    редактировать записи может только автор.
                </p>
                {diaryLoading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" size="sm" /> Загрузка записей...
                    </div>
                ) : diary.length === 0 ? (
                    <div className="empty rounded-2xl p-3 text-center">
                        <p className="mb-0 footer-muted">Записи дневника не найдены.</p>
                    </div>
                ) : (
                    <Table responsive hover variant="dark" size="sm">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Дата</th>
                            <th>Заголовок</th>
                            <th>Автор</th>
                            <th>Текст</th>
                            <th style={{ width: 80 }}>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {diary.map((d) => (
                            <tr key={d.id}>
                                <td>{d.id}</td>
                                <td>{d.date}</td>
                                <td>{d.title}</td>
                                <td>{d.author?.username || d.author_name || "—"}</td>
                                <td className="footer-muted">
                                    {d.content?.length > 80
                                        ? d.content.slice(0, 80) + "..."
                                        : d.content}
                                </td>
                                <td>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteDiary(d)}
                                    >
                                        🗑
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );

    const renderLogsTab = () => (
        <Card className="rounded-2xl shadow-soft">
            <Card.Body>
                <h5 className="mb-3">Логи изменений</h5>
                <p className="footer-muted mb-3">
                    Здесь можно смотреть, кто и какие действия выполнял (создание
                    привычек, обновление профиля и т.д.).
                </p>
                {logsLoading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" size="sm" /> Загрузка логов...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="empty rounded-2xl p-3 text-center">
                        <p className="mb-0 footer-muted">Логи пока отсутствуют.</p>
                    </div>
                ) : (
                    <Table responsive hover variant="dark" size="sm">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Время</th>
                            <th>Пользователь</th>
                            <th>Действие</th>
                            <th>Детали</th>
                        </tr>
                        </thead>
                        <tbody>
                        {logs.map((l) => (
                            <tr key={l.id}>
                                <td>{l.id}</td>
                                <td>{l.at}</td>
                                <td>{l.actor}</td>
                                <td>{l.action}</td>
                                <td>
                                    <code style={{ whiteSpace: "pre-wrap", fontSize: "0.8rem" }}>
                                        {l.details}
                                    </code>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );

    return (
        <Container className="container-page">
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

            <Row className="mb-3">
                <Col>
                    <h2 className="fw-bold mb-1">Admin Panel</h2>
                    <div className="footer-muted">
                        Управление пользователями, привычками, дневником и логами системы.
                    </div>
                </Col>
            </Row>

            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || "habits")}
                className="mb-3"
            >
                <Tab eventKey="habits" title="Привычки">
                    {renderHabitsTab()}
                </Tab>
                <Tab eventKey="diary" title="Дневник">
                    {renderDiaryTab()}
                </Tab>
                <Tab eventKey="users" title="Пользователи">
                    {renderUsersTab()}
                </Tab>
                <Tab eventKey="logs" title="Логи">
                    {renderLogsTab()}
                </Tab>
            </Tabs>
        </Container>
    );
}

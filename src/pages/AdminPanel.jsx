import React, { useEffect, useState } from "react";
import { Alert, Card, Container, Table } from "react-bootstrap";

export default function AdminPanel(){
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState("");

    useEffect(()=>{

        setLogs([
            { id:1, at:"2025-11-12 10:15", actor:"admin", action:"CREATE_HABIT", details:"{\"title\":\"Morning run\"}" },
            { id:2, at:"2025-11-12 10:17", actor:"admin", action:"UPDATE_PROFILE", details:"{\"username\":\"newname\"}" },
        ]);
    },[]);

    return (
        <Container className="container-page">
            <h2 className="fw-bold mb-3">Admin Panel</h2>
            <div className="footer-muted mb-3">Просмотр логов изменений (UI готов, подключи API при наличии).</div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="rounded-2xl">
                <Card.Body>
                    <Table responsive bordered hover variant="dark">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Timestamp</th>
                            <th>Actor</th>
                            <th>Action</th>
                            <th>Details</th>
                        </tr>
                        </thead>
                        <tbody>
                        {logs.length===0 ? (
                            <tr><td colSpan="5" className="text-center footer-muted">Пусто</td></tr>
                        ) : logs.map(l=>(
                            <tr key={l.id}>
                                <td>{l.id}</td>
                                <td>{l.at}</td>
                                <td>{l.actor}</td>
                                <td>{l.action}</td>
                                <td><code style={{whiteSpace:"pre-wrap"}}>{l.details}</code></td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
}
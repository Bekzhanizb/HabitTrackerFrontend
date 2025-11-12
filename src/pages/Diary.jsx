import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Container, Form, Modal, Row } from "react-bootstrap";

const key = "df_diary";
const load = () => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } };
const save = (data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} };

const toYMD = (d) => d.toISOString().slice(0,10);

function Calendar({ value, onChange }) {
    const [cursor, setCursor] = useState(new Date(value));
    const y = cursor.getFullYear();
    const m = cursor.getMonth();

    const days = useMemo(() => {
        const first = new Date(y, m, 1);
        const start = new Date(first); start.setDate(1 - (first.getDay() || 7) + 1); // понедельник как первый
        const grid = [];
        for (let i = 0; i < 42; i++) {
            const d = new Date(start); d.setDate(start.getDate() + i);
            grid.push(d);
        }
        return grid;
    }, [y, m]);

    const isSame = (a,b)=> toYMD(a)===toYMD(b);
    const isCurMonth = (d)=> d.getMonth()===m;

    return (
        <Card className="rounded-2xl h-100">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <Button variant="outline-primary" size="sm" onClick={()=>setCursor(new Date(y, m-1, 1))}>‹</Button>
                    <div className="fw-bold">{cursor.toLocaleString("default", { month: "long" })} {y}</div>
                    <Button variant="outline-primary" size="sm" onClick={()=>setCursor(new Date(y, m+1, 1))}>›</Button>
                </div>
                <div className="d-grid" style={{gridTemplateColumns:"repeat(7, 1fr)", gap: 6}}>
                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d)=>(
                        <div key={d} className="text-center footer-muted">{d}</div>
                    ))}
                    {days.map((d, i)=>(
                        <button
                            key={i}
                            className="btn py-2"
                            style={{
                                border: isSame(d, value) ? "1px solid var(--primary)" : "1px solid var(--border)",
                                background: isSame(d, value) ? "rgba(124,92,255,.15)" : isCurMonth(d) ? "rgba(255,255,255,.04)" : "transparent",
                                borderRadius: 10, color:"#fff"
                            }}
                            onClick={()=>onChange(d)}
                        >
                            {d.getDate()}
                        </button>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );
}

function EntryView({ entry, onBack }) {
    if (!entry) return null;
    return (
        <Card className="rounded-2xl h-100">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                    <h4 className="m-0">{entry.title || "Без названия"}</h4>
                    <Button variant="outline-primary" size="sm" onClick={onBack}>← Back</Button>
                </div>
                <div className="footer-muted mt-1">{entry.date}</div>
                <hr/>
                <div style={{whiteSpace:"pre-wrap"}}>{entry.text || "Пусто"}</div>
            </Card.Body>
        </Card>
    );
}

export default function Diary(){
    const [store, setStore] = useState(load()); // { "2025-11-12": [ {id,title,text,date}, ... ] }
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeEntry, setActiveEntry] = useState(null);

    const ymd = toYMD(selectedDate);
    const items = store[ymd] || [];

    useEffect(()=> save(store), [store]);

    const [showNew, setShowNew] = useState(false);
    const [form, setForm] = useState({ title: "", text: "" });

    const openNew = () => { setForm({ title:"", text:"" }); setShowNew(true); };
    const saveNew = () => {
        const entry = { id: crypto.randomUUID(), title: form.title.trim(), text: form.text, date: ymd };
        setStore(s => ({ ...s, [ymd]: [entry, ...(s[ymd]||[])] }));
        setShowNew(false);
        setActiveEntry(entry);
    };

    return (
        <Container className="container-page">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h2 className="fw-bold m-0">Diary</h2>
                    <div className="footer-muted">Write and review your day.</div>
                </div>
                <Button variant="primary" onClick={openNew}>+ New entry</Button>
            </div>

            <Row className="g-4">
                <Col lg={4}><Calendar value={selectedDate} onChange={setSelectedDate} /></Col>

                <Col lg={8}>
                    {!activeEntry ? (
                        <Card className="rounded-2xl">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="fw-bold">Entries for {ymd}</div>
                                    <span className="badge badge-soft rounded-pill">{items.length}</span>
                                </div>
                                {items.length === 0 ? (
                                    <div className="empty rounded-2xl p-4 text-center">
                                        <div className="mb-1">Записей нет</div>
                                        <div className="footer-muted">Нажмите «New entry», чтобы добавить первую запись.</div>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        {items.map(it=>(
                                            <button
                                                key={it.id}
                                                className="btn text-start"
                                                style={{border:"1px solid var(--border)", color:"#fff", borderRadius:12, background:"rgba(255,255,255,.04)"}}
                                                onClick={()=>setActiveEntry(it)}
                                            >
                                                <div className="fw-semibold">{it.title || "Без названия"}</div>
                                                <div className="footer-muted">{it.text?.slice(0, 140) || "Пусто"}{(it.text||"").length>140?"…":""}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    ) : (
                        <EntryView entry={activeEntry} onBack={()=>setActiveEntry(null)} />
                    )}
                </Col>
            </Row>

            <Modal show={showNew} onHide={()=>setShowNew(false)} centered>
                <Modal.Header closeButton><Modal.Title>New entry — {ymd}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e)=>{e.preventDefault(); saveNew();}}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control className="input-dark" value={form.title} onChange={(e)=>setForm(s=>({...s,title:e.target.value}))}/>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Text</Form.Label>
                            <Form.Control className="input-dark" as="textarea" rows={8} value={form.text} onChange={(e)=>setForm(s=>({...s,text:e.target.value}))}/>
                        </Form.Group>
                        <Button type="submit" className="w-100" variant="primary">Save</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

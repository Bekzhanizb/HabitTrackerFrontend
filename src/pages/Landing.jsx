import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Landing(){
    return (
        <>
            <header className="py-4">
                <Container>
                    <div className="d-flex align-items-center justify-content-between">
                        <h4 className="m-0 fw-bold">HabitTracker</h4>
                        <div className="d-flex gap-2">
                            <Link className="btn btn-outline-primary" to="/login">Login</Link>
                            <Link className="btn btn-primary" to="/register">Get Started</Link>
                        </div>
                    </div>
                </Container>
            </header>

            <main>
                <Container className="pb-5">
                    <div className="hero rounded-2xl p-5 p-md-6 mt-3 shadow-soft">
                        <Row className="align-items-center g-4">
                            <Col md={7}>
                                <span className="badge badge-soft mb-3 px-3 py-2 rounded-pill">Build better habits</span>
                                <h1 className="display-5 fw-bold mb-3">
                                    Track. Improve. <span style={{color:"#7c5cff"}}>Repeat.</span>
                                </h1>
                                <p className="lead" style={{color:"#cbd4e6"}}>
                                    Minimal, fast, and delightful habit tracking. Create routines, see streaks,
                                    and keep momentum with a calm, focused interface.
                                </p>
                                <div className="d-flex gap-3 mt-4">
                                    <Link to="/register" className="btn btn-primary btn-lg px-4">Create free account</Link>
                                    <a href="#features" className="btn btn-outline-primary btn-lg px-4">See features</a>
                                </div>
                                <p className="footer-muted mt-3">No ads. No noise. Your data stays yours.</p>
                            </Col>
                            <Col md={5}>
                                <div className="rounded-2xl shadow-soft p-3" style={{background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)"}}>
                                    <img
                                        alt="Preview"
                                        src="https://images.unsplash.com/photo-1511203466129-824e631920d4?q=80&w=1200&auto=format&fit=crop"
                                        className="img-fluid rounded-2xl"
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <section id="features" className="mt-5 pt-4">
                        <Row className="g-4">
                            {[
                                {t:"Ultra-simple tracking", d:"Add habits in seconds. One tap to log, zero friction."},
                                {t:"Weekly & monthly cadence", d:"Daily/weekly/monthly frequency with clean summaries."},
                                {t:"Streaks & momentum", d:"Stay motivated with streaks, completion rate, and gentle nudges."},
                            ].map((f,i)=>(
                                <Col md={4} key={i}>
                                    <Card className="h-100 rounded-2xl">
                                        <Card.Body>
                                            <div className="mb-3" style={{fontSize:"1.75rem"}}>✨</div>
                                            <Card.Title className="fw-bold">{f.t}</Card.Title>
                                            <Card.Text className="mt-2" style={{color:"var(--muted)"}}>{f.d}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </section>

                    <section className="mt-5 pt-4 text-center">
                        <div className="rounded-2xl p-5 shadow-soft" style={{background:"rgba(255,255,255,.04)", border:"1px solid var(--border)"}}>
                            <h2 className="fw-bold">Ready to start a streak?</h2>
                            <p className="footer-muted mb-4">Join free and set your first habit in under a minute.</p>
                            <Link to="/register" className="btn btn-primary btn-lg px-4">Get started free</Link>
                        </div>
                    </section>
                </Container>
            </main>
        </>
    );
}

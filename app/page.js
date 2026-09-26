"use client";

import { useEffect, useState } from "react";
import LoginScreen from "@/components/LoginScreen";
import MuridView from "@/components/MuridView";
import OrtuView from "@/components/OrtuView";
import GuruView from "@/components/GuruView";
import KepsekView from "@/components/KepsekView";
import PengawasView from "@/components/PengawasView";
import AdminView from "@/components/AdminView";
import { C } from "@/components/ui";
import { STUDENTS, CLASSES, SCHOOLS } from "@/lib/data";

const SESSION_KEY = "si7kaih-session";

export default function Home() {
  const [session, setSession] = useState(undefined); // undefined = not yet checked, null = logged out

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      setSession(raw ? JSON.parse(raw) : null);
    } catch (e) {
      setSession(null);
    }
  }, []);

  const handleLogin = (role, studentId) => {
    const next = { role, studentId: studentId || null };
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  if (session === undefined) {
    return <div style={{ background: C.paper }} className="min-h-screen" />;
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const student = session.studentId ? STUDENTS.find((s) => s.id === session.studentId) : null;
  const cls = student ? CLASSES.find((c) => c.id === student.classId) : null;
  const school = cls ? SCHOOLS.find((s) => s.id === cls.schoolId) : null;

  return (
    <div style={{ background: C.paper, minHeight: "100vh" }}>
      {session.role === "murid" && student && (
        <MuridView student={student} className={cls.name} schoolName={school.name} onLogout={handleLogout} />
      )}
      {session.role === "ortu" && student && (
        <OrtuView student={student} className={cls.name} schoolName={school.name} onLogout={handleLogout} />
      )}
      {session.role === "guru" && <GuruView classId={CLASSES[0].id} onLogout={handleLogout} />}
      {session.role === "kepsek" && <KepsekView schoolId={SCHOOLS[0].id} onLogout={handleLogout} />}
      {session.role === "pengawas" && <PengawasView onLogout={handleLogout} />}
      {session.role === "admin" && <AdminView schoolId={SCHOOLS[0].id} onLogout={handleLogout} />}
    </div>
  );
}

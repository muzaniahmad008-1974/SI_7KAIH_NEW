"use client";

import { useMemo, useState } from "react";
import { Sunrise, School, UserCircle2, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { C, FONT_LINK, PrimaryButton } from "./ui";
import { ROLES, CLASSES, STUDENTS, SCHOOLS, HABITS } from "@/lib/data";

export default function LoginScreen({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState("murid");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loginClassId, setLoginClassId] = useState("");
  const [loginStudentId, setLoginStudentId] = useState("");
  const [formError, setFormError] = useState("");

  const role = ROLES.find((r) => r.id === selectedRole);
  const usesStudentPicker = selectedRole === "murid" || selectedRole === "ortu";
  const studentsInLoginClass = STUDENTS.filter((s) => s.classId === loginClassId);

  // Seven habit badges arranged along a shallow arc — a "crown" floating
  // above the login card, echoing the seven habits without copying any
  // government emblem.
  const arcHabits = useMemo(() => HABITS.map((h, i) => {
    const t = i / (HABITS.length - 1);
    const angle = Math.PI * (0.92 - t * 0.84);
    const cx = 50 + Math.cos(angle) * 42;
    const cy = 52 - Math.sin(angle) * 38;
    return { ...h, cx, cy };
  }), []);

  const pickRole = (id) => { setSelectedRole(id); setFormError(""); };
  const handleClassChange = (classId) => { setLoginClassId(classId); setLoginStudentId(""); setFormError(""); };

  const submit = (e) => {
    e.preventDefault();
    if (usesStudentPicker && (!loginClassId || !loginStudentId)) {
      setFormError("Pilih kelas dan nama dulu, ya.");
      return;
    }
    setFormError("");
    onLogin(selectedRole, usesStudentPicker ? loginStudentId : undefined);
  };

  return (
    <div
      style={{ fontFamily: "Inter, sans-serif", background: "linear-gradient(150deg,#1E7FD6,#17A398 45%,#4CAF50 78%,#F7B32B)" }}
      className="min-h-screen relative overflow-hidden"
    >
      <style>{`@import url('${FONT_LINK}');`}</style>

      {/* Decorative blobs + confetti — full-bleed colour, no gaps */}
      <div className="absolute rounded-full pointer-events-none" style={{ width: 260, height: 260, right: -80, top: -80, background: "rgba(255,255,255,.14)" }} />
      <div className="absolute rounded-full pointer-events-none" style={{ width: 200, height: 200, left: -60, bottom: 40, background: "rgba(255,255,255,.10)" }} />
      {[
        { x: 8, y: 8, s: 9 }, { x: 92, y: 6, s: 8 },
        { x: 5, y: 48, s: 7 }, { x: 95, y: 42, s: 8 },
        { x: 12, y: 88, s: 7 }, { x: 88, y: 90, s: 8 },
      ].map((d, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none" style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, background: "white", opacity: 0.6 }} />
      ))}

      <div className="relative z-10 flex flex-col items-center px-4 py-8 min-h-screen">
        <div className="text-center pt-4 pb-2">
          <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-2" style={{ background: "rgba(255,255,255,.25)" }}>
            <Sunrise size={26} color="white" />
          </div>
          <div style={{ fontFamily: "'Baloo 2'", color: "white", textShadow: "0 2px 8px rgba(0,0,0,.2)" }} className="text-2xl font-extrabold">SI-7KAIH AI</div>
          <div className="text-[12.5px]" style={{ color: "rgba(255,255,255,.92)" }}>Jurnal Aktivitas Murid &middot; Tujuh Kebiasaan Anak Indonesia Hebat</div>
        </div>

        {/* Crown of habit badges */}
        <div className="relative w-full max-w-sm" style={{ height: 145 }}>
          {arcHabits.map((h) => (
            <div
              key={h.id}
              className="absolute rounded-full flex items-center justify-center shadow-lg"
              style={{ left: `${h.cx}%`, top: `${h.cy}%`, width: 44, height: 44, transform: "translate(-50%,-50%)", background: "white", border: `3px solid ${h.color}` }}
              title={h.label}
            >
              <h.icon size={19} color={h.color} />
            </div>
          ))}
        </div>

        {/* Floating glass card */}
        <div
          className="w-full max-w-sm rounded-3xl p-6 -mt-2"
          style={{ background: "rgba(255,255,255,.94)", backdropFilter: "blur(6px)", boxShadow: "0 24px 55px -20px rgba(0,0,0,.45)" }}
        >
          <h2 style={{ fontFamily: "'Baloo 2'", color: C.ink }} className="text-lg font-extrabold mb-4 text-center">
            Selamat Datang, <span style={{ color: role.color }}>Hebat!</span>
          </h2>

          <div className="text-[12px] font-semibold mb-2" style={{ color: C.sub }}>Masuk sebagai</div>
          <div className="flex flex-wrap gap-1.5 mb-5 justify-center">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => pickRole(r.id)}
                className="px-3 py-1.5 rounded-full text-[12px] font-semibold"
                style={selectedRole === r.id ? { background: r.color, color: "white" } : { background: "#F1EEE3", color: C.sub }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit}>
            {usesStudentPicker ? (
              <>
                <label className="block mb-3">
                  <span className="text-[12px] font-semibold" style={{ color: C.sub }}>Kelas{selectedRole === "ortu" ? " Anak" : ""}</span>
                  <div className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ border: `2px solid ${formError && !loginClassId ? C.brick : C.line}`, background: "white" }}>
                    <School size={16} color={C.sub} />
                    <select
                      value={loginClassId}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="flex-1 text-[13.5px] outline-none bg-transparent"
                      style={{ color: loginClassId ? C.ink : C.sub }}
                    >
                      <option value="">Pilih Kelas</option>
                      {CLASSES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} — {SCHOOLS.find((s) => s.id === c.schoolId)?.name}</option>
                      ))}
                    </select>
                  </div>
                </label>
                <label className="block mb-3">
                  <span className="text-[12px] font-semibold" style={{ color: C.sub }}>Nama{selectedRole === "ortu" ? " Anak" : ""}</span>
                  <div className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ border: `2px solid ${formError && !loginStudentId ? C.brick : C.line}`, background: loginClassId ? "white" : "#F1EEE3" }}>
                    <UserCircle2 size={16} color={C.sub} />
                    <select
                      value={loginStudentId}
                      onChange={(e) => setLoginStudentId(e.target.value)}
                      disabled={!loginClassId}
                      className="flex-1 text-[13.5px] outline-none bg-transparent disabled:cursor-not-allowed"
                      style={{ color: loginStudentId ? C.ink : C.sub }}
                    >
                      <option value="">{loginClassId ? "Pilih Nama" : "Pilih kelas terlebih dahulu"}</option>
                      {studentsInLoginClass.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </label>
                {formError && <p className="text-[12px] font-medium mb-3 -mt-1" style={{ color: C.brick }}>{formError}</p>}
              </>
            ) : (
              <label className="block mb-3">
                <span className="text-[12px] font-semibold" style={{ color: C.sub }}>NISN / Username</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ border: `2px solid ${C.line}`, background: "white" }}>
                  <UserCircle2 size={16} color={C.sub} />
                  <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan NISN atau username" className="flex-1 text-[13.5px] outline-none bg-transparent" />
                </div>
              </label>
            )}

            <label className="block mb-5">
              <span className="text-[12px] font-semibold" style={{ color: C.sub }}>Password</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ border: `2px solid ${C.line}`, background: "white" }}>
                <Lock size={16} color={C.sub} />
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" className="flex-1 text-[13.5px] outline-none bg-transparent" />
                <button type="button" onClick={() => setShowPw((s) => !s)}>{showPw ? <EyeOff size={15} color={C.sub} /> : <Eye size={15} color={C.sub} />}</button>
              </div>
            </label>

            <PrimaryButton icon={LogIn} onClick={submit} style={{ width: "100%", justifyContent: "center", padding: "11px 0", background: `linear-gradient(135deg, ${role.color}, ${C.blueDeep})`, boxShadow: `0 10px 24px -8px ${role.color}99` }}>
              Masuk
            </PrimaryButton>
          </form>
        </div>

        <p className="text-center text-[11px] mt-5 max-w-sm" style={{ color: "rgba(255,255,255,.85)" }}>
          Contoh demonstrasi &middot; kolom NISN/Password belum tersambung ke sistem autentikasi sungguhan.
        </p>
      </div>
    </div>
  );
}

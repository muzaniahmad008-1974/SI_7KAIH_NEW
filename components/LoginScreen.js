"use client";

import { useState } from "react";
import { Sunrise, School, UserCircle2, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { C, FONT_LINK, PrimaryButton } from "./ui";
import { ROLES, CLASSES, STUDENTS, SCHOOLS } from "@/lib/data";

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
    <div style={{ fontFamily: "Inter, sans-serif", background: C.paper }} className="min-h-screen flex items-center justify-center px-4 py-10">
      <style>{`@import url('${FONT_LINK}');`}</style>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: C.blueDeep }}>
            <Sunrise size={26} color={C.gold} />
          </div>
          <div style={{ fontFamily: "'Baloo 2'", color: C.ink }} className="text-2xl font-extrabold">SI-7KAIH AI</div>
          <div className="text-[12.5px]" style={{ color: C.sub }}>Jurnal Aktivitas Murid &middot; Tujuh Kebiasaan Anak Indonesia Hebat</div>
        </div>

        <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="text-[12px] font-semibold mb-2" style={{ color: C.sub }}>Masuk sebagai</div>
          <div className="flex flex-wrap gap-1.5 mb-5">
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
                  <div className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ border: `2px solid ${formError && !loginClassId ? C.brick : C.line}` }}>
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
                <div className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ border: `2px solid ${C.line}` }}>
                  <UserCircle2 size={16} color={C.sub} />
                  <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan NISN atau username" className="flex-1 text-[13.5px] outline-none bg-transparent" />
                </div>
              </label>
            )}

            <label className="block mb-5">
              <span className="text-[12px] font-semibold" style={{ color: C.sub }}>Password</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ border: `2px solid ${C.line}` }}>
                <Lock size={16} color={C.sub} />
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" className="flex-1 text-[13.5px] outline-none bg-transparent" />
                <button type="button" onClick={() => setShowPw((s) => !s)}>{showPw ? <EyeOff size={15} color={C.sub} /> : <Eye size={15} color={C.sub} />}</button>
              </div>
            </label>

            <PrimaryButton icon={LogIn} onClick={submit} style={{ width: "100%", justifyContent: "center", padding: "11px 0", background: `linear-gradient(135deg, ${role.color}, ${C.blueDeep})` }}>
              Masuk
            </PrimaryButton>
          </form>
        </div>
        <p className="text-center text-[11px] mt-5" style={{ color: C.sub }}>
          Contoh demonstrasi &middot; kolom NISN/Password belum tersambung ke sistem autentikasi sungguhan. Lihat README untuk memasang login yang aman sebelum dipakai dengan data murid sesungguhnya.
        </p>
      </div>
    </div>
  );
}

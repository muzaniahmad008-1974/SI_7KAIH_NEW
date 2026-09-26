"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, UserCircle2, UserCog, Calendar } from "lucide-react";
import { Card, SectionTitle, Chip, PrimaryButton, C } from "./ui";
import { getData, setData } from "@/lib/clientStorage";
import { CLASSES, SCHOOLS, STUDENTS, extraStudentsKey, extraClassesKey, extraGuruKey, tahunAjaranKey } from "@/lib/data";

export default function AdminView({ schoolId: initialSchoolId, onLogout }) {
  const [schoolId, setSchoolId] = useState(initialSchoolId);
  const [tab, setTab] = useState("ringkasan");
  const [extraStudents, setExtraStudents] = useState(null);
  const [extraClasses, setExtraClasses] = useState(null);
  const [extraGuru, setExtraGuru] = useState(null);
  const [tahunAjaran, setTahunAjaran] = useState(null);
  const [studentForm, setStudentForm] = useState({ name: "", gender: "L", classId: "" });
  const [classForm, setClassForm] = useState({ name: "", wali: "" });
  const [guruForm, setGuruForm] = useState({ name: "", peran: "Guru Mata Pelajaran" });

  const school = SCHOOLS.find((s) => s.id === schoolId);
  const baseClasses = CLASSES.filter((c) => c.schoolId === schoolId);
  const baseStudents = STUDENTS.filter((s) => baseClasses.some((c) => c.id === s.classId));

  useEffect(() => {
    let alive = true;
    (async () => {
      const [es, ec, eg, ta] = await Promise.all([
        getData(extraStudentsKey(schoolId), []),
        getData(extraClassesKey(schoolId), []),
        getData(extraGuruKey(schoolId), []),
        getData(tahunAjaranKey(), { tahun: "2026/2027", semester: "Ganjil" }),
      ]);
      if (!alive) return;
      setExtraStudents(es); setExtraClasses(ec); setExtraGuru(eg); setTahunAjaran(ta);
      setStudentForm((f) => ({ ...f, classId: baseClasses[0]?.id || "" }));
    })();
    return () => { alive = false; };
  }, [schoolId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loading = extraStudents === null || extraClasses === null || extraGuru === null || tahunAjaran === null;
  const allClasses = loading ? [] : [...baseClasses, ...extraClasses];
  const allStudents = loading ? [] : [...baseStudents, ...extraStudents];
  const allGuru = loading ? [] : [
    ...baseClasses.map((c) => ({ id: `wali-${c.id}`, name: c.wali, peran: `Wali Kelas ${c.name}` })),
    ...extraGuru,
  ];

  const addStudent = async () => {
    if (!studentForm.name.trim() || !studentForm.classId) return;
    const next = [...extraStudents, { id: "adm-" + Date.now(), name: studentForm.name.trim(), gender: studentForm.gender, classId: studentForm.classId }];
    setExtraStudents(next);
    await setData(extraStudentsKey(schoolId), next);
    setStudentForm({ ...studentForm, name: "" });
  };

  const addClass = async () => {
    if (!classForm.name.trim()) return;
    const next = [...extraClasses, { id: "adm-" + Date.now(), schoolId, name: classForm.name.trim(), wali: classForm.wali.trim() || "Belum ditentukan" }];
    setExtraClasses(next);
    await setData(extraClassesKey(schoolId), next);
    setClassForm({ name: "", wali: "" });
  };

  const addGuru = async () => {
    if (!guruForm.name.trim()) return;
    const next = [...extraGuru, { id: "adm-" + Date.now(), name: guruForm.name.trim(), peran: guruForm.peran }];
    setExtraGuru(next);
    await setData(extraGuruKey(schoolId), next);
    setGuruForm({ name: "", peran: "Guru Mata Pelajaran" });
  };

  const saveTahunAjaran = async (next) => {
    setTahunAjaran(next);
    await setData(tahunAjaranKey(), next);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="text-[12px]" style={{ color: C.sub }}>Admin Sekolah</div>
          <h1 style={{ fontFamily: "'Baloo 2'", color: C.ink }} className="text-xl font-extrabold">{school.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className="rounded-lg px-3 py-2 text-[13px]" style={{ border: `1px solid ${C.line}` }}>
            {SCHOOLS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={onLogout} className="text-[12.5px] font-semibold" style={{ color: C.brick }}>Keluar</button>
        </div>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {[["ringkasan", "Ringkasan"], ["siswa", "Data Siswa"], ["kelas", "Data Kelas"], ["guru", "Data Guru"], ["tahun-ajaran", "Tahun Ajaran"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className="px-3 py-1.5 rounded-full text-[12.5px] font-semibold" style={tab === id ? { background: C.blueDeep, color: "white" } : { background: "#F1EEE3", color: C.sub }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="py-10 text-center" style={{ color: C.sub }}><Loader2 className="animate-spin inline" /> Memuat data induk sekolah...</div>
      ) : (
        <div className="space-y-4">
          {tab === "ringkasan" && (
            <div className="grid sm:grid-cols-4 gap-3">
              {[
                { label: "Jumlah Siswa", value: allStudents.length, icon: UserCircle2, tone: "#1E7FD6" },
                { label: "Jumlah Kelas", value: allClasses.length, icon: UserCog, tone: "#4CAF50" },
                { label: "Jumlah Guru", value: allGuru.length, icon: UserCog, tone: "#F7B32B" },
                { label: "Tahun Ajaran Aktif", value: `${tahunAjaran.tahun} \u00B7 ${tahunAjaran.semester}`, icon: Calendar, tone: "#17A398", small: true },
              ].map((s) => (
                <Card key={s.label}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: s.tone }}><s.icon size={16} color="white" /></div>
                  <div className={s.small ? "text-[14px] font-bold" : "text-2xl font-extrabold"} style={{ fontFamily: "'Baloo 2'", color: C.ink }}>{s.value}</div>
                  <div className="text-[12px]" style={{ color: C.sub }}>{s.label}</div>
                </Card>
              ))}
            </div>
          )}

          {tab === "siswa" && (
            <Card>
              <SectionTitle title="Data Induk Siswa" />
              <div className="overflow-x-auto -mx-1 mb-4">
                <table className="w-full text-[12.5px] min-w-[480px]">
                  <thead><tr style={{ color: C.sub }}>
                    <th className="text-left font-semibold py-1.5 px-1">No</th>
                    <th className="text-left font-semibold py-1.5 px-1">Nama</th>
                    <th className="text-left font-semibold py-1.5 px-1">P/L</th>
                    <th className="text-left font-semibold py-1.5 px-1">Kelas</th>
                  </tr></thead>
                  <tbody>
                    {allStudents.map((s, i) => (
                      <tr key={s.id} style={{ borderTop: `1px solid ${C.line}` }}>
                        <td className="py-1.5 px-1">{i + 1}</td>
                        <td className="py-1.5 px-1 font-medium" style={{ color: C.ink }}>{s.name}</td>
                        <td className="py-1.5 px-1">{s.gender}</td>
                        <td className="py-1.5 px-1">{allClasses.find((c) => c.id === s.classId)?.name || "\u2014"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-[12.5px] font-semibold mb-2" style={{ color: C.ink }}>Tambah Siswa Baru</div>
              <div className="grid sm:grid-cols-4 gap-2">
                <input placeholder="Nama siswa" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} className="rounded-lg px-2.5 py-2 text-[13px]" style={{ border: `1px solid ${C.line}` }} />
                <select value={studentForm.gender} onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })} className="rounded-lg px-2.5 py-2 text-[13px]" style={{ border: `1px solid ${C.line}` }}>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
                <select value={studentForm.classId} onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })} className="rounded-lg px-2.5 py-2 text-[13px]" style={{ border: `1px solid ${C.line}` }}>
                  {allClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <PrimaryButton icon={Plus} onClick={addStudent}>Tambah</PrimaryButton>
              </div>
            </Card>
          )}

          {tab === "kelas" && (
            <Card>
              <SectionTitle title="Data Induk Kelas" />
              <div className="space-y-2 mb-4">
                {allClasses.map((c) => (
                  <div key={c.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: "#EFEAD9" }}>
                    <div>
                      <div className="text-[13.5px] font-semibold" style={{ color: C.ink }}>{c.name}</div>
                      <div className="text-[12px]" style={{ color: C.sub }}>Wali Kelas: {c.wali}</div>
                    </div>
                    <Chip tone="blue">{allStudents.filter((s) => s.classId === c.id).length} siswa</Chip>
                  </div>
                ))}
              </div>
              <div className="text-[12.5px] font-semibold mb-2" style={{ color: C.ink }}>Tambah Kelas Baru</div>
              <div className="grid sm:grid-cols-3 gap-2">
                <input placeholder="Nama kelas (mis. IX A)" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} className="rounded-lg px-2.5 py-2 text-[13px]" style={{ border: `1px solid ${C.line}` }} />
                <input placeholder="Wali kelas" value={classForm.wali} onChange={(e) => setClassForm({ ...classForm, wali: e.target.value })} className="rounded-lg px-2.5 py-2 text-[13px]" style={{ border: `1px solid ${C.line}` }} />
                <PrimaryButton icon={Plus} onClick={addClass}>Tambah</PrimaryButton>
              </div>
            </Card>
          )}

          {tab === "guru" && (
            <Card>
              <SectionTitle title="Data Induk Guru" />
              <div className="space-y-2 mb-4">
                {allGuru.map((g) => (
                  <div key={g.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: "#EFEAD9" }}>
                    <div className="text-[13.5px] font-semibold" style={{ color: C.ink }}>{g.name}</div>
                    <Chip tone="green">{g.peran}</Chip>
                  </div>
                ))}
              </div>
              <div className="text-[12.5px] font-semibold mb-2" style={{ color: C.ink }}>Tambah Guru Baru</div>
              <div className="grid sm:grid-cols-3 gap-2">
                <input placeholder="Nama guru" value={guruForm.name} onChange={(e) => setGuruForm({ ...guruForm, name: e.target.value })} className="rounded-lg px-2.5 py-2 text-[13px]" style={{ border: `1px solid ${C.line}` }} />
                <select value={guruForm.peran} onChange={(e) => setGuruForm({ ...guruForm, peran: e.target.value })} className="rounded-lg px-2.5 py-2 text-[13px]" style={{ border: `1px solid ${C.line}` }}>
                  <option>Guru Mata Pelajaran</option>
                  <option>Guru PAI</option>
                  <option>Guru BK</option>
                  <option>Guru PJOK</option>
                  <option>Tenaga Kependidikan</option>
                </select>
                <PrimaryButton icon={Plus} onClick={addGuru}>Tambah</PrimaryButton>
              </div>
            </Card>
          )}

          {tab === "tahun-ajaran" && (
            <Card>
              <SectionTitle title="Pengaturan Tahun Ajaran" />
              <div className="grid sm:grid-cols-2 gap-3 max-w-md">
                <label className="block">
                  <span className="text-[12px] font-semibold" style={{ color: C.sub }}>Tahun Ajaran</span>
                  <input value={tahunAjaran.tahun} onChange={(e) => saveTahunAjaran({ ...tahunAjaran, tahun: e.target.value })} className="mt-1 w-full rounded-lg px-2.5 py-2 text-[13px]" style={{ border: `1px solid ${C.line}` }} />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold" style={{ color: C.sub }}>Semester</span>
                  <select value={tahunAjaran.semester} onChange={(e) => saveTahunAjaran({ ...tahunAjaran, semester: e.target.value })} className="mt-1 w-full rounded-lg px-2.5 py-2 text-[13px]" style={{ border: `1px solid ${C.line}` }}>
                    <option>Ganjil</option>
                    <option>Genap</option>
                  </select>
                </label>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

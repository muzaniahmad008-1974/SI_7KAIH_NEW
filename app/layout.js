import "./globals.css";

export const metadata = {
  title: "SI-7KAIH AI",
  description: "Jurnal Aktivitas Murid — Tujuh Kebiasaan Anak Indonesia Hebat",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}

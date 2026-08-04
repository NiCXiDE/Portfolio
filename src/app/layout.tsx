import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nico Ayala Design",
  description:
    "Diseñador gráfico y de interfaces. Portfolio de Nico Ayala.",
  icons: {
    icon: [{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="h-full overflow-hidden font-satoshi text-ink">
        {children}
      </body>
    </html>
  );
}

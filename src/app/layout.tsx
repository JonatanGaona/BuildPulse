import type { Metadata } from "next";
import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";
import "./globals.scss";
import styles from "../styles/_layout.module.scss";

export const metadata: Metadata = {
  title: "BuildPulse - ConTech Analytics",
  description: "Plataforma inteligente de control analítico e incidencias de obra en tiempo real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className={styles.layoutContainer}>
          <Sidebar />
          <div className={styles.mainContent}>
            <Header />
            <main className={styles.pageContainer}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
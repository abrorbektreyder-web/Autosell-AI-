import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avtosell AI",
  description: "Comment-to-DM automation, AI sales conversations, CRM leads and Telegram notifications."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}

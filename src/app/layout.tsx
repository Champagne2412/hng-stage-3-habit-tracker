import type { Metadata } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/shared/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Track your daily habits and build streaks",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}

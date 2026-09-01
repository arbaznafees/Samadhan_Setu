import type { Viewport } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { ChatWidget } from "@/components/ChatWidget";

export const metadata = {
  title: "Samadhan Setu Jharkhand | Civic Grievance to Institutional Solution Platform",
  description:
    "Empowering citizens to report issues, routing to Jharkhand HEIs (BIT Mesra, IIT ISM, NIT, BAU) for actionable R&D, and partnering with industry CSR for funding.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#002147",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF9FD] text-[#1A1B1E] antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(registration) {
                        console.log('PWA ServiceWorker registered with scope: ', registration.scope);
                      },
                      function(err) {
                        console.log('PWA ServiceWorker registration failed: ', err);
                      }
                    );
                  });
                }
              `,
            }}
          />
                    <footer className="bg-primary-container text-white py-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-secondary-container text-slate-950 font-bold flex items-center justify-center text-xs">
                  सं
                </div>
                <span>
                  © 2026 Samadhan Setu Jharkhand • Department of Higher, Technical Education & Skill Development
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <span>AI Triage: Gemini 2.5 Flash</span>
                <span>Vector Search: pgvector</span>
                <span>PostGIS Enabled</span>
              </div>
            </div>
          </footer>
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
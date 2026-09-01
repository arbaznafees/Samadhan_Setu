import type { Viewport } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Chatbot from "@/components/Chatbot";

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
      <body className="min-h-screen bg-surface-subtle text-text-primary antialiased flex flex-col">
        <AuthProvider>
          {children}
          <Chatbot />
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
        </AuthProvider>
      </body>
    </html>
  );
}

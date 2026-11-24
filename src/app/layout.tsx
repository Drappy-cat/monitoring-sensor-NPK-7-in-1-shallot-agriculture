import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Telemetri Sensor NPK 7-in-1: Bawang Merah",
  description:
    "Dashboard telemetri realtime sensor NPK 7-in-1 untuk budidaya bawang merah. Monitoring Soil Moisture, Suhu, Konduktivitas EC, pH, Nitrogen, Fosfor, dan Kalium tanah.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230f172a'/><path d='M8 22V14M16 22V10M24 22V16' stroke='%2338bdf8' stroke-width='2.5' stroke-linecap='round'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('theme-preference');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'light') {
                  document.documentElement.classList.remove('dark');
                } else if (stored === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (!prefersDark) {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

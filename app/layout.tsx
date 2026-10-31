import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppNav } from "@/components/layout/app-nav";

export const metadata: Metadata = {
  title: "Besok Aja.Task — Academic Task Manager",
  description: "Aplikasi manajemen perkuliahan dan tugas akademik mahasiswa berkecepatan tinggi",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Besok Aja.Task",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans min-h-screen antialiased bg-background text-foreground transition-colors duration-200 pb-16 md:pb-0">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AppNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
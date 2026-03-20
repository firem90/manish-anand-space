import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Lora } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { TopLoader } from "@/components/TopLoader";
import { GlobalViewTracker } from "@/components/GlobalViewTracker";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Manish Anandaeswaran | Engineer",
  description: "I build distributed systems that don't fall over.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${lora.variable} bg-background text-foreground antialiased min-h-screen flex flex-col font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <TopLoader />
          </Suspense>
          <GlobalViewTracker />
          <Navigation />
          <main className="flex-grow w-full max-w-[900px] mx-auto px-6 py-8 md:py-16">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

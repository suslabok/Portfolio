import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono, Caveat } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { AmbientBackground} from "@/components/Animations";
import { Sidebar, ScrollProgress, BackToTop } from "@/components/Navigation";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sushma-acharya.dev"),
  title: {
    default: "Sushma Acharya",
    template: "%s · Sushma Acharya",
  },
  description:
    "Portfolio of Sushma Acharya, a Computer Engineering undergraduate at Kathmandu University building AI-powered tools, full-stack applications, and interactive experiences.",
  keywords: [
    "Sushma Acharya",
    "Software Engineer",
    "Full Stack Developer",
    "AI Engineer",
    "Kathmandu University",
    "Next.js",
    "React Developer",
    "Nepal",
  ],
  authors: [{ name: "Sushma Acharya" }],
  creator: "Sushma Acharya",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Sushma Acharya",
    description:
      "Computer Engineering undergraduate building AI-powered tools, full-stack applications, and interactive experiences.",
    siteName: "Sushma Acharya",
    images: [{ url: "/images/profile.jpg", width: 800, height: 800, alt: "Sushma Acharya" }],
  },
  twitter: {
    card: "summary",
    title: "Sushma Acharya",
    description:
      "Computer Engineering undergraduate building AI-powered tools, full-stack applications, and interactive experiences.",
    images: ["/images/profile.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${caveat.variable} h-full`}
    >
      <body className="grain min-h-full bg-bg font-sans text-text-primary">
  
        <MotionConfig reducedMotion="user">
          <AmbientBackground />
          <ScrollProgress />
          <Sidebar />
          <div className="pl-[104px] sm:pl-[116px]">{children}</div>
          <BackToTop />
        </MotionConfig>
      </body>
    </html>
  );
}
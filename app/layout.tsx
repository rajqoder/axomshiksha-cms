import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/MainLayout";

const montserrat = Montserrat({
  weight: "400",
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "CMS | Axomshiksha",
  description: "Content Management System for AxomShiksha",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={montserrat.className} lang="en">
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}

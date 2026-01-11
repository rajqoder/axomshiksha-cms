import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MuiThemeWrapper } from "@/components/MuiThemeWrapper";

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
    <html className={montserrat.className} lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <MuiThemeWrapper>
              <Header />
              {children}
              <Footer />
            </MuiThemeWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

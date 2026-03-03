import type { Metadata } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Realtor Growth OS",
  description: "CRM, lead capture, AI messaging, and ROI dashboard for realtors",
};

const publicPrefixes = ["/auth", "/rsvp", "/sign-in"];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const isPublic = publicPrefixes.some((prefix) => pathname.startsWith(prefix));

  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-gray-50`}>
        {!isPublic && <Sidebar />}
        <main className={!isPublic ? "md:ml-60" : ""}>
          {children}
        </main>
      </body>
    </html>
  );
}

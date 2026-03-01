import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { headers } from "next/headers";
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

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contacts", label: "Contacts" },
  { href: "/events", label: "Events" },
  { href: "/open-house", label: "Open Houses" },
];

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
        {!isPublic && (
          <nav className="bg-white border-b px-6 py-3 flex items-center gap-6">
            <Link href="/" className="font-bold text-lg">
              Realtor Growth OS
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/auth/logout"
              className="ml-auto text-sm text-gray-500 hover:text-gray-900"
            >
              Sign out
            </Link>
          </nav>
        )}
        {children}
      </body>
    </html>
  );
}

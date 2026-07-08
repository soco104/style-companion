import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import "./styles.css";

export const metadata: Metadata = {
  title: "Style Companion Admin",
  description: "Admin portal for Style Companion"
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/users", label: "Users" },
  { href: "/shoppers", label: "Shopper profiles" },
  { href: "/bookings", label: "Bookings" },
  { href: "/reviews", label: "Reviews" },
  { href: "/safety-reports", label: "Safety reports" }
];

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <Link className="brand" href="/">
              <span>Style Companion</span>
              <strong>Admin</strong>
            </Link>
            <nav className="nav" aria-label="Admin navigation">
              {navItems.map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="content">{children}</div>
        </div>
      </body>
    </html>
  );
}

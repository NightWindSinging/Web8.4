import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

function getMetadataBase() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100");
  } catch {
    return new URL("http://localhost:3100");
  }
}

export const metadata = {
  metadataBase: getMetadataBase(),
  title: "DATANGXING Packaging — Homepage Concepts",
  description: "Three homepage directions for a custom paper packaging manufacturer.",
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

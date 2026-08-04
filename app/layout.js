import "./globals.css";

export const metadata = {
  title: "DATANGXING Packaging — Homepage Concepts",
  description: "Three homepage directions for a custom paper packaging manufacturer.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Image Generator",
  description: "Create stunning images with AI - A modern image generation app with community features",
  keywords: ["AI", "image generation", "artificial intelligence", "art", "creativity"],
  authors: [{ name: "AI Image Generator" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
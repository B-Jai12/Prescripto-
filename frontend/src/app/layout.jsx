import "./globals.css";

export const metadata = {
  title: "LipiRx - AI Prescription Assistant",
  description:
    "Upload any medical prescription and instantly get structured medicine details, safety warnings, diet plans, and pharmacy links powered by AI.",
  keywords: "prescription parser, AI medical, pharmacy, drug interactions, India",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}


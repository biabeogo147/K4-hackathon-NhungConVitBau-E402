import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Thực Chiến — Trợ lý tìm hiểu chương trình",
  description:
    "Trợ lý dành cho người đang tìm hiểu, chuẩn bị dự tuyển hoặc sắp tham gia chương trình AI Thực Chiến.",
  openGraph: {
    title: "AI Thực Chiến — Trợ lý tìm hiểu chương trình",
    description:
      "Hỏi nhanh, hiểu đúng về chương trình AI Thực Chiến.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Thực Chiến — Trợ lý tìm hiểu chương trình",
    description:
      "Hỏi nhanh, hiểu đúng về chương trình AI Thực Chiến.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

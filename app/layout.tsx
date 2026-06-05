import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '썸네일 알케미',
  description: '카피 구조와 디자인 스타일을 분석해 유튜브 썸네일 ABC안을 생성하는 도구'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='ko'>
      <body>{children}</body>
    </html>
  );
}

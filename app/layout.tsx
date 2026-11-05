import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: '雍和小院 · 来坐一会儿', description: '银杏落在朱墙边。带一串心愿，和猫狗一起，在雍和宫灵感的小院里慢慢待着。', icons: { icon:'/favicon.svg' } };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="zh-CN"><body>{children}</body></html>; }

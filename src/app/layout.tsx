import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'P402 Meter — Real-Time Per-Token AI Billing on Arc',
  description: 'Healthcare prior authorization where every AI token is priced in USDC and settled on Arc in real time.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

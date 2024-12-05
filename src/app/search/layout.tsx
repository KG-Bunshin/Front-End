import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search | KG Bunshin Web',
  description: 'Knowledge Graph Final Task',
};

export default function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}

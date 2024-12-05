import { Inter } from 'next/font/google';
import './globals.css';
import ReactQueryProvider from './ReactQueryProvider';
import { Metadata } from 'next';
import { Suspense } from 'react';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KG Bunshin',
  description: 'A sample app with React Query and desktop-only design',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"
        />
      </Head>
      <body className={inter.className}>
        <Suspense
          fallback={
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading </h1>
          }
        >
          <div className="lg:block hidden min-h-screen bg-gray-100">
            <ReactQueryProvider>{children}</ReactQueryProvider>
            <footer className="bg-white rounded-lg shadow dark:bg-gray-900 mt-4">
              <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
                  © 2024{' '}
                  <a href="https://flowbite.com/" className="hover:underline">
                    KG Bunshin™
                  </a>
                  . All Rights Reserved.
                </span>
              </div>
            </footer>
          </div>
          <div className="flex w-screen min-h-screen items-center justify-center bg-gray-100 lg:hidden">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Desktop Only
              </h1>
              <p className="text-gray-600">
                This website is designed for desktop use only. Please visit it
                on a larger screen.
              </p>
            </div>
          </div>
        </Suspense>
      </body>
    </html>
  );
}

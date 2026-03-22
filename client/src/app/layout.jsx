// No 'use client' here - layout runs on the SERVER by default in Next.js

import { AuthProvider } from '@/context/AuthContext'; // our global user state
import Navbar from '@/components/Navbar';             // navbar component
import './globals.css';                               // global styles

// metadata shows in browser tab
export const metadata = {
  title: 'BrainBlitz',
  description: 'Quiz Application',
};

export default function RootLayout({ children }) {
  // children = whatever page the user is on
  return (
    <html lang="en">
      <body>
        <AuthProvider>   {/* wrap everything so all pages can access user */}
          <Navbar />     {/* shows on every page */}
          <main className="max-w-4xl mx-auto px-4 py-8">
            {children}   {/* current page renders here */}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

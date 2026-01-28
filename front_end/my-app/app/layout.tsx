import Header from '@/components/header';
import Sidebar from '@/components/sidebar/sidebar';
import './layout.css';

export const metadata = {
  title: "Articles App",
  description: "Browse articles by author, title, or ID",
  icons: "/favicon.ico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Global header */}
        <Header />

        <div className="container flex">
          {/* Sidebar always visible */}
          <Sidebar />

          {/* Main content area */}
          <main className="main-content flex-1 p-4">
            {children} {/* Page content renders here */}
          </main>
        </div>
      </body>
    </html>
  );
}
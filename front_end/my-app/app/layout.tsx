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
        <header className="header-shell">
        <Header />
        </header>

        <div className="container">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
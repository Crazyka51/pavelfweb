import "../../styles/globals.css";
import "./globals.css";
import "./styles/tiptap.css";
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import AdminAuthLayout from './components/AdminAuthLayout';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={inter.className}>
      <AuthProvider>
        <AdminAuthLayout>
          {children}
        </AdminAuthLayout>
      </AuthProvider>
    </div>
  );
}

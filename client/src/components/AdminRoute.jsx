'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/quizzes'); // redirect if not admin
  }, [user]);

  if (!user || user.role !== 'admin') return null;
  return children; // show page only if admin
};

export default AdminRoute;

'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const SuperAdminRoute = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'superadmin') router.push('/');
  }, [user]);

  if (!user || user.role !== 'superadmin') return null;
  return children;
};

export default SuperAdminRoute;
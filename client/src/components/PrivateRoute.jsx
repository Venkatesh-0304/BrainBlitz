'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();   // get logged in user
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login'); // redirect if not logged in
  }, [user]);

  if (!user) return null; // show nothing while redirecting
  return children;        // show the page if logged in
};

export default PrivateRoute;



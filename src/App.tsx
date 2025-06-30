
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import SplashScreen from '@/components/SplashScreen';
import AuthPage from '@/components/auth/AuthPage';
import UserDashboard from '@/components/dashboard/UserDashboard';
import MitraDashboard from '@/components/dashboard/MitraDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { supabase } from '@/integrations/supabase/client';

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // Create default admin user if doesn't exist
    const createDefaultAdmin = async () => {
      try {
        const { data: existingAdmin } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin')
          .single();

        if (!existingAdmin) {
          // Try to sign up the default admin
          const { error } = await supabase.auth.signUp({
            email: 'id.arvinstudio@gmail.com',
            password: 'Bandung123',
            options: {
              data: {
                full_name: 'Admin GetLife',
                role: 'admin'
              }
            }
          });

          if (!error) {
            console.log('Default admin created successfully');
          }
        }
      } catch (error) {
        console.log('Admin creation process completed');
      }
    };

    createDefaultAdmin();
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPage />;
  }

  // Check if mitra is verified
  if (profile.role === 'mitra' && !profile.is_verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Menunggu Verifikasi</h2>
          <p className="text-gray-600 mb-6">
            Akun Anda sedang dalam proses verifikasi oleh admin. Silakan tunggu konfirmasi lebih lanjut.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-blue-600 hover:underline"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  // Check if user is blocked
  if (profile.is_blocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Akun Diblokir</h2>
          <p className="text-gray-600 mb-6">
            Akun Anda telah diblokir oleh admin. Silakan hubungi customer service untuk informasi lebih lanjut.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-blue-600 hover:underline"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on role
  switch (profile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'mitra':
      return <MitraDashboard />;
    case 'user':
    default:
      return <UserDashboard />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

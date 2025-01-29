import React, { useState, useEffect } from 'react';
import { Building2, Menu } from 'lucide-react';
import { supabase } from './lib/supabase';
import { AuthForm } from './components/Auth/AuthForm';
import { UserMenu } from './components/Auth/UserMenu';
import { Sidebar } from './components/Navigation/Sidebar';
import { BalanceDisplay } from './components/Balance/BalanceDisplay';
import DepthPage from './pages/DepthPage';
import { GalleryPage } from './pages/GalleryPage';

function App() {
  const [session, setSession] = useState<any>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('designer');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const token = '49be0c4f-0a33-4a4a-a602-4f6f46a37a96';

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.comfyonline.app/api/get_user_account_api', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.errorMsg || 'Failed to fetch balance');
      }

      if (data.data?.balances !== undefined) {
        setBalance(data.data.balances);
      } else {
        throw new Error('Balance data not found in response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchBalance();
    }
  }, [session]);

  if (!session) {
    return <AuthForm onSuccess={() => fetchBalance()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-0">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <Building2 className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Sm@rt Kitchen</h1>
                  <p className="text-xs text-gray-500 -mt-1">AI-Powered Architectural Kitchen Design</p>
                </div>
              </div>
              <div className="sm:hidden flex items-center space-x-4">
                <UserMenu email={session.user.email} onSignOut={() => setSession(null)} />
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-8 py-3 sm:py-0 border-t sm:border-t-0 border-gray-200">
              <BalanceDisplay balance={balance} loading={loading} />
              <div className="hidden sm:block h-8 w-px bg-gray-200" />
              <div className="hidden sm:block">
                <UserMenu email={session.user.email} onSignOut={() => setSession(null)} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <main className="pt-28 sm:pt-20 pb-12 px-4 sm:px-6 lg:pl-72 lg:pr-8">
        {currentPage === 'designer' ? (
          <DepthPage session={session} />
        ) : (
          <GalleryPage session={session} />
        )}
      </main>
    </div>
  );
}

export default App;
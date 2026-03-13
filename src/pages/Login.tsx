import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <PublicHeader />
      <div className="flex-1 flex items-start justify-center p-4 pt-20 sm:pt-32">
        <div className="max-w-[500px] w-full bg-white border border-[#d3d3d3] rounded shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#f3f3f3] border-b border-[#d3d3d3] py-2.5 px-4 text-center">
            <h1 className="text-[#333] text-lg font-medium">Log in</h1>
          </div>

          <div className="p-4 sm:p-6">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="text-[#333] font-bold text-sm sm:w-28 shrink-0">
                  User Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#ccc] rounded focus:outline-none focus:border-blue-400 text-[#333]"
                />
              </div>

              {/* Password Input */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="text-[#333] font-bold text-sm sm:w-28 shrink-0">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#ccc] rounded focus:outline-none focus:border-blue-400 text-[#333]"
                />
              </div>

              {/* Login Button */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="hidden sm:block sm:w-28 shrink-0" />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#428bca] hover:bg-[#3276b1] text-white px-4 py-1.5 rounded text-sm font-medium border border-[#357ebd] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Log in'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <PublicFooter />
      <MobileBottomNav />
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';

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
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <PublicHeader />
      <div className="flex-1 flex items-center justify-center p-4 pt-20">
        <div className="max-w-[380px] w-full bg-white rounded-[32px] shadow-2xl overflow-hidden relative border border-slate-200">
          {/* Blue Header Section */}
          <div className="relative h-[240px] bg-white overflow-hidden">
            <div className="absolute top-[-50px] left-[-50px] w-[450px] h-[350px] bg-gradient-to-br from-blue-600 to-blue-700 rounded-full opacity-90 transform -rotate-12 translate-y-[-50px]"></div>
            <div className="absolute top-[-80px] right-[-80px] w-[200px] h-[200px] bg-white rounded-full opacity-100"></div>
            
            <div className="relative z-10 p-10 pt-16">
              <h2 className="text-white text-xl font-bold opacity-90">Welcome Back,</h2>
              <h1 className="text-white text-5xl font-black mt-1">Log In!</h1>
            </div>
          </div>

          <div className="p-8 pt-0">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Input */}
              <div className="relative">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 font-medium"
                  placeholder="Jacob@gmail.com"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 font-medium"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 group"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                    {rememberMe && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-sm font-semibold text-slate-500">Remember me</span>
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-[20px] transition-all shadow-xl shadow-blue-200 flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  'Log in'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

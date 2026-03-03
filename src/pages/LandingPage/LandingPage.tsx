import React from 'react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { ArrowRight, CheckCircle2, BarChart3, Shield, Zap, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative bg-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50/50" />
          <div className="container mx-auto px-4 py-20 lg:py-32 relative">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Master Your Finances with <span className="text-blue-600">FinDash</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Track income, expenses, loans, and savings in one powerful dashboard. 
                Gain clarity on your financial health today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  Get Started Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/features" 
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Powerful features to help you manage your personal and family finances effectively.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: BarChart3,
                  title: 'Advanced Analytics',
                  desc: 'Visualize your spending habits with interactive charts and detailed reports.'
                },
                {
                  icon: Shield,
                  title: 'Secure Data',
                  desc: 'Your financial data is encrypted and stored securely. Privacy first approach.'
                },
                {
                  icon: Zap,
                  title: 'Real-time Tracking',
                  desc: 'Monitor your transactions and balances in real-time across all devices.'
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Bottom Header (Sticky) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center">
             <span className="font-bold text-slate-800">FinDash</span>
             <Link 
               to="/login" 
               className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
             >
               Login / Sign Up
             </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

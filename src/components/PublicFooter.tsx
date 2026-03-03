import React from 'react';
import { Wallet, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Wallet className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold">FinDash</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Empowering your financial journey with smart tracking, insightful analytics, and secure data management.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="hover:text-blue-500 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-pink-500 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-blue-600 transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="hover:text-blue-500 transition-colors">Home</Link></li>
              <li><Link to="/features" className="hover:text-blue-500 transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-blue-500 transition-colors">Pricing</Link></li>
              <li><Link to="/about" className="hover:text-blue-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/help" className="hover:text-blue-500 transition-colors">Help Center</Link></li>
              <li><Link to="/terms" className="hover:text-blue-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/faq" className="hover:text-blue-500 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                <span>123 Financial District,<br />Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span>+880 1234 567890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <span>support@findash.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} FinDash. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

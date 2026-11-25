import React from 'react';
import { Sparkles, Shield, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-white">SmartExpense-AI</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Production-quality AI-powered personal finance assistant designed to track spending, build budgets, and save smarter.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Product</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#features" className="hover:text-slate-200">Expense Tracking</a></li>
            <li><a href="#ai-insights" className="hover:text-slate-200">AI Intelligence</a></li>
            <li><a href="#features" className="hover:text-slate-200">Category Budgets</a></li>
            <li><a href="#features" className="hover:text-slate-200">Savings Goals</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Platform</h4>
          <ul className="space-y-2 text-xs">
            <li><span className="text-slate-500">React + Vite Frontend</span></li>
            <li><span className="text-slate-500">Node.js + Express Backend</span></li>
            <li><span className="text-slate-500">Google Gemini AI</span></li>
            <li><span className="text-slate-500">MongoDB Atlas Database</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Security & Trust</h4>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>256-bit Encrypted Session Security</span>
          </div>
          <p className="text-[11px] text-slate-500">
            SmartExpense-AI respects your financial privacy. AI analysis is generated safely on isolated user metrics.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
        <p>© 2026 SmartExpense-AI. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for SaaS Personal Finance
        </p>
      </div>
    </footer>
  );
};

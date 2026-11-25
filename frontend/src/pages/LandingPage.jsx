import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  BarChart3,
  Target,
  PieChart,
  Receipt,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden border-b border-slate-900">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI-Powered Personal Finance Engine</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-none"
            >
              Understand Your Money.{' '}
              <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Build Your Future.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal"
            >
              SmartExpense-AI helps you track spending, understand your financial habits, build better budgets, and save smarter with personalized AI insights.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base shadow-xl shadow-brand-600/30 transition-all cursor-pointer"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-base transition-all"
              >
                Explore Features
              </a>
            </motion.div>
          </div>

          {/* Interactive Hero Dashboard Mockup Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 relative max-w-5xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-slate-800/60 to-slate-900/90 border border-slate-700/60 shadow-2xl shadow-slate-950/80"
          >
            <div className="bg-slate-950 rounded-xl p-6 border border-slate-800/80 space-y-6">
              {/* Fake Dashboard Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-500 font-mono ml-2">smartexpense.ai/app/dashboard</span>
                </div>
                <div className="text-xs font-semibold text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
                  Live Product Preview
                </div>
              </div>

              {/* Fake Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Balance</p>
                  <p className="text-xl font-bold text-white">₹56,550</p>
                  <p className="text-[10px] text-emerald-400 font-medium">+12.5% vs last month</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Income</p>
                  <p className="text-xl font-bold text-emerald-400">₹75,000</p>
                  <p className="text-[10px] text-slate-500">2 Deposits</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</p>
                  <p className="text-xl font-bold text-rose-400">₹18,450</p>
                  <p className="text-[10px] text-rose-400 font-medium">-4.2% optimized</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Savings Rate</p>
                  <p className="text-xl font-bold text-purple-400">75%</p>
                  <p className="text-[10px] text-purple-400 font-medium">Target: 30%</p>
                </div>
              </div>

              {/* Floating AI Insight Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 flex items-start gap-4">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-purple-300">AI Financial Summary</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    "You saved ₹56,550 this month with a 75% savings rate. Reducing dining out by ₹1,200 could help you complete your New M3 MacBook Pro savings goal 2 months faster."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Value Points */}
      <section className="py-12 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-10 h-10 mx-auto rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Track Smarter</h3>
            <p className="text-xs text-slate-400">Log every transaction seamlessly with category tagging and receipt support.</p>
          </div>
          <div className="space-y-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Save Better</h3>
            <p className="text-xs text-slate-400">Set ambitious savings goals with real-time target date monthly calculations.</p>
          </div>
          <div className="space-y-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Think Ahead</h3>
            <p className="text-xs text-slate-400">Receive Gemini AI insights identifying unnecessary spending and saving opportunities.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Built for Intelligent Financial Control</h2>
            <p className="text-sm text-slate-400">
              Everything you need to master your money in one cohesive, modern SaaS platform.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Asymmetrical Feature Card */}
            <div className="lg:col-span-2 p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                Featured AI Intelligence
              </div>
              <h3 className="text-2xl font-bold text-white">Google Gemini AI Financial Insights</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                SmartExpense-AI analyzes your raw financial transactions, budgets, and savings goals to generate personalized, non-generic advice.
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-purple-300 font-bold">
                  <span>Spending Analysis Example</span>
                  <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded-full">Gemini 1.5</span>
                </div>
                <p className="text-slate-300">
                  "Food spending reached ₹4,250 this month (23% of total). Setting a monthly ceiling of ₹3,500 can free up ₹750/month towards your Emergency Fund."
                </p>
              </div>
            </div>

            {/* Smaller Supporting Cards */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 w-fit">
                  <PieChart className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">Smart Budgets</h4>
                <p className="text-xs text-slate-400">
                  Category caps with healthy, warning, critical, and budget exceeded indicators.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">Financial Reports</h4>
                <p className="text-xs text-slate-400">
                  Interactive time-series charts and category breakdown exports in CSV & PDF formats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works 4-Step Sequence */}
      <section id="how-it-works" className="py-20 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-white">How SmartExpense-AI Works</h2>
            <p className="text-sm text-slate-400">Simple 4-step workflow to financial clarity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <span className="text-3xl font-extrabold text-slate-700">01</span>
              <h3 className="text-base font-bold text-white">Track</h3>
              <p className="text-xs text-slate-400">Log income & expenses with payment methods and receipts.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <span className="text-3xl font-extrabold text-slate-700">02</span>
              <h3 className="text-base font-bold text-white">Analyze</h3>
              <p className="text-xs text-slate-400">System aggregates category breakdowns and spending trends.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <span className="text-3xl font-extrabold text-slate-700">03</span>
              <h3 className="text-base font-bold text-white">Discover</h3>
              <p className="text-xs text-slate-400">AI identifies unnecessary expenses and saving opportunities.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <span className="text-3xl font-extrabold text-slate-700">04</span>
              <h3 className="text-base font-bold text-white">Improve</h3>
              <p className="text-xs text-slate-400">Achieve your savings goals faster with smart discipline.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            Start Building Better Financial Habits Today
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Join thousands of users taking control of their money with SmartExpense-AI.
          </p>
          <div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-xl shadow-brand-600/30 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Skeleton } from '../components/UI/Skeleton';
import { Badge } from '../components/UI/Badge';
import { IncomeExpenseChart } from '../components/Charts/IncomeExpenseChart';
import { CategoryPieChart } from '../components/Charts/CategoryPieChart';
import { TransactionModal } from '../components/Transactions/TransactionModal';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Sparkles,
  Plus,
  ArrowRight,
  RefreshCw,
  Receipt,
} from 'lucide-react';
import { toast } from 'react-toastify';

export const DashboardPage = ({ currentPeriod = 'this_month' }) => {
  const { formatCurrency } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshingAI, setRefreshingAI] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard?period=${currentPeriod}`);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentPeriod]);

  const handleAddTransaction = async (formData) => {
    setSubmitting(true);
    try {
      const res = await api.post('/transactions', formData);
      toast.success(res.message || 'Transaction added!');
      setIsModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefreshAI = async () => {
    setRefreshingAI(true);
    try {
      const res = await api.post('/ai/insights');
      if (res.success && res.data) {
        setData((prev) => ({
          ...prev,
          aiSummary: res.data,
        }));
        toast.success('Generated fresh AI insights!');
      }
    } catch (err) {
      toast.error('Could not refresh AI insights');
    } finally {
      setRefreshingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    savingsRate: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Financial Command Center</h2>
          <p className="text-xs text-slate-400">Overview of income, expenses, category allocation, and AI advice.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" icon={Plus}>
          Add Transaction
        </Button>
      </div>

      {/* 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <Card hover className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Balance</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-white">{formatCurrency(summary.totalBalance)}</p>
            <p className="text-[11px] text-slate-400 mt-1">Net accumulated position</p>
          </div>
        </Card>

        {/* Total Income */}
        <Card hover className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Income</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-emerald-400">{formatCurrency(summary.totalIncome)}</p>
            <p className="text-[11px] text-emerald-400/80 mt-1 font-medium">+12.5% vs previous period</p>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card hover className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Expenses</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-rose-400">{formatCurrency(summary.totalExpenses)}</p>
            <p className="text-[11px] text-rose-400/80 mt-1 font-medium">-4.2% optimized spending</p>
          </div>
        </Card>

        {/* Total Savings & Rate */}
        <Card hover className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Savings</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-purple-300">{formatCurrency(summary.totalSavings)}</p>
            <p className="text-[11px] text-purple-400 mt-1 font-medium">
              {summary.savingsRate}% Savings Rate
            </p>
          </div>
        </Card>
      </div>

      {/* Main Grid: Charts & AI Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Chart */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Income vs Expenses</h3>
              <p className="text-xs text-slate-400">Monthly cash inflow & outflow trajectory</p>
            </div>
            <Badge variant="success">Area Chart</Badge>
          </div>
          <IncomeExpenseChart data={data?.incomeVsExpense || []} />
        </Card>

        {/* Expense Category Donut Chart */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Expense Breakdown</h3>
              <p className="text-xs text-slate-400">Allocation by category</p>
            </div>
            <Badge variant="neutral">Categories</Badge>
          </div>
          <CategoryPieChart data={data?.expenseByCategory || []} />
        </Card>
      </div>

      {/* AI Insight Card & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Financial Summary Card */}
        <Card className="lg:col-span-1 border-purple-500/30 bg-gradient-to-b from-purple-950/20 to-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-purple-200">AI Financial Summary</h3>
            </div>
            <Button
              onClick={handleRefreshAI}
              variant="ghost"
              size="sm"
              loading={refreshingAI}
              icon={RefreshCw}
              title="Refresh AI analysis"
            >
              Refresh
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/20 space-y-3">
            <p className="text-xs text-slate-200 leading-relaxed italic">
              "{data?.aiSummary?.summary || 'Your spending increased slightly this period. Analyzing category allocations to recommend savings opportunities.'}"
            </p>
            {data?.aiSummary?.insights?.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <p className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">Top Recommendation</p>
                <p className="text-xs text-slate-300">
                  {data.aiSummary.insights[0].description}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/app/ai-insights"
              className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 hover:text-purple-200"
            >
              View Full AI Analysis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[10px] text-slate-500">Gemini Powered</span>
          </div>
        </Card>

        {/* Recent Transactions Table */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Recent Transactions</h3>
              <p className="text-xs text-slate-400">Latest activity records</p>
            </div>
            <Link
              to="/app/transactions"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              View All Transactions
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.recentTransactions?.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No transactions recorded yet. Click "Add Transaction" to start tracking!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Payment</th>
                    <th className="pb-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data?.recentTransactions?.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 text-slate-400 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 text-slate-100 font-medium">{tx.description || tx.category || '-'}</td>
                      <td className="py-3">
                        <Badge variant="neutral">{tx.category}</Badge>
                      </td>
                      <td className="py-3 text-slate-400">{tx.paymentMethod}</td>
                      <td
                        className={`py-3 text-right font-semibold ${
                          tx.type === 'Income' ? 'text-emerald-400' : 'text-slate-200'
                        }`}
                      >
                        {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTransaction}
        loading={submitting}
      />
    </div>
  );
};

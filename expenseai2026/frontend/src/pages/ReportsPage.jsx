import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Skeleton } from '../components/UI/Skeleton';
import { Badge } from '../components/UI/Badge';
import { IncomeExpenseChart } from '../components/Charts/IncomeExpenseChart';
import { CategoryPieChart } from '../components/Charts/CategoryPieChart';
import { BarChart3, TrendingUp, TrendingDown, PiggyBank, FileText, FileSpreadsheet, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const ReportsPage = () => {
  const { formatCurrency } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports?period=${period}`);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  const summary = data?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    savingsRate: 0,
    transactionCount: 0,
  };

  const exportCSV = () => {
    if (!data || !data.categories) return toast.info('No report data to export');
    const headers = ['Category', 'Amount', 'Percentage'];
    const rows = data.categories.map((c) => [c.name, c.amount, `${c.percentage}%`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartexpense_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (!data) return toast.info('No report data to export');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('SmartExpense-AI — Financial Report Summary', 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${period.toUpperCase()} | Total Income: ₹${summary.totalIncome} | Total Expenses: ₹${summary.totalExpenses}`, 14, 23);

    const tableColumn = ['Category', 'Amount (₹)', 'Percentage (%)'];
    const tableRows = (data.categories || []).map((c) => [c.name, `₹${c.amount.toLocaleString('en-IN')}`, `${c.percentage}%`]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
    });

    doc.save(`smartexpense_financial_report_${Date.now()}.pdf`);
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const categoryChartData = (data?.categories || []).map((c) => ({
    name: c.name,
    value: c.amount,
    percentage: c.percentage,
  }));

  const trendChartData = (data?.trends || []).map((t) => ({
    month: t.date,
    Income: t.Income,
    Expense: t.Expense,
  }));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Financial Reports & Analytics</h2>
          <p className="text-xs text-slate-400">Deep-dive audit into cashflow, savings trends, and category distribution.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {['week', 'month', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  period === p ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                This {p}
              </button>
            ))}
          </div>
          <Button onClick={exportCSV} variant="outline" size="sm" icon={FileSpreadsheet}>
            CSV
          </Button>
          <Button onClick={exportPDF} variant="outline" size="sm" icon={FileText}>
            PDF
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Income</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-3">{formatCurrency(summary.totalIncome)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{summary.transactionCount} transactions recorded</p>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Expenses</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-400 mt-3">{formatCurrency(summary.totalExpenses)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Outflow total for period</p>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Savings</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-purple-300 mt-3">{formatCurrency(summary.totalSavings)}</p>
          <p className="text-[11px] text-purple-400 mt-1 font-medium">{summary.savingsRate}% Savings Rate</p>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Activity Level</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-3">{summary.transactionCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Total items processed</p>
        </Card>
      </div>

      {/* Report Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Category Allocation Breakdown</h3>
              <p className="text-xs text-slate-400">Proportional spend distribution</p>
            </div>
            <Badge variant="neutral">Donut Chart</Badge>
          </div>
          <CategoryPieChart data={categoryChartData} />
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Cashflow Trend Trajectory</h3>
              <p className="text-xs text-slate-400">Inflow vs Outflow analysis</p>
            </div>
            <Badge variant="success">Trend Chart</Badge>
          </div>
          <IncomeExpenseChart data={trendChartData} />
        </Card>
      </div>

      {/* Category Table */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-white">Expense Category Breakdown Table</h3>
        {data?.categories?.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No expense categories recorded for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
                  <th className="py-3 px-4 font-semibold text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.categories?.map((cat) => (
                  <tr key={cat.name} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-200">{cat.name}</td>
                    <td className="py-3.5 px-4 font-bold text-right text-slate-100">{formatCurrency(cat.amount)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge variant="neutral">{cat.percentage}%</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

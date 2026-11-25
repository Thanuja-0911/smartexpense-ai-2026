import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { ProgressBar } from '../components/UI/ProgressBar';
import { Badge } from '../components/UI/Badge';
import { Skeleton } from '../components/UI/Skeleton';
import { EmptyState } from '../components/UI/EmptyState';
import { ConfirmModal } from '../components/UI/ConfirmModal';
import { BudgetModal } from '../components/Budgets/BudgetModal';
import { PieChart as PieChartIcon, Plus, Edit2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export const BudgetsPage = () => {
  const { formatCurrency } = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/budgets');
      if (res.success) {
        setBudgets(res.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSaveBudget = async (formData) => {
    setSubmitting(true);
    try {
      if (editingBudget) {
        await api.put(`/budgets/${editingBudget._id}`, formData);
        toast.success('Budget updated');
      } else {
        await api.post('/budgets', formData);
        toast.success('Category budget created');
      }
      setIsModalOpen(false);
      setEditingBudget(null);
      fetchBudgets();
    } catch (err) {
      toast.error(err.message || 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      await api.delete(`/budgets/${deletingId}`);
      toast.success('Budget removed');
      setDeletingId(null);
      fetchBudgets();
    } catch (err) {
      toast.error(err.message || 'Failed to delete budget');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status, percentage) => {
    if (status === 'exceeded' || percentage >= 100) {
      return (
        <Badge variant="danger" className="animate-pulse">
          Budget Exceeded
        </Badge>
      );
    }
    if (status === 'critical' || percentage >= 90) {
      return <Badge variant="danger">Critical (&gt;90%)</Badge>;
    }
    if (status === 'warning' || percentage >= 70) {
      return <Badge variant="warning">Warning (70-90%)</Badge>;
    }
    return <Badge variant="success">Healthy (&lt;70%)</Badge>;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-rose-600';
    if (percentage >= 90) return 'bg-rose-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Monthly Category Budgets</h2>
          <p className="text-xs text-slate-400">Set spending ceilings for each category to maintain discipline.</p>
        </div>
        <Button
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          variant="primary"
          icon={Plus}
        >
          Create Budget
        </Button>
      </div>

      {/* Budget Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : budgets.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={PieChartIcon}
            title="No budgets configured"
            description="Create your first monthly category budget to prevent overspending."
            actionText="Create Budget"
            onAction={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => (
            <Card key={b._id} hover className="space-y-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{b.category}</h3>
                  <p className="text-[11px] text-slate-400">
                    {new Date(0, b.month - 1).toLocaleString('en-US', { month: 'long' })} {b.year}
                  </p>
                </div>
                {getStatusBadge(b.status, b.percentage)}
              </div>

              {/* Progress Bar & Amounts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Spent: <strong className="text-slate-200">{formatCurrency(b.spent)}</strong>
                  </span>
                  <span className="text-slate-400">
                    Limit: <strong className="text-slate-200">{formatCurrency(b.amount)}</strong>
                  </span>
                </div>
                <ProgressBar value={b.percentage} color={getProgressColor(b.percentage)} height="h-2.5" />
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-slate-300">{b.percentage}% used</span>
                  <span className={b.remaining === 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-medium'}>
                    {b.remaining === 0 ? '0 remaining' : `${formatCurrency(b.remaining)} remaining`}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingBudget(b);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(b._id)}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSubmit={handleSaveBudget}
        initialData={editingBudget}
        loading={submitting}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget"
        message="Are you sure you want to remove this category budget?"
        loading={submitting}
      />
    </div>
  );
};

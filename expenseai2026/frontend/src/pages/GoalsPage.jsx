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
import { GoalModal } from '../components/Goals/GoalModal';
import { AddMoneyModal } from '../components/Goals/AddMoneyModal';
import { Target, Plus, Edit2, Trash2, Calendar, PiggyBank, ArrowUpRight } from 'lucide-react';
import { toast } from 'react-toastify';

export const GoalsPage = () => {
  const { formatCurrency } = useTheme();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/goals');
      if (res.success) {
        setGoals(res.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSaveGoal = async (formData) => {
    setSubmitting(true);
    try {
      if (selectedGoal && isGoalModalOpen) {
        await api.put(`/goals/${selectedGoal._id}`, formData);
        toast.success('Savings goal updated');
      } else {
        await api.post('/goals', formData);
        toast.success('Savings goal created');
      }
      setIsGoalModalOpen(false);
      setSelectedGoal(null);
      fetchGoals();
    } catch (err) {
      toast.error(err.message || 'Failed to save goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDepositMoney = async (depositData) => {
    if (!selectedGoal) return;
    setSubmitting(true);
    try {
      await api.put(`/goals/${selectedGoal._id}`, {
        addAmount: depositData.addAmount,
      });
      toast.success(`Deposited ${formatCurrency(depositData.addAmount)} to ${selectedGoal.name}!`);
      setIsDepositModalOpen(false);
      setSelectedGoal(null);
      fetchGoals();
    } catch (err) {
      toast.error(err.message || 'Deposit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      await api.delete(`/goals/${deletingId}`);
      toast.success('Goal deleted');
      setDeletingId(null);
      fetchGoals();
    } catch (err) {
      toast.error(err.message || 'Failed to delete goal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Savings Goals Tracker</h2>
          <p className="text-xs text-slate-400">Track milestones for major purchases, emergency funds, and travel.</p>
        </div>
        <Button
          onClick={() => {
            setSelectedGoal(null);
            setIsGoalModalOpen(true);
          }}
          variant="primary"
          icon={Plus}
        >
          Set Savings Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : goals.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Target}
            title="Set your first savings goal"
            description="Organize your major financial milestones and track your progress automatically."
            actionText="Create Goal"
            onAction={() => {
              setSelectedGoal(null);
              setIsGoalModalOpen(true);
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => (
            <Card key={g._id} hover className="space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">{g.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{g.description || 'Savings milestone'}</p>
                  </div>
                  <Badge variant={g.percentage >= 100 ? 'success' : 'ai'}>
                    {g.percentage}% Completed
                  </Badge>
                </div>

                {/* Progress Details */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Saved: <strong className="text-emerald-400 font-bold">{formatCurrency(g.savedAmount)}</strong>
                    </span>
                    <span className="text-slate-400">
                      Target: <strong className="text-slate-200">{formatCurrency(g.targetAmount)}</strong>
                    </span>
                  </div>
                  <ProgressBar value={g.percentage} color="bg-brand-500" height="h-3" />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Remaining: {formatCurrency(g.remaining)}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(g.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Monthly Estimate Math */}
                {g.percentage < 100 && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                    Est. Monthly Savings Needed:{' '}
                    <strong className="text-purple-300 font-bold">{formatCurrency(g.monthlyRequired)}/mo</strong>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <Button
                  onClick={() => {
                    setSelectedGoal(g);
                    setIsDepositModalOpen(true);
                  }}
                  variant="secondary"
                  size="sm"
                  icon={PiggyBank}
                >
                  Add Money
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedGoal(g);
                      setIsGoalModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(g._id)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setSelectedGoal(null);
        }}
        onSubmit={handleSaveGoal}
        initialData={selectedGoal}
        loading={submitting}
      />

      {/* Add Deposit Money Modal */}
      <AddMoneyModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setSelectedGoal(null);
        }}
        onSubmit={handleDepositMoney}
        goal={selectedGoal}
        loading={submitting}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Savings Goal"
        message="Are you sure you want to remove this savings goal?"
        loading={submitting}
      />
    </div>
  );
};

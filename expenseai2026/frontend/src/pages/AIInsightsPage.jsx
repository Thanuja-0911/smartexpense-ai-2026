import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Skeleton } from '../components/UI/Skeleton';
import { Badge } from '../components/UI/Badge';
import { ProgressBar } from '../components/UI/ProgressBar';
import { Sparkles, RefreshCw, AlertTriangle, ShieldCheck, TrendingDown, Target, Lightbulb } from 'lucide-react';
import { toast } from 'react-toastify';

export const AIInsightsPage = () => {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/insights');
      if (res.success && res.data) {
        setAiData(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.post('/ai/insights');
      if (res.success && res.data) {
        setAiData(res.data);
        toast.success('Generated updated AI insights!');
      }
    } catch (err) {
      toast.error('Failed to generate new AI analysis');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const score = aiData?.healthScore || 70;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-2xl font-extrabold text-white">AI Financial Advisor</h2>
          </div>
          <p className="text-xs text-slate-400">Personalized spending patterns, budget anomalies, and optimization strategies.</p>
        </div>
        <Button onClick={handleRefresh} loading={refreshing} variant="primary" icon={RefreshCw}>
          Regenerate Insights
        </Button>
      </div>

      {/* AI Financial Health Score Card */}
      <Card className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 border-purple-500/30 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">Financial Health Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">{score}</span>
              <span className="text-sm text-slate-400">/ 100</span>
            </div>
            <ProgressBar value={score} color={score > 75 ? 'bg-emerald-500' : score > 50 ? 'bg-amber-500' : 'bg-rose-500'} height="h-3" />
          </div>

          <div className="md:col-span-2 space-y-2 border-t md:border-t-0 md:border-l border-purple-500/20 pt-4 md:pt-0 md:pl-6">
            <Badge variant="ai">AI Analysis Summary</Badge>
            <p className="text-xs text-slate-200 leading-relaxed italic">
              "{aiData?.summary || 'Your spending rate is healthy. Keep tracking categories to stay ahead of long-term milestones.'}"
            </p>
          </div>
        </div>
      </Card>

      {/* Grid: Insights & Discretionary Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Insights */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">Smart Insights</h3>
          </div>
          <div className="space-y-3">
            {aiData?.insights?.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{item.title}</span>
                  <Badge variant={item.severity === 'warning' ? 'warning' : item.severity === 'success' ? 'success' : 'neutral'}>
                    {item.category}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Unnecessary Spending & Saving Opportunities */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <h3 className="text-base font-bold text-white">Potential Saving Opportunities</h3>
          </div>
          <div className="space-y-3">
            {aiData?.savingOpportunities?.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1">
                <span className="text-xs font-bold text-purple-200">{item.title}</span>
                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Budget Recommendations */}
      {aiData?.budgetRecommendations?.length > 0 && (
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-400" />
            <h3 className="text-base font-bold text-white">Recommended Monthly Budget Ceilings</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiData.budgetRecommendations.map((b, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{b.category}</span>
                  <span className="text-xs font-extrabold text-emerald-400">₹{b.recommendedAmount?.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[11px] text-slate-400">{b.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

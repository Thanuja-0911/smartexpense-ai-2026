import React, { useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Sparkles, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export const ResetPasswordPage = () => {
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = paramToken || searchParams.get('token');

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Reset token is missing. Please use the link sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword: data.password,
      });
      toast.success(res.message || 'Password reset successful! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white">SmartExpense-AI</span>
          </Link>
          <h2 className="text-xl font-bold text-white pt-2">Set New Password</h2>
          <p className="text-xs text-slate-400">Enter a secure new password for your account.</p>
        </div>

        {!token ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>Missing Reset Token</span>
            </div>
            <p className="text-xs text-slate-300">
              No reset token found in the URL. Please click the exact reset link sent to your email.
            </p>
            <Link to="/forgot-password" className="inline-block text-xs text-brand-400 underline font-semibold">
              Request a new reset link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              {...register('password', {
                required: 'Please enter a new password',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your new password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />

            <Button type="submit" variant="primary" className="w-full py-3" loading={loading}>
              Update Password
            </Button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-800">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

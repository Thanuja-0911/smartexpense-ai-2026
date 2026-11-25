import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Sparkles, Lock } from 'lucide-react';
import { toast } from 'react-toastify';

export const ResetPasswordPage = () => {
  const { token } = useParams();
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
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword: data.password,
      });
      toast.success(res.message || 'Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password.');
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
          <p className="text-xs text-slate-400">Enter a strong new password for your account.</p>
        </div>

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
      </div>
    </div>
  );
};

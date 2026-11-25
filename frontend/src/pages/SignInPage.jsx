import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Sparkles, Mail, Lock } from 'lucide-react';
import { toast } from 'react-toastify';

export const SignInPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password, data.rememberMe);
      toast.success(res.message || 'Login successful!');
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white">SmartExpense-AI</span>
          </Link>
          <h2 className="text-xl font-bold text-white pt-2">Sign In with Gmail / Email</h2>
          <p className="text-xs text-slate-400">Sign in with your Gmail to access your personal finance dashboard.</p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Gmail / Email Address"
            type="email"
            placeholder="thanuja09112007@gmail.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email', {
              required: 'Please enter your Gmail / email address',
              pattern: { value: /^\S+@\S+\.\S+$/i, message: 'Invalid email address format' },
            })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            {...register('password', {
              required: 'Please enter your password',
            })}
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded bg-slate-950 border-slate-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
                {...register('rememberMe')}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-brand-400 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" className="w-full py-3" loading={loading}>
            Sign In with Gmail
          </Button>
        </form>

        {/* Footer info note */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span className="text-slate-400">✨ Enter your Gmail & password to log in or get started immediately.</span>
        </div>
      </div>
    </div>
  );
};

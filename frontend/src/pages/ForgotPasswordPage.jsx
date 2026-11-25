import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Sparkles, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

export const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: data.email });
      toast.success(res.message || 'Reset link sent!');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link.');
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
          <h2 className="text-xl font-bold text-white pt-2">Reset Password</h2>
          <p className="text-xs text-slate-400">Enter your account email to receive a password reset link.</p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
            <p className="text-xs text-emerald-400 font-medium leading-relaxed">
              If an account exists with that email, a password reset link has been dispatched!
            </p>
            <Link to="/login" className="inline-block text-xs text-brand-400 underline font-semibold">
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email', {
                required: 'Please enter your email',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
              })}
            />

            <Button type="submit" variant="primary" className="w-full py-3" loading={loading}>
              Send Reset Link
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

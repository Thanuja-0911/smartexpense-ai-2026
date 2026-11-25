import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Sparkles, User, Mail, Lock } from 'lucide-react';
import { toast } from 'react-toastify';

export const SignUpPage = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await registerAuth(data.name, data.email, data.password);
      toast.success(res.message || 'Registration successful!');
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
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
          <h2 className="text-xl font-bold text-white pt-2">Create Your Account</h2>
          <p className="text-xs text-slate-400">Start tracking spending and receiving AI financial insights.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Thanuja"
            icon={User}
            error={errors.name?.message}
            {...register('name', { required: 'Please enter your full name' })}
          />

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

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            {...register('password', {
              required: 'Please create a password',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />

          <Button type="submit" variant="primary" className="w-full py-3" loading={loading}>
            Create Free Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

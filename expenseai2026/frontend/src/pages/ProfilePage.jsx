import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import { User, Mail, DollarSign, Bell, Lock, ShieldCheck, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export const ProfilePage = () => {
  const { user, updateUserData } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [updating, setUpdating] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCurrency(user.currency || 'INR');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put('/profile', { name, currency });
      if (res.success && res.data) {
        updateUserData(res.data);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }

    setChangingPass(true);
    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (res.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Account & Profile Settings</h2>
        <p className="text-xs text-slate-400">Manage your identity, currency preferences, and account security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Information Form */}
        <Card className="md:col-span-2 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-brand-400" />
            <h3 className="text-base font-bold text-white">Personal Information</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Full Name"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              icon={Mail}
              value={email}
              disabled
              className="opacity-70 bg-slate-900 cursor-not-allowed"
            />

            <Select
              label="Preferred Display Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[
                { value: 'INR', label: 'INR (₹ - Indian Rupee)' },
                { value: 'USD', label: 'USD ($ - US Dollar)' },
                { value: 'EUR', label: 'EUR (€ - Euro)' },
                { value: 'GBP', label: 'GBP (£ - British Pound)' },
              ]}
            />

            <div className="pt-2">
              <Button type="submit" loading={updating} variant="primary" icon={CheckCircle}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Security & Password Form */}
        <Card className="space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">Change Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              icon={Lock}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="New Password"
              type="password"
              icon={Lock}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button type="submit" loading={changingPass} variant="outline" className="w-full">
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

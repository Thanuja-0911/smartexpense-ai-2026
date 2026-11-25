import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import {
  User,
  Mail,
  Lock,
  CheckCircle,
  Camera,
  Upload,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
];

export const ProfilePage = () => {
  const { user, updateUserData } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');

  const fileInputRef = useRef(null);

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
      setProfileImage(user.profileImage || '');
      setImagePreview(user.profileImage || '');
    }
  }, [user]);

  // Handle local file selection and convert to Base64
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Please choose a valid image file (PNG, JPG, JPEG, WEBP)');
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image size must be less than 5MB');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      setProfileImage(base64Data);
      setImagePreview(base64Data);
      toast.info('New photo selected! Click "Save Profile Changes" to apply.');
    };
    reader.readAsDataURL(file);
  };

  // Select quick preset avatar
  const handleSelectPreset = (url) => {
    setProfileImage(url);
    setImagePreview(url);
    toast.info('Preset avatar selected! Click "Save Profile Changes" to apply.');
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setProfileImage('');
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Photo removed! Click "Save Profile Changes" to apply.');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put('/profile', {
        name,
        currency,
        profileImage,
      });

      if (res.success && res.data) {
        updateUserData(res.data);
        toast.success('Profile and photo updated successfully!');
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
        <h2 className="text-2xl font-extrabold text-white">Account & Profile</h2>
        <p className="text-xs text-slate-400">Manage your profile photo, personal information, and security.</p>
      </div>

      {/* Profile Photo Management Card */}
      <Card className="space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Camera className="w-4 h-4 text-brand-400" />
          <h3 className="text-base font-bold text-white">Profile Photo</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Preview */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-brand-500/40 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-brand-500/10">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={name || 'User Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-extrabold text-brand-300">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-lg border-2 border-slate-950 transition-all cursor-pointer active:scale-95"
              title="Upload photo from device"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Controls & Actions */}
          <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Personal Avatar</h4>
              <p className="text-xs text-slate-400">
                Upload a picture from your device or pick a persona avatar below. PNG, JPG or WEBP up to 5MB.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Upload}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo
              </Button>

              {imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  onClick={handleRemovePhoto}
                  className="text-rose-400 hover:text-rose-300 hover:border-rose-500/30"
                >
                  Remove Photo
                </Button>
              )}
            </div>

            {/* Preset Avatars Selection */}
            <div className="pt-2">
              <p className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1.5 justify-center sm:justify-start">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Or select a quick persona avatar:</span>
              </p>
              <div className="flex items-center gap-2.5 justify-center sm:justify-start flex-wrap">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectPreset(url)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      imagePreview === url
                        ? 'border-brand-400 ring-2 ring-brand-500/50 scale-110 shadow-md shadow-brand-500/20'
                        : 'border-slate-700 hover:border-brand-500/60 opacity-75 hover:opacity-100 hover:scale-105'
                    }`}
                    title={`Persona Avatar ${i + 1}`}
                  >
                    <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

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

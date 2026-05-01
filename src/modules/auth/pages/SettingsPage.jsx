import React, { useState } from 'react';
import axios from '../../../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Lock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('New passwords do not match');
    }

    setLoading(true);
    try {
      await axios.post('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      toast.success('Password updated successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account security and authentication preferences.</p>
      </div>

      <Card>
        <CardHeader className="py-6 border-b border-slate-50">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary-600" />
            Update Password
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 items-start mb-4">
              <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Ensure your new password contains at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Current Password</label>
              <input
                name="currentPassword"
                type="password"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">New Password</label>
              <input
                name="newPassword"
                type="password"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm"
                placeholder="Minimum 8 characters"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Confirm New Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm"
                placeholder="Repeat new password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="pt-4 border-t border-slate-50 flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-primary-200 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-6 flex gap-4 items-center">
           <div className="w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-slate-400" />
           </div>
           <div>
              <p className="text-sm font-bold text-slate-900">Need help with your account?</p>
              <p className="text-xs text-slate-500 mt-0.5">Contact the IT administration team if you've lost access or suspect unauthorized activity.</p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;

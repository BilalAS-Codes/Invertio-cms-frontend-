import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from '../../../api/axios';
import { Lock, Loader2, ArrowLeft, KeySquare } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [formData, setFormData] = useState({
    email: state?.email || '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsLoading(true);
    try {
      await axios.post('/auth/reset-password', formData);
      toast.success('Password reset successfully. Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700 text-sm font-bold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create New Password</h2>
        <p className="text-slate-500 text-sm mt-2">Enter the code sent to your email and your new password.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <input
            name="email"
            type="email"
            readOnly
            className="appearance-none rounded-lg block w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 sm:text-sm outline-none"
            value={formData.email}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reset Code</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeySquare className="h-5 w-5 text-slate-400" />
            </div>
            <input
              name="code"
              type="text"
              required
              maxLength={6}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="6-digit code"
              value={formData.code}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              name="newPassword"
              type="password"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="••••••••"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              name="confirmPassword"
              type="password"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 focus:outline-none transition-all duration-200 shadow-lg shadow-primary-200 disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;

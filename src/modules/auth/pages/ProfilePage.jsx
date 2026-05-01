import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { User, Mail, Shield, Calendar, Loader2, Edit3, Camera, MapPin, Briefcase, Award, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../../utils/cn';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/auth/me');
      setProfile(res.data.data);
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Profile Header Card */}
      <div className="relative">
        <div className="h-64 w-full bg-gradient-to-br from-slate-900 via-primary-900 to-indigo-900 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="absolute top-6 right-6">
            <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 backdrop-blur-md px-4 py-1.5 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
              Online
            </Badge>
          </div>
        </div>
        
        <div className="absolute -bottom-20 left-10 flex flex-col md:flex-row md:items-end gap-8 px-4">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[2rem] bg-white p-2 shadow-2xl ring-8 ring-slate-50">
              <div className="w-full h-full rounded-[1.5rem] bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white text-5xl font-black shadow-inner">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <button className="absolute bottom-3 right-3 p-2.5 bg-white rounded-2xl shadow-xl border border-slate-100 text-slate-500 hover:text-primary-600 transition-all hover:scale-110 active:scale-95">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
              <Award className="w-6 h-6 text-amber-500 fill-amber-500/10" />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              <div className="flex items-center gap-1.5 text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
                <Briefcase className="w-3.5 h-3.5" />
                {profile.role_name}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Dubai, UAE
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Local Time
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-32">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                  <User className="w-5 h-5" />
                </div>
                Detailed Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-50">
                <div className="p-8 space-y-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                    <p className="text-base font-bold text-slate-800">{profile.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                      {profile.email}
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-base font-bold text-slate-400 italic">Not shared yet</p>
                  </div>
                </div>
                <div className="p-8 space-y-8 bg-slate-50/30">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                    <p className="text-base font-bold text-slate-800">Operations & Management</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                    <p className="text-base font-bold text-slate-800">Invertio HQ - Dubai</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</p>
                    <p className="text-base font-bold text-slate-800 truncate">{profile.role_name} Lead</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                 <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Security Health</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Your account is protected by enterprise-grade 2FA and encrypted sessions.
                </p>
              </div>
              <Button variant="secondary" size="sm" className="w-full font-bold rounded-xl h-10">
                Manage Security
              </Button>
            </Card>
            
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                 <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Profile Updates</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Keep your information current to ensure seamless collaboration with the team.
                </p>
              </div>
              <Button className="w-full font-bold rounded-xl h-10 shadow-lg shadow-primary-100">
                Edit Details
              </Button>
            </Card>
          </div>
        </div>

        {/* Right Column: Meta Info */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] p-8 text-center bg-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
            <div className="relative">
              <div className="w-20 h-20 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white mx-auto mb-6 shadow-2xl">
                 <Calendar className="w-10 h-10 text-primary-400" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Service Period</p>
              <p className="text-2xl font-black text-slate-900">
                {new Date(profile.created_at).toLocaleDateString([], { month: 'long', year: 'numeric' })}
              </p>
              <div className="mt-6 pt-6 border-t border-slate-50">
                 <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Loyalty Status</p>
                 <div className="flex justify-center gap-1 mt-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-6 h-1.5 rounded-full bg-primary-200 first:bg-primary-600" />
                    ))}
                 </div>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-8 bg-gradient-to-br from-primary-600 to-indigo-700 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Award className="w-32 h-32" />
             </div>
             <div className="relative space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary-100">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10">
                      <p className="text-[10px] font-bold text-primary-200 uppercase mb-1">Efficiency</p>
                      <p className="text-xl font-black text-white">98%</p>
                   </div>
                   <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10">
                      <p className="text-[10px] font-bold text-primary-200 uppercase mb-1">Projects</p>
                      <p className="text-xl font-black text-white">12+</p>
                   </div>
                </div>
                <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10">
                   <p className="text-[10px] font-bold text-primary-200 uppercase mb-1">Response Time</p>
                   <p className="text-xl font-black text-white">&lt; 15m</p>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    default: 'bg-slate-100 text-slate-800 border-slate-200'
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-black uppercase border flex items-center", variants[variant], className)}>
      {children}
    </span>
  );
};

export default ProfilePage;

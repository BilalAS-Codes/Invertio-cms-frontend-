import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { 
  LayoutDashboard, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  Briefcase, 
  Clock,
  ArrowUpRight,
  Target
} from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';
import AttendancePunch from '../../../components/AttendancePunch';
import LiveAttendance from '../../../components/LiveAttendance';
import Skeleton from '../../../components/ui/Skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { hasPermission } from '../../../utils/permissionUtils';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    Promise.all([fetchStats(), fetchProfile()]).finally(() => setLoading(false));
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/dashboard/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error("Dashboard fetch error", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/auth/me');
      setProfile(res.data.data);
    } catch (err) {
      console.error("Profile fetch error", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[420px] rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Revenue', value: stats?.finance?.revenue || 0, color: '#3b82f6' },
    { name: 'Expenses', value: stats?.finance?.expenses || 0, color: '#ef4444' },
  ];

  const utilizationPercentage = Math.round(stats?.utilization?.percentage || 0);
  const attendancePercentage = Math.round((stats?.users?.present_today / stats?.users?.total_users) * 100 || 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time performance monitoring across all departments.</p>
        </div>
        <Badge variant="outline" className="bg-white text-slate-500 border-slate-200 py-1 px-3">
          <Clock className="w-3.5 h-3.5 mr-2" />
          {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' })}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard 
          title="Active Projects" 
          value={stats?.projects?.active || 0} 
          icon={Briefcase} 
          subtext={`${stats?.projects?.blocked || 0} Blocked (Financial)`} 
        />
        <StatCard 
          title="Pending Tasks" 
          value={stats?.tasks?.pending || 0} 
          icon={CheckCircle2} 
          subtext="Across all pipelines" 
        />
        <StatCard 
          title="Attendance Rate" 
          value={`${attendancePercentage}%`} 
          icon={Users} 
          subtext={`${stats?.users?.present_today || 0} Present Today`} 
          trend={`${stats?.users?.on_leave_today || 0} On Leave`}
        />
        <StatCard 
          title="Total Clients" 
          value={stats?.clients?.total || 0} 
          icon={Target} 
          subtext="Active business entities" 
        />
        {hasPermission('finance', 'report.view') && (
          <StatCard 
            title="Consolidated Revenue" 
            value={`₹${(stats?.finance?.revenue / 1000).toFixed(1)}k`} 
            icon={TrendingUp} 
            subtext="INR (Live Rates)" 
            className="bg-primary-50 border-primary-100"
          />
        )}
        {!hasPermission('finance', 'report.view') && (
           <StatCard 
            title="Recruitment" 
            value={stats?.hr?.total_candidates || 0} 
            icon={Target} 
            subtext="Active candidates" 
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hasPermission('finance', 'report.view') && (
          <Card className="lg:col-span-2 shadow-sm border-slate-200/60">
            <CardHeader className="py-6 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Financial Health</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Consolidated institutional liquidity (INR)</p>
              </div>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Revenue</div>
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Expenses</div>
              </div>
            </CardHeader>
            <CardContent className="h-[340px] p-8">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={80}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        {!hasPermission('finance', 'report.view') && (
          <Card className="lg:col-span-2 shadow-sm border-slate-200/60 bg-slate-50 flex items-center justify-center">
            <div className="text-center p-12">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <LayoutDashboard className="w-8 h-8 text-slate-200" />
               </div>
               <h3 className="text-sm font-bold text-slate-900">Standard Operational View</h3>
               <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto font-medium">Financial analytics are restricted to authorized personnel.</p>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200/60">
            <CardHeader className="py-5 border-b border-slate-50">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <Users className="w-4 h-4 text-primary-500" />
                 Resource Utilization
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
               <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{utilizationPercentage}%</p>
                    <p className="text-xs text-slate-500 font-medium">Workforce active on tasks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stats?.utilization?.assigned} / {stats?.utilization?.total}</p>
                  </div>
               </div>
               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${utilizationPercentage}%` }} 
                  />
               </div>
               <p className="text-[10px] text-slate-400 mt-4 leading-relaxed italic">
                 Percentage of users currently assigned to active task pipelines.
               </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200/60">
            <CardHeader className="py-5 border-b border-slate-50">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <Target className="w-4 h-4 text-emerald-500" />
                 Upcoming Milestones
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50">
                  {stats?.upcoming_milestones?.length > 0 ? stats.upcoming_milestones.map((m, i) => (
                    <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-default">
                       <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{m.name}</p>
                          <p className="text-[10px] text-slate-500">{new Date(m.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                       </div>
                       <Badge variant="outline" className="text-[10px] font-bold text-primary-600 border-primary-100">
                         ₹{(m.budget / 1000).toFixed(0)}k
                       </Badge>
                    </div>
                  )) : (
                    <div className="p-6 text-center text-xs text-slate-400">No upcoming milestones</div>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {hasPermission('finance', 'report.view') && (
           <Card className="bg-slate-900 border-transparent text-white shadow-xl lg:col-span-1">
              <CardContent className="p-8 flex flex-col h-full justify-between">
                 <div>
                    <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-6">
                      <TrendingUp className="w-6 h-6 text-primary-400" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Net Profit Margin</p>
                    <p className="text-4xl font-black tracking-tight">
                      {Math.round(stats?.finance?.margin || 0)}%
                    </p>
                 </div>
                 <div className="mt-8">
                   <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>OUTPERFORMING QUARTER</span>
                   </div>
                 </div>
              </CardContent>
           </Card>
         )}
         {!hasPermission('finance', 'report.view') && (
            <Card className="bg-white border-slate-200/60 shadow-sm lg:col-span-1">
               <CardContent className="p-8 flex flex-col h-full justify-center text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-slate-200" />
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Growth Metrics</p>
                  <p className="text-xs text-slate-600 mt-2 font-medium">Analytics restricted</p>
               </CardContent>
            </Card>
         )}

         <div className="lg:col-span-3">
            <LiveAttendance />
         </div>

         {/* Employee Performance Leaderboard */}
         <Card className="lg:col-span-1 shadow-sm border-slate-200/60 overflow-hidden">
            <CardHeader className="py-5 border-b border-slate-50 bg-slate-50/50">
               <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                 <TrendingUp className="w-4 h-4 text-primary-500" />
                 Top Performers
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50">
                  {stats?.leaderboard?.length > 0 ? stats.leaderboard.map((user, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-[10px] font-black">
                             {user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                             <p className="text-xs font-bold text-slate-900">{user.name}</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Completed Velocity</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-primary-600">{user.story_points} pts</p>
                          <div className="flex items-center gap-0.5 justify-end mt-0.5">
                             {[...Array(Math.min(5, Math.ceil(user.story_points / 20)))].map((_, star) => (
                                <div key={star} className="w-1 h-1 rounded-full bg-amber-400" />
                             ))}
                          </div>
                       </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-[10px] text-slate-400 font-medium">No performance data yet</div>
                  )}
               </div>
            </CardContent>
            <div className="p-3 bg-slate-50/80 border-t border-slate-50 text-center">
               <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Performance Metrics (Live)</span>
            </div>
         </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

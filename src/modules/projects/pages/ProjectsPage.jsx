import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import {
  Loader2, Plus, X, FolderPlus, Users, Briefcase, CheckCircle2,
  AlertTriangle, TrendingUp, Link, FolderOpen, ExternalLink,
  FileText, UploadCloud, Trash2, MessageSquare, Send, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProjectTeamModal from '../components/ProjectTeamModal';
import ProjectResourcesModal from '../components/ProjectResourcesModal';
import StatCard from '../../../components/ui/StatCard';
import { cn } from '../../../utils/cn';
import { hasPermission } from '../../../utils/permissionUtils';
import Skeleton from '../../../components/ui/Skeleton';
import { BASE_URL } from '../../../api/baseUrl';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' }
];

const ProjectsPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  // Document & Resources state
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectCategory, setProjectCategory] = useState('New Project');
  const [leadSource, setLeadSource] = useState('Direct');
  const [refType, setRefType] = useState('client');

  useEffect(() => {

    // RBAC: Check for module permission
    if (!hasPermission('projects', 'view')) {
      toast.error("Access Denied: You do not have permissions to access the Projects module.");
      navigate('/dashboard');
      return;
    }

    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        axios.get('/projects'),
        axios.get('/clients') // Get all clients/leads
      ]);
      setProjects(Array.isArray(pRes.data.data) ? pRes.data.data : (pRes.data.data || []));
      setClients(Array.isArray(cRes.data.data) ? cRes.data.data : (cRes.data.data || []));
    } catch (error) {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    try {
      await axios.post('/projects', {
        ...payload,
        client_id: payload.client_id,
        budget: payload.budget ? parseFloat(payload.budget) : 0,
        resource_links: []
      });
      toast.success('Project created successfully');
      setShowAddModal(false);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchProjectResources = (project) => {
    setSelectedProject(project);
    setShowResourceModal(true);
  };

  const handleManageTeam = (project) => {
    setSelectedProject(project);
    setShowTeamModal(true);
  };

  const getStatusBadge = (status) => {
    if (!status) return <Badge>Unknown</Badge>;
    const baseStyle = "text-[10px] font-bold uppercase tracking-wider";
    if (status.includes('Blocked')) return <Badge variant="destructive" className={baseStyle}>{status}</Badge>;
    if (status === 'Completed') return <Badge variant="success" className={baseStyle}>{status}</Badge>;
    if (status === 'In Progress') return <Badge variant="primary" className={baseStyle}>{status}</Badge>;
    return <Badge variant="secondary" className={baseStyle}>{status}</Badge>; // Planned / On Hold
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const normalizeUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of all client and internal institutional projects.</p>
        </div>
        {hasPermission('projects', 'create') && (
          <Button onClick={() => { setProjectCategory('New Project'); setShowAddModal(true); }} className="bg-primary-600 hover:bg-primary-700 h-10">
            <FolderPlus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Projects" value={projects.length} icon={Briefcase} subtext="Active & planned" />
        <StatCard title="In Progress" value={projects.filter(p => p.status === 'In Progress').length} icon={TrendingUp} trend="+2" subtext="Current velocity" />
        <StatCard title="Completed" value={projects.filter(p => p.status === 'Completed').length} icon={CheckCircle2} subtext="Lifetime delivery" />
        <StatCard title="Maintenance" value={projects.filter(p => p.category === 'Maintenance').length} icon={Layers} subtext="Long-term support" />
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6">
          <div>
            <CardTitle className="text-xl font-bold">Active Tracker</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Monitoring {projects.length} active initiatives.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-45" />
            <Input className="pl-10 h-10 text-sm" placeholder="Search projects..." />
          </div>
        </CardHeader>


        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-slate-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-5 flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No projects available.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-4">Project Name</TableHead>
                  <TableHead className="py-4">Client</TableHead>
                  <TableHead className="py-4">Timeline</TableHead>
                  <TableHead className="py-4">Status</TableHead>
                  <TableHead className="text-right py-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {projects.map((project) => (
                  <TableRow key={project.id} className="group">


                    <TableCell className="py-5">
                      <div className="font-bold text-slate-900">{project.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{project.tech_stack || 'Standard Stack'}</span>
                        <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-tight py-0 px-1.5 border-slate-100">
                          {project.category || 'New Project'}
                        </Badge>
                        {hasPermission('projects', 'budget.view') && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">
                              {CURRENCIES.find(c => c.code === project.currency)?.symbol || '$'}
                              {(parseFloat(project.budget) || 0).toLocaleString()}
                            </span>
                          </>
                        )}
                        {(project.resource_links?.length > 0 || project.documents_count > 0) && (
                          <>
                            <span className="text-slate-300">•</span>
                            <button
                              onClick={() => fetchProjectResources(project)}
                              className="text-[10px] text-primary-600 hover:text-primary-700 font-bold uppercase tracking-wider flex items-center gap-1"
                            >
                              <FolderOpen className="w-3 h-3" />
                              {project.resource_links?.length || 0} Links
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-sm font-semibold text-slate-700">{project.client_name || 'Internal'}</div>
                      {project.reference_name && (
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          Ref: {project.reference_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-5 text-[10px] text-slate-500 font-bold uppercase">
                      {project.start_date ? formatDate(project.start_date) : 'N/A'} - {project.end_date ? formatDate(project.end_date) : 'Ongoing'}
                    </TableCell>
                    <TableCell className="py-5">{getStatusBadge(project.status)}</TableCell>
                    <TableCell className="text-right py-5">
                      {hasPermission('projects', 'team.manage') && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-primary-600"
                            onClick={() => fetchProjectResources(project)}
                            title="Project Resources"
                          >
                            <FolderOpen className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-[10px] font-bold uppercase text-primary-600 hover:bg-primary-50 px-3"
                            onClick={() => handleManageTeam(project)}
                          >
                            <Users className="w-3.5 h-3.5 mr-1.5" />
                            Members
                          </Button>
                        </div>
                      )}
                      {!hasPermission('projects', 'team.manage') && (
                        <Badge variant="outline" className="text-[10px] font-bold text-slate-400">READ ONLY</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 text-slate-900 overflow-y-auto">
          <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between py-6">
              <div>
                <CardTitle className="text-xl font-bold">New Project</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Initiate a new institutional workflow.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-all hover:rotate-90 duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto">
              <form onSubmit={handleAddProject} className="space-y-4 text-slate-900">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Project Category</label>
                    <select
                      name="category"
                      value={projectCategory}
                      onChange={(e) => setProjectCategory(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      required
                    >
                      <option value="New Project">New Project (Lead-based)</option>
                      <option value="Maintenance">Maintenance / Service</option>
                    </select>
                  </div>
                  <Input label="Project Name" name="name" placeholder="E-commerce Redesign" required />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Account / Client</label>
                  <select name="client_id" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" required>
                    <option value="">Select account...</option>
                    {/* For New Projects, only show Signed Leads. For Maintenance, show all active clients */}
                    {clients.filter(c => {
                      if (projectCategory === 'New Project') {
                        return c.lifecycle_stage === 'Proposal Signed' || c.lifecycle_stage === 'Project Started';
                      }
                      return true; // Maintenance allows all
                    }).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.company_name} - {c.potential_project_name || 'Generic Project'}
                        {c.lifecycle_stage === 'Proposal Signed' ? ' (Signed Proposal)' : ''}
                      </option>
                    ))}
                  </select>
                  {projectCategory === 'New Project' && (
                    <p className="text-[10px] text-primary-600 mt-1 italic font-bold">
                      *Only the projects with 'Proposal Signed' or 'Project Started' status will be listed here.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Project Budget" name="budget" type="number" placeholder="5000" required />
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Currency</label>
                    <select name="currency" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Initial Status</label>
                    <select name="status" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                    </select>
                  </div>
                  <Input label="Tech Stack" name="tech_stack" placeholder="React, Node.js, PostgreSQL" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Date" name="start_date" type="date" required />
                  <Input label="End Date" name="end_date" type="date" required />
                </div>

                {/* Lead Source & Reference Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Lead Source</label>
                    <select
                      name="lead_source"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      onChange={(e) => setLeadSource(e.target.value)}
                      value={leadSource}
                    >
                      <option value="Direct">Direct</option>
                      <option value="Reference">Reference</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Email Marketing">Email Marketing</option>
                      <option value="Event">Event</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {leadSource === 'Reference' && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Reference Type</label>
                        <select
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                          onChange={(e) => setRefType(e.target.value)}
                          value={refType}
                        >
                          <option value="client">Existing Client</option>
                          <option value="other">Other / New Reference</option>
                        </select>
                      </div>

                      {refType === 'client' ? (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700">Select Client</label>
                          <select name="reference_id" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                            <option value="">Select a client...</option>
                            {clients.map(c => (
                              <option key={c.id} value={c.id}>{c.company_name}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <Input label="Reference Name / Details" name="reference_name_other" placeholder="Enter reference name..." required />
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700">Share Type</label>
                          <select name="reference_share_type" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                            <option value="Percentage">Percentage (%)</option>
                            <option value="Fixed">Fixed Amount</option>
                          </select>
                        </div>
                        <Input label="Share Value" name="reference_share_value" type="number" placeholder="10" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 justify-end pt-6">
                  <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-primary-600 hover:bg-primary-700">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Project"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Manage Team Modal */}
      {showTeamModal && selectedProject && (
        <ProjectTeamModal
          project={selectedProject}
          onClose={() => {
            setShowTeamModal(false);
            fetchProjects();
          }}
        />
      )}

      {/* Project Resources Modal */}
      {showResourceModal && selectedProject && (
        <ProjectResourcesModal
          project={selectedProject}
          onClose={() => {
            setShowResourceModal(false);
            fetchProjects();
          }}
          onUpdate={fetchProjects}
        />
      )}
    </div>
  );
};

export default ProjectsPage;

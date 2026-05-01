import React from 'react';
import axios from '../../../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { BASE_URL } from '../../../api/baseUrl';
import Badge from '../../../components/ui/Badge';
import { X, Calendar, User, ClipboardList, Info, Clock, FolderOpen, Link, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import ProjectResourcesModal from '../../projects/components/ProjectResourcesModal';
import Button from '../../../components/ui/Button';

const TaskDetailModal = ({ task, onClose }) => {
  const [showResources, setShowResources] = React.useState(false);
  const [documents, setDocuments] = React.useState([]);
  const [loadingDocs, setLoadingDocs] = React.useState(false);

  React.useEffect(() => {
    if (task && task.id) {
        fetchTaskDocuments();
    }
  }, [task]);

  const fetchTaskDocuments = async () => {
    setLoadingDocs(true);
    try {
        const res = await axios.get(`/projects/tasks/${task.id}/documents`);
        setDocuments(res.data.data || []);
    } catch (err) {
        console.error("Failed to fetch task documents", err);
    } finally {
        setLoadingDocs(false);
    }
  };

  const completionTime = task?.completion_date ? new Date(task.completion_date).getTime() - 60000 : null;
  const initialDocs = documents.filter(d => !completionTime || new Date(d.created_at).getTime() < completionTime);
  const proofDocs = documents.filter(d => completionTime && new Date(d.created_at).getTime() >= completionTime);

  const renderDoc = (doc) => {
    const fileUrl = doc.file_url || `${BASE_URL.replace('/api', '')}/${doc.file_key}`;
    return (
        <a key={doc.id} href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-primary-200 transition-all group shadow-sm h-[60px]">
           <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-primary-50 transition-colors shrink-0">
              <FileText className="w-4 h-4 text-slate-400 group-hover:text-primary-500" />
           </div>
           <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-slate-900 truncate">{doc.file_name}</p>
              <p className="text-[9px] text-slate-400">{(doc.file_size / 1024).toFixed(0)} KB</p>
           </div>
        </a>
    );
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 text-slate-900">
      <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300 border-none flex flex-col max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-start sm:items-center justify-between bg-white border-b border-slate-100 py-5 sm:py-6 px-5 sm:px-8 shrink-0">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight text-slate-900">{task.title}</CardTitle>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                  {task.project_name || 'Individual Task'}
                </Badge>
                <Badge 
                    variant={
                        task.status === 'Completed' ? 'success' : 
                        task.status === 'In Progress' ? 'primary' : 
                        'default'
                    }
                    className="text-[10px] font-bold uppercase tracking-wider"
                >
                    {task.status}
                </Badge>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600 group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </CardHeader>
        
        <CardContent className="p-0 overflow-y-auto">
          <div className="flex flex-col md:flex-row">
            {/* Main Content */}
            <div className="md:w-2/3 p-5 sm:p-8 border-b md:border-b-0 md:border-r border-slate-50 min-h-[300px]">
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <Info className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Description & Details</span>
              </div>
              <div className="prose prose-slate max-w-none mb-8">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                  {task.description || "No detailed description provided for this task."}
                </p>
              </div>

              {task.task_references && task.task_references.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Link className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">References & Examples</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {task.task_references.map((ref, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{ref.title || 'Note'}</p>
                          <p className="text-xs font-medium text-slate-700 break-words leading-relaxed">{ref.value}</p>
                        </div>
                        {ref.value && (ref.value.startsWith('http') || ref.value.includes('.')) && (
                          <a 
                            href={ref.value.startsWith('http') ? ref.value : `https://${ref.value}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-white rounded-lg shadow-sm text-primary-600 hover:bg-primary-50 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {initialDocs.length > 0 && (
                <div className="space-y-4 mt-8 pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FileText className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Initial Media & Assets</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {initialDocs.map(renderDoc)}
                  </div>
                </div>
              )}

              {task.status === 'Completed' && task.completion_notes && (
                <div className="space-y-4 mt-8 pt-8 border-t border-emerald-100 bg-emerald-50/20 -mx-5 sm:-mx-8 px-5 sm:px-8 pb-8">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Proof of Completion</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm space-y-4">
                    <p className="text-sm text-slate-700 leading-relaxed italic border-l-2 border-emerald-200 pl-3">"{task.completion_notes}"</p>
                    
                    {proofDocs.length > 0 && (
                      <div className="pt-2">
                        <div className="grid grid-cols-2 gap-3">
                          {proofDocs.map(renderDoc)}
                        </div>
                      </div>
                    )}

                    {task.completion_date && (
                      <div className="pt-2 flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        Completed on {new Date(task.completion_date).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Details */}
            <div className="md:w-1/3 bg-slate-50/50 p-5 sm:p-8 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-3 text-slate-400">
                  <User className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Assignment & Impact</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-black">
                      {(task.assigned_to_name || task.user_name || 'NA').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{task.assigned_to_name || task.user_name || "Unassigned"}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Primary Lead</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Priority</p>
                      <p className={cn(
                        "text-xs font-black uppercase tracking-wider",
                        task.priority === 'Urgent' ? "text-rose-600" : 
                        task.priority === 'High' ? "text-amber-600" : 
                        "text-slate-600"
                      )}>{task.priority || 'Medium'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Complexity</p>
                      <p className="text-xs font-black text-slate-900">{task.story_points || 0} Points</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Timeline</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Due Date</div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Calendar className="w-4 h-4 text-rose-400" />
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : "Flexible"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Last Activity</div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      {task.updated_at ? new Date(task.updated_at).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="bg-white border-t border-slate-50 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center px-5 sm:px-8 gap-3 shrink-0">
            <Button 
                variant="ghost" 
                className="w-full sm:w-auto text-primary-600 font-bold text-xs"
                onClick={() => setShowResources(true)}
            >
                <FolderOpen className="w-4 h-4 mr-2" />
                PROJECT RESOURCES
            </Button>
            <button 
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
                CLOSE DETAILS
            </button>
        </div>
      </Card>

      {showResources && (
        <ProjectResourcesModal 
          project={{ id: task.project_id, name: task.project_name }} 
          onClose={() => setShowResources(false)} 
        />
      )}
    </div>
  );
};

export default TaskDetailModal;

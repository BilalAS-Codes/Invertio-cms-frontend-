import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { 
  X, Briefcase, Link, ExternalLink, UploadCloud, 
  FileText, Trash2, Loader2, MessageSquare, Send,
  FolderOpen, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../../../components/ui/Skeleton';
import { cn } from '../../../utils/cn';
import { BASE_URL } from '../../../api/baseUrl';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';

const ProjectResourcesModal = ({ project, onClose, onUpdate }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [projectDocuments, setProjectDocuments] = useState([]);
  const [projectComments, setProjectComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [resourceLinks, setResourceLinks] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  useEffect(() => {
    if (project) {
      setResourceLinks(project.resource_links || []);
      fetchDocuments();
      fetchComments();
    }
  }, [project]);

  const fetchDocuments = async () => {
    setDocLoading(true);
    try {
      const res = await axios.get(`/projects/${project.id}/documents`);
      setProjectDocuments(res.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch documents');
    } finally {
      setDocLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentLoading(true);
    try {
      const res = await axios.get(`/projects/${project.id}/comments`);
      setProjectComments(res.data.data || []);
    } catch (err) {
      console.error("Fetch comments error", err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleUpdateLinks = async () => {
    try {
      await axios.patch(`/projects/${project.id}/github`, { resource_links: resourceLinks });
      toast.success('Links updated');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to update links');
    }
  };

  const handleUploadDocument = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`/projects/${project.id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded');
      fetchDocuments();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });

  const handleDeleteDocument = (docId) => {
    setConfirmModal({
      show: true,
      id: docId
    });
  };

  const performDelete = async (docId) => {
    try {
      await axios.delete(`/projects/documents/${docId}`);
      toast.success('Document removed');
      fetchDocuments();
    } catch (err) {
      toast.error('Delete failed');
    } finally {
      setConfirmModal({ show: false, id: null });
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsPostingComment(true);
    try {
      await axios.post(`/projects/${project.id}/comments`, { comment: newComment });
      setNewComment('');
      fetchComments();
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setIsPostingComment(false);
    }
  };

  const normalizeUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 text-slate-900 overflow-y-auto">
      <Card className="w-full max-w-5xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <CardHeader className="flex flex-row items-center justify-between py-6 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
               <Briefcase className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Project Hub: Resources</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{project.name} • Internal Delivery Assets</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-all hover:rotate-90 duration-200">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="p-0 flex flex-col lg:flex-row flex-1 overflow-hidden bg-white">
          {/* Left Column: Links (25%) */}
          <div className="w-full lg:w-1/4 border-r border-slate-100 bg-slate-50/30 p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
               <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Link className="w-3.5 h-3.5" />
                 Links
               </h3>
               <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-primary-600 hover:bg-primary-50"
                onClick={() => setResourceLinks([...resourceLinks, { title: '', url: '' }])}
               >
                 <Plus className="w-4 h-4" />
               </Button>
            </div>
            
            <div className="space-y-3">
               {resourceLinks.map((link, idx) => (
                 <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2 group">
                    <div className="flex items-center justify-between">
                       <input 
                          className="text-[10px] font-bold text-slate-900 border-none p-0 focus:ring-0 w-full bg-transparent"
                          placeholder="Title (e.g. Figma)"
                          value={link.title}
                          onChange={(e) => {
                            const updated = [...resourceLinks];
                            updated[idx].title = e.target.value;
                            setResourceLinks(updated);
                          }}
                       />
                       <button 
                        onClick={() => setResourceLinks(resourceLinks.filter((_, i) => i !== idx))}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                       >
                         <X className="w-3 h-3" />
                       </button>
                    </div>
                    <div className="flex items-center gap-2">
                       <input 
                          className="text-[9px] text-primary-600 font-medium border-none p-0 focus:ring-0 w-full bg-transparent truncate"
                          placeholder="URL"
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...resourceLinks];
                            updated[idx].url = e.target.value;
                            setResourceLinks(updated);
                          }}
                       />
                       {link.url && (
                         <a href={normalizeUrl(link.url)} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-primary-600">
                           <ExternalLink className="w-3 h-3" />
                         </a>
                       )}
                    </div>
                 </div>
               ))}
            </div>
            <Button 
              className="w-full mt-5 h-8 text-[10px] font-bold uppercase tracking-wider" 
              variant="outline"
              onClick={handleUpdateLinks}
            >
              Save Resources
            </Button>
          </div>

          {/* Middle Column: Files (37.5%) */}
          <div className="w-full lg:w-[37.5%] border-r border-slate-100 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Project Files</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Asset storage</p>
              </div>
              <div className="relative">
                <input type="file" id="resource-file-upload-comp" className="hidden" onChange={handleUploadDocument} />
                <Button 
                  onClick={() => document.getElementById('resource-file-upload-comp').click()}
                  disabled={isUploading}
                  className="bg-primary-600 hover:bg-primary-700 h-8 px-3 text-[10px] font-bold uppercase"
                >
                   {isUploading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <UploadCloud className="w-3 h-3 mr-2" />}
                   Upload
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {docLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                </div>
              ) : projectDocuments.length === 0 ? (
                <div className="py-16 text-center bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                  <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Empty Vault</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projectDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-primary-200 transition-all group shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary-50 transition-colors">
                          <FileText className="w-4 h-4 text-slate-400 group-hover:text-primary-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-bold text-slate-900 truncate max-w-[140px]">{doc.file_name}</p>
                          <p className="text-[9px] text-slate-500 font-medium">
                            {(doc.file_size / 1024).toFixed(0)}KB • {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a 
                          href={doc.file_url || `${BASE_URL.replace('/api', '')}/${doc.file_key}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-primary-600"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button 
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Comments (37.5%) */}
          <div className="flex-1 p-6 flex flex-col bg-slate-50/50 overflow-hidden">
             <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Project Feed</h3>
             </div>

             <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                {commentLoading ? (
                   <div className="space-y-4">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-3/4 rounded-2xl" />)}
                   </div>
                ) : projectComments.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                      <MessageSquare className="w-8 h-8 mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Start a Discussion</p>
                   </div>
                ) : (
                   projectComments.map((comment) => (
                      <div key={comment.id} className={cn(
                         "flex flex-col max-w-[85%]",
                         comment.user_id === user.id ? "ml-auto items-end" : "mr-auto items-start"
                      )}>
                         <div className={cn(
                            "p-3 rounded-2xl text-xs shadow-sm border",
                            comment.user_id === user.id 
                              ? "bg-primary-600 text-white border-primary-500 rounded-tr-none" 
                              : "bg-white text-slate-700 border-slate-100 rounded-tl-none"
                         )}>
                            {comment.comment}
                         </div>
                         <div className="flex items-center gap-2 mt-1 px-1">
                            <span className="text-[8px] font-bold text-slate-400 uppercase">{comment.user_name}</span>
                            <span className="text-[8px] text-slate-300">•</span>
                            <span className="text-[8px] text-slate-300">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                      </div>
                   ))
                )}
             </div>

             <form onSubmit={handlePostComment} className="relative mt-auto">
                <textarea 
                   placeholder="Post an update or comment..."
                   className="w-full rounded-2xl border border-slate-200 bg-white p-3 pr-12 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm resize-none"
                   rows="2"
                   value={newComment}
                   onChange={(e) => setNewComment(e.target.value)}
                   onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handlePostComment(e);
                      }
                   }}
                />
                <button 
                   type="submit"
                   disabled={isPostingComment || !newComment.trim()}
                   className="absolute right-3 bottom-3 p-1.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all shadow-md"
                >
                   <Send className="w-3.5 h-3.5" />
                </button>
             </form>
          </div>
        </CardContent>
      </Card>
      
      <ConfirmationModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, id: null })}
        onConfirm={() => performDelete(confirmModal.id)}
        title="Delete Document"
        message="Are you sure you want to permanently delete this project document? This action cannot be undone."
        variant="danger"
        confirmText="Delete Document"
      />
    </div>
  );
};

export default ProjectResourcesModal;

import React, { useEffect, useState, Suspense, lazy } from 'react';
import axios from '../../../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';
import {
  Users,
  Calendar,
  UserPlus,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { hasPermission } from '../../../utils/permissionUtils';

// Modular Components (Lazy Loaded)
const RecruitmentTab = lazy(() => import('../components/RecruitmentTab'));
const DirectoryTab = lazy(() => import('../components/DirectoryTab'));
const LeavesTab = lazy(() => import('../components/LeavesTab'));
const PerformanceTab = lazy(() => import('../components/PerformanceTab'));
const HolidaysTab = lazy(() => import('../components/HolidaysTab'));

// Modals (Lazy Loaded)
const InterviewModal = lazy(() => import('../components/InterviewModal'));
const HolidayModal = lazy(() => import('../components/HolidayModal'));
const PerformanceActionModal = lazy(() => import('../components/PerformanceActionModal'));
const DocsModal = lazy(() => import('../components/DocsModal'));
const ConfirmationModal = lazy(() => import('../../../components/ui/ConfirmationModal'));

const TabLoader = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
  </div>
);

const HRPage = () => {
  const [activeTab, setActiveTab] = useState('recruitment'); // 'recruitment', 'directory', 'leaves', 'performance', 'holidays'

  const [pipeline, setPipeline] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [users, setUsers] = useState([]); 
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Document Management
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [docsTarget, setDocsTarget] = useState(null); // { id, name, type: 'user' | 'candidate' }
  const [docsList, setDocsList] = useState([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Performance State
  const [performanceData, setPerformanceData] = useState({ reviews: [], bonuses: [], hikes: [] });
  const [selectedUserForPerf, setSelectedUserForPerf] = useState(null);
  const [showPerfModal, setShowPerfModal] = useState(false); // Type: 'rating' | 'bonus' | 'hike'
  const [perfModalType, setPerfModalType] = useState('rating');

  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ 
    show: false, 
    title: '', 
    message: '', 
    onConfirm: () => {}, 
    confirmText: 'Confirm', 
    variant: 'primary' 
  });

  const fetchPerfData = async (userId) => {
    try {
        const res = await axios.get(`/hr/performance/data/${userId}`);
        setPerformanceData(res.data.data || { reviews: [], bonuses: [], hikes: [] });
    } catch (err) {
        toast.error('Failed to fetch performance records');
    }
  };

  const handlePerfSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    formData.append('user_id', selectedUserForPerf.user_id);

    let endpoint = '/hr/performance/reviews';
    if (perfModalType === 'bonus') endpoint = '/hr/performance/bonuses';
    if (perfModalType === 'hike') {
        endpoint = '/hr/performance/hikes';
        const newSalary = formData.get('new_salary');
        formData.append('previous_salary', selectedUserForPerf.salary);
        const hikeAmount = parseFloat(newSalary) - parseFloat(selectedUserForPerf.salary);
        const percentage = ((hikeAmount / selectedUserForPerf.salary) * 100).toFixed(2);
        formData.append('percentage', percentage);
    }

    try {
        const config = {};
        if (perfModalType === 'bonus') {
            config.headers = { 'Content-Type': 'multipart/form-data' };
        }
        await axios.post(endpoint, formData, config);
        toast.success(`${perfModalType.charAt(0).toUpperCase() + perfModalType.slice(1)} logged successfully`);
        setShowPerfModal(false);
        fetchPerfData(selectedUserForPerf.id);
        fetchHRData(); // Refresh directory to see updated salary
    } catch (err) {
        toast.error('Operation failed');
    } finally {
        setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchHRData();
  }, [activeTab]);

  const fetchHRData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'recruitment') {
        const [pipeRes, userRes, rolesRes] = await Promise.all([
          axios.get('/hr/recruitment/pipeline'),
          axios.get('/users/selection'),
          axios.get('/users/roles')
        ]);
        const candidatesList = pipeRes.data.data || [];
        setCandidates(candidatesList);
        setUsers(userRes.data.data || []);
        setRoles(rolesRes.data.data || []);

        const stages = ['Applied', 'Interview', 'Offer', 'Hired', 'Rejected'];
        const chartMap = stages.map((stage, i) => ({
          value: candidatesList.filter(c => c.stage === stage).length,
          name: stage,
          fill: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f43f5e'][i]
        })).filter(s => s.value > 0);
        
        setPipeline(chartMap.length > 0 ? chartMap : [{value: 1, name: 'Applied', fill: '#3b82f6'}]);
      } else if (activeTab === 'directory') {
        const [empRes, candRes] = await Promise.all([
          axios.get('/hr/employees'),
          axios.get('/hr/recruitment/pipeline')
        ]);
        setEmployees(empRes.data.data || []);
        setCandidates(candRes.data.data || []);
      } else if (activeTab === 'performance') {
        const res = await axios.get('/hr/employees');
        setEmployees(res.data.data || []);
      } else if (activeTab === 'leaves') {
        const res = await axios.get('/hr/leaves');
        setLeaves(res.data.data || []);
      } else if (activeTab === 'holidays') {
        const res = await axios.get('/hr/holidays');
        setHolidays(res.data.data || []);
      }
    } catch (err) {
      console.error("HR fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleHolidaySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    try {
        await axios.post('/hr/holidays', payload);
        toast.success('Holiday added successfully');
        setShowHolidayModal(false);
        fetchHRData();
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add holiday');
    } finally {
        setIsSubmitting(false);
    }
  };

  const deleteHoliday = async (id) => {
    setConfirmModal({
      show: true,
      title: 'Delete Holiday',
      message: 'Are you sure you want to remove this holiday from the corporate calendar?',
      confirmText: 'Delete Holiday',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`/hr/holidays/${id}`);
          toast.success('Holiday removed');
          fetchHRData();
        } catch (err) {
          toast.error('Failed to remove holiday');
        } finally {
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      }
    });
  };

  const handleLeaveAction = async (leaveId, status) => {
    try {
      await axios.patch(`/hr/leaves/${leaveId}`, { status });
      toast.success(`Leave request ${status.toLowerCase()}`);
      fetchHRData();
    } catch (err) {
      toast.error('Failed to update leave status');
    }
  };

  const updateStage = async (candidateId, newStage) => {
    try {
      await axios.patch(`/hr/recruitment/candidates/${candidateId}/stage`, { stage: newStage });
      toast.success(`Stage updated to ${newStage}`);
      fetchHRData();
    } catch (err) {
      toast.error('Failed to update stage');
    }
  };

  const scheduleInterview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const candidateName = formData.get('candidate_name');
    const candidateEmail = formData.get('candidate_email');
    const interviewerId = formData.get('interviewer_id');
    const date = formData.get('date');

    try {
      let candidateId = selectedCandidate?.id;

      if (!candidateId) {
        const candRes = await axios.post('/hr/recruitment/candidates', {
          name: candidateName,
          email: candidateEmail,
          phone: formData.get('candidate_phone'),
          designation: formData.get('designation'),
          department: formData.get('department'),
          salary: formData.get('salary'),
          joining_date: formData.get('joining_date'),
          role_id: formData.get('role_id'),
          source: 'System Portal'
        });
        candidateId = candRes.data.data.id;
      }

      await axios.post('/hr/recruitment/interviews', {
        candidate_id: candidateId,
        interviewer_id: interviewerId,
        date: date,
      });

      toast.success('Interview scheduled successfully');
      setShowInterviewModal(false);
      setSelectedCandidate(null);
      fetchHRData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete scheduling');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchDocs = async (type, id) => {
    try {
        const res = await axios.get(`/hr/documents/${type}/${id}`);
        setDocsList(res.data.data || []);
    } catch (err) {
        toast.error('Failed to fetch documents');
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docsTarget) return;
    
    setIsUploadingDoc(true);
    const formData = new FormData(e.target);
    if (docsTarget.type === 'user') {
        formData.append('user_id', docsTarget.id);
    } else {
        formData.append('candidate_id', docsTarget.id);
    }

    try {
        await axios.post('/hr/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Document uploaded successfully');
        fetchDocs(docsTarget.type, docsTarget.id);
        e.target.reset();
    } catch (err) {
        toast.error('Failed to upload document');
    } finally {
        setIsUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    setConfirmModal({
      show: true,
      title: 'Delete Document',
      message: 'Are you sure you want to permanently delete this personnel document?',
      confirmText: 'Delete Document',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`/hr/documents/item/${docId}`);
          toast.success('Document deleted');
          fetchDocs(docsTarget.type, docsTarget.id);
        } catch (err) {
          toast.error('Failed to delete document');
        } finally {
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      }
    });
  };

  const openDocs = (item, type) => {
    setDocsTarget({ id: item.id, name: item.name, type });
    setDocsList([]);
    setShowDocsModal(true);
    fetchDocs(type, item.id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata'
    });
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-1 h-[400px] rounded-2xl" />
          <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional HR</h1>
          <p className="text-sm text-slate-500 mt-1">Recruitment governance and employee management hub.</p>
        </div>
        <div className="flex items-center gap-2">
            {['recruitment', 'directory', 'leaves', 'performance', 'holidays'].map((tab) => (
              <Button 
                  key={tab}
                  variant={activeTab === tab ? 'primary' : 'ghost'} 
                  onClick={() => setActiveTab(tab)}
                  className="h-10 text-xs font-bold uppercase tracking-wider"
              >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}

            {activeTab === 'recruitment' && hasPermission('hr', 'recruitment.manage') && (
                <Button onClick={() => { setSelectedCandidate(null); setShowInterviewModal(true); }} className="bg-primary-600 hover:bg-primary-700 h-10 ml-2">
                    <UserPlus className="w-4 h-4 mr-2" />
                    New Interview
                </Button>
            )}
            {activeTab === 'holidays' && hasPermission('hr', 'holidays.manage') && (
                <Button onClick={() => setShowHolidayModal(true)} className="bg-emerald-600 hover:bg-emerald-700 h-10 ml-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    Add Holiday
                </Button>
            )}
        </div>
      </div>

      <Suspense fallback={<TabLoader />}>
        {activeTab === 'recruitment' && (
          <RecruitmentTab 
            candidates={candidates}
            pipeline={pipeline}
            updateStage={updateStage}
            formatDate={formatDate}
            setSelectedCandidate={setSelectedCandidate}
            setShowInterviewModal={setShowInterviewModal}
            openDocs={openDocs}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryTab 
            employees={employees}
            candidates={candidates}
            openDocs={openDocs}
            setSelectedCandidate={setSelectedCandidate}
            setShowInterviewModal={setShowInterviewModal}
          />
        )}

        {activeTab === 'leaves' && (
          <LeavesTab 
            leaves={leaves}
            handleLeaveAction={handleLeaveAction}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceTab 
            employees={employees}
            selectedUserForPerf={selectedUserForPerf}
            setSelectedUserForPerf={setSelectedUserForPerf}
            fetchPerfData={fetchPerfData}
            performanceData={performanceData}
            setPerfModalType={setPerfModalType}
            setShowPerfModal={setShowPerfModal}
          />
        )}

        {activeTab === 'holidays' && (
          <HolidaysTab 
            holidays={holidays}
            deleteHoliday={deleteHoliday}
          />
        )}
      </Suspense>

      {/* Modals (Lazy Loaded) */}
      <Suspense fallback={null}>
        <InterviewModal 
          isOpen={showInterviewModal}
          onClose={() => setShowInterviewModal(false)}
          selectedCandidate={selectedCandidate}
          roles={roles}
          users={users}
          scheduleInterview={scheduleInterview}
          isSubmitting={isSubmitting}
        />

        <HolidayModal 
          isOpen={showHolidayModal}
          onClose={() => setShowHolidayModal(false)}
          handleHolidaySubmit={handleHolidaySubmit}
          isSubmitting={isSubmitting}
        />

        <PerformanceActionModal 
          isOpen={showPerfModal}
          onClose={() => setShowPerfModal(false)}
          perfModalType={perfModalType}
          selectedUserForPerf={selectedUserForPerf}
          handlePerfSubmit={handlePerfSubmit}
          isSubmitting={isSubmitting}
        />

        <DocsModal 
          isOpen={showDocsModal}
          onClose={() => setShowDocsModal(false)}
          docsTarget={docsTarget}
          handleUploadDoc={handleUploadDoc}
          isUploadingDoc={isUploadingDoc}
          docsList={docsList}
          handleDeleteDoc={handleDeleteDoc}
        />

        <ConfirmationModal 
          isOpen={confirmModal.show}
          onClose={() => setConfirmModal(prev => ({ ...prev, show: false }))}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          confirmText={confirmModal.confirmText}
          variant={confirmModal.variant}
        />
      </Suspense>
    </div>
  );
};

export default HRPage;

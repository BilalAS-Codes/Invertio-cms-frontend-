import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Table, { TableHeader, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { Clock, Check, X as XIcon } from 'lucide-react';
import { hasPermission } from '../../../utils/permissionUtils';

const LeavesTab = ({
  leaves,
  handleLeaveAction
}) => {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-900">
      <CardHeader className="py-6">
        <CardTitle className="text-xl font-bold">Leave Requests</CardTitle>
        <p className="text-xs text-slate-500 mt-0.5">Approve or reject employee time-off applications.</p>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-4">Employee</TableHead>
              <TableHead className="py-4">Type</TableHead>
              <TableHead className="py-4">Duration</TableHead>
              <TableHead className="py-4">Status</TableHead>
              <TableHead className="text-right py-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {leaves.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-400 italic">No pending leave requests found.</TableCell>
              </TableRow>
            )}
            {leaves.map(leave => (
              <TableRow key={leave.id}>
                <TableCell className="py-5 font-bold">{leave?.employee_name}</TableCell>
                <TableCell className="py-5">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase">{leave?.leave_type}</Badge>
                </TableCell>
                <TableCell className="py-5">
                  <div className="text-xs font-semibold">{new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {leave.days_count} Days
                  </div>
                </TableCell>
                <TableCell className="py-5">
                  <Badge
                    variant={leave.status === 'Approved' ? 'success' : leave.status === 'Rejected' ? 'danger' : 'primary'}
                    className="text-[10px] font-bold uppercase"
                  >
                    {leave.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-5">
                  {leave.status === 'Pending' && hasPermission('hr', 'leaves.approve') ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleLeaveAction(leave.id, 'Approved')}>
                        <Check className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="danger" className="h-8" onClick={() => handleLeaveAction(leave.id, 'Rejected')}>
                        <XIcon className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300 uppercase italic">PROCESSED</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LeavesTab;

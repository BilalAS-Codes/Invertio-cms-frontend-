import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Table, { TableHeader, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { Calendar, Trash2 } from 'lucide-react';
import { hasPermission } from '../../../utils/permissionUtils';

const HolidaysTab = ({
  holidays,
  deleteHoliday
}) => {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-900">
      <CardHeader className="py-6">
        <CardTitle className="text-xl font-bold">Holiday Calendar</CardTitle>
        <p className="text-xs text-slate-500 mt-0.5">Public holidays and company-wide closures.</p>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-4">Holiday Name</TableHead>
              <TableHead className="py-4">Date</TableHead>
              <TableHead className="py-4">Type</TableHead>
              <TableHead className="text-right py-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {holidays.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-slate-400 italic">No holidays scheduled.</TableCell>
              </TableRow>
            )}
            {holidays.map(holiday => (
              <TableRow key={holiday.id}>
                <TableCell className="py-5 font-bold">{holiday.name}</TableCell>
                <TableCell className="py-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                    <span className="text-xs font-semibold">{new Date(holiday.date).toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell className="py-5">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase">{holiday.type || 'Public'}</Badge>
                </TableCell>
                <TableCell className="text-right py-5">
                  {hasPermission('hr', 'holidays.manage') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-slate-300 hover:text-rose-600"
                      onClick={() => deleteHoliday(holiday.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

export default HolidaysTab;

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Table, { TableHeader, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import { Search } from 'lucide-react';

const PayrollTab = ({
  payrollData,
  payrollSearch,
  setPayrollSearch,
  payrollYearFilter,
  setPayrollYearFilter,
  currencies
}) => {
  const filteredPayroll = payrollData.filter(pay => {
    const matchesSearch = pay.user_name?.toLowerCase().includes(payrollSearch.toLowerCase()) || 
                        pay.project_name?.toLowerCase().includes(payrollSearch.toLowerCase());
    const matchesYear = payrollYearFilter === 'All' || pay.year.toString() === payrollYearFilter;
    return matchesSearch && matchesYear;
  });

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-6">
        <div>
          <CardTitle className="text-xl font-bold">Payroll & Labor Costs</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Tracking employee compensation and project-labor allocation.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search name or project..." 
                value={payrollSearch}
                onChange={(e) => setPayrollSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:ring-primary-500 w-full sm:w-64"
              />
            </div>
            <select 
              value={payrollYearFilter}
              onChange={(e) => setPayrollYearFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 py-2 focus:ring-primary-500"
            >
              <option value="All">All Years</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
         <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-4">Employee</TableHead>
                <TableHead className="py-4">Project Allocation</TableHead>
                <TableHead className="py-4">Period</TableHead>
                <TableHead className="py-4">Amount</TableHead>
                <TableHead className="py-4">Status</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredPayroll.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-500">No payroll records found.</TableCell></TableRow>
              ) : (
                filteredPayroll.map(pay => (
                  <TableRow key={pay.id}>
                    <TableCell className="py-5 font-bold text-slate-900 text-sm">{pay.user_name}</TableCell>
                    <TableCell className="py-5 font-bold text-slate-500 text-sm">{pay.project_name || 'General Admin'}</TableCell>
                    <TableCell className="py-5 text-sm text-slate-600">{pay.month}/{pay.year}</TableCell>
                    <TableCell className="py-5 font-bold text-slate-900">
                      {currencies.find(c => c.code === pay.currency)?.symbol || '$'}
                      {pay.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-5">
                      <Badge variant={pay.status === 'Paid' ? 'success' : 'default'} className="text-[10px] font-bold uppercase">{pay.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
         </Table>
      </CardContent>
    </Card>
  );
};

export default PayrollTab;

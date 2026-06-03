// ReportsPage - Main reports page
import { useState, useEffect } from 'react';
import { useToast } from '../../hooks';
import api from '../../api/client';
import { DataTable } from '../../components/DataTable';
import { ReportTypeSelector } from './ReportTypeSelector';
import { ReportHeader } from './ReportHeader';
import { ReportChart } from './ReportChart';

const REPORT_TYPES = [
  { id: 'delivery-summary', title: 'Delivery Summary', description: 'Overview of all delivery activities and status', color: 'blue' },
  { id: 'so-status', title: 'SO Status Report', description: 'Sales order status and progress tracking', color: 'green' },
  { id: 'alert-history', title: 'Alert History', description: 'Historical view of all system alerts', color: 'amber' },
  { id: 'customer-performance', title: 'Customer Performance', description: 'Delivery performance by customer', color: 'purple' },
  { id: 'production-metrics', title: 'Production Metrics', description: 'Production and throughput metrics', color: 'teal' },
  { id: 'audit-log', title: 'Audit Log', description: 'System audit trail and activity log', color: 'slate' },
];

function ReportsPage() {
  const toast = useToast();
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    if (activeReport) fetchReportData(activeReport);
  }, [activeReport]);

  const fetchReportData = async (reportType) => {
    setLoading(true);
    setError(null);
    setReportData(null);
    try {
      const response = await api.get(`/reports/${reportType}`);
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load report data');
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    if (!activeReport) return;
    setExporting(true);
    try {
      const response = await api.post('/reports/export', { reportType: activeReport, format }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeReport}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch (err) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('Preparing to print...');
  };

  const handleRefresh = () => {
    if (activeReport) fetchReportData(activeReport);
  };

  const activeReportInfo = REPORT_TYPES.find(r => r.id === activeReport);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate and analyze system reports</p>
        </div>
        {activeReport && (
          <ReportHeader
            onRefresh={handleRefresh}
            onExport={() => handleExport()}
            onPrint={handlePrint}
            isExporting={exporting}
          />
        )}
      </div>

      {!activeReport ? (
        <ReportTypeSelector
          reportTypes={REPORT_TYPES}
          onSelect={setActiveReport}
        />
      ) : (
        <>
          <button
            onClick={() => setActiveReport(null)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reports
          </button>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeReportInfo?.color === 'blue' ? 'bg-blue-500' :
                activeReportInfo?.color === 'green' ? 'bg-green-500' :
                activeReportInfo?.color === 'amber' ? 'bg-amber-500' :
                activeReportInfo?.color === 'purple' ? 'bg-purple-500' :
                activeReportInfo?.color === 'teal' ? 'bg-teal-500' : 'bg-slate-500'
              }`}>
                <ReportIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">{activeReportInfo?.title}</h2>
                <p className="text-xs text-slate-500">{activeReportInfo?.description}</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : (
              <>
                <ReportChart data={reportData} />
                <DataTable
                  columns={getColumns(activeReport)}
                  data={reportData?.data || []}
                  pageSize={25}
                  emptyMessage="No data available"
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ReportIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function getColumns(reportType) {
  switch (reportType) {
    case 'delivery-summary':
      return [
        { key: 'date', label: 'Date', sortable: true },
        { key: 'destination', label: 'Destination', sortable: true },
        { key: 'plan', label: 'Plan', sortable: true },
        { key: 'actual', label: 'Actual', sortable: true },
        { key: 'rate', label: 'Rate', sortable: true },
      ];
    case 'so-status':
      return [
        { key: 'so_number', label: 'SO Number', sortable: true },
        { key: 'customer', label: 'Customer', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'progress', label: 'Progress', sortable: true },
      ];
    case 'alert-history':
      return [
        { key: 'timestamp', label: 'Time', sortable: true },
        { key: 'type', label: 'Type', sortable: true },
        { key: 'message', label: 'Message', sortable: true },
        { key: 'severity', label: 'Severity', sortable: true },
      ];
    default:
      return [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'description', label: 'Description', sortable: true },
        { key: 'value', label: 'Value', sortable: true },
      ];
  }
}

export default ReportsPage;
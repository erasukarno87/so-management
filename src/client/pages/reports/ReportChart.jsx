// ReportChart - Simple chart component for reports
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export function ReportChart({ data }) {
  if (!data?.chartData?.length) return null;

  return (
    <div className="h-64 mb-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.chartData}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ReportChart;
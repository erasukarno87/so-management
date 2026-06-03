// ChartsGrid - Dashboard charts display component
import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

export function ChartsGrid({ chartData, statusPie, deliveryTypeData, bucketData, destinationData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <PlanVsActualChart data={chartData} />
      <StatusPieChart data={statusPie} />
      <DeliveryTypeChart data={deliveryTypeData} />
      <BucketChart data={bucketData} />
      <DestinationChart data={destinationData} />
    </div>
  );
}

function useContainerSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width: Math.floor(width), height: Math.floor(height) });
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

function ChartWrapper({ children, data, height = 200, title }) {
  const containerRef = useRef(null);
  const { width } = useContainerSize(containerRef);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const hasData = data && Array.isArray(data) && data.length > 0;

  if (!mounted || !hasData) {
    return (
      <div ref={containerRef} className="bg-white rounded-2xl p-4 shadow-sm" style={{ minHeight: height }}>
        <h3 className="font-semibold text-slate-800 text-sm mb-4">{title}</h3>
        <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No data available</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="font-semibold text-slate-800 text-sm mb-4">{title}</h3>
      {children}
    </div>
  );
}

function PlanVsActualChart({ data }) {
  const containerRef = useRef(null);
  const { width } = useContainerSize(containerRef);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || data.length === 0) {
    return (
      <div ref={containerRef} className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm" style={{ minHeight: 200 }}>
        <h3 className="font-semibold text-slate-800 text-sm mb-4">Plan vs Actual Delivery</h3>
        <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No data available</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-slate-800 text-sm">Plan vs Actual Delivery</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-blue-500" />
            Plan
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            Actual
          </span>
        </div>
      </div>
      {width > 0 ? (
        <div style={{ height: 200, width: '100%' }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }} />
              <Bar dataKey="plan" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Plan">
                <LabelList dataKey="plan" position="top" style={{ fontSize: 10, fill: '#3b82f6' }} />
              </Bar>
              <Bar dataKey="actual" fill="#22c55e" radius={[6, 6, 0, 0]} name="Actual">
                <LabelList dataKey="actual" position="top" style={{ fontSize: 10, fill: '#22c55e' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">Loading...</div>
      )}
    </div>
  );
}

function StatusPieChart({ data }) {
  const containerRef = useRef(null);
  const { width } = useContainerSize(containerRef);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || data.length === 0) {
    return (
      <div ref={containerRef} className="bg-white rounded-2xl p-4 shadow-sm" style={{ minHeight: 140 }}>
        <h3 className="font-semibold text-slate-800 text-sm mb-4">SO Status</h3>
        <div className="h-[140px] flex items-center justify-center text-slate-400 text-xs">No data</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="font-semibold text-slate-800 text-sm mb-4">SO Status</h3>
      {width > 0 ? (
        <div style={{ height: 140, width: '100%' }}>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="#fff">
                {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                <LabelList dataKey="value" position="outside" style={{ fontSize: 10, fontWeight: 600 }} />
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[140px] flex items-center justify-center text-slate-400 text-xs">Loading...</div>
      )}
      <div className="space-y-1 mt-2">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="text-slate-500">{item.name}</span>
            </div>
            <span className="font-semibold text-slate-700">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeliveryTypeChart({ data }) {
  const containerRef = useRef(null);
  const { width } = useContainerSize(containerRef);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || data.length === 0) {
    return (
      <div ref={containerRef} className="bg-white rounded-2xl p-4 shadow-sm" style={{ minHeight: 140 }}>
        <h3 className="font-semibold text-slate-800 text-sm mb-4">Delivery Type</h3>
        <div className="h-[140px] flex items-center justify-center text-slate-400 text-xs">No data</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="font-semibold text-slate-800 text-sm mb-4">Delivery Type</h3>
      {width > 0 ? (
        <div style={{ height: 140, width: '100%' }}>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="#fff">
                {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                <LabelList dataKey="value" position="outside" style={{ fontSize: 10, fontWeight: 600 }} />
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[140px] flex items-center justify-center text-slate-400 text-xs">Loading...</div>
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mt-2">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="text-slate-500">{item.name}:</span>
            <span className="font-semibold text-slate-700">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BucketChart({ data }) {
  const containerRef = useRef(null);
  const { width } = useContainerSize(containerRef);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || data.length === 0) {
    return (
      <div ref={containerRef} className="bg-white rounded-2xl p-4 shadow-sm" style={{ minHeight: 160 }}>
        <h3 className="font-semibold text-slate-800 text-sm mb-4">Distribution by Bucket</h3>
        <div className="h-[160px] flex items-center justify-center text-slate-400 text-xs">No data</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="font-semibold text-slate-800 text-sm mb-4">Distribution by Bucket</h3>
      {width > 0 ? (
        <div style={{ height: 160, width: '100%' }}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }} />
              <Bar dataKey="plan" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Plan">
                <LabelList dataKey="plan" position="top" style={{ fontSize: 9, fill: '#3b82f6' }} />
              </Bar>
              <Bar dataKey="actual" fill="#22c55e" radius={[4, 4, 0, 0]} name="Actual">
                <LabelList dataKey="actual" position="top" style={{ fontSize: 9, fill: '#22c55e' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[160px] flex items-center justify-center text-slate-400 text-xs">Loading...</div>
      )}
      <div className="flex items-center justify-center gap-3 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-blue-500" />
          Plan
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-green-500" />
          Actual
        </span>
      </div>
    </div>
  );
}

function DestinationChart({ data }) {
  const containerRef = useRef(null);
  const { width } = useContainerSize(containerRef);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || data.length === 0) {
    return (
      <div ref={containerRef} className="bg-white rounded-2xl p-4 shadow-sm" style={{ minHeight: 160 }}>
        <h3 className="font-semibold text-slate-800 text-sm mb-4">Distribution by Destination</h3>
        <div className="h-[160px] flex items-center justify-center text-slate-400 text-xs">No data</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="font-semibold text-slate-800 text-sm mb-4">Distribution by Destination</h3>
      {width > 0 ? (
        <div style={{ height: 160, width: '100%' }}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 80 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="#94a3b8" width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }} />
              <Bar dataKey="plan" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Plan">
                <LabelList dataKey="plan" position="right" style={{ fontSize: 9, fill: '#3b82f6' }} />
              </Bar>
              <Bar dataKey="actual" fill="#22c55e" radius={[0, 4, 4, 0]} name="Actual">
                <LabelList dataKey="actual" position="right" style={{ fontSize: 9, fill: '#22c55e' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[160px] flex items-center justify-center text-slate-400 text-xs">Loading...</div>
      )}
      <div className="flex items-center justify-center gap-3 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-blue-500" />
          Plan
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-green-500" />
          Actual
        </span>
      </div>
    </div>
  );
}

export default ChartsGrid;
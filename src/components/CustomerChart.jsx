import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

const fmt = value =>
  new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white p-4 border rounded-lg shadow-md">
      <p className="font-semibold">{label}</p>
      <p>Neukunden: {fmt(d.newCustomers)}</p>
      <p>Nachbesteller: {fmt(d.reorderCustomers)}</p>
    </div>
  );
};

const CustomerChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 20, right: 20, left: -40, bottom: 5 }}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" />
        <Area
          type="monotone"
          dataKey="newCustomers"
          name="Neukunden"
          stroke="#34C759"
          fill="#34C759"
          stackId="1"
        />
        <Area
          type="monotone"
          dataKey="reorderCustomers"
          name="Nachbesteller"
          stroke="#007AFF"
          fill="#007AFF"
          stackId="1"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CustomerChart;
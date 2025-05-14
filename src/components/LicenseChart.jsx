import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;

  const fmtInt = value => new Intl.NumberFormat('de-DE').format(value);
  const fmtDec = value =>
    new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);

  return (
    <div className="bg-white p-4 border rounded-lg shadow-md">
      <p className="font-semibold">{label}</p>
      <p>Neue Kunden: {fmtInt(d.newCustomers)}</p>
      <p>Nachbesteller: {fmtInt(d.reorderCustomers)}</p>
      <p>Rohertrag Pina: {fmtDec(d.bruttoRohertrag)} €</p>
      <p>Vertriebskosten: {fmtDec(d.vertriebsKosten)} €</p>
      <p>Logistikkosten: {fmtDec(d.logistikKosten)} €</p>
      <p>Deckungsbeitrag II: {fmtDec(d.deckungsbeitragII)} €</p>
      <p>Lizenz 1 Erlös: {fmtDec(d.tier1)} €</p>
      <p>Lizenz 2 Erlös: {fmtDec(d.tier2)} €</p>
      <p>Restgewinn Pina: {fmtDec(d.restgewinn)} €</p>
    </div>
  );
};

const LicenseChart = ({
  data,
  dataKey = 'tier1',
  dataKey2 = 'tier2',
  dataKey3 = 'deckungsbeitragII',
  dataKey4 = 'restgewinn',
  strokeColor = '#34C759',
  strokeColor2 = '#007AFF',
  strokeColor3 = '#FFD60A',
  strokeColor4 = '#FF9500',
  name = 'Lizenz 1 Erlös',
  name2 = 'Lizenz 2 Erlös',
  name3 = 'Deckungsbeitrag II',
  name4 = 'Restgewinn'
}) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: -40, bottom: 5 }}>
        <XAxis dataKey="month" padding={{ left: 0, right: 0 }} />
        <YAxis tick={false} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" />
        <Line type="monotone" dataKey={dataKey} stroke={strokeColor} name={name} dot={false} strokeWidth={3} />
        <Line type="monotone" dataKey={dataKey2} stroke={strokeColor2} name={name2} dot={false} strokeWidth={3} />
        <Line type="monotone" dataKey={dataKey3} stroke={strokeColor3} name={name3} dot={false} strokeWidth={3} />
        <Line type="monotone" dataKey={dataKey4} stroke={strokeColor4} name={name4} dot={false} strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LicenseChart;

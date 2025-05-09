import React from 'react';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

// Custom Tooltip zeigt alle gewünschten Kennzahlen mit deutscher Formatierung an
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  const fmtInt = value => new Intl.NumberFormat('de-DE').format(value);
  const fmtDec = value => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

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
  startYear,
  startMonth,
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
  const {
    months,
    newPartners,
    increaseInterval,
    increaseAmount,
    unitsPerDisplay,
    license1Gross,
    postcardCost,
    graphicShare,
    license2,
    license2Threshold,
    reorderRate,
    reorderCycle,
    costPrice,
    sellPrice,
    salesCost,
    logisticsCost
  } = data;

  const net1 = Math.max(license1Gross - postcardCost - graphicShare, 0);
  const newPartnersPerMonth = Array.from({ length: months }, (_, j) =>
    newPartners + (increaseInterval > 0 ? Math.floor(j / increaseInterval) * increaseAmount : 0)
  );

  const chartData = newPartnersPerMonth.map((cSize, i) => {
    const yyyy = startYear + Math.floor((startMonth - 1 + i) / 12);
    const mm = ((startMonth - 1 + i) % 12) + 1;
    const monthLabel = String(mm).padStart(2, '0') + '/' + yyyy;

    const baseUnits = cSize * unitsPerDisplay;
    let reorderUnits = 0;
    newPartnersPerMonth.forEach((cs, j) => {
      const age = i + 1 - (j + 1);
      if (reorderCycle > 0 && age >= reorderCycle && age % reorderCycle === 0) {
        reorderUnits += cs * (reorderRate / 100) * unitsPerDisplay;
      }
    });
    const totalUnits = baseUnits + reorderUnits;

    const bruttoRohertrag = (sellPrice - costPrice) * totalUnits;
    const vertriebsKosten = salesCost * totalUnits;
    const logistikKosten = logisticsCost * totalUnits;
    const deckungsbeitragII = bruttoRohertrag - vertriebsKosten - logistikKosten;
    const tier1 = net1 * totalUnits;
    const totalPartners = newPartnersPerMonth.slice(0, i + 1).reduce((a, b) => a + b, 0);
    const tier2 = totalPartners > license2Threshold ? license2 * totalUnits : 0;
    const restgewinn = deckungsbeitragII - tier1 - tier2;

    return {
      month: i + 1,
      monthLabel,
      newCustomers: cSize,
      reorderCustomers: Math.round(cSize * (reorderRate / 100)),
      bruttoRohertrag: Number(bruttoRohertrag.toFixed(2)),
      vertriebsKosten: Number(vertriebsKosten.toFixed(2)),
      logistikKosten: Number(logistikKosten.toFixed(2)),
      deckungsbeitragII: Number(deckungsbeitragII.toFixed(2)),
      tier1: Number(tier1.toFixed(2)),
      tier2: Number(tier2.toFixed(2)),
      restgewinn: Number(restgewinn.toFixed(2))
    };
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 20, left: -40, bottom: 5 }}>
        <XAxis dataKey="month" padding={{ left: 0, right: 0 }} />
        <YAxis tick={false} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" />
        <Line type="monotone" dataKey="tier1" stroke={strokeColor} name={name} dot={false} strokeWidth={3} />
        <Line type="monotone" dataKey="tier2" stroke={strokeColor2} name={name2} dot={false} strokeWidth={3} />
        <Line type="monotone" dataKey="deckungsbeitragII" stroke={strokeColor3} name={name3} dot={false} strokeWidth={3} />
        <Line type="monotone" dataKey="restgewinn" stroke={strokeColor4} name={name4} dot={false} strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LicenseChart;
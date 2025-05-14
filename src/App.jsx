import React, { useState, useEffect } from 'react';
import InputMask from './components/InputMask';
import LicenseChart from './components/LicenseChart';

function CollapsibleSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="w-full border rounded-2xl bg-white mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 text-left font-semibold"
      >
        {title} <span>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState({
    months: 120,
    startDate: '2025-07',
    costPrice: 6.9,
    sellPrice: 12.9,
    salesCost: 0,
    logisticsCost: 0,
    unitsPerDisplay: 32,
    newPartners: 4,
    increaseInterval: 12,
    increaseAmount: 2,
    reorderRate: 50,
    reorderCycle: 1,
    license1Gross: 1.2,
    postcardCost: 0.1,
    graphicShare: 0.2,
    license2: 1.3,
    license2Threshold: 3,
    marginPerUnit: 0,
    deckungsbeitragPerUnit: 0
  });

  // Recalculate margin and deckungsbeitrag
  useEffect(() => {
    const { sellPrice, costPrice, salesCost, logisticsCost } = data;
    const margin = parseFloat((sellPrice - costPrice).toFixed(2));
    const deck = parseFloat((margin - salesCost - logisticsCost).toFixed(2));
    setData(d => ({ ...d, marginPerUnit: margin, deckungsbeitragPerUnit: deck }));
  }, [data.sellPrice, data.costPrice, data.salesCost, data.logisticsCost]);

  const { months, startDate, costPrice, sellPrice, salesCost, logisticsCost, unitsPerDisplay, newPartners,
          increaseInterval, increaseAmount, reorderRate, reorderCycle, license1Gross, postcardCost,
          graphicShare, license2, license2Threshold } = data;

  const [startYear, startMonth] = startDate.split('-').map(Number);

  // 1) Neukunden-Kohorten pro Monat
  const newPartnersPerMonth = Array.from(
    { length: months },
    (_, j) => newPartners + (increaseInterval > 0 ? Math.floor(j / increaseInterval) * increaseAmount : 0)
  );

  // 2) KPI – erstes Jahr
  const totalNew = newPartnersPerMonth.reduce((a, b) => a + b, 0);
  const reorders = chartData.reduce((sum, r) => sum + r.reorderCustomers, 0);

  let totalUnitsFirstYear = 0;
  newPartnersPerMonth.forEach(cohortSize => {
    let ve = unitsPerDisplay;
    for (let m = 1; m <= 11; m++) {
      if (reorderCycle > 0 && m % reorderCycle === 0) {
        ve += (reorderRate / 100) * unitsPerDisplay;
      }
    }
    totalUnitsFirstYear += cohortSize * ve;
  });

  const avgUnitsFirstYear = totalNew > 0 ? totalUnitsFirstYear / totalNew : 0;
  const avgRevenueFirstYear = avgUnitsFirstYear * sellPrice;

  // 3) Chart-Daten
  const chartData = newPartnersPerMonth.map((cSize, i) => {
  const yyyy = startYear + Math.floor((startMonth - 1 + i) / 12);
  const mm = ((startMonth - 1 + i) % 12) + 1;
  const monthLabel = `${String(mm).padStart(2, '0')}/${yyyy}`;

  const baseUnits = cSize * unitsPerDisplay;

  // Dynamische Berechnung: Welche früheren Kohorten bestellen nach?
  let reorderUnits = 0;
  let reorderCustomers = 0;
  for (let j = 0; j < i; j++) {
    const age = i - j;
    if (reorderCycle > 0 && age >= reorderCycle && age % reorderCycle === 0) {
      const previousCohort = newPartnersPerMonth[j];
      reorderUnits += previousCohort * (reorderRate / 100) * unitsPerDisplay;
      reorderCustomers += Math.round(previousCohort * (reorderRate / 100));
    }
  }

  const totalUnits = baseUnits + reorderUnits;
  const bruttoRohertrag = (sellPrice - costPrice) * totalUnits;
  const vertriebsKosten = salesCost * totalUnits;
  const logistikKosten = logisticsCost * totalUnits;
  const deckungsbeitragII = bruttoRohertrag - vertriebsKosten - logistikKosten;
  const net1 = Math.max(license1Gross - postcardCost - graphicShare, 0);
  const tier1 = net1 * totalUnits;
  const tier2 = cSize > license2Threshold ? license2 * totalUnits : 0;
  const rest = deckungsbeitragII - tier1 - tier2;

  return {
    month: i + 1,
    monthLabel,
    newCustomers: cSize,
    reorderCustomers,
    bruttoRohertrag: Number(bruttoRohertrag.toFixed(2)),
    vertriebsKosten: Number(vertriebsKosten.toFixed(2)),
    logistikKosten: Number(logistikKosten.toFixed(2)),
    deckungsbeitragII: Number(deckungsbeitragII.toFixed(2)),
    tier1: Number(tier1.toFixed(2)),
    tier2: Number(tier2.toFixed(2)),
    restgewinn: Number(rest.toFixed(2)),
    totalUnits
  };
});

  // 4) Gesamt-Übersicht
  const totalLicense1 = chartData.reduce((sum, r) => sum + r.tier1, 0);
  const totalLicense2 = chartData.reduce((sum, r) => sum + r.tier2, 0);
  const totalUnitsAll = chartData.reduce((sum, r) => sum + r.totalUnits, 0);
  const lastLicense1 = chartData[chartData.length - 1]?.tier1 || 0;

  // Export-Funktion
  const handleExportAll = () => {
    const exportPayload = {
      inputs: data,
      kpis: {
        totalNew,
        reorders,
        avgUnitsFirstYear: Number(avgUnitsFirstYear.toFixed(2)),
        avgRevenueFirstYear: Number(avgRevenueFirstYear.toFixed(2)),
        totalUnitsAll,
        avgUnitsPerMonth: Number((totalUnitsAll / months).toFixed(2)),
        totalLicense1,
        avgLicense1PerMonth: Number((totalLicense1 / months).toFixed(2)),
        totalLicense2,
        avgLicense2PerMonth: Number((totalLicense2 / months).toFixed(2)),
        lastLicense1Month: Number(lastLicense1.toFixed(2))
      },
      chartData
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planning_data_${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fmt = v => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + ' €';
  const fmtNum = v => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

  return (
    <div className="relative min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Business Case Simulator</h1>
        <button onClick={handleExportAll} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Alle Daten exportieren (JSON)
        </button>
      </div>

     {/* Eingabemasken mit korrektem JSX */}
<CollapsibleSection title="Basisdaten & Produktkalkulation">
  <InputMask
    data={data}
    onChange={setData}
    sections={['Basisdaten', 'Produktkalkulation']}
  />
</CollapsibleSection>

<CollapsibleSection title="Händlerwachstum & Bestellverhalten">
  <InputMask
    data={data}
    onChange={setData}
    sections={['Händlerwachstum', 'Bestellverhalten']}
  />
</CollapsibleSection>

<CollapsibleSection title="Kostenplanung (Pina)">
  <InputMask
    data={data}
    onChange={setData}
    sections={['Kostenplanung (Pina)']}
  />
</CollapsibleSection>

<CollapsibleSection title="Lizenz 1 / Städteserie & Lizenz 2 / Website & Shop">
  <InputMask
    data={data}
    onChange={setData}
    sections={[
      'Lizenz 1 / Städteserie (C-Hub)',
      'Lizenz 2 / Website & Shop (C-Hub)'
    ]}
  />
</CollapsibleSection>

      {/* Übersichten */}
      <CollapsibleSection title="Übersicht – Kundenzahlen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-100 rounded-xl text-center"><h3 className="font-medium">Gesamt Neukunden</h3><p className="mt-2 text-2xl font-semibold">{fmtNum(totalNew)}</p><p className="text-sm text-gray-500">Summe aller Neukunden im ersten Jahr</p></div>
          <div className="p-4 bg-gray-100 rounded-xl text-center"><h3 className="font-medium">Kunden mit ≥1 Nachbestellung</h3><p className="mt-2 text-2xl font-semibold">{fmtNum(reorders)}</p><p className="text-sm text-gray-500">Anzahl mit mind. einer Nachbestellung im ersten Jahr</p></div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Übersicht – Durchschnittswerte">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-100 rounded-xl text-center"><h3 className="font-medium">Ø VE pro Händler/Jahr</h3><p className="mt-2 text-2xl font-semibold">{fmtNum(avgUnitsFirstYear)}</p><p className="text-sm text-gray-500">Durchschnitt VE pro Kunde im ersten Jahr</p></div>
          <div className="p-4 bg-gray-100 rounded-xl text-center"><h3 className="font-medium">Ø Umsatz pro Händler/Jahr</h3><p className="mt-2 text-2xl font-semibold">{fmt(avgRevenueFirstYear)}</p><p className="text-sm text-gray-500">Durchschnittlicher Umsatz pro Kunde im ersten Jahr</p></div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Übersicht – Gesamt VE">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-100 rounded-xl text-center"><h3 className="font-medium">VE insgesamt Ende Planungszeitraum</h3><p className="mt-2 text-2xl font-semibold">{fmtNum(totalUnitsAll)}</p><p className="text-sm text-gray-500">Summe aller VE über {months} Monate</p></div>
          <div className="p-4 bg-gray-100 rounded-xl text-center"><h3 className="font-medium">Ø VE pro Monat</h3><p className="mt-2 text-2xl font-semibold">{fmtNum(totalUnitsAll / months)}</p><p className="text-sm text-gray-500">Durchschnittliche VE je Monat</p></div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Lizenz-KPIs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-100 rounded-xl text-center"><h3 className="font-medium">Gesamt Erlös Lizenz 1</h3><p className="mt-2 text-2xl font-semibold">{fmt(totalLicense1)}</p><p className="text-sm text-gray-500">Summe Lizenz 1-Erlöse</p></div>
          <div className="p-4 bg-gray-100 rounded-xl text-center"><h3 className="font-medium">Ø monatlicher Erlös Lizenz 1</h3><p className="mt-2 text-2xl font-semibold">{fmt(totalLicense1 / months)}</p><p className="text-sm text-gray-500">
            Durchschnitt pro Monat</p></div>
          <div className="p-4 bg-gray-100 rounded-xl text-center"><h3 className="font-medium">Erlös Lizenz 1 (letzter Monat)</h3><p className="mt-2 text-2xl font-semibold">{fmt(lastLicense1)}</p><p className="text-sm text-gray-500">Im letzten Monat der Planung</p></div>
          <div className="p-4 bg-gray-100 rounded-xl text-center"><h3 className="font-medium">Gesamt Erlös Lizenz 2</h3><p className="mt-2 text-2xl font-semibold">{fmt(totalLicense2)}</p><p className="text-sm text-gray-500">Summe Lizenz 2-Erlöse</p></div>
          <div className="p-4 bg-gray-100 rounded-xl text-center"><h3 className="font-medium">Ø monatlicher Erlös Lizenz 2</h3><p className="mt-2 text-2xl font-semibold">{fmt(totalLicense2 / months)}</p><p className="text-sm text-gray-500">Durchschnitt pro Monat</p></div>
        </div>
      </CollapsibleSection>

      {/* Chart */}
      <CollapsibleSection title="Einnahmen & Marge">
        <LicenseChart
          data={chartData}
          startYear={startYear}
          startMonth={startMonth}
          dataKey="tier1"
          strokeColor="#34C759"
          name="Lizenz 1 Erlös"
          dataKey2="tier2"
          strokeColor2="#007AFF"
          name2="Lizenz 2 Erlös"
          dataKey3="deckungsbeitragII"
          strokeColor3="#FFD60A"
          name3="Deckungsbeitrag II"
          dataKey4="restgewinn"
          strokeColor4="#FF9500"
          name4="Restgewinn"
        />
      </CollapsibleSection>
    </div>
  );
}

"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Card from "@/components/Card";

// Données d'exemple — à remplacer par une requête agrégée Supabase
// (ex: vue SQL group by date) une fois le volume réel disponible.
const verificationsTrend = [
  { day: "Lun", value: 120 },
  { day: "Mar", value: 180 },
  { day: "Mer", value: 150 },
  { day: "Jeu", value: 220 },
  { day: "Ven", value: 300 },
  { day: "Sam", value: 260 },
  { day: "Dim", value: 310 },
];

const repartition = [
  { name: "Authentiques", value: 78, color: "#10B981" },
  { name: "Modifiés", value: 9, color: "#EF4444" },
  { name: "Inconnus", value: 13, color: "#F59E0B" },
];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-2">
        <h2 className="text-white font-semibold mb-4">Évolution des vérifications</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={verificationsTrend}>
            <XAxis dataKey="day" stroke="#8B98A5" fontSize={12} />
            <YAxis stroke="#8B98A5" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "#141A21", border: "1px solid #232B34", borderRadius: 8 }}
              labelStyle={{ color: "#fff" }}
            />
            <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h2 className="text-white font-semibold mb-4">Répartition</h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={repartition} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
              {repartition.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#141A21", border: "1px solid #232B34", borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1 mt-2">
          {repartition.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-xs text-origin-muted">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
              {entry.name}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

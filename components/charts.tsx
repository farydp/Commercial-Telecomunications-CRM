"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#1d7a75", "#d9785f", "#5b7cfa", "#23a66f", "#94a3b8"];

export function StatusPieChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PeriodAreaChart({ data }: { data: Array<{ day: string; total: number }> }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="contactsArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1d7a75" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#1d7a75" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="day" stroke="#64748b" />
          <YAxis allowDecimals={false} stroke="#64748b" />
          <Tooltip />
          <Area type="monotone" dataKey="total" stroke="#1d7a75" fill="url(#contactsArea)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}



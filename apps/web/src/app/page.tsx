"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Tx = {
  id: string;
  kind: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  note?: string;
};

const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"];

export default function HomePage() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [budget, setBudget] = useState(2500);

  const form = useForm<Omit<Tx, "id">>({
    defaultValues: { kind: "expense", amount: 0, category: "", date: "" }
  });

  const onSubmit = form.handleSubmit((value) => {
    setTransactions((prev) => [{ ...value, id: crypto.randomUUID() }, ...prev]);
    form.reset({ kind: "expense", amount: 0, category: "", date: "" });
  });

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.kind === "income") acc.income += tx.amount;
        else acc.expense += tx.amount;
        acc.byCategory[tx.category] = (acc.byCategory[tx.category] || 0) + tx.amount;
        return acc;
      },
      { income: 0, expense: 0, byCategory: {} as Record<string, number> }
    );
  }, [transactions]);

  const chartData = Object.entries(summary.byCategory).map(([name, value]) => ({ name, value }));
  const budgetUsed = summary.expense;

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      <h1 className="text-3xl font-semibold">Fund Tracker</h1>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card title="Saldo" value={(summary.income - summary.expense).toFixed(2)} />
        <Card title="Przychody" value={summary.income.toFixed(2)} />
        <Card title="Wydatki" value={summary.expense.toFixed(2)} />
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="mb-3 text-xl font-medium">Dodaj transakcję</h2>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <select {...form.register("kind")} className="rounded border p-2">
            <option value="expense">Wydatek</option>
            <option value="income">Dochód</option>
          </select>
          <input type="number" step="0.01" placeholder="Kwota" {...form.register("amount", { valueAsNumber: true })} className="rounded border p-2" />
          <input placeholder="Kategoria" {...form.register("category", { required: true })} className="rounded border p-2" />
          <input type="date" {...form.register("date", { required: true })} className="rounded border p-2" />
          <input placeholder="Notatka" {...form.register("note")} className="rounded border p-2 sm:col-span-2" />
          <button type="submit" className="rounded bg-black px-4 py-2 text-white sm:col-span-2">Zapisz</button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h2 className="mb-3 text-xl font-medium">Struktura wydatków</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={90}>
                  {chartData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="text-xl font-medium">Budżet miesięczny</h2>
          <input
            type="number"
            className="rounded border p-2"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
          <p>Wykorzystano: {budgetUsed.toFixed(2)} / {budget.toFixed(2)}</p>
          {budgetUsed > budget ? <p className="text-red-600">Przekroczono budżet.</p> : <p className="text-green-600">Budżet pod kontrolą.</p>}
        </div>
      </section>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-lg border p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold">{value} PLN</p>
    </article>
  );
}

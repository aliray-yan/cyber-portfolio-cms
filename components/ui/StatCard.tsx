import Card from "./Card";

interface StatCardProps {
  label: string;
  value: number | string;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <Card>
      <p className="text-3xl font-bold text-cyan-400">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </Card>
  );
}

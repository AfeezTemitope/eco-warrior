import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: number;
    color: "blue" | "green" | "purple";
    icon: LucideIcon;
}

export default function StatCard({ title, value, color, icon: Icon }: StatCardProps) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-800 border-blue-200",
        green: "bg-green-50 text-green-800 border-green-200",
        purple: "bg-purple-50 text-purple-800 border-purple-200",
    };

    return (
        <div className={`${colorClasses[color]} border-2 rounded-xl p-6 transition-transform hover:scale-105`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-80">{title}</h3>
                <Icon size={20} className="opacity-60" />
            </div>
            <p className="text-4xl font-bold">{value}</p>
        </div>
    );
}
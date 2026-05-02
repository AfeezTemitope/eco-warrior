import type { LucideIcon } from "lucide-react";

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: LucideIcon;
    children: React.ReactNode;
}

export default function TabButton({ active, onClick, icon: Icon, children }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                active
                    ? "bg-green-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
            }`}
        >
            <Icon size={20} className="flex-shrink-0" />
            <span className="truncate">{children}</span>
        </button>
    );
}

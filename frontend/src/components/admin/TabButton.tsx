import { LucideIcon } from "lucide-react";

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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                active
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
        >
            <Icon size={18} />
            <span className="hidden sm:inline">{children}</span>
        </button>
    );
}
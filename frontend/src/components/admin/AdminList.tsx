import { useState, useRef } from "react";
import { UserMinus, Plus, Loader2 } from "lucide-react";
import api from "../../lib/api";
import { toast } from "react-toastify";

interface Admin {
    id: string;
    username: string;
    role: string;
}

interface AdminListProps {
    admins: Admin[];
    onRefresh: () => void;
    loading: boolean;
}

interface ErrorResponse {
    error?: string;
}

interface AxiosErrorWithData {
    response?: {
        data?: ErrorResponse;
    };
}

export default function AdminList({ admins, onRefresh, loading }: AdminListProps) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [createLoading, setCreateLoading] = useState(false);
    const submitRef = useRef(false);

    const handleCreate = async () => {
        if (!username || !email || !password) {
            toast.error("Please fill all fields");
            return;
        }

        if (submitRef.current) return;
        submitRef.current = true;
        setCreateLoading(true);

        try {
            await api.post("/admin/admins", {
                email,
                password,
                username,
            });
            toast.success("Admin created!");
            setUsername("");
            setEmail("");
            setPassword("");
            onRefresh();
        } catch (err) {
            const errorMsg =
                (err as AxiosErrorWithData).response?.data?.error || "Failed to create admin";
            toast.error(errorMsg);
        } finally {
            setCreateLoading(false);
            submitRef.current = false;
        }
    };

    const handleDelete = async (adminId: string, adminUsername: string) => {
        if (!confirm(`Delete admin "${adminUsername}"?`)) return;

        try {
            await api.delete(`/admin/admins/${adminId}`);
            toast.info(`Admin "${adminUsername}" deleted`);
            onRefresh();
        } catch {
            toast.error("Failed to delete admin");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-900">Create New Admin</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow md:col-span-2"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={createLoading}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium md:col-span-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {createLoading && <Loader2 size={18} className="animate-spin" />}
                        <Plus size={18} /> Create Admin
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">All Admins</h2>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-blue-600" size={24} />
                        <span className="ml-2 text-gray-600">Loading admins...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Username
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {admins.length > 0 ? (
                                admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{admin.username}</div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <div className="text-sm text-gray-600">{admin.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        admin.role === "superadmin"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : "bg-blue-100 text-blue-800"
                                                    }`}
                                                >
                                                    {admin.role}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(admin.id, admin.username)}
                                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                <UserMinus size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                        No admins found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
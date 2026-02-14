'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsersCog, faCheckCircle, faTimesCircle, faBan, faPlay, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { API_URL, getAuthHeaders } from '@/lib/api';
import { toast } from 'sonner';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
    subscription?: {
        status: string;
        plan: { name: string };
    };
    _count?: {
        rooms: number;
        bookings: number;
    }
}

export default function AdminTenantPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/tenants`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                setTenants(await res.json());
            } else {
                toast.error('Gagal mengambil data tenant (Superadmin Only)');
            }
        } catch {
            toast.error('Error fetching tenants');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${API_URL}/tenants/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                toast.success(`Tenant ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
                fetchTenants();
            }
        } catch {
            toast.error('Gagal update status');
        }
    };

    const filteredTenants = tenants.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Tenant</h1>
                    <p className="text-sm text-gray-500 mt-1">Superadmin Control Panel</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari Tenant..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none text-sm"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
            </div>

            <div className="bg-[#ecf0f3] rounded-2xl shadow-[9px_9px_16px_#cbced1,-9px_-9px_16px_#ffffff] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-200/50 text-gray-600 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Tenant Info</th>
                            <th className="p-4">Langganan</th>
                            <th className="p-4">Statistik</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="p-10 text-center"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#00bfa5] text-2xl" /></td></tr>
                        ) : filteredTenants.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Tidak ada data tenant.</td></tr>
                        ) : filteredTenants.map(t => (
                            <tr key={t.id} className="hover:bg-white/30 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">{t.name}</div>
                                    <div className="text-xs text-gray-500">/{t.slug}</div>
                                    <div className="text-xs text-gray-400 mt-1">{new Date(t.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="p-4">
                                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                                        {t.subscription?.plan?.name || 'No Plan'}
                                    </span>
                                    <div className="text-xs text-gray-500 mt-1 uppercase">{t.subscription?.status}</div>
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    <div>{t._count?.rooms || 0} Kamar</div>
                                    <div>{t._count?.bookings || 0} Booking</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        <FontAwesomeIcon icon={t.isActive ? faCheckCircle : faTimesCircle} />
                                        {t.isActive ? 'Active' : 'Suspended'}
                                    </span>
                                </td>
                                <td className="p-4 flex justify-center">
                                    <button
                                        onClick={() => toggleStatus(t.id, t.isActive)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${t.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                        title={t.isActive ? 'Suspend Tenant' : 'Activate Tenant'}
                                    >
                                        <FontAwesomeIcon icon={t.isActive ? faBan : faPlay} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

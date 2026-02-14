'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faLayerGroup, faEdit, faTrash, faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons';
import { API_URL, getAuthHeaders } from '@/lib/api';
import { toast } from 'sonner';

interface Plan {
    id: string;
    name: string;
    price: number;
    maxRooms: number;
    maxStaff: number;
    allowMultiBranch: boolean;
}

export default function AdminPlanPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<any>({
        name: '', price: 0, maxRooms: 10, maxStaff: 1, allowMultiBranch: false
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/plans`, { headers: getAuthHeaders() });
            if (res.ok) setPlans(await res.json());
        } catch {
            toast.error('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/plans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ ...formData, price: Number(formData.price), maxRooms: Number(formData.maxRooms), maxStaff: Number(formData.maxStaff) }),
            });
            if (res.ok) {
                toast.success('Plan Created');
                setShowModal(false);
                fetchPlans();
            }
        } catch {
            toast.error('Error creating plan');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Paket Langganan</h1>
                    <p className="text-sm text-gray-500 mt-1">Konfigurasi Membership</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 rounded-xl bg-[#00bfa5] text-white font-medium shadow-lg hover:bg-[#00a891] transition-all flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Buat Paket
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-10"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#00bfa5] text-3xl" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map(p => (
                        <div key={p.id} className="bg-[#ecf0f3] rounded-2xl p-6 shadow-[9px_9px_16px_#cbced1,-9px_-9px_16px_#ffffff] flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#00bfa5]/20 to-transparent rounded-bl-full -mr-4 -mt-4"></div>

                            <h3 className="text-xl font-bold text-gray-800 mb-2">{p.name}</h3>
                            <div className="text-3xl font-bold text-[#00bfa5] mb-6">
                                Rp {p.price.toLocaleString()} <span className="text-sm text-gray-400 font-normal">/bulan</span>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                    <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                                    Max {p.maxRooms} Kamar
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                    <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                                    Max {p.maxStaff} Staff
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                    <FontAwesomeIcon icon={faCheck} className={`text-${p.allowMultiBranch ? 'green' : 'gray'}-500`} />
                                    Multi-Cabang: {p.allowMultiBranch ? 'Ya' : 'Tidak'}
                                </li>
                            </ul>

                            <button className="w-full py-2 rounded-xl border-2 border-gray-300 text-gray-500 font-bold hover:border-[#00bfa5] hover:text-[#00bfa5] transition-all">
                                Edit Paket
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#ecf0f3] rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">Buat Paket Baru</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Nama Paket</label>
                                <input type="text" required className="w-full px-4 py-2 rounded-xl bg-[#ecf0f3] shadow-inner outline-none"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Harga (Bulanan)</label>
                                <input type="number" required className="w-full px-4 py-2 rounded-xl bg-[#ecf0f3] shadow-inner outline-none"
                                    value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Max Kamar</label>
                                    <input type="number" required className="w-full px-4 py-2 rounded-xl bg-[#ecf0f3] shadow-inner outline-none"
                                        value={formData.maxRooms} onChange={e => setFormData({ ...formData, maxRooms: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Max Staff</label>
                                    <input type="number" required className="w-full px-4 py-2 rounded-xl bg-[#ecf0f3] shadow-inner outline-none"
                                        value={formData.maxStaff} onChange={e => setFormData({ ...formData, maxStaff: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={formData.allowMultiBranch} onChange={e => setFormData({ ...formData, allowMultiBranch: e.target.checked })} />
                                <label className="text-sm font-semibold text-gray-600">Izinkan Multi Cabang</label>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-600 hover:bg-gray-200 rounded-xl">Batal</button>
                                <button type="submit" className="flex-1 py-3 bg-[#00bfa5] text-white rounded-xl shadow-lg hover:bg-[#00a891]">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

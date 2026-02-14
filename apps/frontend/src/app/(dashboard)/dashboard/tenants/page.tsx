'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser, faEdit, faTrash, faSpinner, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { API_URL, getAuthHeaders } from '@/lib/api';
import { toast } from 'sonner';

interface Customer {
    id: string;
    fullName: string;
    phone: string;
    ktpNumber: string;
}

export default function CustomerPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form
    const [formData, setFormData] = useState({ fullName: '', phone: '', ktpNumber: '' });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/customers`, { headers: getAuthHeaders() });
            if (res.ok) setCustomers(await res.json());
        } catch {
            toast.error('Gagal mengambil data customer');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success('Customer ditambahkan');
                setShowModal(false);
                setFormData({ fullName: '', phone: '', ktpNumber: '' });
                fetchCustomers();
            } else {
                toast.error('Gagal menambah customer');
            }
        } catch {
            toast.error('Terjadi kesalahan');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Penyewa</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola data penghuni kost</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 rounded-xl bg-[#00bfa5] text-white font-medium shadow-lg hover:bg-[#00a891] transition-all flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Tambah Penyewa
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map(c => (
                    <div key={c.id} className="bg-[#ecf0f3] rounded-2xl p-6 shadow-[9px_9px_16px_#cbced1,-9px_-9px_16px_#ffffff] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                            {c.fullName.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-gray-800">{c.fullName}</div>
                            <div className="text-sm text-gray-500">{c.phone}</div>
                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <FontAwesomeIcon icon={faIdCard} />
                                {c.ktpNumber}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#ecf0f3] rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">Tambah Penyewa</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Nama Lengkap</label>
                                <input type="text" required className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none"
                                    value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">No. HP / WA</label>
                                <input type="text" required className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none"
                                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Nomor KTP</label>
                                <input type="text" required className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none"
                                    value={formData.ktpNumber} onChange={e => setFormData({ ...formData, ktpNumber: e.target.value })} />
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

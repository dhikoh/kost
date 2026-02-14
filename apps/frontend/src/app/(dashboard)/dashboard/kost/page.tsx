'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBuilding, faMapMarkerAlt, faEdit, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { API_URL, getAuthHeaders } from '@/lib/api';
import { toast } from 'sonner';

interface Kost {
    id: string;
    name: string;
    address: string;
    description: string;
    _count?: {
        rooms: number;
    }
}

export default function KostPage() {
    const [kosts, setKosts] = useState<Kost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingKost, setEditingKost] = useState<Kost | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        description: '',
    });

    useEffect(() => {
        fetchKosts();
    }, []);

    const fetchKosts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/kost`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setKosts(data);
            }
        } catch (error) {
            console.error('Failed to fetch kosts', error);
            toast.error('Gagal mengambil data kost');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingKost ? `${API_URL}/kost/${editingKost.id}` : `${API_URL}/kost`;
            const method = editingKost ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editingKost ? 'Kost berhasil diperbarui' : 'Kost berhasil ditambahkan');
                setShowModal(false);
                setFormData({ name: '', address: '', description: '' });
                setEditingKost(null);
                fetchKosts();
            } else {
                toast.error('Gagal menyimpan kost');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus kost ini?')) return;

        try {
            const res = await fetch(`${API_URL}/kost/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (res.ok) {
                toast.success('Kost berhasil dihapus');
                fetchKosts();
            } else {
                toast.error('Gagal menghapus kost');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan');
        }
    };

    const openEdit = (kost: Kost) => {
        setEditingKost(kost);
        setFormData({
            name: kost.name,
            address: kost.address,
            description: kost.description,
        });
        setShowModal(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Daftar Kost</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola properti kost Anda</p>
                </div>
                <button
                    onClick={() => {
                        setEditingKost(null);
                        setFormData({ name: '', address: '', description: '' });
                        setShowModal(true);
                    }}
                    className="px-6 py-3 rounded-xl bg-[#00bfa5] text-white font-medium shadow-lg hover:bg-[#00a891] transition-all flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Tambah Kost
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <FontAwesomeIcon icon={faSpinner} className="text-[#00bfa5] text-3xl animate-spin" />
                </div>
            ) : kosts.length === 0 ? (
                <div className="text-center py-20 bg-[#ecf0f3] rounded-2xl shadow-[inset_5px_5px_10px_#cbced1,inset_-5px_-5px_10px_#ffffff]">
                    <FontAwesomeIcon icon={faBuilding} className="text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-500">Belum ada data kost.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kosts.map((kost) => (
                        <div key={kost.id} className="bg-[#ecf0f3] rounded-2xl p-6 shadow-[9px_9px_16px_#cbced1,-9px_-9px_16px_#ffffff] hover:shadow-[5px_5px_10px_#cbced1,-5px_-5px_10px_#ffffff] transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-[#ecf0f3] flex items-center justify-center text-[#00bfa5] shadow-[3px_3px_6px_#cbced1,-3px_-3px_6px_#ffffff]">
                                    <FontAwesomeIcon icon={faBuilding} />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEdit(kost)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-[#00bfa5] shadow-[3px_3px_6px_#cbced1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff]"
                                    >
                                        <FontAwesomeIcon icon={faEdit} size="sm" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(kost.id)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 shadow-[3px_3px_6px_#cbced1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff]"
                                    >
                                        <FontAwesomeIcon icon={faTrash} size="sm" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-1">{kost.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3" />
                                <span className="truncate">{kost.address}</span>
                            </div>

                            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-xs font-semibold bg-gray-200 px-2 py-1 rounded text-gray-600">
                                    {kost.description || 'Tidak ada deskripsi'}
                                </span>
                                <span className="text-xs font-bold text-[#00bfa5]">
                                    {kost._count?.rooms || 0} Kamar
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#ecf0f3] rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">
                            {editingKost ? 'Edit Kost' : 'Tambah Kost Baru'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Nama Kost</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] border-none outline-none text-gray-700 shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] focus:ring-2 focus:ring-[#00bfa5]"
                                    placeholder="Contoh: Kost Bahagia"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Alamat</label>
                                <textarea
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] border-none outline-none text-gray-700 shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] focus:ring-2 focus:ring-[#00bfa5] min-h-[100px]"
                                    placeholder="Alamat lengkap kost..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Deskripsi (Opsional)</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] border-none outline-none text-gray-700 shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] focus:ring-2 focus:ring-[#00bfa5]"
                                    placeholder="Deskripsi singkat"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-[#00bfa5] text-white font-semibold shadow-lg hover:bg-[#00a891] transition-all"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

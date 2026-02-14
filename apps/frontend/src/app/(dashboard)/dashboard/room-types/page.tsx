'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBed, faEdit, faTrash, faSpinner, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { API_URL, getAuthHeaders } from '@/lib/api';
import { toast } from 'sonner';

interface RoomType {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    facilities: string[];
}

export default function RoomTypePage() {
    const [types, setTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState<RoomType | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        facilities: '',
    });

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/room-types`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setTypes(data);
            }
        } catch (error) {
            toast.error('Gagal mengambil data tipe kamar');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingType ? `${API_URL}/room-types/${editingType.id}` : `${API_URL}/room-types`;
            const method = editingType ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                basePrice: parseFloat(formData.basePrice),
                facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f)
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(editingType ? 'Tipe kamar diperbarui' : 'Tipe kamar ditambahkan');
                setShowModal(false);
                setFormData({ name: '', description: '', basePrice: '', facilities: '' });
                setEditingType(null);
                fetchTypes();
            } else {
                toast.error('Gagal menyimpan tipe kamar');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus tipe kamar ini?')) return;
        try {
            const res = await fetch(`${API_URL}/room-types/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                toast.success('Tipe kamar dihapus');
                fetchTypes();
            } else {
                toast.error('Gagal menghapus');
            }
        } catch {
            toast.error('Terjadi kesalahan');
        }
    };

    const openEdit = (type: RoomType) => {
        setEditingType(type);
        setFormData({
            name: type.name,
            description: type.description,
            basePrice: type.basePrice.toString(),
            facilities: type.facilities.join(', '),
        });
        setShowModal(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Tipe Kamar</h1>
                    <p className="text-sm text-gray-500 mt-1">Kategori dan harga kamar</p>
                </div>
                <button
                    onClick={() => {
                        setEditingType(null);
                        setFormData({ name: '', description: '', basePrice: '', facilities: '' });
                        setShowModal(true);
                    }}
                    className="px-6 py-3 rounded-xl bg-[#00bfa5] text-white font-medium shadow-lg hover:bg-[#00a891] transition-all flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Tambah Tipe
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center h-64 items-center">
                    <FontAwesomeIcon icon={faSpinner} className="text-[#00bfa5] text-3xl animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {types.map((type) => (
                        <div key={type.id} className="bg-[#ecf0f3] rounded-2xl p-6 shadow-[9px_9px_16px_#cbced1,-9px_-9px_16px_#ffffff]">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-blue-100 text-blue-600 shadow-sm">
                                    <FontAwesomeIcon icon={faBed} size="lg" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(type)} className="text-gray-400 hover:text-[#00bfa5] transition-colors"><FontAwesomeIcon icon={faEdit} /></button>
                                    <button onClick={() => handleDelete(type.id)} className="text-gray-400 hover:text-red-500 transition-colors"><FontAwesomeIcon icon={faTrash} /></button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{type.name}</h3>
                            <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">{type.description}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {type.facilities.map((f, i) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">{f}</span>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 text-[#00bfa5] font-bold text-lg">
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                                RP {parseInt(type.basePrice.toString()).toLocaleString('id-ID')}
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
                            {editingType ? 'Edit Tipe Kamar' : 'Tambah Tipe Kamar'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Nama Tipe</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none focus:text-[#00bfa5]"
                                    placeholder="Contoh: Deluxe Room"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Harga Dasar (Per Bulan)</label>
                                <input
                                    type="number" required
                                    value={formData.basePrice}
                                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none focus:text-[#00bfa5]"
                                    placeholder="Contoh: 1500000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Fasilitas (Pisahkan Koma)</label>
                                <input
                                    type="text"
                                    value={formData.facilities}
                                    onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none focus:text-[#00bfa5]"
                                    placeholder="AC, WiFi, Kamar Mandi Dalam"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none focus:text-[#00bfa5] h-24"
                                />
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

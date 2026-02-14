'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faDoorOpen, faSort, faFilter, faSpinner, faTrash, faEdit, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { API_URL, getAuthHeaders } from '@/lib/api';
import { toast } from 'sonner';

interface Room {
    id: string;
    number: string;
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
    kost: { id: string; name: string };
    type: { id: string; name: string; basePrice: number };
}

interface Kost { id: string; name: string }
interface RoomType { id: string; name: string; basePrice: number }

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);

    // Master Data for Dropdowns
    const [kosts, setKosts] = useState<Kost[]>([]);
    const [types, setTypes] = useState<RoomType[]>([]);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [formData, setFormData] = useState({
        number: '',
        kostId: '',
        roomTypeId: '',
        status: 'AVAILABLE'
    });

    useEffect(() => {
        fetchRooms();
        fetchMasterData();
    }, [page]);

    const fetchMasterData = async () => {
        try {
            const [resKost, resType] = await Promise.all([
                fetch(`${API_URL}/kost`, { headers: getAuthHeaders() }),
                fetch(`${API_URL}/room-types`, { headers: getAuthHeaders() })
            ]);
            if (resKost.ok) setKosts(await resKost.json());
            if (resType.ok) setTypes(await resType.json());
        } catch (e) {
            console.error('Failed to load master data');
        }
    };

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/rooms?page=${page}&limit=${limit}`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setRooms(data.data);
                setTotal(data.meta.total);
            }
        } catch (error) {
            toast.error('Gagal mengambil data kamar');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingRoom ? `${API_URL}/rooms/${editingRoom.id}` : `${API_URL}/rooms`;
            const method = editingRoom ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success('Data kamar disimpan');
                setShowModal(false);
                setFormData({ number: '', kostId: '', roomTypeId: '', status: 'AVAILABLE' });
                setEditingRoom(null);
                fetchRooms();
            } else {
                toast.error('Gagal menyimpan data kamar');
            }
        } catch {
            toast.error('Terjadi kesalahan');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus kamar ini?')) return;
        try {
            const res = await fetch(`${API_URL}/rooms/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                toast.success('Kamar dihapus');
                fetchRooms();
            }
        } catch {
            toast.error('Gagal menghapus');
        }
    };

    const handleEdit = (room: Room) => {
        setEditingRoom(room);
        setFormData({
            number: room.number,
            kostId: room.kost.id,
            roomTypeId: room.type.id,
            status: room.status,
        });
        setShowModal(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Kamar</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola ketersediaan kamar</p>
                </div>
                <button
                    onClick={() => {
                        setEditingRoom(null);
                        setFormData({ number: '', kostId: '', roomTypeId: '', status: 'AVAILABLE' });
                        setShowModal(true);
                    }}
                    className="px-6 py-3 rounded-xl bg-[#00bfa5] text-white font-medium shadow-lg hover:bg-[#00a891] transition-all flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Tambah Kamar
                </button>
            </div>

            {/* DATA TABLE (NEUMORPHIC) */}
            <div className="bg-[#ecf0f3] rounded-2xl shadow-[9px_9px_16px_#cbced1,-9px_-9px_16px_#ffffff] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-200/50 text-gray-600 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Nomor</th>
                            <th className="p-4">Kost/Gedung</th>
                            <th className="p-4">Tipe & Harga</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-gray-400">
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl" />
                                </td>
                            </tr>
                        ) : rooms.map((room) => (
                            <tr key={room.id} className="hover:bg-white/30 transition-colors">
                                <td className="p-4 font-bold text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faDoorOpen} className="text-[#00bfa5]" />
                                        {room.number}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600">{room.kost?.name}</td>
                                <td className="p-4">
                                    <div className="font-semibold">{room.type?.name}</div>
                                    <div className="text-xs text-gray-500">Rp {room.type?.basePrice.toLocaleString()}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${room.status === 'AVAILABLE' ? 'bg-green-100 text-green-600' :
                                            room.status === 'OCCUPIED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                        }`}>
                                        {room.status}
                                    </span>
                                </td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button onClick={() => handleEdit(room)} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-white text-gray-600 flex items-center justify-center transition-all">
                                        <FontAwesomeIcon icon={faEdit} size="sm" />
                                    </button>
                                    <button onClick={() => handleDelete(room.id)} className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-all">
                                        <FontAwesomeIcon icon={faTrash} size="sm" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && rooms.length === 0 && (
                    <div className="p-8 text-center text-gray-500">Belum ada data kamar.</div>
                )}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#ecf0f3] rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">
                            {editingRoom ? 'Edit Kamar' : 'Tambah Kamar'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Pilih Kost</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none"
                                    value={formData.kostId}
                                    onChange={(e) => setFormData({ ...formData, kostId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Pilih Kost --</option>
                                    {kosts.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Tipe Kamar</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none"
                                    value={formData.roomTypeId}
                                    onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Pilih Tipe --</option>
                                    {types.map(t => <option key={t.id} value={t.id}>{t.name} - Rp {t.basePrice}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Nomor Kamar</label>
                                <input
                                    type="text" required
                                    value={formData.number}
                                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none"
                                    placeholder="Contoh: 101"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Status</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="AVAILABLE">Tersedia</option>
                                    <option value="OCCUPIED">Terisi</option>
                                    <option value="MAINTENANCE">Perbaikan</option>
                                </select>
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

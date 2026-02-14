'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCalendarAlt, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { API_URL, getAuthHeaders } from '@/lib/api';
import { toast } from 'sonner';

// Simplified Calendar view (List for now, to enable quick MVP)
// A full calendar lib might be too heavy for this step without npm install

interface Booking {
    id: string;
    room: { number: string; kost: { name: string } };
    customer: { fullName: string };
    startDate: string;
    endDate: string;
    status: string;
}

export default function BookingPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form
    const [rooms, setRooms] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        roomId: '',
        customerId: '',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchBookings();
        fetchMasterData();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/bookings`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) setBookings(await res.json());
        } catch {
            toast.error('Gagal mengambil data booking');
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterData = async () => {
        try {
            const [resRooms, resCust] = await Promise.all([
                fetch(`${API_URL}/rooms?status=AVAILABLE`, { headers: getAuthHeaders() }),
                fetch(`${API_URL}/customers`, { headers: getAuthHeaders() })
            ]);

            if (resRooms.ok) {
                const data = await resRooms.json();
                setRooms(data.data || []);
            }
            if (resCust.ok) setCustomers(await resCust.json());
        } catch (e) {
            console.error('Master data failed');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success('Booking berhasil dibuat');
                setShowModal(false);
                fetchBookings();
            } else {
                toast.error('Gagal membuat booking');
            }
        } catch {
            toast.error('Terjadi kesalahan');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Booking & Reservasi</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola penyewaan kamar</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 rounded-xl bg-[#00bfa5] text-white font-medium shadow-lg hover:bg-[#00a891] transition-all flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Buat Booking Baru
                </button>
            </div>

            {/* LIST VIEW (Calendar Placeholder) */}
            <div className="bg-[#ecf0f3] rounded-2xl shadow-[9px_9px_16px_#cbced1,-9px_-9px_16px_#ffffff] p-6">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    Booking Aktif
                </h3>

                {loading ? (
                    <div className="flex justify-center p-8"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#00bfa5]" /></div>
                ) : bookings.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Belum ada booking aktif.</p>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(b => (
                            <div key={b.id} className="bg-white/50 p-4 rounded-xl flex justify-between items-center shadow-sm">
                                <div>
                                    <div className="font-bold text-gray-800">{b.customer?.fullName}</div>
                                    <div className="text-sm text-gray-500">
                                        Kamar {b.room?.number} ({b.room?.kost?.name || 'Unknown Kost'})
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-[#00bfa5] bg-teal-50 px-2 py-1 rounded">
                                        {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">{b.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#ecf0f3] rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">Booking Baru</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Pilih Kamar (Tersedia)</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none"
                                    value={formData.roomId}
                                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Pilih Kamar --</option>
                                    {rooms.map(r => <option key={r.id} value={r.id}>{r.number} ({r.kost?.name}) - {r.type?.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Penyewa (Customer)</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none"
                                    value={formData.customerId}
                                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Pilih Customer --</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                                </select>
                                <p className="text-xs text-right mt-1 text-[#00bfa5] cursor-pointer">Tambah Customer Baru +</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-2">Check In</label>
                                    <input type="date" required className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none"
                                        value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-2">Check Out</label>
                                    <input type="date" required className="w-full px-4 py-3 rounded-xl bg-[#ecf0f3] shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] outline-none"
                                        value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                                </div>
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

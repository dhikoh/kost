'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faBed, faCheckCircle, faSpinner, faPhone } from '@fortawesome/free-solid-svg-icons';
import { API_URL } from '@/lib/api';

export default function PublicKostPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [kost, setKost] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) fetchData();
    }, [slug]);

    const fetchData = async () => {
        try {
            const headers = { 'x-api-key': 'DEMO-API-KEY-123' }; // Hardcoded for Demo
            const [resKost, resRooms] = await Promise.all([
                fetch(`${API_URL}/public/${slug}`, { headers }),
                fetch(`${API_URL}/public/${slug}/rooms`, { headers })
            ]);

            if (resKost.ok) setKost(await resKost.json());
            if (resRooms.ok) setRooms(await resRooms.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-[#00bfa5]" /></div>;
    if (!kost) return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500">Kost tidak ditemukan.</div>;

    const mainKost = kost.kosts[0] || { name: kost.name, description: 'Kost Nyaman' };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            {/* Hero Section */}
            <div className="bg-[#00bfa5] text-white py-20 px-6 text-center shadow-lg">
                <h1 className="text-4xl font-bold mb-2">{mainKost.name}</h1>
                <p className="text-lg opacity-90 mb-6 flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> {kost.address || 'Jakarta, Indonesia'}
                </p>
                <div className="flex justify-center gap-4">
                    <a href={`https://wa.me/${kost.phone}`} target="_blank" className="bg-white text-[#00bfa5] px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition">
                        <FontAwesomeIcon icon={faPhone} className="mr-2" /> Hubungi Pemilik
                    </a>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Description */}
                <div className="bg-white rounded-2xl p-8 shadow-sm mb-12 border border-gray-100">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Tentang Kost</h2>
                    <p className="text-gray-600 leading-relaxed">{mainKost.description}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        {kost.roomTypes[0]?.facilities ? JSON.parse(kost.roomTypes[0].facilities).map((fac: string, i: number) => (
                            <span key={i} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-100">
                                <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> {fac}
                            </span>
                        )) : (<span>Fasilitas Lengkap</span>)}
                    </div>
                </div>

                {/* Room List */}
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Kamar Tersedia ({rooms.length})</h2>
                {rooms.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
                        Maaf, semua kamar sedang penuh saat ini.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map(room => (
                            <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition group">
                                <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-[#e0f2f1] transition">
                                    <FontAwesomeIcon icon={faBed} className="text-4xl" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">Kamar {room.roomNumber}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{room.roomType.name}</p>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold">Harga Sewa</p>
                                            <p className="text-lg font-bold text-[#00bfa5]">Rp {Number(room.price).toLocaleString()}<span className="text-xs text-gray-500 font-normal">/bulan</span></p>
                                        </div>
                                        <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-700">
                                            Pesan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 mt-20 py-8 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Modula Kost SaaS.
            </div>
        </div>
    );
}

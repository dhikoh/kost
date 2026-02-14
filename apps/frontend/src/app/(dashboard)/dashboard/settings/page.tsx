'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { updateUserService, updateTenantService } from '@/services/settingsService';
import styles from './settings.module.css'; // Will create this

export default function SettingsPage() {
    const { user, fetchProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'kost'>('profile');
    const [isLoading, setIsLoading] = useState(false);

    // Profile Refs
    const fullNameRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    // Kost Refs
    const kostNameRef = useRef<HTMLInputElement>(null);
    const kostAddressRef = useRef<HTMLInputElement>(null);
    const kostPhoneRef = useRef<HTMLInputElement>(null);
    const kostDescRef = useRef<HTMLTextAreaElement>(null);

    // Initialize values when user loads
    // Note: Better to use controlled inputs or useEffect to set initial values
    // Using simple approach for now, assuming user is loaded

    // --- Update User ---
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data: any = {};
            if (fullNameRef.current?.value) data.fullName = fullNameRef.current.value;
            if (phoneRef.current?.value) data.phone = phoneRef.current.value;
            if (passwordRef.current?.value) data.password = passwordRef.current.value;

            await updateUserService(data);
            toast.success('Profil berhasil diperbarui!');
            if (passwordRef.current) passwordRef.current.value = ''; // Clear password field
            await fetchProfile(); // Refresh context
        } catch (error: any) {
            toast.error(error.message || 'Gagal memperbarui profil');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Update Kost ---
    const handleUpdateKost = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data: any = {};
            if (kostNameRef.current?.value) data.name = kostNameRef.current.value;
            if (kostAddressRef.current?.value) data.address = kostAddressRef.current.value;
            if (kostPhoneRef.current?.value) data.phone = kostPhoneRef.current.value;
            if (kostDescRef.current?.value) data.description = kostDescRef.current.value;

            await updateTenantService(data);
            toast.success('Data Kost berhasil diperbarui!');
            await fetchProfile(); // Refresh context to update header etc if needed
        } catch (error: any) {
            toast.error(error.message || 'Gagal memperbarui data kost');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return <div>Loading...</div>;

    const isOwner = user.roles.some(r => r.role.name === 'OWNER' || r.role.name === 'SUPERADMIN');

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Pengaturan</h1>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 mb-6">
                <button
                    className={`pb-2 px-1 ${activeTab === 'profile' ? 'border-b-2 border-teal-500 font-semibold text-teal-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profil Pengguna
                </button>
                {isOwner && (
                    <button
                        className={`pb-2 px-1 ${activeTab === 'kost' ? 'border-b-2 border-teal-500 font-semibold text-teal-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('kost')}
                    >
                        Data Kost
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">

                {/* 1. USER PROFILE */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <input
                                ref={fullNameRef}
                                type="text"
                                defaultValue={user.fullName}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Tidak dapat diubah)</label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
                            <input
                                ref={phoneRef}
                                type="text"
                                defaultValue={user.phone}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                            />
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ganti Password (Opsional)</label>
                            <input
                                ref={passwordRef}
                                type="password"
                                placeholder="Kosongkan jika tidak ingin mengganti"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                )}

                {/* 2. KOST PROFILE */}
                {activeTab === 'kost' && isOwner && user.tenant && (
                    <form onSubmit={handleUpdateKost} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kost</label>
                            <input
                                ref={kostNameRef}
                                type="text"
                                defaultValue={user.tenant.name}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug URL (Tidak dapat diubah)</label>
                            <input
                                type="text"
                                value={user.tenant.slug}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Link publik: /kost/{user.tenant.slug}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                            <input
                                ref={kostAddressRef}
                                type="text"
                                defaultValue={user.tenant.address}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kontak Kost (WhatsApp)</label>
                            <input
                                ref={kostPhoneRef}
                                type="text"
                                defaultValue={user.tenant.phone}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi & Fasilitas Umum</label>
                            <textarea
                                ref={kostDescRef}
                                rows={4}
                                defaultValue={user.tenant.description || ''}
                                placeholder="Jelaskan keunggulan kost Anda..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Menyimpan...' : 'Update Data Kost'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { BranchProvider } from '@/context/BranchContext';
import { AuthProvider } from '@/context/AuthContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Simple auth check
        /*
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }
        */
        setMounted(true);
    }, [router]);

    if (!mounted) return <div className="min-h-screen bg-[#ecf0f3]" />;

    return (
        <AuthProvider>
            <BranchProvider>
                <div className="flex min-h-screen bg-[#ecf0f3] font-poppins text-gray-700">
                    <Sidebar />

                    <div className="flex-1 flex flex-col lg:ml-64">
                        <Header />
                        <main className="flex-1 mt-20 p-6 overflow-y-auto">
                            {children}
                        </main>
                    </div>
                </div>
            </BranchProvider>
        </AuthProvider>
    );
}

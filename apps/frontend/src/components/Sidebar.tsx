'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faThLarge,
    faBuilding,
    faDoorOpen,
    faUsers,
    faMoneyBillWave,
    faFileInvoiceDollar,
    faSignOutAlt,
    faBed,
    faBars,
    faTimes,
    faCog,
    faUsersCog,
    faLayerGroup,
    faLock
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';

const MENU_ITEMS = [
    { icon: faThLarge, label: 'Dashboard', href: '/dashboard' },
    { icon: faBuilding, label: 'Kost Management', href: '/dashboard/kost' },
    { icon: faBed, label: 'Room Types', href: '/dashboard/room-types' },
    { icon: faDoorOpen, label: 'Rooms', href: '/dashboard/rooms' },
    { icon: faUsers, label: 'Penyewa', href: '/dashboard/tenants' },
    { icon: faMoneyBillWave, label: 'Booking', href: '/dashboard/calendar' },
];

const ADMIN_ITEMS = [
    { icon: faUsersCog, label: 'All Tenants', href: '/dashboard/admin/tenants' },
    { icon: faLayerGroup, label: 'Plans', href: '/dashboard/admin/plans' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();

    // Check plan features
    const allowFinance = user?.plan?.allowFinance ?? false;
    const isSuperAdmin = user?.roles?.includes('SUPERADMIN') ?? false;

    // Build Menu
    const menu = [...MENU_ITEMS];
    if (allowFinance) {
        menu.push({ icon: faFileInvoiceDollar, label: 'Keuangan', href: '/dashboard/invoices' });
    }

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-[60] p-3 rounded-xl bg-[#ecf0f3] text-gray-700 shadow-[3px_3px_6px_#cbced1,-3px_-3px_6px_#ffffff]"
            >
                <FontAwesomeIcon icon={mobileOpen ? faTimes : faBars} className="w-5 h-5" />
            </button>

            {/* Backdrop */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                w-64 h-screen fixed left-0 top-0 flex flex-col p-6 z-50 overflow-y-auto transition-transform duration-300
                bg-[#ecf0f3] shadow-[5px_0_10px_#cbced1]
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#00bfa5] bg-[#ecf0f3] shadow-[3px_3px_6px_#cbced1,-3px_-3px_6px_#ffffff]">
                        <FontAwesomeIcon icon={faBuilding} size="lg" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-wide text-gray-700">KostApp</h1>
                </div>

                {/* Plan Badge */}
                {user?.plan && (
                    <div className="mb-6 px-2">
                        <div className="bg-gradient-to-r from-teal-400 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block shadow-md">
                            {user.plan.name.toUpperCase()} PLAN
                        </div>
                    </div>
                )}

                {/* Menu */}
                <nav className="flex-1">
                    {menu.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                                <div className={`
                                    flex items-center gap-4 px-5 py-3 mb-3 rounded-xl cursor-pointer transition-all duration-300
                                    ${isActive
                                        ? 'text-[#00bfa5] shadow-[inset_3px_3px_6px_#cbced1,inset_-3px_-3px_6px_#ffffff]'
                                        : 'text-gray-500 hover:text-[#00bfa5] hover:shadow-[3px_3px_6px_#cbced1,-3px_-3px_6px_#ffffff]'
                                    }
                                `}>
                                    <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}

                    {/* Locked Menu for Basic Plan */}
                    {!allowFinance && (
                        <div className="flex items-center gap-4 px-5 py-3 mb-3 rounded-xl text-gray-400 cursor-not-allowed opacity-60">
                            <FontAwesomeIcon icon={faLock} className="w-5 h-5" />
                            <span className="font-medium text-sm">Keuangan (Pro)</span>
                        </div>
                    )}

                    {/* SUPERADMIN SECTION */}
                    {isSuperAdmin && (
                        <>
                            <div className="px-5 mt-6 mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Superadmin</span>
                            </div>
                            {ADMIN_ITEMS.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                                        <div className={`
                                             flex items-center gap-4 px-5 py-3 mb-3 rounded-xl cursor-pointer transition-all duration-300
                                             ${isActive
                                                ? 'text-purple-600 shadow-[inset_3px_3px_6px_#cbced1,inset_-3px_-3px_6px_#ffffff]'
                                                : 'text-gray-500 hover:text-purple-600 hover:shadow-[3px_3px_6px_#cbced1,-3px_-3px_6px_#ffffff]'
                                            }
                                         `}>
                                            <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </nav>

                {/* Bottom Actions */}
                <div className="mt-auto border-t border-gray-300 pt-6">
                    <Link href="/dashboard/settings">
                        <div className="flex items-center gap-4 px-5 py-3 mb-3 rounded-xl cursor-pointer text-gray-500 hover:text-[#00bfa5] hover:shadow-[3px_3px_6px_#cbced1,-3px_-3px_6px_#ffffff] transition-all">
                            <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
                            <span className="font-medium text-sm">Settings</span>
                        </div>
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-red-500 shadow-[3px_3px_6px_#cbced1,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] transition-all"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

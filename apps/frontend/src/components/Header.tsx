'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faSearch, faUserCircle } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
    return (
        <header className="fixed top-0 left-0 lg:left-64 right-0 h-20 flex items-center justify-between px-4 lg:px-8 z-40 backdrop-blur-sm bg-[#ecf0f3]/90">

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full h-10 pl-12 pr-4 rounded-full text-sm bg-[#ecf0f3] text-gray-600 shadow-[inset_2px_2px_5px_#cbced1,inset_-2px_-2px_5px_#ffffff] focus:outline-none"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-4">
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-[#00bfa5] bg-[#ecf0f3] shadow-[3px_3px_6px_#cbced1,-3px_-3px_6px_#ffffff] transition-all">
                    <FontAwesomeIcon icon={faBell} />
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-gray-700">Owner Name</div>
                        <div className="text-xs text-gray-500">Tenant Admin</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 shadow-[2px_2px_5px_#cbced1,-2px_-2px_5px_#ffffff]">
                        <FontAwesomeIcon icon={faUserCircle} size="lg" />
                    </div>
                </div>
            </div>
        </header>
    );
}

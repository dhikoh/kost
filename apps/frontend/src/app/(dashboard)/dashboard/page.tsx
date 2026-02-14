export default function DashboardPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat Cards */}
            {[
                { title: 'Total Kamar', value: '12', color: 'text-blue-500' },
                { title: 'Terisi', value: '8', color: 'text-green-500' },
                { title: 'Kosong', value: '4', color: 'text-red-500' },
                { title: 'Pendapatan', value: 'Rp 15jt', color: 'text-[#00bfa5]' },
            ].map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-[#ecf0f3] shadow-[5px_5px_10px_#cbced1,-5px_-5px_10px_#ffffff]">
                    <div className="text-sm text-gray-500 mb-1">{stat.title}</div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                </div>
            ))}

            {/* Main Content Area */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 p-6 rounded-2xl bg-[#ecf0f3] shadow-[5px_5px_10px_#cbced1,-5px_-5px_10px_#ffffff] min-h-[400px]">
                <h3 className="text-lg font-bold mb-4 text-gray-700">Statistik Okupansi</h3>
                <div className="flex items-center justify-center h-64 text-gray-400">
                    Chart Placeholder
                </div>
            </div>

            {/* Side Panel */}
            <div className="col-span-1 p-6 rounded-2xl bg-[#ecf0f3] shadow-[5px_5px_10px_#cbced1,-5px_-5px_10px_#ffffff]">
                <h3 className="text-lg font-bold mb-4 text-gray-700">Aktivitas Terbaru</h3>
                <ul className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                        <li key={i} className="text-sm text-gray-600 pb-2 border-b border-gray-200 last:border-0">
                            User A baru saja booking kamar 101.
                            <div className="text-xs text-gray-400 mt-1">5 menit lalu</div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

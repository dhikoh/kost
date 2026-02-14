'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoiceDollar, faCheckCircle, faClock, faMoneyBillWave, faSpinner, faSearch, faChartLine, faWallet, faArrowDown, faArrowUp, faPlus } from '@fortawesome/free-solid-svg-icons';
import { API_URL, getAuthHeaders } from '@/lib/api';
import { toast } from 'sonner';

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    dueDate: string;
    booking: {
        customer: { fullName: string };
        room: { roomNumber: string };
    };
}

interface Expense {
    id: string;
    title: string;
    amount: number;
    category: string;
    expenseDate: string;
}

interface FinanceSummary {
    revenue: number;
    expense: number;
    profit: number;
}

export default function InvoicePage() {
    const [activeTab, setActiveTab] = useState<'invoices' | 'expenses'>('invoices');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [summary, setSummary] = useState<FinanceSummary>({ revenue: 0, expense: 0, profit: 0 });
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Expense Form State
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: 'Maintenance' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resInv, resExp, resSum] = await Promise.all([
                fetch(`${API_URL}/invoices`, { headers: getAuthHeaders() }),
                fetch(`${API_URL}/finance/expenses`, { headers: getAuthHeaders() }),
                fetch(`${API_URL}/finance/summary`, { headers: getAuthHeaders() })
            ]);

            if (resInv.ok) setInvoices(await resInv.json());
            if (resExp.ok) setExpenses(await resExp.json());
            if (resSum.ok) setSummary(await resSum.json());

        } catch {
            toast.error('Gagal memuat data keuangan');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (id: string, amount: number) => {
        if (!confirm('Konfirmasi pembayaran tunai diterima?')) return;
        setProcessingId(id);
        try {
            const res = await fetch(`${API_URL}/invoices/${id}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ amount, method: 'CASH' })
            });
            if (res.ok) {
                toast.success('Pembayaran Berhasil Dicatat');
                fetchData(); // Refresh all
            }
        } catch { toast.error('Error'); }
        finally { setProcessingId(null); }
    };

    const handleCreateExpense = async () => {
        if (!newExpense.title || !newExpense.amount) return toast.error('Isi semua data');
        try {
            const res = await fetch(`${API_URL}/finance/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ ...newExpense, amount: Number(newExpense.amount) })
            });
            if (res.ok) {
                toast.success('Pengeluaran berhasil dicatat');
                setShowExpenseModal(false);
                setNewExpense({ title: '', amount: '', category: 'Maintenance' });
                fetchData();
            }
        } catch { toast.error('Gagal simpan'); }
    };

    return (
        <div>
            {/* Header & Tabs */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Keuangan Kost</h1>
                    <p className="text-sm text-gray-500">Kelola pemasukan dan pengeluaran</p>
                </div>
                <div className="flex bg-[#ecf0f3] rounded-xl p-1 shadow-inner">
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'invoices' ? 'bg-[#00bfa5] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Tagihan Masuk
                    </button>
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'expenses' ? 'bg-[#00bfa5] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Pengeluaran Operasional
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#ecf0f3] p-5 rounded-2xl shadow-[9px_9px_16px_#cbced1,-9px_-9px_16px_#ffffff] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl">
                        <FontAwesomeIcon icon={faArrowUp} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Pemasukan</p>
                        <p className="text-xl font-bold text-gray-800">Rp {summary.revenue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-[#ecf0f3] p-5 rounded-2xl shadow-[9px_9px_16px_#cbced1,-9px_-9px_16px_#ffffff] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl">
                        <FontAwesomeIcon icon={faArrowDown} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Pengeluaran</p>
                        <p className="text-xl font-bold text-gray-800">Rp {summary.expense.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-[#ecf0f3] p-5 rounded-2xl shadow-[9px_9px_16px_#cbced1,-9px_-9px_16px_#ffffff] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                        <FontAwesomeIcon icon={faWallet} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Profit Bersih</p>
                        <p className="text-xl font-bold text-gray-800">Rp {summary.profit.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-[#ecf0f3] rounded-2xl shadow-[9px_9px_16px_#cbced1,-9px_-9px_16px_#ffffff] overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-64"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-[#00bfa5]" /></div>
                ) : activeTab === 'invoices' ? (
                    // INVOICES TABLE
                    <table className="w-full text-left">
                        <thead className="bg-gray-200/50 text-gray-600 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4">Invoice #</th>
                                <th className="p-4">Penyewa</th>
                                <th className="p-4">Nominal</th>
                                <th className="p-4">Jatuh Tempo</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {invoices.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-gray-500">Kosong</td></tr> :
                                invoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-white/30">
                                        <td className="p-4 font-mono text-sm font-bold text-gray-700">{inv.invoiceNumber}</td>
                                        <td className="p-4">
                                            <div className="font-bold">{inv.booking.customer.fullName}</div>
                                            <div className="text-xs text-gray-500">{inv.booking.room.roomNumber}</div>
                                        </td>
                                        <td className="p-4 font-bold">Rp {Number(inv.amount).toLocaleString()}</td>
                                        <td className="p-4 text-sm">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            {inv.status === 'PAID' ?
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><FontAwesomeIcon icon={faCheckCircle} /> LUNAS</span> :
                                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><FontAwesomeIcon icon={faClock} /> UNPAID</span>
                                            }
                                        </td>
                                        <td className="p-4 text-center">
                                            {inv.status !== 'PAID' && (
                                                <button onClick={() => handlePayment(inv.id, Number(inv.amount))} disabled={processingId === inv.id} className="text-[#00bfa5] hover:underline text-xs font-bold">
                                                    {processingId === inv.id ? 'Processing...' : 'Bayar'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                ) : (
                    // EXPENSES TABLE
                    <div>
                        <div className="p-4 flex justify-end border-b border-gray-200">
                            <button onClick={() => setShowExpenseModal(true)} className="px-4 py-2 bg-red-500 text-white rounded-lg shadow font-bold text-sm hover:bg-red-600 flex items-center gap-2">
                                <FontAwesomeIcon icon={faPlus} /> Catat Pengeluaran
                            </button>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-200/50 text-gray-600 uppercase text-xs font-bold">
                                <tr>
                                    <th className="p-4">Tanggal</th>
                                    <th className="p-4">Judul</th>
                                    <th className="p-4">Kategori</th>
                                    <th className="p-4 text-right">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {expenses.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-gray-500">Belum ada data pengeluaran.</td></tr> :
                                    expenses.map(exp => (
                                        <tr key={exp.id} className="hover:bg-white/30">
                                            <td className="p-4 text-sm text-gray-600">{new Date(exp.expenseDate).toLocaleDateString()}</td>
                                            <td className="p-4 font-bold text-gray-700">{exp.title}</td>
                                            <td className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{exp.category}</td>
                                            <td className="p-4 text-right font-bold text-red-600">- Rp {Number(exp.amount).toLocaleString()}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Expense Modal */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#ecf0f3] p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Catat Pengeluaran</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Judul Pengeluaran</label>
                                <input type="text" className="w-full p-2 rounded-lg bg-[#e6e9ef] shadow-inner outline-none"
                                    value={newExpense.title} onChange={e => setNewExpense({ ...newExpense, title: e.target.value })} placeholder="Contoh: Beli Lampu, Gaji Staff" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Nominal (Rp)</label>
                                <input type="number" className="w-full p-2 rounded-lg bg-[#e6e9ef] shadow-inner outline-none"
                                    value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} placeholder="0" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Kategori</label>
                                <select className="w-full p-2 rounded-lg bg-[#e6e9ef] shadow-inner outline-none"
                                    value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}>
                                    <option value="Maintenance">Maintenance & Perbaikan</option>
                                    <option value="Utilities">Listrik & Air</option>
                                    <option value="Salary">Gaji Staff</option>
                                    <option value="Marketing">Iklan & Pemasaran</option>
                                    <option value="Other">Lain-lain</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowExpenseModal(false)} className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-200 font-bold text-sm">Batal</button>
                            <button onClick={handleCreateExpense} className="px-4 py-2 rounded-lg bg-[#00bfa5] text-white shadow font-bold text-sm hover:bg-[#00a891]">Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

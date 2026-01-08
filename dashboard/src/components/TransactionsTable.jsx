import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, CreditCard, ShoppingBag } from 'lucide-react';

export function TransactionsTable({ transactions }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden shadow-xl"
        >
            <div className="p-6 border-b border-dark-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
                <span className="text-xs text-gray-500 bg-dark-900 px-3 py-1 rounded-full border border-dark-700">
                    Live Updates
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-dark-900/50 text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium">Time</th>
                            <th className="px-6 py-4 font-medium">Order ID</th>
                            <th className="px-6 py-4 font-medium">Details</th>
                            <th className="px-6 py-4 font-medium text-right">Amount</th>
                            <th className="px-6 py-4 font-medium text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    No transactions found today
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx, i) => (
                                <motion.tr
                                    key={tx.idPesanan || i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-dark-700/50 transition-colors group"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {tx.tanggalWaktu}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400 group-hover:text-white transition-colors">
                                        {tx.idPesanan}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        <div className="flex gap-2">
                                            <span className="inline-flex items-center gap-1 bg-dark-900 px-2 py-0.5 rounded text-xs">
                                                <ShoppingBag className="w-3 h-3" /> {tx.tipePesanan || 'Order'}
                                            </span>
                                            <span className="inline-flex items-center gap-1 bg-dark-900 px-2 py-0.5 rounded text-xs">
                                                <CreditCard className="w-3 h-3" /> {tx.tipePembayaran || 'Payment'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white text-right">
                                        {tx.penjualanKotor || `Rp ${tx.jumlah?.toLocaleString('id-ID')}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status?.toLowerCase().includes('settlement') || tx.status?.toLowerCase().includes('berhasil')
                                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                            }`}>
                                            {tx.status || 'Success'}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

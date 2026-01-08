import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, DollarSign, ShoppingCart, RefreshCw } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { TransactionsTable } from './components/TransactionsTable';

function App() {
  const [data, setData] = useState({ transactions: [], totalAmount: 0, totalCount: 0, scrapedAt: null });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/transactions');
      setData(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Format currency
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-green-300 bg-clip-text text-transparent">
              Gobiz Dashboard
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Monitoring
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Last updated</p>
            <p className="text-sm font-mono text-gray-300">{lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Revenue (Today)"
            value={formatRupiah(data.totalAmount || 0)}
            icon={DollarSign}
            className="border-green-500/20"
          />
          <StatsCard
            title="Total Transactions"
            value={data.totalCount || 0}
            icon={ShoppingCart}
          />
          <StatsCard
            title="Average Order Value"
            value={formatRupiah(data.totalCount > 0 ? (data.totalAmount / data.totalCount) : 0)}
            icon={Activity}
          />
        </div>

        {/* Transactions Table */}
        <TransactionsTable transactions={data.transactions || []} />

      </div>
    </div>
  );
}

export default App;

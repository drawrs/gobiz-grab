import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export function StatsCard({ title, value, icon: Icon, trend, className }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "bg-dark-800 p-6 rounded-2xl border border-dark-700 hover:border-primary-500/50 transition-colors shadow-lg",
                className
            )}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
                {Icon && <Icon className="w-5 h-5 text-primary-500" />}
            </div>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white">{value}</span>
                {trend && (
                    <span className={cn("text-xs mb-1", trend > 0 ? "text-green-500" : "text-red-500")}>
                        {trend > 0 ? "+" : ""}{trend}%
                    </span>
                )}
            </div>
        </motion.div>
    );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';

const BreakdownTable = ({ data, type = 'sip' }) => {
    const { t } = useTranslation(); // simplified for now, assuming external translation or transparent keys
    const { formatMoney } = useCurrency();

    if (!data || data.length === 0) return null;

    // Common columns
    // Year | Invested | Interest | Total Value (SIP, Lumpsum)
    // Age | Expense | Balance (Retirement)

    const renderHeader = () => {
        switch (type) {
            case 'retirement':
                return (
                    <tr>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-left text-gray-400 font-medium">Age</th>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-right text-gray-400 font-medium">Expenses</th>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-right text-gray-400 font-medium">Corpus</th>
                    </tr>
                );
            default: // sip, lumpsum
                return (
                    <tr>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-left text-gray-400 font-medium">Year</th>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-right text-gray-400 font-medium">Invested</th>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-right text-gray-400 font-medium">Interest</th>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-right text-gray-400 font-medium">Total Value</th>
                    </tr>
                );
        }
    };

    const renderRows = () => {
        return data.map((row, index) => {
            if (type === 'retirement') {
                return (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-2 py-1 sm:px-4 sm:py-2 text-white">{row.age}</td>
                        <td className="px-2 py-1 sm:px-4 sm:py-2 text-right text-white font-mono">{formatMoney(row.expenses)}</td>
                        <td className="px-2 py-1 sm:px-4 sm:py-2 text-right text-white font-mono">{formatMoney(row.corpus)}</td>
                    </tr>
                );
            }
            return (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-2 py-1 sm:px-4 sm:py-2 text-white">{row.year}</td>
                    <td className="px-2 py-1 sm:px-4 sm:py-2 text-right text-white font-mono">{formatMoney(row.invested)}</td>
                    <td className="px-2 py-1 sm:px-4 sm:py-2 text-right text-white font-mono">{formatMoney(row.interest)}</td>
                    <td className="px-2 py-1 sm:px-4 sm:py-2 text-right text-white font-mono">{formatMoney(row.total)}</td>
                </tr>
            );
        });
    };

    return (
        <div className="w-full mt-6 overflow-hidden rounded-xl border border-white/10 bg-black/20">
            <div className="overflow-x-auto max-h-[350px] sm:max-h-[450px] lg:max-h-[600px] overflow-y-auto no-scrollbar">
                <table className="w-full text-xs sm:text-sm">
                    <thead className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/10">
                        {renderHeader()}
                    </thead>
                    <tbody>
                        {renderRows()}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BreakdownTable;

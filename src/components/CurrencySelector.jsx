import React from "react";
import { CircleDollarSign } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export default function CurrencySelector() {
    const { currencyCode, setCurrencyCode, currencies } = useCurrency();

    const currentCurrency = currencies.find(c => c.code === currencyCode) || currencies[0];

    return (
        <div className="relative">
            <Select value={currencyCode} onValueChange={setCurrencyCode}>
                <SelectTrigger className="w-auto min-w-[140px] rounded-2xl glass border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 text-white">
                    <div className="flex items-center gap-2">
                        <CircleDollarSign className="h-4 w-4 text-green-400" />
                        <span className="text-lg">{currentCurrency.symbol}</span>
                        <span className="text-sm font-medium">{currentCurrency.code}</span>
                    </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl bg-gray-900/95 backdrop-blur-sm border-white/10">
                    {currencies.map((c) => (
                        <SelectItem
                            key={c.code}
                            value={c.code}
                            className="flex items-center gap-2 text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2"
                        >
                            <div className="flex items-center gap-2 w-full">
                                <span className="text-lg">{c.symbol}</span>
                                <span className="text-sm font-medium">{c.code}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

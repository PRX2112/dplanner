import React, { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export const currencies = [
  { code: "INR", symbol: "₹", locale: "en-IN" },
  { code: "USD", symbol: "$", locale: "en-US" },
  { code: "EUR", symbol: "€", locale: "de-DE" },
  { code: "GBP", symbol: "£", locale: "en-GB" },
  { code: "JPY", symbol: "¥", locale: "ja-JP" },
  { code: "AED", symbol: "AED", locale: "en-AE" },
];

export const CurrencyProvider = ({ children }) => {
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem("app_currency") || "INR";
  });

  useEffect(() => {
    localStorage.setItem("app_currency", currencyCode);
  }, [currencyCode]);

  const activeCurrency = currencies.find((c) => c.code === currencyCode) || currencies[0];

  const formatMoney = (value) => {
    if (!isFinite(value)) return activeCurrency.symbol + "0";
    return new Intl.NumberFormat(activeCurrency.locale, {
      style: "currency",
      currency: activeCurrency.code,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const value = {
    currencyCode,
    setCurrencyCode,
    activeCurrency,
    formatMoney,
    currencies,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

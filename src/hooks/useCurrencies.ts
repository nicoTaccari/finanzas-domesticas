// src/hooks/useCurrencies.ts - VERSIÓN CORREGIDA
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type {
  Currency,
  ExchangeRate,
  HouseholdCurrency,
} from "../types/currency";

export const useCurrencies = (householdId: string | null) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [householdCurrencies, setHouseholdCurrencies] = useState<
    HouseholdCurrency[]
  >([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (householdId) {
      fetchHouseholdCurrencies();
      fetchExchangeRates();
    }
  }, [householdId]);

  const fetchCurrencies = async () => {
    try {
      const { data, error } = await supabase
        .from("currencies")
        .select("*")
        .eq("is_active", true)
        .order("id");

      if (error) throw error;
      setCurrencies(data || []);
    } catch (err) {
      console.error("Error fetching currencies:", err);
      setError(
        err instanceof Error ? err.message : "Error fetching currencies"
      );
    }
  };

  const fetchHouseholdCurrencies = async () => {
    try {
      const { data, error } = await supabase
        .from("household_currencies")
        .select(
          `
          *,
          currency:currencies(*)
        `
        )
        .eq("household_id", householdId)
        .order("display_order");

      if (error) throw error;
      setHouseholdCurrencies(data || []);
    } catch (err) {
      console.error("Error fetching household currencies:", err);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);

      // CAMBIO CLAVE: No hacer join con currencies para evitar objetos anidados problemáticos
      const { data, error } = await supabase
        .from("exchange_rates")
        .select("*")
        .eq("household_id", householdId)
        .eq("is_active", true)
        .order("valid_from", { ascending: false });

      if (error) throw error;

      // Mapear y agregar información de currencies de forma segura
      const ratesWithCurrencyInfo = (data || []).map((rate) => ({
        ...rate,
        from_currency_info: currencies.find((c) => c.id === rate.from_currency),
        to_currency_info: currencies.find((c) => c.id === rate.to_currency),
      }));

      setExchangeRates(ratesWithCurrencyInfo);
    } catch (err) {
      console.error("Error fetching exchange rates:", err);
      setError(
        err instanceof Error ? err.message : "Error fetching exchange rates"
      );
    } finally {
      setLoading(false);
    }
  };

  const addExchangeRate = async (rateData: {
    from_currency: string;
    to_currency: string;
    rate: number;
    rate_type: string;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("exchange_rates")
        .insert([
          {
            ...rateData,
            household_id: householdId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Refetch para obtener datos actualizados
      await fetchExchangeRates();

      return { success: true, data };
    } catch (err) {
      console.error("Error adding exchange rate:", err);
      return {
        success: false,
        error:
          err instanceof Error ? err.message : "Error adding exchange rate",
      };
    }
  };

  const getLatestRate = (
    fromCurrency: string,
    toCurrency: string,
    rateType: string = "manual"
  ) => {
    if (fromCurrency === toCurrency) return 1;

    const rate = exchangeRates.find(
      (r) =>
        r.from_currency === fromCurrency &&
        r.to_currency === toCurrency &&
        r.rate_type === rateType
    );

    if (rate) return rate.rate;

    // Buscar tasa inversa
    const inverseRate = exchangeRates.find(
      (r) =>
        r.from_currency === toCurrency &&
        r.to_currency === fromCurrency &&
        r.rate_type === rateType
    );

    return inverseRate ? 1 / inverseRate.rate : 1;
  };

  const convertAmount = (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rateType: string = "manual"
  ) => {
    if (fromCurrency === toCurrency) return amount;
    const rate = getLatestRate(fromCurrency, toCurrency, rateType);
    return amount * rate;
  };

  const formatAmount = (amount: number, currencyId: string) => {
    const currency = currencies.find((c) => c.id === currencyId);
    if (!currency) return amount.toString();

    return `${currency.symbol}${amount.toLocaleString("es-AR", {
      minimumFractionDigits: currency.decimal_places,
      maximumFractionDigits: currency.decimal_places,
    })}`;
  };

  const getPrimaryCurrency = () => {
    const primary = householdCurrencies.find((hc) => hc.is_primary);
    return primary?.currency_id || "ARS";
  };

  const getCurrencyInfo = (currencyId: string) => {
    return currencies.find((c) => c.id === currencyId);
  };

  return {
    currencies,
    householdCurrencies,
    exchangeRates,
    loading,
    error,
    addExchangeRate,
    getLatestRate,
    convertAmount,
    formatAmount,
    getPrimaryCurrency,
    getCurrencyInfo,
    refetch: () => {
      fetchCurrencies();
      fetchHouseholdCurrencies();
      fetchExchangeRates();
    },
  };
};

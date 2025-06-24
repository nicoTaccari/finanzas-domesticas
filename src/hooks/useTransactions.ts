import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Transaction } from "../lib/supabase";

export const useTransactions = (householdId: string | null) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!householdId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    fetchTransactions();
    // Comentamos las suscripciones por ahora para evitar problemas
    // subscribeToTransactions()
  }, [householdId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching transactions for household:", householdId);

      const { data, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("household_id", householdId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching transactions:", fetchError);
        throw fetchError;
      }

      console.log("Fetched transactions:", data);
      setTransactions(data || []);
    } catch (err) {
      console.error("Error in fetchTransactions:", err);
      setError(
        err instanceof Error ? err.message : "Error fetching transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (
    transactionData: Omit<
      Transaction,
      "id" | "user_id" | "created_at" | "updated_at"
    >
  ) => {
    try {
      console.log("Adding transaction:", transactionData);

      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            ...transactionData,
            household_id: householdId,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding transaction:", error);
        throw error;
      }

      console.log("Added transaction:", data);

      // Actualizar la lista localmente
      setTransactions((prev) => [data, ...prev]);

      return { success: true, data };
    } catch (err) {
      console.error("Error in addTransaction:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error adding transaction",
      };
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      console.log("Deleting transaction:", id);

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting transaction:", error);
        throw error;
      }

      console.log("Deleted transaction:", id);

      // Actualizar la lista localmente
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      return { success: true };
    } catch (err) {
      console.error("Error in deleteTransaction:", err);
      return {
        success: false,
        error:
          err instanceof Error ? err.message : "Error deleting transaction",
      };
    }
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
};

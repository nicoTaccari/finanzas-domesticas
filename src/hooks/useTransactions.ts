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
      console.log("Attempting to delete transaction with ID:", id);

      // Verificar que el ID es válido
      if (!id || isNaN(id)) {
        throw new Error("ID de transacción inválido");
      }

      // Primero verificar que la transacción existe y pertenece al usuario
      const { data: existingTransaction, error: checkError } = await supabase
        .from("transactions")
        .select("id, user_id, household_id")
        .eq("id", id)
        .single();

      if (checkError) {
        console.error("Error checking transaction:", checkError);
        throw new Error("No se pudo verificar la transacción");
      }

      if (!existingTransaction) {
        throw new Error("Transacción no encontrada");
      }

      console.log("Transaction to delete:", existingTransaction);

      // Eliminar la transacción
      const { error: deleteError, data: deletedData } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .select(); // Agregar select para ver qué se eliminó

      if (deleteError) {
        console.error("Error deleting transaction:", deleteError);
        throw deleteError;
      }

      console.log("Deleted transaction data:", deletedData);

      // Verificar que realmente se eliminó
      if (!deletedData || deletedData.length === 0) {
        console.warn("No rows were deleted, checking policies...");

        // Intentar con match más específico incluyendo user_id
        const { data: currentUser } = await supabase.auth.getUser();
        if (currentUser.user) {
          const { error: deleteError2 } = await supabase
            .from("transactions")
            .delete()
            .eq("id", id)
            .eq("user_id", currentUser.user.id);

          if (deleteError2) {
            console.error("Error with user-specific delete:", deleteError2);
            throw new Error(
              "No tienes permisos para eliminar esta transacción"
            );
          }
        }
      }

      console.log("Successfully deleted transaction:", id);

      // Actualizar la lista localmente removiendo la transacción
      setTransactions((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        console.log("Updated transactions after delete:", updated.length);
        return updated;
      });

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

  // Función para refrescar transacciones después de operaciones
  const refreshTransactions = async () => {
    console.log("Refreshing transactions...");
    await fetchTransactions();
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
    refresh: refreshTransactions,
  };
};

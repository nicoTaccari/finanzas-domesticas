import React from "react";
import styled from "@emotion/styled";
import { Trash2, Calendar } from "lucide-react";
import type { Transaction } from "../lib/supabase";

const ListContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f8fafc;
    margin: 0 -16px;
    padding: 16px;
    border-radius: 12px;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TransactionInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TransactionDescription = styled.div`
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
`;

const TransactionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: #718096;
`;

const TransactionCategory = styled.span`
  background: #edf2f7;
  color: #4a5568;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const TransactionAmount = styled.div<{ type: Transaction["type"] }>`
  font-weight: 700;
  font-size: 1.1rem;
  margin-right: 12px;

  ${({ type }) => {
    switch (type) {
      case "income":
        return "color: #48bb78;";
      case "expense":
        return "color: #f56565;";
      case "investment":
        return "color: #4299e1;";
      case "saving":
        return "color: #ed8936;";
    }
  }}
`;

const DeleteButton = styled.button<{ deleting?: boolean }>`
  background: none;
  border: none;
  color: ${(props) => (props.deleting ? "#f56565" : "#cbd5e0")};
  cursor: ${(props) => (props.deleting ? "not-allowed" : "pointer")};
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  opacity: ${(props) => (props.deleting ? 0.6 : 1)};

  &:hover:not(:disabled) {
    color: #f56565;
    background: #fed7d7;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #718096;
  padding: 40px 20px;
  font-size: 1rem;
`;

const DebugInfo = styled.div`
  font-size: 0.7rem;
  color: #a0aec0;
  margin-left: 8px;
`;

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: number) => Promise<void>;
  loading?: boolean;
  showDebug?: boolean; // Para debugging
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
  loading = false,
  showDebug = false,
}) => {
  const [deletingIds, setDeletingIds] = React.useState<Set<number>>(new Set());

  if (transactions.length === 0) {
    return (
      <EmptyState>
        {loading ? (
          "Cargando transacciones..."
        ) : (
          <>
            No hay transacciones registradas aún.
            <br />
            ¡Comienza agregando tu primera transacción!
          </>
        )}
      </EmptyState>
    );
  }

  const typeLabels = {
    income: "Ingreso",
    expense: "Gasto",
    investment: "Inversión",
    saving: "Ahorro",
  };

  const formatAmount = (
    amount: number,
    type: Transaction["type"],
    currency?: string
  ) => {
    const sign = type === "expense" ? "-" : "+";
    const currencySymbol = currency === "USD" ? "US$" : "$";
    return `${sign}${currencySymbol}${amount.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;
  };

  const handleDelete = async (id: number) => {
    if (!id) {
      console.error("No ID provided for deletion");
      return;
    }

    console.log("Delete button clicked for ID:", id);

    if (deletingIds.has(id)) {
      console.log("Already deleting this transaction");
      return;
    }

    if (!confirm("¿Estás seguro de que quieres eliminar esta transacción?")) {
      return;
    }

    try {
      setDeletingIds((prev) => new Set(prev).add(id));
      console.log("Starting deletion process for ID:", id);

      await onDeleteTransaction(id);

      console.log("Deletion completed for ID:", id);
    } catch (error) {
      console.error("Error in handleDelete:", error);
      alert("Error al eliminar la transacción");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  return (
    <ListContainer>
      {showDebug && (
        <DebugInfo>
          Total transacciones: {transactions.length} | Loading:{" "}
          {loading ? "Yes" : "No"}
        </DebugInfo>
      )}

      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id}>
          <TransactionInfo>
            <TransactionDescription>
              {transaction.description}
              {showDebug && (
                <DebugInfo>
                  ID: {transaction.id} | User: {transaction.user_id}
                </DebugInfo>
              )}
            </TransactionDescription>
            <TransactionMeta>
              <TransactionCategory>
                {typeLabels[transaction.type]} • {transaction.category}
              </TransactionCategory>
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Calendar size={12} />
                {new Date(transaction.date).toLocaleDateString("es-AR")}
              </span>
              {transaction.currency_id && transaction.currency_id !== "ARS" && (
                <span>{transaction.currency_id}</span>
              )}
            </TransactionMeta>
          </TransactionInfo>
          <TransactionAmount type={transaction.type}>
            {formatAmount(
              transaction.amount,
              transaction.type,
              transaction.currency_id
            )}
          </TransactionAmount>
          <DeleteButton
            onClick={() => handleDelete(transaction.id!)}
            title="Eliminar transacción"
            deleting={deletingIds.has(transaction.id!)}
            disabled={deletingIds.has(transaction.id!) || !transaction.id}
          >
            <Trash2 size={16} />
          </DeleteButton>
        </TransactionItem>
      ))}
    </ListContainer>
  );
};

export default TransactionList;

import React from "react";
import styled from "@emotion/styled";
import { Trash2, Calendar } from "lucide-react";
import type { Transaction } from "./FinanceApp";

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

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #cbd5e0;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    color: #f56565;
    background: #fed7d7;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #718096;
  padding: 40px 20px;
  font-size: 1rem;
`;

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: number) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
}) => {
  if (transactions.length === 0) {
    return (
      <EmptyState>
        No hay transacciones registradas aún.
        <br />
        ¡Comienza agregando tu primera transacción!
      </EmptyState>
    );
  }

  const typeLabels = {
    income: "Ingreso",
    expense: "Gasto",
    investment: "Inversión",
    saving: "Ahorro",
  };

  const formatAmount = (amount: number, type: Transaction["type"]) => {
    const sign = type === "expense" ? "-" : "+";
    return `${sign}$${amount.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;
  };

  return (
    <ListContainer>
      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id}>
          <TransactionInfo>
            <TransactionDescription>
              {transaction.description}
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
            </TransactionMeta>
          </TransactionInfo>
          <TransactionAmount type={transaction.type}>
            {formatAmount(transaction.amount, transaction.type)}
          </TransactionAmount>
          <DeleteButton
            onClick={() => onDeleteTransaction(transaction.id)}
            title="Eliminar transacción"
          >
            <Trash2 size={16} />
          </DeleteButton>
        </TransactionItem>
      ))}
    </ListContainer>
  );
};

export default TransactionList;

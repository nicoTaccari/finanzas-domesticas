import React from "react";
import styled from "@emotion/styled";
import { TrendingUp, TrendingDown, PiggyBank, Target } from "lucide-react";
import { useCurrencies } from "../hooks/useCurrencies";
import type { Transaction } from "../lib/supabase";

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  padding: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 24px;
  }
`;

const BalanceCard = styled.div<{
  variant: "income" | "expense" | "investment" | "saving";
}>`
  padding: 32px;
  border-radius: 18px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${({ variant }) => {
    switch (variant) {
      case "income":
        return `
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          box-shadow: 0 16px 32px rgba(72, 187, 120, 0.3);
        `;
      case "expense":
        return `
          background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
          box-shadow: 0 16px 32px rgba(245, 101, 101, 0.3);
        `;
      case "investment":
        return `
          background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
          box-shadow: 0 16px 32px rgba(66, 153, 225, 0.3);
        `;
      case "saving":
        return `
          background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
          box-shadow: 0 16px 32px rgba(237, 137, 54, 0.3);
        `;
    }
  }}

  &:hover {
    transform: translateY(-6px) scale(1.02);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
`;

const CardIcon = styled.div`
  position: relative;
  z-index: 1;
  margin-bottom: 16px;
`;

const Amount = styled.div`
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const SecondaryAmount = styled.div`
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
`;

const Label = styled.div`
  opacity: 0.95;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
  position: relative;
  z-index: 1;
`;

interface BalanceCardsProps {
  transactions: Transaction[];
  householdId: string;
}

const BalanceCards: React.FC<BalanceCardsProps> = ({
  transactions,
  householdId,
}) => {
  const { formatAmount, getPrimaryCurrency, convertAmount } =
    useCurrencies(householdId);

  const primaryCurrency = getPrimaryCurrency();

  // Calcular totales por tipo en moneda primaria
  const totals = transactions.reduce(
    (acc, transaction) => {
      // Convertir a moneda primaria si es necesario
      const amountInPrimary =
        transaction.currency_id === primaryCurrency
          ? transaction.amount
          : convertAmount(
              transaction.amount,
              transaction.currency_id ?? primaryCurrency,
              primaryCurrency
            );

      acc[transaction.type] += amountInPrimary;
      return acc;
    },
    { income: 0, expense: 0, investment: 0, saving: 0 }
  );

  // Calcular totales en USD para referencia
  const totalsUSD = transactions.reduce(
    (acc, transaction) => {
      const amountUSD =
        transaction.amount_usd ||
        convertAmount(
          transaction.amount,
          transaction.currency_id ?? primaryCurrency,
          "USD"
        );
      acc[transaction.type] += amountUSD;
      return acc;
    },
    { income: 0, expense: 0, investment: 0, saving: 0 }
  );

  const cardData = [
    {
      variant: "income" as const,
      icon: <TrendingUp size={32} />,
      amount: totals.income,
      amountUSD: totalsUSD.income,
      label: "Ingresos",
    },
    {
      variant: "expense" as const,
      icon: <TrendingDown size={32} />,
      amount: totals.expense,
      amountUSD: totalsUSD.expense,
      label: "Gastos",
    },
    {
      variant: "investment" as const,
      icon: <PiggyBank size={32} />,
      amount: totals.investment,
      amountUSD: totalsUSD.investment,
      label: "Inversiones",
    },
    {
      variant: "saving" as const,
      icon: <Target size={32} />,
      amount: totals.saving,
      amountUSD: totalsUSD.saving,
      label: "Ahorros",
    },
  ];

  return (
    <CardsContainer>
      {cardData.map((card) => (
        <BalanceCard key={card.variant} variant={card.variant}>
          <CardIcon>{card.icon}</CardIcon>
          <Amount>{formatAmount(card.amount, primaryCurrency)}</Amount>
          {primaryCurrency !== "USD" && (
            <SecondaryAmount>
              ≈ {formatAmount(card.amountUSD, "USD")}
            </SecondaryAmount>
          )}
          <Label>{card.label}</Label>
        </BalanceCard>
      ))}
    </CardsContainer>
  );
};

export default BalanceCards;

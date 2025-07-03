import React from "react";
import styled from "@emotion/styled";
import { DollarSign } from "lucide-react";
import type { Currency } from "../types/currency";

const Select = styled.select`
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fafafa;
  cursor: pointer;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: white;
  }
`;

interface CurrencySelectorProps {
  currencies: Currency[];
  value: string;
  onChange: (currencyId: string) => void;
  className?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currencies,
  value,
  onChange,
  className,
}) => {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {currencies.map((currency) => (
        <option key={currency.id} value={currency.id}>
          {currency.symbol} {currency.name}
        </option>
      ))}
    </Select>
  );
};

export default CurrencySelector;

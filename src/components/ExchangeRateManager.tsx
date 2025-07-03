// src/components/ExchangeRateManager.tsx - VERSIÓN CORREGIDA
import React, { useState } from "react";
import styled from "@emotion/styled";
import {
  TrendingUp,
  Plus,
  Calculator as CalculatorIcon,
  Clock,
} from "lucide-react";
import { useCurrencies } from "../hooks/useCurrencies";
import CurrencySelector from "./CurrencySelector";

const Container = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  color: #1a202c;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  margin-left: auto;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr 120px 1fr auto;
  gap: 12px;
  align-items: end;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  color: #4a5568;
  font-weight: 600;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Select = styled.select`
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SubmitButton = styled.button`
  background: #48bb78;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #38a169;
  }
`;

const RatesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RateItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const RateInfo = styled.div`
  flex: 1;
`;

const RatePair = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
`;

const RateDetails = styled.div`
  font-size: 0.85rem;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RateValue = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #48bb78;
`;

const RateType = styled.span<{ type: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;

  ${({ type }) => {
    switch (type) {
      case "oficial":
        return "background: #bee3f8; color: #2b6cb0;";
      case "blue":
        return "background: #c6f6d5; color: #276749;";
      case "mep":
        return "background: #feebc8; color: #c05621;";
      case "manual":
        return "background: #e2e8f0; color: #4a5568;";
      default:
        return "background: #fed7d7; color: #c53030;";
    }
  }}
`;

const CalculatorSection = styled.div`
  background: #f0f4ff;
  border: 2px solid #e5edff;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
`;

const CalculatorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  gap: 12px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const CalculatorResult = styled.div`
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #667eea;
  grid-column: 1 / -1;
  margin-top: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #718096;
  padding: 40px 20px;
  font-size: 1rem;
`;

interface ExchangeRateManagerProps {
  householdId: string;
}

const ExchangeRateManager: React.FC<ExchangeRateManagerProps> = ({
  householdId,
}) => {
  const {
    currencies,
    exchangeRates,
    loading,
    addExchangeRate,
    getLatestRate,
    convertAmount,
    formatAmount,
    getCurrencyInfo,
  } = useCurrencies(householdId);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    from_currency: "USD",
    to_currency: "ARS",
    rate: "",
    rate_type: "manual",
    notes: "",
  });

  // Calculator state
  const [calcAmount, setCalcAmount] = useState("100");
  const [calcFrom, setCalcFrom] = useState("USD");
  const [calcTo, setCalcTo] = useState("ARS");
  const [calcType, setCalcType] = useState("manual");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      alert("Por favor ingresa una tasa válida");
      return;
    }

    const result = await addExchangeRate({
      ...formData,
      rate: parseFloat(formData.rate),
    });

    if (result.success) {
      setFormData({
        from_currency: "USD",
        to_currency: "ARS",
        rate: "",
        rate_type: "manual",
        notes: "",
      });
      setShowForm(false);
    } else {
      alert(result.error || "Error al agregar tipo de cambio");
    }
  };

  const calculatedAmount = convertAmount(
    parseFloat(calcAmount) || 0,
    calcFrom,
    calcTo,
    calcType
  );

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: "center", padding: "40px", color: "#718096" }}>
          Cargando tipos de cambio...
        </div>
      </Container>
    );
  }

  // Función auxiliar para obtener el nombre de la moneda de forma segura
  const getCurrencyName = (currencyId: string) => {
    const currency = getCurrencyInfo(currencyId);
    return currency ? `${currency.symbol} ${currency.name}` : currencyId;
  };

  return (
    <Container>
      <Header>
        <Title>
          <TrendingUp size={24} />
          Tipos de Cambio
        </Title>
        <AddButton onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          {showForm ? "Cancelar" : "Agregar"}
        </AddButton>
      </Header>

      {showForm && (
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>De:</Label>
            <CurrencySelector
              currencies={currencies}
              value={formData.from_currency}
              onChange={(value) =>
                setFormData({ ...formData, from_currency: value })
              }
            />
          </FormGroup>

          <FormGroup>
            <Label>A:</Label>
            <CurrencySelector
              currencies={currencies}
              value={formData.to_currency}
              onChange={(value) =>
                setFormData({ ...formData, to_currency: value })
              }
            />
          </FormGroup>

          <FormGroup>
            <Label>Tasa:</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="1000.00"
              value={formData.rate}
              onChange={(e) =>
                setFormData({ ...formData, rate: e.target.value })
              }
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Tipo:</Label>
            <Select
              value={formData.rate_type}
              onChange={(e) =>
                setFormData({ ...formData, rate_type: e.target.value })
              }
            >
              <option value="manual">Manual</option>
              <option value="oficial">Oficial</option>
              <option value="blue">Blue</option>
              <option value="mep">MEP</option>
              <option value="ccl">CCL</option>
              <option value="cripto">Cripto</option>
            </Select>
          </FormGroup>

          <SubmitButton type="submit">Guardar</SubmitButton>
        </Form>
      )}

      <CalculatorSection>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          <CalculatorIcon size={20} style={{ color: "#667eea" }} />
          <span style={{ fontWeight: "600", color: "#667eea" }}>
            Calculadora
          </span>
        </div>

        <CalculatorGrid>
          <Input
            type="number"
            value={calcAmount}
            onChange={(e) => setCalcAmount(e.target.value)}
            placeholder="100"
          />

          <CurrencySelector
            currencies={currencies}
            value={calcFrom}
            onChange={setCalcFrom}
          />

          <span style={{ textAlign: "center", fontWeight: "600" }}>→</span>

          <CurrencySelector
            currencies={currencies}
            value={calcTo}
            onChange={setCalcTo}
          />

          <Select
            value={calcType}
            onChange={(e) => setCalcType(e.target.value)}
          >
            <option value="manual">Manual</option>
            <option value="oficial">Oficial</option>
            <option value="blue">Blue</option>
            <option value="mep">MEP</option>
            <option value="ccl">CCL</option>
            <option value="cripto">Cripto</option>
          </Select>

          <CalculatorResult>
            = {formatAmount(calculatedAmount, calcTo)}
          </CalculatorResult>
        </CalculatorGrid>
      </CalculatorSection>

      {exchangeRates.length === 0 ? (
        <EmptyState>
          No hay tipos de cambio configurados aún.
          <br />
          ¡Agrega tu primer tipo de cambio!
        </EmptyState>
      ) : (
        <RatesList>
          {exchangeRates.map((rate) => (
            <RateItem key={rate.id}>
              <RateInfo>
                <RatePair>
                  {getCurrencyName(rate.from_currency)} →{" "}
                  {getCurrencyName(rate.to_currency)}
                </RatePair>
                <RateDetails>
                  <RateType type={rate.rate_type}>{rate.rate_type}</RateType>
                  <Clock size={12} />
                  {new Date(rate.valid_from).toLocaleDateString("es-AR")}
                  {rate.notes && <span>• {rate.notes}</span>}
                </RateDetails>
              </RateInfo>
              <RateValue>
                {rate.rate.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </RateValue>
            </RateItem>
          ))}
        </RatesList>
      )}
    </Container>
  );
};

export default ExchangeRateManager;

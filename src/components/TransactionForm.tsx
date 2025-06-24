import React, { useState } from "react";
import styled from "@emotion/styled";
import type { Transaction } from "./FinanceApp";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: #4a5568;
  font-weight: 600;
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fafafa;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: white;
  }
`;

const Select = styled.select`
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fafafa;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: white;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onAddTransaction,
}) => {
  const [formData, setFormData] = useState({
    type: "income" as Transaction["type"],
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  const categoryOptions = {
    income: [
      { value: "trabajo", label: "Trabajo" },
      { value: "freelance", label: "Freelance" },
      { value: "negocio", label: "Negocio" },
      { value: "otros", label: "Otros" },
    ],
    expense: [
      { value: "alimentacion", label: "Alimentación" },
      { value: "transporte", label: "Transporte" },
      { value: "entretenimiento", label: "Entretenimiento" },
      { value: "servicios", label: "Servicios" },
      { value: "salud", label: "Salud" },
      { value: "otros", label: "Otros" },
    ],
    investment: [
      { value: "acciones", label: "Acciones" },
      { value: "criptomonedas", label: "Criptomonedas" },
      { value: "fondos", label: "Fondos" },
      { value: "inmuebles", label: "Inmuebles" },
      { value: "otros", label: "Otros" },
    ],
    saving: [
      { value: "emergencia", label: "Emergencia" },
      { value: "vacaciones", label: "Vacaciones" },
      { value: "jubilacion", label: "Jubilación" },
      { value: "objetivos", label: "Objetivos" },
      { value: "otros", label: "Otros" },
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.description || !formData.category) {
      alert("Por favor completa todos los campos");
      return;
    }

    onAddTransaction({
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      date: formData.date,
    });

    // Reset form
    setFormData({
      type: "income",
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleTypeChange = (type: Transaction["type"]) => {
    setFormData({ ...formData, type, category: "" });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label>Tipo</Label>
        <Select
          value={formData.type}
          onChange={(e) =>
            handleTypeChange(e.target.value as Transaction["type"])
          }
        >
          <option value="income">Ingreso</option>
          <option value="expense">Gasto</option>
          <option value="investment">Inversión</option>
          <option value="saving">Ahorro</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>Cantidad</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </FormGroup>

      <FormGroup>
        <Label>Descripción</Label>
        <Input
          type="text"
          placeholder="Ej: Salario, Supermercado, Acciones..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </FormGroup>

      <FormGroup>
        <Label>Categoría</Label>
        <Select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
        >
          <option value="">Selecciona una categoría</option>
          {categoryOptions[formData.type].map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>Fecha</Label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </FormGroup>

      <SubmitButton type="submit">Agregar Transacción</SubmitButton>
    </Form>
  );
};

export default TransactionForm;

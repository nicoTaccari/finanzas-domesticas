import React from "react";
import styled from "@emotion/styled";
import { ChevronDown, Users } from "lucide-react";
import type { Household } from "../lib/supabase";

const SelectorContainer = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 20px;
`;

const SelectorButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  min-width: 200px;
  justify-content: space-between;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const DropdownContent = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  margin-top: 4px;
  overflow: hidden;
  transform: ${(props) =>
    props.isOpen ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.95)"};
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  transition: all 0.2s ease;
`;

const DropdownItem = styled.button<{ isSelected?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: ${(props) => (props.isSelected ? "#f7fafc" : "white")};
  color: #2d3748;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;

  &:hover {
    background: #f1f5f9;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #e2e8f0;
  }
`;

interface HouseholdSelectorProps {
  households: Household[];
  currentHousehold: Household | null;
  onSelectHousehold: (household: Household) => void;
}

const HouseholdSelector: React.FC<HouseholdSelectorProps> = ({
  households,
  currentHousehold,
  onSelectHousehold,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (household: Household) => {
    onSelectHousehold(household);
    setIsOpen(false);
  };

  return (
    <SelectorContainer>
      <SelectorButton onClick={() => setIsOpen(!isOpen)}>
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={16} />
          {currentHousehold?.name || "Seleccionar hogar"}
        </span>
        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </SelectorButton>

      <DropdownContent isOpen={isOpen}>
        {households.map((household) => (
          <DropdownItem
            key={household.id}
            isSelected={household.id === currentHousehold?.id}
            onClick={() => handleSelect(household)}
          >
            <Users size={14} />
            {household.name}
          </DropdownItem>
        ))}
      </DropdownContent>
    </SelectorContainer>
  );
};

export default HouseholdSelector;

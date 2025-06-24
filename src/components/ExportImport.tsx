import React, { useRef } from "react";
import styled from "@emotion/styled";
import { Download, Upload } from "lucide-react";

const ButtonContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    color: #667eea;
    background: #f8fafc;
    transform: translateY(-2px);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

interface ExportImportProps {
  onExport: () => void;
  onImport: (csvContent: string) => void;
}

const ExportImport: React.FC<ExportImportProps> = ({ onExport, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target?.result as string;
      onImport(csvContent);
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <ButtonContainer>
      <ActionButton onClick={onExport}>
        <Download size={20} />
        Exportar a CSV
      </ActionButton>

      <ActionButton onClick={handleImportClick}>
        <Upload size={20} />
        Importar desde CSV
      </ActionButton>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />
    </ButtonContainer>
  );
};

export default ExportImport;

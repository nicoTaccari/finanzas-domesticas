import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Download,
  Upload,
  Wallet,
  Users,
  Home,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useHousehold } from "../hooks/useHousehold";
import { useTransactions } from "../hooks/useTransactions";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import BalanceCards from "./BalanceCards";
import ExportImport from "./ExportImport";
import AuthForm from "./AuthForm";
import HouseholdSelector from "./HouseholdSelector";
import LoadingSpinner from "./LoadingSpinner";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
`;

const AppCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Header = styled.header`
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  color: white;
  padding: 40px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  font-weight: 300;
`;

const UserInfo = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 8px;
`;

const Dashboard = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 768px) {
    padding: 24px;
    gap: 24px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
  }
`;

const CardTitle = styled.h3`
  color: #1a202c;
  margin-bottom: 24px;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  color: #c53030;
  padding: 16px;
  border-radius: 12px;
  margin: 20px 32px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: #c6f6d5;
  color: #276749;
  padding: 16px;
  border-radius: 12px;
  margin: 20px 32px;
  text-align: center;
`;

const FinanceApp: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    households,
    currentHousehold,
    loading: householdLoading,
    createHousehold,
    setCurrentHousehold,
  } = useHousehold(user?.id || null);

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    addTransaction,
    deleteTransaction,
  } = useTransactions(currentHousehold?.id || null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Mostrar notificaciones temporales
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddTransaction = async (transactionData: any) => {
    const result = await addTransaction(transactionData);

    if (result.success) {
      setNotification({
        type: "success",
        message: "¡Transacción agregada correctamente!",
      });
    } else {
      setNotification({
        type: "error",
        message: result.error || "Error al agregar la transacción",
      });
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta transacción?")) {
      return;
    }

    const result = await deleteTransaction(id);

    if (result.success) {
      setNotification({
        type: "success",
        message: "Transacción eliminada correctamente",
      });
    } else {
      setNotification({
        type: "error",
        message: result.error || "Error al eliminar la transacción",
      });
    }
  };

  const handleCreateHousehold = async () => {
    const name = prompt("Nombre del nuevo hogar:");
    if (!name) return;

    const result = await createHousehold(name);

    if (result.success) {
      setNotification({
        type: "success",
        message: `¡Hogar "${name}" creado correctamente!`,
      });
    } else {
      setNotification({
        type: "error",
        message: result.error || "Error al crear el hogar",
      });
    }
  };

  const exportData = () => {
    if (transactions.length === 0) {
      setNotification({
        type: "error",
        message: "No hay transacciones para exportar",
      });
      return;
    }

    const headers = ["Fecha", "Tipo", "Descripción", "Categoría", "Cantidad"];
    const csvContent = [
      headers.join(","),
      ...transactions.map((t) =>
        [t.date, t.type, `"${t.description}"`, t.category, t.amount].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `finanzas_${currentHousehold?.name || "domesticas"}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();

    setNotification({
      type: "success",
      message: "Datos exportados correctamente",
    });
  };

  const importData = (csvContent: string) => {
    // Por ahora mantenemos la funcionalidad local
    // En el futuro podrías implementar importación masiva a Supabase
    setNotification({
      type: "error",
      message: "Importación temporal deshabilitada en la versión colaborativa",
    });
  };

  // Loading states
  if (authLoading) {
    return <LoadingSpinner message="Cargando aplicación..." />;
  }

  // Si no está autenticado, mostrar form de login
  if (!user) {
    return <AuthForm />;
  }

  // Si está cargando hogares
  if (householdLoading) {
    return <LoadingSpinner message="Cargando tus hogares..." />;
  }

  return (
    <Container>
      <AppCard>
        <Header>
          <HeaderTop>
            <HeaderInfo>
              <Title>💰 Finanzas Domésticas</Title>
              <Subtitle>
                {currentHousehold
                  ? `Hogar: ${currentHousehold.name}`
                  : "Gestiona tus finanzas colaborativamente"}
              </Subtitle>
              <UserInfo>Conectado como: {user.email}</UserInfo>
            </HeaderInfo>

            <HeaderActions>
              <ActionButton onClick={handleCreateHousehold}>
                <Home size={16} />
                Nuevo Hogar
              </ActionButton>

              <ActionButton onClick={() => signOut()}>
                <LogOut size={16} />
                Salir
              </ActionButton>
            </HeaderActions>
          </HeaderTop>

          {households.length > 0 && (
            <HouseholdSelector
              households={households}
              currentHousehold={currentHousehold}
              onSelectHousehold={setCurrentHousehold}
            />
          )}
        </Header>

        {/* Notificaciones */}
        {notification &&
          (notification.type === "success" ? (
            <SuccessMessage>{notification.message}</SuccessMessage>
          ) : (
            <ErrorMessage>{notification.message}</ErrorMessage>
          ))}

        {/* Error de transacciones */}
        {transactionsError && (
          <ErrorMessage>
            Error al cargar transacciones: {transactionsError}
          </ErrorMessage>
        )}

        {/* Si no hay hogar seleccionado */}
        {!currentHousehold ? (
          <div
            style={{ padding: "60px", textAlign: "center", color: "#718096" }}
          >
            <Home size={48} style={{ margin: "0 auto 20px", opacity: 0.5 }} />
            <h3 style={{ marginBottom: "12px", color: "#2d3748" }}>
              ¡Bienvenido!
            </h3>
            <p style={{ marginBottom: "24px" }}>
              Crea tu primer hogar para comenzar a gestionar tus finanzas.
            </p>
            <ActionButton
              onClick={handleCreateHousehold}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                padding: "12px 24px",
                fontSize: "16px",
              }}
            >
              <Home size={20} />
              Crear Mi Primer Hogar
            </ActionButton>
          </div>
        ) : (
          <>
            <BalanceCards transactions={transactions} />

            <Dashboard>
              <Card>
                <CardTitle>
                  <PlusCircle size={24} />
                  Nueva Transacción
                </CardTitle>
                <TransactionForm onAddTransaction={handleAddTransaction} />
              </Card>

              <Card>
                <CardTitle>
                  <Wallet size={24} />
                  Transacciones Recientes
                  {transactionsLoading && (
                    <div
                      style={{
                        marginLeft: "auto",
                        fontSize: "14px",
                        color: "#718096",
                      }}
                    >
                      Sincronizando...
                    </div>
                  )}
                </CardTitle>
                <TransactionList
                  transactions={transactions.slice(0, 10)}
                  onDeleteTransaction={handleDeleteTransaction}
                  loading={transactionsLoading}
                />
              </Card>
            </Dashboard>

            <div style={{ margin: "0 32px 32px 32px" }}>
              <Card>
                <CardTitle>
                  <Download size={24} />
                  Exportar Datos
                </CardTitle>
                <ExportImport onExport={exportData} onImport={importData} />
              </Card>
            </div>
          </>
        )}
      </AppCard>
    </Container>
  );
};

export default FinanceApp;

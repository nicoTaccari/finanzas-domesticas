import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Household } from "../lib/supabase";

export const useHousehold = (userId: string | null) => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserHouseholds();
    } else {
      setHouseholds([]);
      setCurrentHousehold(null);
      setLoading(false);
    }
  }, [userId]);

  const fetchUserHouseholds = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching households for user:", userId);

      // OPCIÓN 1: Usar la función personalizada (recomendado)
      const { data, error: fetchError } = await supabase.rpc(
        "get_user_households"
      );

      if (fetchError) {
        console.error("Error with RPC call:", fetchError);

        // OPCIÓN 2: Fallback - consulta directa sin RLS
        console.log("Trying fallback method...");
        return await fetchHouseholdsFallback();
      }

      console.log("RPC returned data:", data);

      const householdData =
        data?.map((item: any) => ({
          id: item.household_id,
          name: item.household_name,
          created_at: item.created_at,
          role: item.user_role,
        })) || [];

      setHouseholds(householdData);

      // Seleccionar el primer hogar por defecto
      if (householdData.length > 0 && !currentHousehold) {
        setCurrentHousehold(householdData[0]);
      }

      // Limpiar selección si el hogar actual ya no existe
      if (
        currentHousehold &&
        !householdData.find((h: any) => h.id === currentHousehold.id)
      ) {
        setCurrentHousehold(householdData.length > 0 ? householdData[0] : null);
      }
    } catch (err) {
      console.error("Error in fetchUserHouseholds:", err);
      setError(
        err instanceof Error ? err.message : "Error fetching households"
      );
    } finally {
      setLoading(false);
    }
  };

  // Método fallback que hace la consulta de forma diferente
  const fetchHouseholdsFallback = async () => {
    try {
      console.log("Using fallback method for fetching households");

      // Primero obtener las membresías del usuario
      const { data: memberships, error: memberError } = await supabase
        .from("household_members")
        .select("household_id, role")
        .eq("user_id", userId);

      if (memberError) {
        console.error("Error fetching memberships:", memberError);
        throw memberError;
      }

      console.log("User memberships:", memberships);

      if (!memberships || memberships.length === 0) {
        setHouseholds([]);
        setCurrentHousehold(null);
        return;
      }

      // Luego obtener los detalles de los hogares
      const householdIds = memberships.map((m) => m.household_id);

      const { data: householdsData, error: householdError } = await supabase
        .from("households")
        .select("id, name, created_at")
        .in("id", householdIds);

      if (householdError) {
        console.error("Error fetching household details:", householdError);
        throw householdError;
      }

      console.log("Household details:", householdsData);

      // Combinar datos
      const combinedData =
        householdsData?.map((household) => {
          const membership = memberships.find(
            (m) => m.household_id === household.id
          );
          return {
            ...household,
            role: membership?.role,
          };
        }) || [];

      setHouseholds(combinedData);

      if (combinedData.length > 0 && !currentHousehold) {
        setCurrentHousehold(combinedData[0]);
      }
    } catch (err) {
      console.error("Error in fallback method:", err);
      throw err;
    }
  };

  const createHousehold = async (name: string) => {
    try {
      setError(null);

      console.log("Creating household with name:", name);

      // Usar la función personalizada
      const { data: householdId, error: createError } = await supabase.rpc(
        "create_household_with_owner",
        {
          household_name: name,
        }
      );

      if (createError) {
        console.error("Error creating household:", createError);
        throw createError;
      }

      console.log("Created household with ID:", householdId);

      // Recargar la lista de hogares
      await fetchUserHouseholds();

      return { success: true, household: { id: householdId, name } };
    } catch (err) {
      console.error("Error in createHousehold:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error creating household";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const inviteMember = async (email: string, householdId: string) => {
    try {
      setError(null);

      console.log("Inviting user:", email, "to household:", householdId);

      // Por ahora, un método simple: obtener user_id por email y agregar directamente
      const { data: userData, error: userError } = await supabase
        .from("auth.users") // Esto puede no funcionar, necesitarías una tabla profiles
        .select("id")
        .eq("email", email)
        .single();

      if (userError) {
        console.error("Error finding user:", userError);
        throw new Error(
          "Usuario no encontrado. Asegúrate de que esté registrado en la aplicación."
        );
      }

      // Agregar como miembro
      const { error: memberError } = await supabase
        .from("household_members")
        .insert([
          {
            household_id: householdId,
            user_id: userData.id,
            role: "member",
          },
        ]);

      if (memberError) {
        console.error("Error adding member:", memberError);
        throw memberError;
      }

      console.log("Successfully invited user");

      return { success: true };
    } catch (err) {
      console.error("Error in inviteMember:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error inviting member";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const leaveHousehold = async (householdId: string) => {
    try {
      setError(null);

      const { error: leaveError } = await supabase
        .from("household_members")
        .delete()
        .eq("household_id", householdId)
        .eq("user_id", userId);

      if (leaveError) {
        console.error("Error leaving household:", leaveError);
        throw leaveError;
      }

      // Si era el hogar actual, limpiar selección
      if (currentHousehold?.id === householdId) {
        setCurrentHousehold(null);
      }

      // Recargar la lista
      await fetchUserHouseholds();

      return { success: true };
    } catch (err) {
      console.error("Error in leaveHousehold:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error leaving household";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    households,
    currentHousehold,
    loading,
    error,
    createHousehold,
    inviteMember,
    leaveHousehold,
    setCurrentHousehold,
    refetch: fetchUserHouseholds,
  };
};

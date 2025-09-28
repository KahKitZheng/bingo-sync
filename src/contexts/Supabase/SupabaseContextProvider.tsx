import { useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { SupabaseContext } from "./SupabaseContext";

const supabase = createClient(
  import.meta.env.VITE_PROJECT_URL,
  import.meta.env.VITE_ANON_KEY,
);

type SupabaseContextProviderProps = {
  children: React.ReactNode;
};

export const SupabaseContextProvider = (
  props: SupabaseContextProviderProps,
) => {
  const { children } = props;

  const contextValues = useMemo(
    () => ({
      supabase,
    }),
    [],
  );

  return (
    <SupabaseContext.Provider value={contextValues}>
      {children}
    </SupabaseContext.Provider>
  );
};

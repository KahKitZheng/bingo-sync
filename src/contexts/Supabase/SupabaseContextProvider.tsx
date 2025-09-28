import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SupabaseContext } from "./SupabaseContext";
import type { Template } from "../../types/bingo";
import { useLocation } from "react-router";

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
  const location = useLocation();

  const [templates, setTemplates] = useState<Template[]>([]);

  const retrieveTemplates = useCallback(async () => {
    const { data } = await supabase.from("Template").select("*");
    if (data) {
      setTemplates((data as Template[]) || []);
    }
  }, []);

  // Retrieve templates on mount
  useEffect(() => {
    retrieveTemplates();

    // maybe better if it's retrieved after saving a template
    if (location.pathname.startsWith("/template")) {
      retrieveTemplates();
    } else {
      return;
    }
  }, [location.pathname, retrieveTemplates]);

  const contextValues: SupabaseContext = useMemo(
    () => ({
      supabase,
      templates,
    }),
    [templates],
  );

  return (
    <SupabaseContext.Provider value={contextValues}>
      {children}
    </SupabaseContext.Provider>
  );
};

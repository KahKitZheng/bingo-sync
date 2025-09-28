import React from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/supabase";

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
};

export const SupabaseContext = React.createContext<SupabaseContext>(
  {} as SupabaseContext,
);

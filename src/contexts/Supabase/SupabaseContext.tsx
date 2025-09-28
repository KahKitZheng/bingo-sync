import React from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/supabase";
import type { Template } from "../../types/bingo";

export type SupabaseContext = {
  supabase: SupabaseClient<Database>;
  templates: Template[];
};

export const SupabaseContext = React.createContext<SupabaseContext>(
  {} as SupabaseContext,
);

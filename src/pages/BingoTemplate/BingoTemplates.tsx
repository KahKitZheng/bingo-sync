import { useCallback, useContext, useEffect, useState } from "react";
import { SupabaseContext } from "../../contexts/Supabase/SupabaseContext";
import type { Template } from "../../types/bingo";

export default function BingoTemplates() {
  const { supabase } = useContext(SupabaseContext);

  const [templates, setTemplates] = useState<Template[]>([]);

  const retrieveTemplates = useCallback(async () => {
    const { data } = await supabase.from("Template").select("*");
    if (data) {
      setTemplates(data as Template[]);
    }
  }, [supabase]);

  useEffect(() => {
    retrieveTemplates();
  }, [retrieveTemplates]);

  console.log({ templates });

  return <div>BingoTemplates</div>;
}

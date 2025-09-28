import { SupabaseContextProvider } from "../contexts/Supabase/SupabaseContextProvider";
import BingoTemplateEditorPage from "../pages/BingoTemplate/BingoTemplateEditorPage";
import BingoTemplates from "../pages/BingoTemplate/BingoTemplates";

function App() {
  return (
    <SupabaseContextProvider>
      <main className="mx-auto max-w-[1400px] bg-neutral-50 px-4 py-8">
        {/* <BingoTemplates /> */}
        <BingoTemplateEditorPage />
      </main>
    </SupabaseContextProvider>
  );
}

export default App;

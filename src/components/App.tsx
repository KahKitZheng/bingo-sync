import { SupabaseContextProvider } from "../contexts/Supabase/SupabaseContextProvider";
import { BrowserRouter, Route, Routes } from "react-router";
import TemplateEditorPage from "../pages/template/TemplateEditorPage";
import TemplatesPage from "../pages/template/TemplatesPage";
import GamePage from "../pages/game/GamePage";
import HighscorePage from "../pages/highscore/HighscorePage";

function App() {
  return (
    <BrowserRouter>
      <SupabaseContextProvider>
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/template/:id" element={<TemplateEditorPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/highscore" element={<HighscorePage />} />
        </Routes>
      </SupabaseContextProvider>
    </BrowserRouter>
  );
}

export default App;

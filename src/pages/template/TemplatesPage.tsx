import { useContext } from "react";
import { SupabaseContext } from "../../contexts/Supabase/SupabaseContext";
import { Link } from "react-router";
import Layout from "../../components/Layout";

const TemplatesPage = () => {
  const { templates } = useContext(SupabaseContext);

  return (
    <Layout>
      <div className="flex flex-col gap-2">
        {templates.map((template) => (
          <Link key={template.id} to={`/template/${template.id}`}>
            <div className="rounded border border-neutral-200 p-2">
              <p>{template.name}</p>
              {template.description && <p>{template.description}</p>}
            </div>
          </Link>
        ))}
        <Link to={`/template/${templates.length + 1}`}>
          <div className="rounded border border-neutral-200 p-2">
            <p>New template</p>
          </div>
        </Link>
      </div>
    </Layout>
  );
};

export default TemplatesPage;

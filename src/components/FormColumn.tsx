type FormColumnProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function FormColumn(props: Readonly<FormColumnProps>) {
  const { title, description, children } = props;

  return (
    <div className="flex-1 rounded-xl border border-neutral-200 bg-white p-4 shadow">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

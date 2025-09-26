type FormColumnProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function FormColumn(props: Readonly<FormColumnProps>) {
  const { title, description, children } = props;

  return (
    <div className="rounded-xl p-6 border shadow border-neutral-200 flex-1">
      <div className="mb-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        {description && <p className="text-gray-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

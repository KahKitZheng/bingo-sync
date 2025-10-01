import { Link } from "react-router";

type LayoutProps = {
  children?: React.ReactNode;
};

const Layout = (props: Readonly<LayoutProps>) => {
  const { children } = props;

  return (
    <div className="mx-auto flex h-full w-full max-w-[1080px] flex-1 flex-col p-4">
      <header className="mb-4 flex items-center justify-between gap-4">
        <Link to="/" className="text-2xl font-bold">
          <h1 className="text-4xl font-bold text-indigo-500">Bingo</h1>
        </Link>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/templates" className="text-center font-semibold">
            Templates
          </Link>
          <Link to="/game" className="text-center font-semibold">
            Game
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
};

export default Layout;

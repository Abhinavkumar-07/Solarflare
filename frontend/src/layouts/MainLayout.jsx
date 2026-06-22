import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
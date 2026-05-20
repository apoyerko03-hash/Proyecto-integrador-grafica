

export default function Layout({ title, subtitle, children }) {
  return (
    <div className="flex h-screen " style={{ background: '#1a1e29' }}>

      <div className="flex-1 flex flex-col ml-10 transition-all duration-300">
        <header className="px-2 py-4 border-b border-white/5">
          <h1 className="text-white font-heading font-bold text-2xl">{title}</h1>
          {subtitle && <p className="text-white/30 text-sm font-mono mt-0.5">{subtitle}</p>}
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

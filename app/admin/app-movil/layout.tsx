export default function AppMovilLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">App móvil</h1>
        <p className="text-sm text-zinc-400 mt-1">Contenido de la aplicación de clientas y del personal</p>
      </div>
      <div className="max-w-4xl space-y-5">{children}</div>
    </div>
  );
}

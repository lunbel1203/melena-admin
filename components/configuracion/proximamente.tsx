export default function Proximamente({ titulo }: { titulo: string }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-10 text-center">
      <p className="text-sm font-semibold text-zinc-700 mb-1">{titulo}</p>
      <p className="text-sm text-zinc-400">Esta sección todavía no está conectada. Próximamente.</p>
    </div>
  );
}

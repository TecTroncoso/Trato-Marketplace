export function SpecsTable({ attributes }: { attributes: Record<string, string> }) {
  const entries = Object.entries(attributes);
  if (!entries.length) return null;

  return (
    <section id="caracteristicas" className="rounded-xl bg-white p-5 shadow-[var(--shadow-card)]">
      <h2 className="mb-4 text-lg font-semibold text-trato-ink">Características del producto</h2>
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key} className="border-b border-trato-line last:border-b-0">
              <th className="w-1/3 py-2.5 pr-4 text-left align-top font-normal text-trato-muted">{key}</th>
              <td className="py-2.5 font-medium text-trato-ink">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

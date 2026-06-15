const METHOD_STYLES: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-emerald-100 text-emerald-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
};

export default function MethodBadge({ method }: { method: string }) {
  const style = METHOD_STYLES[method] ?? "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${style}`}
    >
      {method}
    </span>
  );
}

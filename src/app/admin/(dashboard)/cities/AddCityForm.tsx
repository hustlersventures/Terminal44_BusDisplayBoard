"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addCity } from "@/lib/actions/cities";

export default function AddCityForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter a city name.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await addCity(name);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Could not add city.");
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Warangal"
          className="min-w-0 flex-1 rounded-xl border border-stone-300 px-4 py-3.5 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
        <button
          type="submit"
          disabled={saving}
          className="shrink-0 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Adding…" : "Add City"}
        </button>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </form>
  );
}

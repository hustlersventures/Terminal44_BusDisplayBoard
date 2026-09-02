"use client";

import { useState } from "react";
import { addCity } from "@/lib/actions/cities";

const ADD_NEW = "__add_new__";

export default function CitySelect({
  id,
  name,
  label,
  value,
  cities,
  onChange,
  onCityAdded,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  cities: string[];
  onChange: (value: string) => void;
  onCityAdded: (city: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!newCity.trim()) {
      setError("Enter a city name.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await addCity(newCity);
    setSaving(false);
    if (!result.ok || !result.name) {
      setError(result.error ?? "Could not add city.");
      return;
    }
    onCityAdded(result.name);
    onChange(result.name);
    setAdding(false);
    setNewCity("");
  }

  if (adding) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700">{label}</label>
        {/* Keeps the field present in the form's data even while adding. */}
        <input type="hidden" name={name} value={value} />
        <div className="flex gap-2">
          <input
            autoFocus
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            placeholder="New city name"
            className="min-w-0 flex-1 rounded-xl border border-stone-300 px-4 py-3.5 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          <button
            type="button"
            disabled={saving}
            onClick={handleAdd}
            className="shrink-0 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Adding…" : "Add"}
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setError(null);
              setNewCity("");
            }}
            className="shrink-0 rounded-xl border border-stone-300 px-4 text-sm font-medium text-stone-600"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-stone-700">
        {label}
      </label>
      <select
        id={id}
        name={name}
        required
        value={value}
        onChange={(e) => {
          if (e.target.value === ADD_NEW) {
            setAdding(true);
            return;
          }
          onChange(e.target.value);
        }}
        className="rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      >
        <option value="" disabled>
          Select a city
        </option>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
        <option value={ADD_NEW}>+ Add new city…</option>
      </select>
    </div>
  );
}

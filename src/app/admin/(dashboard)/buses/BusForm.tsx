"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { searchBuses } from "@/lib/actions/buses";
import { isoToIstInput } from "@/lib/datetime";
import { BUS_STATUSES, STATUS_LABELS, type BusBayDisplay, type BusStatus } from "@/lib/types";
import type { FormState } from "./formActions";

export interface BusFormValues {
  bay: string;
  bus_number: string;
  operator_name: string;
  route_from: string;
  route_to: string;
  route_via: string;
  scheduled_arrival: string; // datetime-local value, IST
  scheduled_departure: string; // datetime-local value, IST
  status: BusStatus;
}

function defaultValues(): BusFormValues {
  const now = new Date();
  const in45 = new Date(now.getTime() + 45 * 60_000);
  return {
    bay: "",
    bus_number: "",
    operator_name: "",
    route_from: "",
    route_to: "",
    route_via: "",
    scheduled_arrival: isoToIstInput(now.toISOString()),
    scheduled_departure: isoToIstInput(in45.toISOString()),
    status: "at_terminal",
  };
}

export default function BusForm({
  action,
  initialValues,
  existingBays,
  mode,
  submitLabel,
}: {
  action: (state: FormState | undefined, formData: FormData) => Promise<FormState>;
  initialValues?: Partial<BusFormValues>;
  existingBays: string[];
  mode: "new" | "edit";
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [fields, setFields] = useState<BusFormValues>({ ...defaultValues(), ...initialValues });

  const [suggestions, setSuggestions] = useState<BusBayDisplay[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function set<K extends keyof BusFormValues>(key: K, value: BusFormValues[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    if (mode !== "new") return;
    const q = fields.bus_number.trim();
    searchTimer.current = setTimeout(async () => {
      if (q.length < 2) {
        setSuggestions([]);
        return;
      }
      const results = await searchBuses(q);
      setSuggestions(results);
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [fields.bus_number, mode]);

  function applySuggestion(bus: BusBayDisplay) {
    setFields((prev) => ({
      ...prev,
      bus_number: bus.bus_number,
      operator_name: bus.operator_name,
      route_from: bus.route_from,
      route_to: bus.route_to,
      route_via: bus.route_via ?? "",
    }));
    setShowSuggestions(false);
    setSuggestions([]);
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="relative flex flex-col gap-1.5">
        <label htmlFor="bus_number" className="text-sm font-medium text-stone-700">
          Bus Number
        </label>
        <input
          id="bus_number"
          name="bus_number"
          required
          autoComplete="off"
          placeholder="e.g. TS09OR 4521"
          value={fields.bus_number}
          onChange={(e) => set("bus_number", e.target.value.toUpperCase())}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="rounded-xl border border-stone-300 px-4 py-3.5 text-base font-mono outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
        {mode === "new" && showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
            {suggestions.map((bus) => (
              <li key={bus.id}>
                <button
                  type="button"
                  onMouseDown={() => applySuggestion(bus)}
                  className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left hover:bg-orange-50"
                >
                  <span className="text-sm font-semibold text-stone-900">{bus.bus_number}</span>
                  <span className="text-xs text-stone-500">
                    {bus.operator_name} · {bus.route_from} → {bus.route_to}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {mode === "new" && (
          <p className="text-xs text-stone-400">
            Matches an existing bus? Tap it to reuse its operator &amp; route.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="operator_name" className="text-sm font-medium text-stone-700">
          Operator
        </label>
        <input
          id="operator_name"
          name="operator_name"
          required
          placeholder="e.g. Orange Travels"
          value={fields.operator_name}
          onChange={(e) => set("operator_name", e.target.value)}
          className="rounded-xl border border-stone-300 px-4 py-3.5 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="route_from" className="text-sm font-medium text-stone-700">
            From
          </label>
          <input
            id="route_from"
            name="route_from"
            required
            value={fields.route_from}
            onChange={(e) => set("route_from", e.target.value)}
            className="rounded-xl border border-stone-300 px-4 py-3.5 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="route_to" className="text-sm font-medium text-stone-700">
            To
          </label>
          <input
            id="route_to"
            name="route_to"
            required
            value={fields.route_to}
            onChange={(e) => set("route_to", e.target.value)}
            className="rounded-xl border border-stone-300 px-4 py-3.5 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="route_via" className="text-sm font-medium text-stone-700">
          Via <span className="font-normal text-stone-400">(optional)</span>
        </label>
        <input
          id="route_via"
          name="route_via"
          value={fields.route_via}
          onChange={(e) => set("route_via", e.target.value)}
          className="rounded-xl border border-stone-300 px-4 py-3.5 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bay" className="text-sm font-medium text-stone-700">
          Bay
        </label>
        <input
          id="bay"
          name="bay"
          required
          list="bay-options"
          placeholder="e.g. A6"
          value={fields.bay}
          onChange={(e) => set("bay", e.target.value)}
          className="rounded-xl border border-stone-300 px-4 py-3.5 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
        <datalist id="bay-options">
          {existingBays.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="scheduled_arrival" className="text-sm font-medium text-stone-700">
            Arrival
          </label>
          <input
            id="scheduled_arrival"
            name="scheduled_arrival"
            type="datetime-local"
            required
            value={fields.scheduled_arrival}
            onChange={(e) => set("scheduled_arrival", e.target.value)}
            className="rounded-xl border border-stone-300 px-4 py-3.5 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="scheduled_departure" className="text-sm font-medium text-stone-700">
            Departure
          </label>
          <input
            id="scheduled_departure"
            name="scheduled_departure"
            type="datetime-local"
            required
            value={fields.scheduled_departure}
            onChange={(e) => set("scheduled_departure", e.target.value)}
            className="rounded-xl border border-stone-300 px-4 py-3.5 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-sm font-medium text-stone-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={fields.status}
          onChange={(e) => set("status", e.target.value as BusStatus)}
          className="rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        >
          {BUS_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-orange-500 px-6 py-4 text-base font-semibold text-white shadow-md shadow-orange-200 transition active:scale-[0.98] hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

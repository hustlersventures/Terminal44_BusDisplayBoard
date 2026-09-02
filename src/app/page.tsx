import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-gradient-to-b from-orange-50 to-white px-6 py-16 text-center">
      <div>
        <p className="text-sm font-semibold tracking-wide text-orange-600 uppercase">
          Terminal 44
        </p>
        <h1 className="mt-2 text-3xl font-bold text-stone-900 sm:text-4xl">
          Bus Display Board
        </h1>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <Link
          href="/display"
          className="rounded-2xl bg-orange-500 px-6 py-5 text-lg font-semibold text-white shadow-md shadow-orange-200 transition active:scale-[0.98] hover:bg-orange-600"
        >
          Live Display Board
        </Link>
        <Link
          href="/admin"
          className="rounded-2xl border-2 border-orange-500 bg-white px-6 py-5 text-lg font-semibold text-orange-600 transition active:scale-[0.98] hover:bg-orange-50"
        >
          Admin Portal
        </Link>
      </div>
    </main>
  );
}

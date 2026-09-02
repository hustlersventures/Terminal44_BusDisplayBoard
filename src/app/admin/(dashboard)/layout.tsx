import Link from "next/link";
import { logout } from "@/app/admin/login/actions";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-stone-50">
      <header className="sticky top-0 z-10 border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="rounded-lg bg-orange-500 px-2 py-1 text-xs font-bold text-white">T44</span>
            <span className="text-sm font-semibold text-stone-800">Admin Portal</span>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-700"
            >
              Log out
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 px-4 pb-2 text-sm font-medium">
          <Link href="/admin" className="rounded-lg px-3 py-1.5 text-stone-600 hover:bg-orange-50 hover:text-orange-700">
            Buses
          </Link>
          <Link href="/admin/ads" className="rounded-lg px-3 py-1.5 text-stone-600 hover:bg-orange-50 hover:text-orange-700">
            Advertisements
          </Link>
          <Link href="/admin/cities" className="rounded-lg px-3 py-1.5 text-stone-600 hover:bg-orange-50 hover:text-orange-700">
            Cities
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">{children}</main>
    </div>
  );
}

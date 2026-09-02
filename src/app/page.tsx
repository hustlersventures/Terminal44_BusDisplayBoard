import Link from "next/link";
import { Oswald } from "next/font/google";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });

export default function Home() {
  return (
    <main
      className="relative flex flex-1 items-center justify-end bg-cover bg-center px-6 py-16 sm:px-16"
      style={{ backgroundImage: "url(/terminal44-hero.png)" }}
    >
      {/* Darken the ad image so the side panel stays readable over it. */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative flex w-full max-w-sm flex-col items-center gap-8 text-center">
        <div>
          {/* <p className="text-sm font-semibold tracking-wide text-orange-300 uppercase">
            Terminal 44
          </p> */}
          <h1 className={`${oswald.className} mt-2`} style={{ fontSize: "40px", letterSpacing: "1px" }}>
            <span className="text-white">TERMINAL </span>
            <span className="text-orange-500">44</span>
          </h1>
        </div>

        <div className="flex w-full flex-col gap-4">
          <Link
            href="/display"
            className="rounded-2xl bg-orange-500 px-6 py-5 text-lg font-semibold text-white shadow-md shadow-orange-950/40 transition active:scale-[0.98] hover:bg-orange-600"
          >
            Live Display Board
          </Link>
          <Link
            href="/admin"
            className="rounded-2xl border-2 border-orange-400 bg-white/90 px-6 py-5 text-lg font-semibold text-orange-600 backdrop-blur transition active:scale-[0.98] hover:bg-white"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </main>
  );
}

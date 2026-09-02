import { Chakra_Petch } from "next/font/google";

// Bold, squared-off, technical look — matches the reference departure-board
// image. Scoped to /display only so the admin portal keeps its own font.
const board = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-board",
});

export default function DisplayLayout({ children }: LayoutProps<"/display">) {
  return <div className={`${board.variable} h-dvh font-[family-name:var(--font-board)]`}>{children}</div>;
}

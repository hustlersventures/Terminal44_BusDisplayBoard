import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-gradient-to-b from-orange-50 to-white px-6 py-16">
      <div className="text-center">
        <p className="text-sm font-semibold tracking-wide text-orange-600 uppercase">
          Terminal 44
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">Admin Portal</h1>
      </div>
      <LoginForm redirectTo={from && from.startsWith("/admin") ? from : "/admin"} />
    </main>
  );
}

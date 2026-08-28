import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-bg mb-6">
        <span className="text-2xl font-bold text-white">R</span>
      </div>
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Página não encontrada
      </p>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        A página que você está procurando não existe ou foi removida.
      </p>
      <Link
        href="/home"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-lg px-6 font-semibold text-white gradient-bg transition-opacity hover:opacity-90"
      >
        Voltar para o início
      </Link>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-4 text-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute inset-0 grid-fade opacity-40" />
      </div>

      <div className="relative">
        <h1 className="text-[9rem] sm:text-[12rem] font-black tracking-tighter leading-none gradient-text">
          404
        </h1>
        <p className="mt-2 text-2xl sm:text-3xl font-bold">Página não encontrada</p>
        <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
          A página que você está procurando não existe ou foi removida.
        </p>
        <Link
          href="/"
          className="group mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-full gradient-bg px-6 font-semibold text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/40 px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
      <span>© {year} Tutorfy. Todos os direitos reservados.</span>
      <span className="flex items-center gap-1">
        Portal Administrativo
        <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          v1.0
        </span>
      </span>
    </footer>
  );
}

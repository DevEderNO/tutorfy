import { BookMarked } from 'lucide-react';

export function MaterialsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center py-24">
      <div className="glass-panel rounded-2xl p-12 text-center space-y-5 max-w-md w-full">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto neon-glow">
          <BookMarked className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Materiais</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Em breve você poderá acessar apostilas, exercícios e materiais compartilhados pelo seu tutor.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Em desenvolvimento
        </span>
      </div>
    </div>
  );
}

import React from "react";

interface AtomSection {
  id: string;
  icon: string;
  title: string;
  render: () => React.ReactNode;
}

const sections: AtomSection[] = [
  {
    id: "colors",
    icon: "palette",
    title: "1. Paleta de Cores",
    render: () => (
      <div className="flex flex-col gap-6 w-full">
        {/* Primary */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Violet</span>
          <div className="flex gap-2">
            <div className="flex-1 h-14 rounded-lg bg-[#c4b5fd] flex items-end p-2">
              <span className="text-[10px] font-bold text-violet-900">#c4b5fd</span>
            </div>
            <div className="flex-1 h-14 rounded-lg bg-[#8b5cf6] shadow-lg shadow-violet-500/20 flex items-end p-2">
              <span className="text-[10px] font-bold text-white uppercase">Base</span>
            </div>
            <div className="flex-1 h-14 rounded-lg bg-[#6d28d9] flex items-end p-2">
              <span className="text-[10px] font-bold text-white">#6d28d9</span>
            </div>
          </div>
        </div>

        {/* Semantic */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estados Semânticos</span>
          <div className="grid grid-cols-4 gap-2">
            <div className="aspect-square bg-emerald-500 rounded-lg flex flex-col items-end justify-end p-2">
              <span className="text-[10px] font-bold text-white uppercase leading-none">Success</span>
            </div>
            <div className="aspect-square bg-amber-500 rounded-lg flex flex-col items-end justify-end p-2">
              <span className="text-[10px] font-bold text-white uppercase leading-none">Warning</span>
            </div>
            <div className="aspect-square bg-rose-500 rounded-lg flex flex-col items-end justify-end p-2">
              <span className="text-[10px] font-bold text-white uppercase leading-none">Danger</span>
            </div>
            <div className="aspect-square bg-sky-500 rounded-lg flex flex-col items-end justify-end p-2">
              <span className="text-[10px] font-bold text-white uppercase leading-none">Info</span>
            </div>
          </div>
        </div>

        {/* Grayscale */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Neutros</span>
          <div className="flex h-12 w-full rounded-xl overflow-hidden border border-white/5">
            <div className="flex-1 bg-slate-50 flex items-end p-1"><span className="text-[8px] text-slate-900 font-bold">50</span></div>
            <div className="flex-1 bg-slate-200 flex items-end p-1"><span className="text-[8px] text-slate-900 font-bold">200</span></div>
            <div className="flex-1 bg-slate-400 flex items-end p-1"><span className="text-[8px] text-slate-900 font-bold">400</span></div>
            <div className="flex-1 bg-slate-600 flex items-end p-1"><span className="text-[8px] text-white font-bold">600</span></div>
            <div className="flex-1 bg-slate-800 flex items-end p-1"><span className="text-[8px] text-white font-bold">800</span></div>
            <div className="flex-1 bg-slate-900 flex items-end p-1"><span className="text-[8px] text-white font-bold">900</span></div>
            <div className="flex-1 bg-[#151022] flex items-end p-1 border-l border-white/5"><span className="text-[8px] text-white font-bold">950</span></div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "typography",
    icon: "text_fields",
    title: "2. Tipografia",
    render: () => (
      <div className="flex flex-col gap-4 w-full">
        <div className="border-b border-white/5 pb-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-tight">H1</span>
            <span className="text-xs text-slate-500 font-mono">48px / ExtraBold</span>
          </div>
          <p className="text-4xl font-extrabold text-slate-100 leading-tight truncate">The quick brown fox</p>
        </div>
        <div className="border-b border-white/5 pb-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-tight">H2</span>
            <span className="text-xs text-slate-500 font-mono">30px / Bold</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">Jumped over the lazy dog</p>
        </div>
        <div className="border-b border-white/5 pb-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-tight">Body / Large</span>
            <span className="text-xs text-slate-500 font-mono">18px / Regular</span>
          </div>
          <p className="text-lg text-slate-300 leading-relaxed">Design is how it works.</p>
        </div>
        <div className="border-b border-white/5 pb-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-tight">Body / Base</span>
            <span className="text-xs text-slate-500 font-mono">16px / Regular</span>
          </div>
          <p className="text-base text-slate-400">Everything is designed well.</p>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-tight">Caption</span>
            <span className="text-xs text-slate-500 font-mono">12px / SemiBold</span>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Metadata and labels</p>
        </div>
      </div>
    ),
  },
  {
    id: "icons",
    icon: "grid_view",
    title: "3. Iconografia",
    render: () => (
      <div className="grid grid-cols-3 gap-3 w-full">
        {[
          { icon: "calendar_today", label: "Calendar" },
          { icon: "group", label: "Users" },
          { icon: "payments", label: "Dollar" },
          { icon: "settings", label: "Settings" },
          { icon: "logout", label: "LogOut" },
          { icon: "check_circle", label: "Check" },
          { icon: "cancel", label: "X" },
          { icon: "notifications", label: "Bell" },
          { icon: "chevron_right", label: "Chevron" },
          { icon: "school", label: "School" },
          { icon: "edit", label: "Edit" },
          { icon: "delete", label: "Delete" },
        ].map(({ icon, label }) => (
          <div
            key={icon}
            className="aspect-square bg-slate-900 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1.5 hover:border-violet-500/40 transition-all group"
          >
            <span className="material-symbols-outlined text-slate-300 group-hover:text-violet-400 !text-2xl">{icon}</span>
            <span className="text-[9px] text-slate-500 font-mono">{label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "spacing",
    icon: "square_foot",
    title: "4. Espaçamento",
    render: () => (
      <div className="flex flex-col gap-3 w-full">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Base 4px System</span>
        {[
          { label: "4px", width: "w-1" },
          { label: "8px", width: "w-2" },
          { label: "12px", width: "w-3" },
          { label: "16px", width: "w-4" },
          { label: "24px", width: "w-6" },
          { label: "32px", width: "w-8" },
          { label: "48px", width: "w-12" },
          { label: "64px", width: "w-16" },
        ].map(({ label, width }) => (
          <div key={label} className="flex items-center gap-4">
            <div className={`${width} h-3 bg-violet-500 rounded`} />
            <span className="text-xs font-mono text-slate-500 w-10">{label}</span>
            <div className={`${width} h-1 bg-violet-500/30 rounded-full`} />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "elevation",
    icon: "layers",
    title: "5. Elevação",
    render: () => (
      <div className="flex flex-col gap-6 w-full">
        {[
          {
            label: "Shadow Small",
            cls: "shadow-sm",
            code: "shadow-sm",
            size: "Sm",
          },
          {
            label: "Shadow Medium",
            cls: "shadow-md",
            code: "shadow-md",
            size: "Md",
          },
          {
            label: "Shadow Large",
            cls: "shadow-xl shadow-black/50",
            code: "shadow-xl",
            size: "Lg",
          },
        ].map(({ label, cls, code, size }) => (
          <div key={label} className="flex items-center gap-5">
            <div
              className={`size-16 bg-slate-800 rounded-xl border border-white/5 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 ${cls}`}
            >
              {size}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">{label}</span>
              <span className="text-xs font-mono text-slate-500">{code}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "radius",
    icon: "rounded_corner",
    title: "6. Border Radius",
    render: () => (
      <div className="grid grid-cols-2 gap-5 w-full">
        {[
          { label: "Small (4px)", cls: "rounded", token: "rounded" },
          { label: "Medium (8px)", cls: "rounded-lg", token: "rounded-lg" },
          { label: "Large (12px)", cls: "rounded-xl", token: "rounded-xl" },
          { label: "Full (Pill)", cls: "rounded-full", token: "rounded-full" },
        ].map(({ label, cls, token }) => (
          <div key={label} className="flex flex-col gap-2">
            <div
              className={`h-16 w-full bg-violet-500/10 border-2 border-violet-500/40 ${cls}`}
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">{label}</span>
              <span className="text-[10px] font-mono text-slate-500">{token}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export function AtomsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-100">Átomos &amp; Fundação</h1>
        <p className="text-sm text-slate-400 mt-1">
          Tokens visuais elementares que definem a linguagem visual do Tutorfy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="glass-panel rounded-2xl border border-white/5 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
              <span className="material-symbols-outlined text-violet-400 !text-lg">{section.icon}</span>
              <span className="text-sm font-bold text-slate-100">{section.title}</span>
            </div>
            <div className="p-5">{section.render()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

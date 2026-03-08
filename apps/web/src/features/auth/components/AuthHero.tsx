import { GraduationCap } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  title: string;
  description: string;
}

interface AuthHeroProps {
  title: React.ReactNode;
  description: string;
  features: Feature[];
}

export function AuthHero({ title, description, features }: AuthHeroProps) {
  return (
    <div className="hidden lg:flex w-full relative flex-col justify-center px-12 xl:px-24 overflow-hidden border-r border-white/5 h-full">
      {/* Abstract Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-950/20" />

      {/* Decorative Glows */}
      <div className="absolute -bottom-40 -left-40 size-[40rem] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute top-[-10%] right-[-10%] size-[30rem] bg-indigo-500/10 rounded-full blur-[120px]" />

      {/* Branding */}
      <div className="relative z-10 mb-10 xl:mb-16 flex items-center gap-4 group cursor-default">
        <div className="size-12 xl:size-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-[0_0_25px_rgba(116,61,245,0.4)] group-hover:scale-110 transition-transform duration-500">
          <GraduationCap className="h-6 w-6 xl:h-8 xl:w-8 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
        </div>
        <h1 className="text-3xl xl:text-4xl font-black tracking-tighter text-white">
          Tutorfy
        </h1>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl">
        <h2 className="text-4xl xl:text-6xl font-black text-white leading-[1.1] mb-6 xl:mb-10 tracking-tight">
          {title}
        </h2>
        <p className="text-muted-foreground text-lg xl:text-xl mb-10 xl:mb-16 font-medium leading-relaxed max-w-lg">
          {description}
        </p>

        {/* Feature Cards */}
        <div className="grid gap-4 xl:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`glass-panel p-5 xl:p-6 rounded-[2rem] flex items-start gap-4 xl:gap-6 border-l-4 ${feature.borderColor} bg-white/5 border border-white/5 hover:bg-white/10 transition-all hover:scale-[1.02] cursor-default shadow-lg`}
            >
              <div
                className={`${feature.iconBg} p-2.5 xl:p-3 rounded-2xl shadow-inner`}
              >
                {feature.icon}
              </div>
              <div className="pt-0.5 xl:pt-1">
                <h3 className="font-black text-white text-base xl:text-lg tracking-tight mb-0.5 xl:mb-1">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm xl:text-base font-medium leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

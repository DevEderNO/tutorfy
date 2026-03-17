import { Sparkles, Users } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from '@tutorfy/ui';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: "student-limit" | "ai-disabled";
  max?: number | null;
  current?: number;
}

export function UpgradeModal({ isOpen, onClose, reason, max, current }: UpgradeModalProps) {
  const isStudentLimit = reason === "student-limit";
  const title = isStudentLimit ? "Limite de alunos atingido" : "Recurso não disponível";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center gap-5 pb-2">
        <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_25px_rgba(139,92,246,0.2)]">
          {isStudentLimit ? (
            <Users className="h-8 w-8 text-primary" />
          ) : (
            <Sparkles className="h-8 w-8 text-primary" />
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {isStudentLimit ? (
            <>
              Seu plano atual permite até{" "}
              <span className="text-foreground font-semibold">{max} alunos</span>.
              Você já tem <span className="text-foreground font-semibold">{current} alunos</span> cadastrados.
              <br />
              Para adicionar mais alunos, faça upgrade do seu plano.
            </>
          ) : (
            <>
              Os recursos de Inteligência Artificial não estão disponíveis no seu plano atual.
              <br />
              Faça upgrade para desbloquear IA e outras funcionalidades avançadas.
            </>
          )}
        </p>

        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 w-full text-sm text-muted-foreground">
          Entre em contato com o suporte para fazer upgrade do seu plano.
        </div>

        <Button variant="primary" size="lg" className="w-full" onClick={onClose}>
          Entendi
        </Button>
      </div>
    </Modal>
  );
}

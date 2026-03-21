import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, RadioGroup, RadioItem } from '@tutorfy/ui';

interface PortalLinkModalProps {
  studentId: string;
  studentName: string;
  studentEmail?: string;
  responsibleName?: string;
  open: boolean;
  onClose: () => void;
}

type AccountType = 'STUDENT' | 'GUARDIAN';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'http://localhost:3002';

export function PortalLinkModal({ studentId, studentName, studentEmail, responsibleName, open, onClose }: PortalLinkModalProps) {
  const [accountType, setAccountType] = useState<AccountType>('STUDENT');
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['students', studentId, 'portal-link'],
    queryFn: async () => {
      const res = await api.get<{ data: { token: string; studentId: string } }>(`/students/${studentId}/portal-link`);
      return res.data.data;
    },
    enabled: open,
  });

  const registrationUrl = (() => {
    if (!data) return '';
    const params = new URLSearchParams({ token: data.token, type: accountType });
    const name = accountType === 'STUDENT' ? studentName : (responsibleName || studentName);
    params.set('name', name);
    const email = accountType === 'GUARDIAN' ? studentEmail : undefined;
    if (email) params.set('email', email);
    return `${PORTAL_URL}/register?${params.toString()}`;
  })();

  const handleCopy = async () => {
    if (!registrationUrl) return;
    await navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onOpenChange={(v) => !v && onClose()}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>Link de acesso ao Portal</ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-5">
          <p className="text-sm text-slate-400">
            Gere um link de convite para <span className="text-slate-200 font-medium">{studentName}</span> acessar o Portal do Aluno.
          </p>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo de acesso</p>
            <RadioGroup
              value={accountType}
              onValueChange={(v) => setAccountType(v as AccountType)}
              className="flex gap-4"
            >
              <RadioItem value="STUDENT" label="Aluno" description="Acesso próprio do aluno" />
              <RadioItem value="GUARDIAN" label="Responsável" description="Acesso do responsável" />
            </RadioGroup>
          </div>

          {isLoading ? (
            <div className="h-10 rounded-lg bg-white/5 animate-pulse" />
          ) : registrationUrl ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Link gerado</p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="flex-1 text-xs text-slate-300 font-mono truncate">{registrationUrl}</p>
                <Button variant="ghost" size="icon-sm" onClick={handleCopy} aria-label="Copiar link">
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </Button>
                <a href={registrationUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon-sm" aria-label="Abrir link">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
              <p className="text-xs text-slate-500">
                Compartilhe este link com o {accountType === 'STUDENT' ? 'aluno' : 'responsável'} para que ele crie sua conta no portal.
              </p>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
          {registrationUrl && (
            <Button variant="primary" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

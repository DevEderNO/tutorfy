import { createContext, useContext, useEffect, useState } from 'react';

interface PageHeaderState {
  title: string;
  subtitle?: string;
  backTo?: string;
}

interface PageHeaderContextValue {
  header: PageHeaderState;
  setHeader: (state: PageHeaderState) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null);

export function PageHeaderProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeader] = useState<PageHeaderState>({ title: '' });
  return (
    <PageHeaderContext.Provider value={{ header, setHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader(state: PageHeaderState) {
  const ctx = useContext(PageHeaderContext);
  if (!ctx) throw new Error('usePageHeader must be used inside PageHeaderProvider');
  const { setHeader } = ctx;
  useEffect(() => {
    setHeader(state);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.title, state.subtitle, state.backTo]);
}

export function usePageHeaderState() {
  const ctx = useContext(PageHeaderContext);
  if (!ctx) throw new Error('usePageHeaderState must be used inside PageHeaderProvider');
  return ctx.header;
}

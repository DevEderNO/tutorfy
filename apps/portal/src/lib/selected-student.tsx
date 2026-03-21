import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from './api';

interface Student {
  id: string;
  name: string;
  avatarUrl: string | null;
  grade: string | null;
  school: string | null;
  currentLevel: string | null;
  active: boolean;
}

interface SelectedStudentContextType {
  students: Student[];
  isLoading: boolean;
  selectedId: string;
  setSelectedId: (id: string) => void;
  selectedStudent: Student | undefined;
}

const SelectedStudentContext = createContext<SelectedStudentContextType | null>(null);

export function SelectedStudentProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState('');

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['portal', 'students'],
    queryFn: async () => {
      const res = await api.get<{ data: Student[] }>('/portal/students');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (students.length > 0 && !selectedId) {
      setSelectedId(students[0].id);
    }
  }, [students, selectedId]);

  const selectedStudent = students.find((s) => s.id === selectedId) ?? students[0];

  return (
    <SelectedStudentContext.Provider value={{ students, isLoading, selectedId, setSelectedId, selectedStudent }}>
      {children}
    </SelectedStudentContext.Provider>
  );
}

export function useSelectedStudent() {
  const ctx = useContext(SelectedStudentContext);
  if (!ctx) throw new Error('useSelectedStudent must be used within SelectedStudentProvider');
  return ctx;
}

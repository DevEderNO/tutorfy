// ============================================================
// Tutorfy Shared Types
// ============================================================

// --- Enums ---

export const EvolutionAiMode = {
  AUTO: 'AUTO',
  REVIEW: 'REVIEW',
} as const;

export type EvolutionAiMode = (typeof EvolutionAiMode)[keyof typeof EvolutionAiMode];

export const LessonPlanAiMode = {
  OFF:    'OFF',
  AUTO:   'AUTO',
  DEMAND: 'DEMAND',
} as const;

export type LessonPlanAiMode = (typeof LessonPlanAiMode)[keyof typeof LessonPlanAiMode];

export type LessonPlanField = 'content' | 'homework' | 'notes';

export interface LessonPlanResult {
  content?:  string;
  homework?: string;
  notes?:    string;
}

export const ClassStatus = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
  MISSED: 'MISSED',
} as const;

export type ClassStatus = (typeof ClassStatus)[keyof typeof ClassStatus];

export const BillingType = {
  MONTHLY: 'MONTHLY',
  HOURLY: 'HOURLY',
} as const;

export type BillingType = (typeof BillingType)[keyof typeof BillingType];

// --- List params / responses ---

export interface StudentsListParams {
  page?:        number;
  limit?:       number;
  search?:      string;
  active?:      'true' | 'false';
  billingType?: 'MONTHLY' | 'HOURLY';
  sortBy?:      'name' | 'school' | 'grade' | 'monthlyFee' | 'createdAt';
  sortDir?:     'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data:  T[];
  total: number;
  page:  number;
  limit: number;
}

// --- Entities ---

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  createdAt: string;
  evolutionAiMode?: EvolutionAiMode;
  lessonPlanAiMode?:      LessonPlanAiMode;
  lessonPlanFields?:      LessonPlanField[];
  lessonPlanSessionCount?: number;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  grade: string;
  school: string;
  responsibleName: string;
  responsiblePhone: string;
  billingType: BillingType;
  monthlyFee: number;
  hourlyRate: number | null;
  active: boolean;
  createdAt: string;
  schedulePreferences?: StudentSchedulePreference[];
}

export interface StudentSchedulePreference {
  id: string;
  studentId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface ClassSession {
  id: string;
  userId: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ClassStatus;
  content: string | null;
  homework: string | null;
  notes: string | null;
  createdAt: string;
  student?: Student;
}

export interface Payment {
  id: string;
  userId: string;
  studentId: string;
  month: number;
  year: number;
  amount: number;
  billingType: BillingType;
  classHours: number | null;
  paid: boolean;
  paidAt: string | null;
  createdAt: string;
  student?: Student;
}

// --- API Response Wrappers ---

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// --- DTOs ---

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateStudentDTO {
  name: string;
  avatarUrl?: string;
  grade: string;
  school: string;
  responsibleName: string;
  responsiblePhone: string;
  billingType: BillingType;
  monthlyFee?: number;
  hourlyRate?: number;
  schedulePreferences?: CreateSchedulePreferenceDTO[];
}

export interface CreateSchedulePreferenceDTO {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface UpdateStudentDTO extends Partial<CreateStudentDTO> {
  active?: boolean;
}

export interface CreateClassSessionDTO {
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  status?: ClassStatus;
  content?: string;
  homework?: string;
  notes?: string;
}

export interface UpdateClassSessionDTO extends Partial<CreateClassSessionDTO> {}

export interface CreatePaymentDTO {
  studentId: string;
  month: number;
  year: number;
  amount: number;
  billingType?: BillingType;
  classHours?: number;
}

export interface GeneratePaymentsDTO {
  month: number;
  year: number;
}

export interface DashboardData {
  activeStudents: number;
  weekClasses: ClassSession[];
  pendingPayments: number;
  nextClass: ClassSession | null;
}

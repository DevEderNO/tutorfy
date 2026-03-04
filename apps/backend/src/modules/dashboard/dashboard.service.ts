import { StudentsRepository } from '../students/students.repository.js';
import { ClassesRepository } from '../classes/classes.repository.js';
import { PaymentsRepository } from '../payments/payments.repository.js';

const studentsRepo = new StudentsRepository();
const classesRepo = new ClassesRepository();
const paymentsRepo = new PaymentsRepository();

export class DashboardService {
  async getData(userId: string) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get start and end of current week (Monday to Sunday)
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const [activeStudents, weekClasses, pendingPayments, nextClass] = await Promise.all([
      studentsRepo.countActive(userId),
      classesRepo.findWeekClasses(userId, monday, sunday),
      paymentsRepo.countPending(userId, currentMonth, currentYear),
      classesRepo.findNextClass(userId, now),
    ]);

    return {
      activeStudents,
      weekClasses,
      pendingPayments,
      nextClass,
    };
  }
}

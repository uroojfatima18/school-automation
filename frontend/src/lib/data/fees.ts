import { FeeRecord } from '@/lib/types';
import { students } from './students';

// Generate fee records for all students across multiple months
function generateFees(): FeeRecord[] {
  const months = [
    { label: 'May 2026', due: '2026-05-10' },
    { label: 'June 2026', due: '2026-06-10' },
    { label: 'July 2026', due: '2026-07-10' },
    { label: 'August 2026', due: '2026-08-10' },
    { label: 'September 2026', due: '2026-09-10' },
    { label: 'October 2026', due: '2026-10-10' },
  ];

  const classAmounts: Record<string, number> = {
    'Class 1': 3000, 'Class 2': 3000, 'Class 3': 3500,
    'Class 4': 3500, 'Class 5': 4000, 'Class 6': 4000,
    'Class 7': 4500, 'Class 8': 4500, 'Class 9': 5000,
    'Class 10': 5000,
  };

  const fees: FeeRecord[] = [];
  let feeId = 1;

  students.forEach((student) => {
    const amount = classAmounts[student.className] || 4000;

    months.forEach((m, monthIdx) => {
      // Determine status: older months mostly paid, recent months have pending/overdue
      let status: FeeRecord['status'] = 'paid';
      let paidDate: string | undefined = m.due;
      let daysOverdue: number | undefined;

      if (monthIdx === 5) {
        // Current month (October): mix of paid, pending, overdue
        const rand = Math.random();
        if (rand < 0.45) {
          status = 'paid';
          paidDate = '2026-10-12';
        } else if (rand < 0.75) {
          status = 'pending';
          paidDate = undefined;
          daysOverdue = 0;
        } else {
          status = 'overdue';
          paidDate = undefined;
          daysOverdue = Math.floor(Math.random() * 14) + 1;
        }
      } else if (monthIdx === 4) {
        // September: mostly paid, some overdue
        const rand = Math.random();
        if (rand < 0.8) {
          status = 'paid';
          paidDate = '2026-09-15';
        } else {
          status = 'overdue';
          paidDate = undefined;
          daysOverdue = Math.floor(Math.random() * 30) + 14;
        }
      } else {
        // Older months: all paid
        status = 'paid';
        paidDate = m.due;
      }

      fees.push({
        id: `fee-${feeId++}`,
        schoolId: student.schoolId,
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        parentPhone: student.phone,
        month: m.label,
        amount,
        dueDate: m.due,
        paidDate,
        status,
        daysOverdue,
      });
    });
  });

  return fees;
}

export const fees: FeeRecord[] = generateFees();

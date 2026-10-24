import { StudentResult, ClassResultSummary } from '@/lib/types';

const subjectsByClass: Record<string, string[]> = {
  'Class 1': ['Urdu', 'English', 'Math', 'Islamiat', 'General Knowledge'],
  'Class 2': ['Urdu', 'English', 'Math', 'Islamiat', 'General Knowledge'],
  'Class 3': ['Urdu', 'English', 'Math', 'Islamiat', 'General Knowledge', 'Science'],
  'Class 4': ['Urdu', 'English', 'Math', 'Islamiat', 'General Knowledge', 'Science'],
  'Class 5': ['Urdu', 'English', 'Math', 'Islamiat', 'Social Studies', 'Science'],
  'Class 6': ['Urdu', 'English', 'Math', 'Islamiat', 'Social Studies', 'Science', 'Computer'],
  'Class 7': ['Urdu', 'English', 'Math', 'Islamiat', 'Social Studies', 'Science', 'Computer'],
  'Class 8': ['Urdu', 'English', 'Math', 'Islamiat', 'Social Studies', 'Science', 'Computer'],
  'Class 9': ['Urdu', 'English', 'Math', 'Islamiat', 'Physics', 'Chemistry', 'Biology', 'Computer'],
  'Class 10': ['Urdu', 'English', 'Math', 'Islamiat', 'Physics', 'Chemistry', 'Biology', 'Computer'],
};

function getGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

function generateResults(): StudentResult[] {
  const results: StudentResult[] = [];
  const studentsData = [
    { id: 's1', name: 'Ahmed Khan', father: 'Imran Khan', class: 'Class 10', roll: 1 },
    { id: 's2', name: 'Fatima Noor', father: 'Noor Muhammad', class: 'Class 10', roll: 2 },
    { id: 's21', name: 'Saad Qureshi', father: 'Qureshi Sahab', class: 'Class 10', roll: 3 },
    { id: 's29', name: 'Kashif Mehmood', father: 'Mehmood Ghaznavi', class: 'Class 10', roll: 4 },
    { id: 's35', name: 'Naveed Akhtar', father: 'Akhtar Rasool', class: 'Class 10', roll: 5 },
    { id: 's3', name: 'Hassan Ali', father: 'Ali Raza', class: 'Class 9', roll: 1 },
    { id: 's4', name: 'Aisha Bibi', father: 'Muhammad Azam', class: 'Class 9', roll: 2 },
    { id: 's22', name: 'Rabia Shahid', father: 'Shahid Afridi', class: 'Class 9', roll: 3 },
    { id: 's30', name: 'Sidra Batool', father: 'Batool Shah', class: 'Class 9', roll: 4 },
    { id: 's5', name: 'Usman Tariq', father: 'Tariq Mehmood', class: 'Class 8', roll: 1 },
    { id: 's6', name: 'Zainab Akhtar', father: 'Akhtar Hussain', class: 'Class 8', roll: 2 },
    { id: 's23', name: 'Farhan Mustafa', father: 'Mustafa Kamal', class: 'Class 8', roll: 3 },
    { id: 's31', name: 'Rizwan Ahmed', father: 'Ahmed Butt', class: 'Class 8', roll: 4 },
    { id: 's7', name: 'Bilal Ahmad', father: 'Ahmad Shah', class: 'Class 7', roll: 1 },
    { id: 's8', name: 'Maryam Fatima', father: 'Fateh Muhammad', class: 'Class 7', roll: 2 },
    { id: 's24', name: 'Mahnoor Amir', father: 'Amir Sohail', class: 'Class 7', roll: 3 },
    { id: 's32', name: 'Bushra Khalid', father: 'Khalid Mahmood', class: 'Class 7', roll: 4 },
    { id: 's9', name: 'Hamza Iqbal', father: 'Iqbal Ahmed', class: 'Class 6', roll: 1 },
    { id: 's10', name: 'Sana Malik', father: 'Malik Riaz', class: 'Class 6', roll: 2 },
    { id: 's25', name: 'Junaid Saleem', father: 'Saleem Baig', class: 'Class 6', roll: 3 },
    { id: 's33', name: 'Adeel Ashraf', father: 'Ashraf Ali', class: 'Class 6', roll: 4 },
    { id: 's11', name: 'Owais Raza', father: 'Raza Hussain', class: 'Class 5', roll: 1 },
    { id: 's12', name: 'Hira Nawaz', father: 'Nawaz Sharif', class: 'Class 5', roll: 2 },
    { id: 's26', name: 'Ayesha Kamran', father: 'Kamran Akmal', class: 'Class 5', roll: 3 },
    { id: 's34', name: 'Sumera Akram', father: 'Akram Gill', class: 'Class 5', roll: 4 },
  ];

  const examTypes = ['Midterm', 'Final'];

  examTypes.forEach((examType) => {
    const classBuckets: Record<string, typeof studentsData> = {};
    studentsData.forEach((s) => {
      if (!classBuckets[s.class]) classBuckets[s.class] = [];
      classBuckets[s.class].push(s);
    });

    Object.entries(classBuckets).forEach(([className, classStudents]) => {
      const subjects = subjectsByClass[className] || ['Urdu', 'English', 'Math'];
      const totalMaxMarks = subjects.length * 100;

      // Generate marks and sort for position
      const studentMarks = classStudents.map((s) => {
        const subjectResults = subjects.map((subName) => ({
          name: subName,
          totalMarks: 100,
          obtainedMarks: Math.floor(Math.random() * 50) + 50, // 50-99
        }));
        const obtained = subjectResults.reduce((sum, sub) => sum + sub.obtainedMarks, 0);
        const pct = Math.round((obtained / totalMaxMarks) * 100);

        return {
          student: s,
          subjects: subjectResults,
          totalMarks: totalMaxMarks,
          obtainedMarks: obtained,
          percentage: pct,
          grade: getGrade(pct),
        };
      });

      // Sort by obtained marks descending for position
      studentMarks.sort((a, b) => b.obtainedMarks - a.obtainedMarks);

      studentMarks.forEach((sm, idx) => {
        // Vary status: Midterm results are sent, Final results are draft/approved
        let status: StudentResult['status'] = 'draft';
        if (examType === 'Midterm') {
          status = 'sent';
        } else {
          // Final exam: Class 10 approved, others draft
          if (className === 'Class 10' || className === 'Class 9') {
            status = 'approved';
          }
        }

        results.push({
          id: `result-${sm.student.id}-${examType.toLowerCase()}`,
          schoolId: 'school-001',
          studentId: sm.student.id,
          studentName: sm.student.name,
          fatherName: sm.student.father,
          className,
          rollNo: sm.student.roll,
          examType,
          subjects: sm.subjects,
          totalMarks: sm.totalMarks,
          obtainedMarks: sm.obtainedMarks,
          percentage: sm.percentage,
          grade: sm.grade,
          position: idx + 1,
          status,
        });
      });
    });
  });

  return results;
}

export const results: StudentResult[] = generateResults();

export function getClassResultSummaries(): ClassResultSummary[] {
  const classes = ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  const examTypes = ['Midterm', 'Final'];
  const summaries: ClassResultSummary[] = [];

  classes.forEach((className) => {
    examTypes.forEach((examType) => {
      const classResults = results.filter(
        (r) => r.className === className && r.examType === examType
      );
      const allSent = classResults.every((r) => r.status === 'sent');
      const allApprovedOrSent = classResults.every(
        (r) => r.status === 'approved' || r.status === 'sent'
      );

      let status: ClassResultSummary['status'] = 'draft';
      if (allSent) status = 'sent';
      else if (allApprovedOrSent) status = 'approved';

      summaries.push({
        className,
        examType,
        totalStudents: classResults.length,
        marksEntered: classResults.length,
        resultsGenerated: classResults.length > 0,
        sentToParents: allSent,
        status,
      });
    });
  });

  return summaries;
}

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clean in reverse dependency order
  const models = [
    'auditLog', 'notification', 'homework', 'note', 'favoriteTutor',
    'quizAttempt', 'quizQuestion', 'question', 'quiz',
    'review', 'payment', 'booking', 'timeSlot', 'tutorSubject',
    'subject', 'studentProfile', 'tutorProfile', 'oAuthConnection', 'user',
  ] as const;

  for (const model of models) {
    await (prisma[model] as any).deleteMany();
  }

  const passwordHash = await bcrypt.hash('Password123!', 12);

  // ============================================
  // 1. Users (1 admin + 4 tutors + 3 students)
  // ============================================
  const admin = await prisma.user.create({
    data: {
      email: 'admin@stemtutor.com',
      passwordHash,
      role: 'ADMINISTRATOR',
      firstName: 'Admin',
      lastName: 'System',
      isActive: true,
      isVerified: true,
    },
  });

  const tutors = [];
  const tutorSeedData = [
    { email: 'zhang.teacher@stemtutor.com', firstName: '张', lastName: '老师' },
    { email: 'li.physics@stemtutor.com', firstName: '李', lastName: '物理' },
    { email: 'wang.cs@stemtutor.com', firstName: '王', lastName: '程序员' },
    { email: 'chen.math@stemtutor.com', firstName: '陈', lastName: '数学' },
  ];

  for (const t of tutorSeedData) {
    tutors.push(await prisma.user.create({
      data: { email: t.email, passwordHash, role: 'TUTOR', firstName: t.firstName, lastName: t.lastName, isActive: true, isVerified: true },
    }));
  }

  const students = [];
  const studentSeedData = [
    { email: 'student1@example.com', firstName: '小明', lastName: '王' },
    { email: 'student2@example.com', firstName: '小红', lastName: '李' },
    { email: 'student3@example.com', firstName: '小华', lastName: '张' },
  ];

  for (const s of studentSeedData) {
    students.push(await prisma.user.create({
      data: { email: s.email, passwordHash, role: 'STUDENT', firstName: s.firstName, lastName: s.lastName, isActive: true, isVerified: true },
    }));
  }

  console.log(`Users: ${1 + tutors.length + students.length}`);

  // ============================================
  // 2. Student Profiles
  // ============================================
  await Promise.all([
    prisma.studentProfile.create({ data: { userId: students[0].id, level: 'high_school', grade: '2nd year', institution: 'Beijing No.4 High School', learningPrefs: { preferredFormat: 'online' } } }),
    prisma.studentProfile.create({ data: { userId: students[1].id, level: 'high_school', grade: '3rd year', institution: 'Shanghai Middle School', learningPrefs: { preferredFormat: 'in_person' } } }),
    prisma.studentProfile.create({ data: { userId: students[2].id, level: 'university', grade: '1st year', institution: 'Tsinghua University', learningPrefs: { preferredFormat: 'online' } } }),
  ]);

  // ============================================
  // 3. Tutor Profiles
  // ============================================
  const tutorProfiles = await Promise.all([
    prisma.tutorProfile.create({
      data: {
        userId: tutors[0].id,
        bio: 'Experienced mathematics teacher with 15 years of experience.',
        education: { degree: 'MSc Mathematics', university: 'Peking University', year: 2010 },
        hourlyRate30: 40, hourlyRate45: 55, hourlyRate60: 70, hourlyRate90: 100, onlineRate: 60,
        location: 'Beijing Haidian', latitude: 39.959, longitude: 116.298,
        isVerified: true, avgRating: 4.8, totalReviews: 45, totalSessions: 120,
      },
    }),
    prisma.tutorProfile.create({
      data: {
        userId: tutors[1].id,
        bio: 'Physics PhD, specializing in physics competition coaching.',
        education: { degree: 'PhD Physics', university: 'Tsinghua University', year: 2015 },
        hourlyRate30: 50, hourlyRate45: 65, hourlyRate60: 80, hourlyRate90: 110, onlineRate: 70,
        location: 'Beijing Chaoyang', latitude: 39.921, longitude: 116.443,
        isVerified: true, avgRating: 4.9, totalReviews: 32, totalSessions: 85,
      },
    }),
    prisma.tutorProfile.create({
      data: {
        userId: tutors[2].id,
        bio: 'Senior software engineer, proficient in Python, Java, and Web development.',
        education: { degree: 'MSc Computer Science', university: 'Zhejiang University', year: 2018 },
        hourlyRate30: 35, hourlyRate45: 50, hourlyRate60: 60, hourlyRate90: 85, onlineRate: 50,
        location: 'Hangzhou Xihu', latitude: 30.259, longitude: 120.139,
        isVerified: true, avgRating: 4.7, totalReviews: 25, totalSessions: 60,
      },
    }),
    prisma.tutorProfile.create({
      data: {
        userId: tutors[3].id,
        bio: 'Elementary math specialist, gamified learning approach.',
        education: { degree: 'BEd Education', university: 'East China Normal University', year: 2012 },
        hourlyRate30: 25, hourlyRate45: 35, hourlyRate60: 45, hourlyRate90: 60, onlineRate: 35,
        location: 'Shanghai Pudong', latitude: 31.230, longitude: 121.474,
        isVerified: true, avgRating: 4.6, totalReviews: 68, totalSessions: 200,
      },
    }),
  ]);

  // ============================================
  // 4. Subjects (15 total)
  // ============================================
  const subjects = await Promise.all([
    // Mathematics
    prisma.subject.create({ data: { name: 'Basic Math', category: 'mathematics', level: 'elementary', description: 'Elementary math: addition, subtraction, multiplication, division, fractions.' } }),
    prisma.subject.create({ data: { name: 'Algebra', category: 'mathematics', level: 'high_school', description: 'Equations, inequalities, functions.' } }),
    prisma.subject.create({ data: { name: 'Geometry', category: 'mathematics', level: 'high_school', description: 'Plane geometry, trigonometry.' } }),
    prisma.subject.create({ data: { name: 'Calculus', category: 'mathematics', level: 'university', description: 'Limits, derivatives, integrals.' } }),
    prisma.subject.create({ data: { name: 'Linear Algebra', category: 'mathematics', level: 'university', description: 'Matrices, vectors, eigenvalues.' } }),
    prisma.subject.create({ data: { name: 'Statistics', category: 'mathematics', level: 'university', description: 'Probability, distributions, hypothesis testing.' } }),
    // Physics
    prisma.subject.create({ data: { name: 'Basic Physics', category: 'physics', level: 'high_school', description: 'Mechanics and thermodynamics basics.' } }),
    prisma.subject.create({ data: { name: 'Mechanics', category: 'physics', level: 'high_school', description: "Newton's laws, energy conservation." } }),
    prisma.subject.create({ data: { name: 'Electromagnetism', category: 'physics', level: 'university', description: 'Electric fields, magnetic fields, Maxwell equations.' } }),
    prisma.subject.create({ data: { name: 'Quantum Physics', category: 'physics', level: 'university', description: 'Wave-particle duality, Schrodinger equation.' } }),
    // Computer Science
    prisma.subject.create({ data: { name: 'Python Programming', category: 'computer_science', level: 'high_school', description: 'Python programming for beginners.' } }),
    prisma.subject.create({ data: { name: 'Data Structures & Algorithms', category: 'computer_science', level: 'university', description: 'Classic data structures and algorithm analysis.' } }),
    prisma.subject.create({ data: { name: 'Web Development', category: 'computer_science', level: 'high_school', description: 'Frontend and backend web development basics.' } }),
    prisma.subject.create({ data: { name: 'Machine Learning', category: 'computer_science', level: 'university', description: 'ML theory and practice.' } }),
    prisma.subject.create({ data: { name: 'Database Systems', category: 'computer_science', level: 'university', description: 'Relational databases, SQL, normalization.' } }),
  ]);

  console.log(`Subjects: ${subjects.length}`);

  // ============================================
  // 5. Tutor Subjects
  // ============================================
  const mathSubjects = subjects.filter(s => s.category === 'mathematics');
  const physicsSubjects = subjects.filter(s => s.category === 'physics');
  const csSubjects = subjects.filter(s => s.category === 'computer_science');

  const tutorSubjectData: { tutorId: string; subjectId: string }[] = [];

  // Tutor 0 (zhang) - all math
  mathSubjects.forEach(s => tutorSubjectData.push({ tutorId: tutorProfiles[0].id, subjectId: s.id }));
  // Tutor 1 (li) - all physics
  physicsSubjects.forEach(s => tutorSubjectData.push({ tutorId: tutorProfiles[1].id, subjectId: s.id }));
  // Tutor 2 (wang) - all CS
  csSubjects.forEach(s => tutorSubjectData.push({ tutorId: tutorProfiles[2].id, subjectId: s.id }));
  // Tutor 3 (chen) - elementary math + basic physics
  tutorSubjectData.push({ tutorId: tutorProfiles[3].id, subjectId: subjects[0].id });
  tutorSubjectData.push({ tutorId: tutorProfiles[3].id, subjectId: subjects[6].id });
  tutorSubjectData.push({ tutorId: tutorProfiles[3].id, subjectId: subjects[1].id });

  await prisma.tutorSubject.createMany({ data: tutorSubjectData });

  // ============================================
  // 6. Time Slots (dayOfWeek 0-6)
  // ============================================
  const timeSlotData: { tutorId: string; dayOfWeek: number; startTime: string; endTime: string }[] = [];

  // Tutor 0 - Mon/Wed/Fri 9-17
  [1, 3, 5].forEach(day => {
    timeSlotData.push({ tutorId: tutorProfiles[0].id, dayOfWeek: day, startTime: '09:00', endTime: '12:00' });
    timeSlotData.push({ tutorId: tutorProfiles[0].id, dayOfWeek: day, startTime: '14:00', endTime: '17:00' });
  });

  // Tutor 1 - Tue/Thu 10-18
  [2, 4].forEach(day => {
    timeSlotData.push({ tutorId: tutorProfiles[1].id, dayOfWeek: day, startTime: '10:00', endTime: '13:00' });
    timeSlotData.push({ tutorId: tutorProfiles[1].id, dayOfWeek: day, startTime: '15:00', endTime: '18:00' });
  });

  // Tutor 2 - Mon-Sat evenings
  [1, 2, 3, 4, 5, 6].forEach(day => {
    timeSlotData.push({ tutorId: tutorProfiles[2].id, dayOfWeek: day, startTime: '18:00', endTime: '21:00' });
  });

  // Tutor 3 - Mon-Fri 8-16
  [1, 2, 3, 4, 5].forEach(day => {
    timeSlotData.push({ tutorId: tutorProfiles[3].id, dayOfWeek: day, startTime: '08:00', endTime: '12:00' });
    timeSlotData.push({ tutorId: tutorProfiles[3].id, dayOfWeek: day, startTime: '13:00', endTime: '16:00' });
  });

  await prisma.timeSlot.createMany({ data: timeSlotData });
  console.log(`Time Slots: ${timeSlotData.length}`);

  // ============================================
  // 7. Bookings
  // ============================================
  const now = new Date();
  const future3d = new Date(now.getTime() + 3 * 86400000);
  const past5d = new Date(now.getTime() - 5 * 86400000);
  const past10d = new Date(now.getTime() - 10 * 86400000);
  const future7d = new Date(now.getTime() + 7 * 86400000);

  const bookings = await Promise.all([
    // Confirmed upcoming
    prisma.booking.create({
      data: {
        studentId: students[0].id, tutorId: tutors[0].id, subjectId: subjects[3].id,
        bookingDate: future3d, startTime: '10:00', endTime: '11:00',
        format: 'online', status: 'pending', price: 70,
        notes: 'Need help with integration techniques', meetUrl: 'https://meet.google.com/abc-defg-hij',
      },
    }),
    // Completed past
    prisma.booking.create({
      data: {
        studentId: students[0].id, tutorId: tutors[0].id, subjectId: subjects[4].id,
        bookingDate: past5d, startTime: '14:00', endTime: '15:00',
        format: 'online', status: 'completed', price: 70,
        notes: 'Matrix operations review',
      },
    }),
    // Pending
    prisma.booking.create({
      data: {
        studentId: students[1].id, tutorId: tutors[1].id, subjectId: subjects[7].id,
        bookingDate: future7d, startTime: '15:00', endTime: '16:30',
        format: 'in_person', status: 'pending', price: 110,
        notes: 'Physics exam preparation',
      },
    }),
    // Completed past (for review)
    prisma.booking.create({
      data: {
        studentId: students[1].id, tutorId: tutors[3].id, subjectId: subjects[1].id,
        bookingDate: past10d, startTime: '10:00', endTime: '11:00',
        format: 'in_person', status: 'completed', price: 45,
      },
    }),
    // Cancelled
    prisma.booking.create({
      data: {
        studentId: students[2].id, tutorId: tutors[2].id, subjectId: subjects[11].id,
        bookingDate: past10d, startTime: '19:00', endTime: '20:00',
        format: 'online', status: 'cancelled', price: 60,
        cancellationReason: 'Schedule conflict',
      },
    }),
    // Another completed
    prisma.booking.create({
      data: {
        studentId: students[2].id, tutorId: tutors[0].id, subjectId: subjects[5].id,
        bookingDate: past5d, startTime: '14:00', endTime: '15:00',
        format: 'online', status: 'completed', price: 70,
        notes: 'Probability distributions',
      },
    }),
  ]);

  console.log(`Bookings: ${bookings.length}`);

  // ============================================
  // 8. Payments
  // ============================================
  await Promise.all([
    prisma.payment.create({ data: { bookingId: bookings[0].id, stripePaymentId: 'pi_test_001', amount: 70, platformFee: 7, status: 'completed' } }),
    prisma.payment.create({ data: { bookingId: bookings[1].id, stripePaymentId: 'pi_test_002', amount: 70, platformFee: 7, status: 'completed', escrowReleasedAt: new Date(now.getTime() - 3 * 86400000) } }),
    prisma.payment.create({ data: { bookingId: bookings[3].id, stripePaymentId: 'pi_test_003', amount: 45, platformFee: 4.5, status: 'completed', escrowReleasedAt: new Date(now.getTime() - 5 * 86400000) } }),
    prisma.payment.create({ data: { bookingId: bookings[4].id, stripePaymentId: 'pi_test_004', amount: 60, platformFee: 6, status: 'refunded' } }),
    prisma.payment.create({ data: { bookingId: bookings[5].id, stripePaymentId: 'pi_test_005', amount: 70, platformFee: 7, status: 'completed', escrowReleasedAt: new Date(now.getTime() - 4 * 86400000) } }),
  ]);

  // ============================================
  // 9. Reviews
  // ============================================
  await Promise.all([
    prisma.review.create({
      data: {
        bookingId: bookings[1].id, studentId: students[0].id, tutorId: tutors[0].id,
        rating: 5, communication: 5, expertise: 5, preparation: 5, value: 4,
        comment: 'Excellent tutor! Very clear explanations of matrix operations.',
        tutorResponse: 'Thank you! You were a great student.',
      },
    }),
    prisma.review.create({
      data: {
        bookingId: bookings[3].id, studentId: students[1].id, tutorId: tutors[3].id,
        rating: 5, communication: 5, expertise: 4, preparation: 5, value: 5,
        comment: 'Amazing! Made algebra so easy to understand.',
      },
    }),
    prisma.review.create({
      data: {
        bookingId: bookings[5].id, studentId: students[2].id, tutorId: tutors[0].id,
        rating: 4, communication: 4, expertise: 5, preparation: 4, value: 4,
        comment: 'Very knowledgeable in statistics. Good pace and clear examples.',
      },
    }),
  ]);

  // ============================================
  // 10. Questions
  // ============================================
  const questions = await Promise.all([
    prisma.question.create({
      data: { subjectId: subjects[1].id, type: 'multiple_choice', difficulty: 'easy', content: 'Solve for x: 2x + 5 = 13', options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'], correctAnswer: 'x = 4', explanation: 'Subtract 5: 2x=8, divide by 2: x=4', points: 1 },
    }),
    prisma.question.create({
      data: { subjectId: subjects[1].id, type: 'multiple_choice', difficulty: 'medium', content: 'Discriminant of x^2 - 5x + 6 = 0?', options: ['1', '25', '-1', '49'], correctAnswer: '1', explanation: 'D = 25 - 24 = 1', points: 2 },
    }),
    prisma.question.create({
      data: { subjectId: subjects[3].id, type: 'problem', difficulty: 'medium', content: 'Find the derivative of f(x) = 3x^3 - 2x^2 + 5x - 7', correctAnswer: "f'(x) = 9x^2 - 4x + 5", explanation: 'Apply power rule.', points: 3 },
    }),
    prisma.question.create({
      data: { subjectId: subjects[7].id, type: 'multiple_choice', difficulty: 'easy', content: 'SI unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 'Newton', explanation: 'Newton (N) = kg*m/s^2', points: 1 },
    }),
    prisma.question.create({
      data: { subjectId: subjects[7].id, type: 'problem', difficulty: 'medium', content: 'Car accelerates from rest at 3 m/s^2. Velocity after 5 seconds?', correctAnswer: '15 m/s', explanation: 'v = v0 + at = 0 + 3*5 = 15 m/s', points: 2 },
    }),
    prisma.question.create({
      data: { subjectId: subjects[11].id, type: 'multiple_choice', difficulty: 'easy', content: 'Time complexity of array access by index?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], correctAnswer: 'O(1)', explanation: 'Arrays provide O(1) random access.', points: 1 },
    }),
    prisma.question.create({
      data: { subjectId: subjects[10].id, type: 'short_answer', difficulty: 'easy', content: 'Keyword to define a function in Python?', correctAnswer: 'def', explanation: 'Python uses "def" keyword.', points: 1 },
    }),
  ]);

  console.log(`Questions: ${questions.length}`);

  // ============================================
  // 11. Quizzes
  // ============================================
  const quiz1 = await prisma.quiz.create({
    data: { title: 'Algebra Fundamentals', subjectId: subjects[1].id, timeLimit: 20, createdBy: tutors[0].id, isActive: true },
  });
  const quiz2 = await prisma.quiz.create({
    data: { title: 'Physics Mechanics Test', subjectId: subjects[7].id, timeLimit: 30, createdBy: tutors[1].id, isActive: true },
  });
  const quiz3 = await prisma.quiz.create({
    data: { title: 'CS Basics', subjectId: subjects[11].id, timeLimit: 45, createdBy: tutors[2].id, isActive: true },
  });

  await prisma.quizQuestion.createMany({
    data: [
      { quizId: quiz1.id, questionId: questions[0].id, order: 1 },
      { quizId: quiz1.id, questionId: questions[1].id, order: 2 },
      { quizId: quiz2.id, questionId: questions[3].id, order: 1 },
      { quizId: quiz2.id, questionId: questions[4].id, order: 2 },
      { quizId: quiz3.id, questionId: questions[5].id, order: 1 },
      { quizId: quiz3.id, questionId: questions[6].id, order: 2 },
    ],
  });

  // ============================================
  // 12. Quiz Attempts
  // ============================================
  await Promise.all([
    prisma.quizAttempt.create({
      data: { quizId: quiz1.id, studentId: students[0].id, score: 3, maxScore: 3, answers: { '0': 'x = 4', '1': '1' }, completedAt: new Date(now.getTime() - 2 * 86400000) },
    }),
    prisma.quizAttempt.create({
      data: { quizId: quiz3.id, studentId: students[0].id, score: 1, maxScore: 2, answers: { '5': 'O(1)', '6': 'function' }, completedAt: new Date(now.getTime() - 6 * 3600000) },
    }),
  ]);

  // ============================================
  // 13. Favorite Tutors
  // ============================================
  await prisma.favoriteTutor.createMany({
    data: [
      { studentId: students[0].id, tutorId: tutors[0].id },
      { studentId: students[0].id, tutorId: tutors[1].id },
      { studentId: students[1].id, tutorId: tutors[3].id },
    ],
  });

  // ============================================
  // 14. Notes
  // ============================================
  await prisma.note.createMany({
    data: [
      { studentId: students[0].id, title: 'Integration Techniques Summary', content: 'Key methods: u-substitution, integration by parts, partial fractions.', subjectId: subjects[3].id },
      { studentId: students[0].id, title: 'Eigenvalue Quick Reference', content: 'det(A - lambdaI) = 0, solve for eigenvalues and eigenvectors.', subjectId: subjects[4].id },
      { studentId: students[1].id, title: 'Newton Laws Cheat Sheet', content: '1st: inertia, 2nd: F=ma, 3rd: action-reaction.', subjectId: subjects[7].id },
      { studentId: students[2].id, title: 'Python Tips', content: 'List comprehension: [x**2 for x in range(10)]', subjectId: subjects[10].id },
    ],
  });

  // ============================================
  // 15. Homework
  // ============================================
  await prisma.homework.createMany({
    data: [
      { bookingId: bookings[1].id, tutorId: tutors[0].id, title: 'Matrix Operations Practice', description: 'Complete exercises 3.1-3.10 on matrix multiplication and determinants.', dueDate: new Date(now.getTime() + 7 * 86400000) },
      { bookingId: bookings[3].id, tutorId: tutors[3].id, title: 'Quadratic Equations Worksheet', description: 'Solve 20 quadratic equations using the quadratic formula.', dueDate: new Date(now.getTime() + 5 * 86400000) },
    ],
  });

  // ============================================
  // 16. Notifications
  // ============================================
  await prisma.notification.createMany({
    data: [
      { userId: students[0].id, type: 'booking_confirmed', title: 'Booking Confirmed', message: 'Your calculus session with Zhang has been confirmed.', isRead: false, data: { bookingId: bookings[0].id } },
      { userId: students[0].id, type: 'quiz_result', title: 'Quiz Completed', message: 'You scored 100% on Algebra Fundamentals!', isRead: true, data: { quizId: quiz1.id, score: 3, maxScore: 3 } },
      { userId: students[1].id, type: 'booking_request', title: 'Booking Pending', message: 'Your Mechanics session with Li is pending confirmation.', isRead: false, data: { bookingId: bookings[2].id } },
      { userId: tutors[0].id, type: 'new_booking', title: 'New Session Booked', message: 'Xiaoming Wang booked a calculus session.', isRead: false, data: { bookingId: bookings[0].id } },
      { userId: tutors[0].id, type: 'new_review', title: 'New Review', message: 'You received a 5-star review for Linear Algebra.', isRead: true, data: { rating: 5 } },
      { userId: admin.id, type: 'system', title: 'Tutor Pending Verification', message: 'All new tutors have been verified.', isRead: false },
    ],
  });

  // ============================================
  // 17. Audit Logs
  // ============================================
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: 'USER_CREATE', resource: 'User', resourceId: tutors[0].id, details: { email: tutors[0].email, role: 'TUTOR' }, ipAddress: '127.0.0.1' },
      { userId: admin.id, action: 'TUTOR_VERIFY', resource: 'TutorProfile', resourceId: tutorProfiles[0].id, details: { verified: true }, ipAddress: '127.0.0.1' },
      { userId: students[0].id, action: 'BOOKING_CREATE', resource: 'Booking', resourceId: bookings[0].id, details: { tutorId: tutors[0].id, subject: 'Calculus' }, ipAddress: '127.0.0.1' },
    ],
  });

  console.log('\n--- Seed Summary ---');
  console.log(`Users:           ${1 + tutors.length + students.length} (1 admin, ${tutors.length} tutors, ${students.length} students)`);
  console.log(`Tutor Profiles:  ${tutorProfiles.length}`);
  console.log(`Student Profiles: ${students.length}`);
  console.log(`Subjects:        ${subjects.length}`);
  console.log(`Tutor Subjects:  ${tutorSubjectData.length}`);
  console.log(`Time Slots:      ${timeSlotData.length}`);
  console.log(`Bookings:        ${bookings.length}`);
  console.log(`Questions:       ${questions.length}`);
  console.log(`Quizzes:         3`);
  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

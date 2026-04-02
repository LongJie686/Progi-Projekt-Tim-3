import { PrismaClient, UserRole, BookingStatus, SessionFormat, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始种子数据插入...');

  // 清理现有数据
  await cleanDatabase();

  // 1. 创建科目
  const subjects = await createSubjects();
  console.log('科目创建完成:', subjects.length);

  // 2. 创建管理员用户
  const admin = await createAdmin();
  console.log('管理员创建完成:', admin.email);

  // 3. 创建导师用户及其档案
  const tutors = await createTutors();
  console.log('导师创建完成:', tutors.length);

  // 4. 创建学生用户及其档案
  const students = await createStudents();
  console.log('学生创建完成:', students.length);

  // 5. 关联导师科目
  await createTutorSubjects(tutors, subjects);
  console.log('导师科目关联完成');

  // 6. 创建导师可用时间段
  await createTimeSlots(tutors);
  console.log('导师时间段创建完成');

  // 7. 创建预订
  const bookings = await createBookings(tutors, students, subjects);
  console.log('预订创建完成:', bookings.length);

  // 8. 创建支付记录
  await createPayments(bookings);
  console.log('支付记录创建完成');

  // 9. 创建评价
  await createReviews(bookings);
  console.log('评价创建完成');

  // 10. 创建问题库
  const questions = await createQuestions(subjects);
  console.log('问题创建完成:', questions.length);

  // 11. 创建测验
  const quizzes = await createQuizzes(subjects, questions);
  console.log('测验创建完成:', quizzes.length);

  // 12. 创建收藏导师
  await createFavoriteTutors(students, tutors);
  console.log('收藏导师创建完成');

  // 13. 创建学习笔记
  await createNotes(students, bookings);
  console.log('学习笔记创建完成');

  // 14. 创建作业
  await createHomework(tutors, bookings);
  console.log('作业创建完成');

  // 15. 创建通知
  await createNotifications([...students, ...tutors]);
  console.log('通知创建完成');

  console.log('种子数据插入完成!');
}

async function cleanDatabase() {
  // 按依赖顺序删除
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.homework.deleteMany();
  await prisma.note.deleteMany();
  await prisma.favoriteTutor.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.question.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.tutorSubject.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.tutorProfile.deleteMany();
  await prisma.oAuthConnection.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subject.deleteMany();
}

async function createSubjects() {
  const subjectData = [
    // 数学
    { name: '基础数学', category: '数学', level: 'primary', description: '小学数学基础，包括加减乘除、分数、小数等' },
    { name: '代数', category: '数学', level: 'middle', description: '初中代数，包括方程、不等式、函数基础' },
    { name: '几何', category: '数学', level: 'middle', description: '初中几何，包括平面几何证明和计算' },
    { name: '高等数学', category: '数学', level: 'high', description: '高中数学，包括微积分预备、三角函数等' },
    { name: '线性代数', category: '数学', level: 'college', description: '大学线性代数，矩阵、向量空间等' },
    { name: '微积分', category: '数学', level: 'college', description: '大学微积分，极限、导数、积分等' },

    // 物理
    { name: '基础物理', category: '物理', level: 'middle', description: '初中物理，力学、热学基础' },
    { name: '力学', category: '物理', level: 'high', description: '高中力学，牛顿定律、能量守恒等' },
    { name: '电磁学', category: '物理', level: 'high', description: '高中电磁学，电场、磁场、电路' },
    { name: '光学', category: '物理', level: 'high', description: '高中光学，光的反射、折射、干涉' },
    { name: '量子物理', category: '物理', level: 'college', description: '大学量子物理入门' },

    // 计算机科学
    { name: 'Python编程', category: '计算机科学', level: 'primary', description: 'Python编程入门，适合初学者' },
    { name: '数据结构与算法', category: '计算机科学', level: 'college', description: '经典数据结构和算法分析' },
    { name: 'Web开发', category: '计算机科学', level: 'middle', description: '前端和后端Web开发基础' },
    { name: '机器学习', category: '计算机科学', level: 'college', description: '机器学习基础理论和实践' },
    { name: '数据库原理', category: '计算机科学', level: 'college', description: '关系型数据库设计和SQL' },
  ];

  return await prisma.subject.createManyAndReturn({
    data: subjectData,
  });
}

async function createAdmin() {
  return await prisma.user.create({
    data: {
      email: 'admin@stemtutor.com',
      password: 'admin123', // 实际应用中应使用哈希密码
      firstName: '系统',
      lastName: '管理员',
      role: UserRole.ADMINISTRATOR,
      isActive: true,
      isVerified: true,
    },
  });
}

async function createTutors() {
  const tutorData = [
    {
      email: 'zhang.teacher@stemtutor.com',
      password: 'tutor123',
      firstName: '张',
      lastName: '老师',
      role: UserRole.TUTOR,
      isActive: true,
      isVerified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
      tutorProfile: {
        create: {
          bio: '资深数学教师，15年教学经验，擅长培养学生的数学思维和解题技巧。',
          education: {
            degree: '数学硕士',
            university: '北京大学',
            year: 2010,
          },
          hourlyRate60: 150,
          hourlyRate90: 200,
          location: '北京市海淀区',
          isVerified: true,
          totalSessions: 120,
          avgRating: 4.8,
          totalReviews: 45,
        },
      },
    },
    {
      email: 'li.physics@stemtutor.com',
      password: 'tutor123',
      firstName: '李',
      lastName: '物理',
      role: UserRole.TUTOR,
      isActive: true,
      isVerified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li',
      tutorProfile: {
        create: {
          bio: '物理博士，专注于高中物理竞赛辅导，帮助学生理解物理本质。',
          education: {
            degree: '物理学博士',
            university: '清华大学',
            year: 2015,
          },
          hourlyRate60: 180,
          hourlyRate90: 250,
          location: '北京市朝阳区',
          isVerified: true,
          totalSessions: 85,
          avgRating: 4.9,
          totalReviews: 32,
        },
      },
    },
    {
      email: 'wang.cs@stemtutor.com',
      password: 'tutor123',
      firstName: '王',
      lastName: '程序员',
      role: UserRole.TUTOR,
      isActive: true,
      isVerified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
      tutorProfile: {
        create: {
          bio: '资深软件工程师，5年大厂经验，精通Python、Java、Web开发。',
          education: {
            degree: '计算机科学硕士',
            university: '浙江大学',
            year: 2018,
          },
          hourlyRate60: 120,
          hourlyRate90: 160,
          location: '杭州市西湖区',
          isVerified: true,
          totalSessions: 60,
          avgRating: 4.7,
          totalReviews: 25,
        },
      },
    },
    {
      email: 'chen.math@stemtutor.com',
      password: 'tutor123',
      firstName: '陈',
      lastName: '数学',
      role: UserRole.TUTOR,
      isActive: true,
      isVerified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen',
      tutorProfile: {
        create: {
          bio: '小学数学启蒙专家，善于用游戏化方式激发孩子学习兴趣。',
          education: {
            degree: '教育学学士',
            university: '华东师范大学',
            year: 2012,
          },
          hourlyRate60: 80,
          hourlyRate90: 110,
          location: '上海市浦东新区',
          isVerified: true,
          totalSessions: 200,
          avgRating: 4.6,
          totalReviews: 68,
        },
      },
    },
    {
      email: 'zhao.ml@stemtutor.com',
      password: 'tutor123',
      firstName: '赵',
      lastName: 'AI',
      role: UserRole.TUTOR,
      isActive: true,
      isVerified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao',
      tutorProfile: {
        create: {
          bio: 'AI研究员，曾在多家AI公司工作，熟悉机器学习、深度学习实践。',
          education: {
            degree: '人工智能博士',
            university: '中科院',
            year: 2020,
          },
          hourlyRate60: 200,
          hourlyRate90: 280,
          location: '北京市中关村',
          isVerified: true,
          totalSessions: 30,
          avgRating: 5.0,
          totalReviews: 12,
        },
      },
    },
  ];

  const tutors = [];
  for (const data of tutorData) {
    const tutor = await prisma.user.create({
      data,
      include: { tutorProfile: true },
    });
    tutors.push(tutor);
  }
  return tutors;
}

async function createStudents() {
  const studentData = [
    {
      email: 'student1@example.com',
      password: 'student123',
      firstName: '小明',
      lastName: '王',
      role: UserRole.STUDENT,
      isActive: true,
      isVerified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
      studentProfile: {
        create: {
          gradeLevel: '高中二年级',
          school: '北京四中',
          parentEmail: 'parent1@example.com',
          parentPhone: '13800138001',
        },
      },
    },
    {
      email: 'student2@example.com',
      password: 'student123',
      firstName: '小红',
      lastName: '李',
      role: UserRole.STUDENT,
      isActive: true,
      isVerified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaohong',
      studentProfile: {
        create: {
          gradeLevel: '初中三年级',
          school: '上海中学',
          parentEmail: 'parent2@example.com',
          parentPhone: '13800138002',
        },
      },
    },
    {
      email: 'student3@example.com',
      password: 'student123',
      firstName: '小华',
      lastName: '张',
      role: UserRole.STUDENT,
      isActive: true,
      isVerified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaohua',
      studentProfile: {
        create: {
          gradeLevel: '小学五年级',
          school: '杭州小学',
          parentEmail: 'parent3@example.com',
          parentPhone: '13800138003',
        },
      },
    },
    {
      email: 'student4@example.com',
      password: 'student123',
      firstName: '小强',
      lastName: '陈',
      role: UserRole.STUDENT,
      isActive: true,
      isVerified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoqiang',
      studentProfile: {
        create: {
          gradeLevel: '大学一年级',
          school: '清华大学',
        },
      },
    },
    {
      email: 'student5@example.com',
      password: 'student123',
      firstName: '小美',
      lastName: '赵',
      role: UserRole.STUDENT,
      isActive: true,
      isVerified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaomei',
      studentProfile: {
        create: {
          gradeLevel: '大学三年级',
          school: '北京大学',
        },
      },
    },
  ];

  const students = [];
  for (const data of studentData) {
    const student = await prisma.user.create({
      data,
      include: { studentProfile: true },
    });
    students.push(student);
  }
  return students;
}

async function createTutorSubjects(tutors: any[], subjects: any[]) {
  const tutorSubjectData: { tutorId: string; subjectId: string; pricePerHour: number }[] = [];

  // 张老师 - 数学相关
  const mathTutor = tutors.find(t => t.email === 'zhang.teacher@stemtutor.com');
  const mathSubjects = subjects.filter(s => s.category === '数学');
  mathSubjects.forEach(s => {
    tutorSubjectData.push({
      tutorId: mathTutor!.id,
      subjectId: s.id,
      pricePerHour: mathTutor!.tutorProfile!.hourlyRate60!,
    });
  });

  // 李物理 - 物理相关
  const physicsTutor = tutors.find(t => t.email === 'li.physics@stemtutor.com');
  const physicsSubjects = subjects.filter(s => s.category === '物理');
  physicsSubjects.forEach(s => {
    tutorSubjectData.push({
      tutorId: physicsTutor!.id,
      subjectId: s.id,
      pricePerHour: physicsTutor!.tutorProfile!.hourlyRate60!,
    });
  });

  // 王程序员 - 计算机科学
  const csTutor = tutors.find(t => t.email === 'wang.cs@stemtutor.com');
  const csSubjects = subjects.filter(s => s.category === '计算机科学');
  csSubjects.forEach(s => {
    tutorSubjectData.push({
      tutorId: csTutor!.id,
      subjectId: s.id,
      pricePerHour: csTutor!.tutorProfile!.hourlyRate60!,
    });
  });

  // 陈数学 - 小学数学
  const primaryMathTutor = tutors.find(t => t.email === 'chen.math@stemtutor.com');
  const primaryMath = subjects.find(s => s.name === '基础数学');
  if (primaryMath && primaryMathTutor) {
    tutorSubjectData.push({
      tutorId: primaryMathTutor.id,
      subjectId: primaryMath.id,
      pricePerHour: primaryMathTutor.tutorProfile!.hourlyRate60!,
    });
  }

  // 赵AI - 机器学习
  const aiTutor = tutors.find(t => t.email === 'zhao.ml@stemtutor.com');
  const mlSubject = subjects.find(s => s.name === '机器学习');
  const dsSubject = subjects.find(s => s.name === '数据结构与算法');
  if (aiTutor) {
    if (mlSubject) {
      tutorSubjectData.push({
        tutorId: aiTutor.id,
        subjectId: mlSubject.id,
        pricePerHour: aiTutor.tutorProfile!.hourlyRate60!,
      });
    }
    if (dsSubject) {
      tutorSubjectData.push({
        tutorId: aiTutor.id,
        subjectId: dsSubject.id,
        pricePerHour: aiTutor.tutorProfile!.hourlyRate60!,
      });
    }
  }

  await prisma.tutorSubject.createMany({
    data: tutorSubjectData,
  });
}

async function createTimeSlots(tutors: any[]) {
  const timeSlotData: {
    tutorId: string;
    date: Date;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    format: SessionFormat;
  }[] = [];

  const today = new Date();
  const formats: SessionFormat[] = [SessionFormat.online, SessionFormat.in_person];

  tutors.forEach(tutor => {
    // 为每个导师创建未来7天的时间段
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);

      // 每天创建多个时间段
      const slots = [
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
        { start: '14:00', end: '15:00' },
        { start: '15:00', end: '16:00' },
        { start: '19:00', end: '20:00' },
      ];

      slots.forEach((slot, index) => {
        timeSlotData.push({
          tutorId: tutor.id,
          date,
          startTime: slot.start,
          endTime: slot.end,
          isAvailable: index % 2 === 0, // 部分可用
          format: formats[index % 2],
        });
      });
    }
  });

  await prisma.timeSlot.createMany({
    data: timeSlotData,
  });
}

async function createBookings(tutors: any[], students: any[], subjects: any[]) {
  const bookingData: {
    studentId: string;
    tutorId: string;
    subjectId: string;
    timeSlotId?: string;
    bookingDate: Date;
    startTime: string;
    endTime: string;
    format: SessionFormat;
    status: BookingStatus;
    price: number;
    notes: string;
    meetUrl?: string;
  }[] = [];

  const mathTutor = tutors.find(t => t.email === 'zhang.teacher@stemtutor.com');
  const physicsTutor = tutors.find(t => t.email === 'li.physics@stemtutor.com');
  const csTutor = tutors.find(t => t.email === 'wang.cs@stemtutor.com');

  const student1 = students.find(s => s.email === 'student1@example.com');
  const student2 = students.find(s => s.email === 'student2@example.com');
  const student3 = students.find(s => s.email === 'student3@example.com');
  const student4 = students.find(s => s.email === 'student4@example.com');

  const calculusSubject = subjects.find(s => s.name === '微积分');
  const mechanicsSubject = subjects.find(s => s.name === '力学');
  const pythonSubject = subjects.find(s => s.name === 'Python编程');
  const algebraSubject = subjects.find(s => s.name === '代数');

  const statuses: BookingStatus[] = [
    BookingStatus.completed,
    BookingStatus.confirmed,
    BookingStatus.pending,
    BookingStatus.cancelled,
  ];

  // 创建不同状态的预订
  if (mathTutor && student1 && calculusSubject) {
    bookingData.push({
      studentId: student1.id,
      tutorId: mathTutor.id,
      subjectId: calculusSubject.id,
      bookingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      startTime: '14:00',
      endTime: '15:00',
      format: SessionFormat.online,
      status: BookingStatus.completed,
      price: 150,
      notes: '微积分基础讲解',
      meetUrl: 'https://meet.google.com/abc-defg-hij',
    });
  }

  if (physicsTutor && student2 && mechanicsSubject) {
    bookingData.push({
      studentId: student2.id,
      tutorId: physicsTutor.id,
      subjectId: mechanicsSubject.id,
      bookingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      startTime: '10:00',
      endTime: '11:00',
      format: SessionFormat.in_person,
      status: BookingStatus.confirmed,
      price: 180,
      notes: '力学竞赛辅导',
    });
  }

  if (csTutor && student4 && pythonSubject) {
    bookingData.push({
      studentId: student4.id,
      tutorId: csTutor.id,
      subjectId: pythonSubject.id,
      bookingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startTime: '19:00',
      endTime: '20:00',
      format: SessionFormat.online,
      status: BookingStatus.pending,
      price: 120,
      notes: 'Python入门第一课',
    });
  }

  if (mathTutor && student3 && algebraSubject) {
    bookingData.push({
      studentId: student3.id,
      tutorId: mathTutor.id,
      subjectId: algebraSubject.id,
      bookingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '10:00',
      format: SessionFormat.online,
      status: BookingStatus.cancelled,
      price: 150,
      notes: '学生临时取消',
    });
  }

  return await prisma.booking.createManyAndReturn({
    data: bookingData,
  });
}

async function createPayments(bookings: any[]) {
  const paymentData: {
    bookingId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    stripePaymentIntentId?: string;
    paidAt?: Date;
  }[] = [];

  bookings.forEach(booking => {
    if (booking.status === BookingStatus.completed) {
      paymentData.push({
        bookingId: booking.id,
        amount: booking.price,
        currency: 'CNY',
        status: PaymentStatus.completed,
        stripePaymentIntentId: `pi_test_${booking.id.slice(0, 8)}`,
        paidAt: booking.bookingDate,
      });
    } else if (booking.status === BookingStatus.confirmed) {
      paymentData.push({
        bookingId: booking.id,
        amount: booking.price,
        currency: 'CNY',
        status: PaymentStatus.completed,
        stripePaymentIntentId: `pi_test_${booking.id.slice(0, 8)}`,
        paidAt: new Date(),
      });
    } else if (booking.status === BookingStatus.pending) {
      paymentData.push({
        bookingId: booking.id,
        amount: booking.price,
        currency: 'CNY',
        status: PaymentStatus.pending,
      });
    }
  });

  await prisma.payment.createMany({
    data: paymentData,
  });
}

async function createReviews(bookings: any[]) {
  const reviewData: {
    bookingId: string;
    studentId: string;
    tutorId: string;
    rating: number;
    communication: number;
    expertise: number;
    preparation: number;
    value: number;
    comment: string;
  }[] = [];

  const completedBookings = bookings.filter(b => b.status === BookingStatus.completed);

  completedBookings.forEach(booking => {
    reviewData.push({
      bookingId: booking.id,
      studentId: booking.studentId,
      tutorId: booking.tutorId,
      rating: 5,
      communication: 5,
      expertise: 5,
      preparation: 4,
      value: 5,
      comment: '老师讲解非常清晰，对我的帮助很大！强烈推荐。',
    });
  });

  await prisma.review.createMany({
    data: reviewData,
  });
}

async function createQuestions(subjects: any[]) {
  const questionData: {
    subjectId: string;
    content: string;
    options: any;
    correctAnswer: string;
    explanation: string;
    difficulty: string;
    createdBy: string;
  }[] = [];

  const mathSubject = subjects.find(s => s.name === '代数');
  const physicsSubject = subjects.find(s => s.name === '力学');
  const pythonSubject = subjects.find(s => s.name === 'Python编程');

  // 数学问题
  if (mathSubject) {
    questionData.push({
      subjectId: mathSubject.id,
      content: '求解方程 2x + 5 = 13，x的值是多少？',
      options: ['A. 4', 'B. 3', 'C. 5', 'D. 6'],
      correctAnswer: 'A',
      explanation: '2x = 13 - 5 = 8，所以 x = 4',
      difficulty: 'easy',
      createdBy: 'system',
    });

    questionData.push({
      subjectId: mathSubject.id,
      content: '如果 f(x) = x² - 3x + 2，求 f(2) 的值？',
      options: ['A. 0', 'B. 1', 'C. 2', 'D. -2'],
      correctAnswer: 'A',
      explanation: 'f(2) = 2² - 3×2 + 2 = 4 - 6 + 2 = 0',
      difficulty: 'medium',
      createdBy: 'system',
    });
  }

  // 物理问题
  if (physicsSubject) {
    questionData.push({
      subjectId: physicsSubject.id,
      content: '一个物体从10米高处自由落下，落地时的速度约为多少？（g=10m/s²）',
      options: ['A. 10 m/s', 'B. 14.14 m/s', 'C. 20 m/s', 'D. 100 m/s'],
      correctAnswer: 'B',
      explanation: '根据 v² = 2gh，v = √(2×10×10) = √200 ≈ 14.14 m/s',
      difficulty: 'medium',
      createdBy: 'system',
    });
  }

  // Python问题
  if (pythonSubject) {
    questionData.push({
      subjectId: pythonSubject.id,
      content: 'Python中，以下哪种数据类型是不可变的？',
      options: ['A. list', 'B. dict', 'C. tuple', 'D. set'],
      correctAnswer: 'C',
      explanation: 'tuple（元组）是不可变的数据类型，创建后不能修改其元素。',
      difficulty: 'easy',
      createdBy: 'system',
    });

    questionData.push({
      subjectId: pythonSubject.id,
      content: '以下代码的输出是什么？\nprint([1, 2, 3][1:])',
      options: ['A. [1, 2]', 'B. [2, 3]', 'C. [1]', 'D. [3]'],
      correctAnswer: 'B',
      explanation: '列表切片 [1:] 表示从索引1开始到末尾，结果是 [2, 3]',
      difficulty: 'easy',
      createdBy: 'system',
    });
  }

  return await prisma.question.createManyAndReturn({
    data: questionData,
  });
}

async function createQuizzes(subjects: any[], questions: any[]) {
  const quizData: {
    title: string;
    subjectId: string;
    description: string;
    timeLimit: number;
    totalQuestions: number;
    passingScore: number;
    createdBy: string;
    isPublished: boolean;
  }[] = [];

  const mathSubject = subjects.find(s => s.category === '数学');
  const physicsSubject = subjects.find(s => s.category === '物理');
  const csSubject = subjects.find(s => s.category === '计算机科学');

  if (mathSubject) {
    quizData.push({
      title: '代数基础测验',
      subjectId: mathSubject.id,
      description: '测试你对代数基础概念的理解',
      timeLimit: 30,
      totalQuestions: 2,
      passingScore: 60,
      createdBy: 'system',
      isPublished: true,
    });
  }

  if (physicsSubject) {
    quizData.push({
      title: '力学概念测验',
      subjectId: physicsSubject.id,
      description: '检验力学基础知识',
      timeLimit: 20,
      totalQuestions: 1,
      passingScore: 70,
      createdBy: 'system',
      isPublished: true,
    });
  }

  if (csSubject) {
    quizData.push({
      title: 'Python基础测验',
      subjectId: csSubject.id,
      description: 'Python编程入门知识测试',
      timeLimit: 15,
      totalQuestions: 2,
      passingScore: 50,
      createdBy: 'system',
      isPublished: true,
    });
  }

  const quizzes = await prisma.quiz.createManyAndReturn({
    data: quizData,
  });

  // 关联问题和测验
  const quizQuestionData: { quizId: string; questionId: string; order: number }[] = [];

  quizzes.forEach(quiz => {
    const relatedQuestions = questions.filter(q => q.subjectId === quiz.subjectId);
    relatedQuestions.forEach((question, index) => {
      quizQuestionData.push({
        quizId: quiz.id,
        questionId: question.id,
        order: index + 1,
      });
    });
  });

  await prisma.quizQuestion.createMany({
    data: quizQuestionData,
  });

  return quizzes;
}

async function createFavoriteTutors(students: any[], tutors: any[]) {
  const favoriteData: { studentId: string; tutorId: string }[] = [];

  const student1 = students.find(s => s.email === 'student1@example.com');
  const student2 = students.find(s => s.email === 'student2@example.com');

  const mathTutor = tutors.find(t => t.email === 'zhang.teacher@stemtutor.com');
  const physicsTutor = tutors.find(t => t.email === 'li.physics@stemtutor.com');

  if (student1 && mathTutor) {
    favoriteData.push({ studentId: student1.id, tutorId: mathTutor.id });
  }
  if (student1 && physicsTutor) {
    favoriteData.push({ studentId: student1.id, tutorId: physicsTutor.id });
  }
  if (student2 && physicsTutor) {
    favoriteData.push({ studentId: student2.id, tutorId: physicsTutor.id });
  }

  await prisma.favoriteTutor.createMany({
    data: favoriteData,
  });
}

async function createNotes(students: any[], bookings: any[]) {
  const noteData: {
    studentId: string;
    bookingId?: string;
    title: string;
    content: string;
    subject?: string;
  }[] = [];

  const student1 = students.find(s => s.email === 'student1@example.com');
  const completedBooking = bookings.find(b => b.status === BookingStatus.completed);

  if (student1) {
    noteData.push({
      studentId: student1.id,
      title: '微积分学习笔记',
      content: '今天学习了微积分的基本概念：极限和导数。极限是函数在某一点附近的行为，导数是函数的变化率...',
      subject: '数学',
    });

    if (completedBooking && completedBooking.studentId === student1.id) {
      noteData.push({
        studentId: student1.id,
        bookingId: completedBooking.id,
        title: '辅导课程笔记',
        content: '张老师讲解了导数的几何意义，曲线在某点的切线斜率就是该点的导数值...',
        subject: '数学',
      });
    }
  }

  await prisma.note.createMany({
    data: noteData,
  });
}

async function createHomework(tutors: any[], bookings: any[]) {
  const homeworkData: {
    bookingId: string;
    title: string;
    description: string;
    dueDate: Date;
    assignedBy: string;
  }[] = [];

  const completedBooking = bookings.find(b => b.status === BookingStatus.completed);
  const mathTutor = tutors.find(t => t.email === 'zhang.teacher@stemtutor.com');

  if (completedBooking && mathTutor) {
    homeworkData.push({
      bookingId: completedBooking.id,
      title: '导数练习题',
      description: '完成以下导数计算练习：1. 求 y=x² 的导数 2. 求 y=x³-2x+1 的导数 3. 求 y=sin(x) 的导数',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignedBy: mathTutor.id,
    });
  }

  await prisma.homework.createMany({
    data: homeworkData,
  });
}

async function createNotifications(users: any[]) {
  const notificationData: {
    userId: string;
    type: string;
    title: string;
    content: string;
    isRead: boolean;
  }[] = [];

  users.forEach((user, index) => {
    notificationData.push({
      userId: user.id,
      type: 'system',
      title: '欢迎使用STEM辅导平台',
      content: '感谢您注册STEM辅导平台，开始您的学习之旅吧！',
      isRead: index % 2 === 0,
    });

    if (user.role === UserRole.STUDENT) {
      notificationData.push({
        userId: user.id,
        type: 'booking',
        title: '预订提醒',
        content: '您有一节即将开始的课程，请准时参加。',
        isRead: false,
      });
    }

    if (user.role === UserRole.TUTOR) {
      notificationData.push({
        userId: user.id,
        type: 'review',
        title: '新评价通知',
        content: '您收到了一条新的学生评价，快去看看吧！',
        isRead: false,
      });
    }
  });

  await prisma.notification.createMany({
    data: notificationData,
  });
}

main()
  .catch((e) => {
    console.error('种子数据插入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
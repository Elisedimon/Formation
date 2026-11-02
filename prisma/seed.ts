import {
  PrismaClient,
  Role,
  EnrollmentStatus,
  PaymentStatus,
  DiscussionStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
async function main() {
  console.log('🌱 Début du seed AST-Academy...\n');

  // ── 0. Nettoyage (ordre important à cause des FK) ──
  console.log('🧹 Nettoyage des tables existantes...');
  await prisma.message.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.reviewLike.deleteMany();
  await prisma.review.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.platformSetting.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Tables nettoyées\n');

  // ── 1. Mot de passe commun ──
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // ── 2. UTILISATEURS ──
  console.log('👥 Création des utilisateurs...');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@ast-academy.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.ADMIN,
      emailVerificationToken: null,
    },
  });

  const instructorsData = [
    { firstName: 'Amadou', lastName: 'Diallo', email: 'amadou.diallo@ast-academy.com', bio: 'Expert DevOps & Cloud' },
    { firstName: 'Fatou', lastName: 'Ndiaye', email: 'fatou.ndiaye@ast-academy.com', bio: 'Lead Frontend React' },
    { firstName: 'Kofi', lastName: 'Mensah', email: 'kofi.mensah@ast-academy.com', bio: 'Data Scientist Senior' },
    { firstName: 'Aïcha', lastName: 'Traoré', email: 'aicha.traore@ast-academy.com', bio: 'UX/UI Designer' },
    { firstName: 'Ibrahim', lastName: 'Sow', email: 'ibrahim.sow@ast-academy.com', bio: 'Cybersecurity Engineer' },
  ];

  const instructors = await Promise.all(
    instructorsData.map((i) =>
      prisma.user.create({
        data: {
          email: i.email,
          passwordHash,
          firstName: i.firstName,
          lastName: i.lastName,
          role: Role.INSTRUCTOR,
        },
      })
    )
  );

  // 25 étudiants
  const firstNames = ['Moussa', 'Aminata', 'Cheikh', 'Mariam', 'Youssouf', 'Awa', 'Omar', 'Khady', 'Saliou', 'Nafissatou', 'Ibrahima', 'Bintou', 'Mamadou', 'Coumba', 'Lamine', 'Aïssatou', 'Modou', 'Ndèye', 'Pape', 'Sokhna', 'Alioune', 'Rokhaya', 'Samba', 'Dieynaba', 'Babacar'];
  const lastNames = ['Ba', 'Fall', 'Gueye', 'Diop', 'Sy', 'Cissé', 'Faye', 'Kane', 'Sarr', 'Thiam', 'Ndao', 'Camara', 'Koné', 'Touré', 'Barry'];

  const students = [];
  for (let i = 0; i < 25; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = pick(lastNames);
    const isVerified = Math.random() > 0.2;
    const student = await prisma.user.create({
      data: {
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@student.ast-academy.com`,
        passwordHash,
        firstName: fn,
        lastName: ln,
        role: Role.STUDENT,
        isActive: Math.random() > 0.1,
        emailVerificationToken: isVerified ? null : `verify_${i}_${Date.now()}`,
        emailVerificationTokenExpires: isVerified ? null : new Date(Date.now() + 24 * 3600 * 1000),
        createdAt: daysAgo(rand(1, 180)),
      },
    });
    students.push(student);
  }
  console.log(`✅ ${2 + instructors.length + students.length} utilisateurs créés\n`);

  // ── 3. COURS ──
  console.log('📚 Création des cours...');

  const coursesData = [
    {
      title: 'Docker & Kubernetes de A à Z',
      category: 'DevOps',
      description: 'Maîtrisez la conteneurisation et l\'orchestration pour déployer des applications modernes en production.',
      duration: '40h',
      level: 'Intermédiaire',
      price: 45000,
      icon: 'docker',
      instructorId: instructors[0].id,
      modules: [
        {
          title: 'Introduction à Docker',
          lessons: [
            { title: 'Pourquoi Docker ?', durationMinutes: 25 },
            { title: 'Installer Docker Desktop', durationMinutes: 20 },
            { title: 'Premiers containers', durationMinutes: 35 },
          ],
          quizzes: [
            {
              title: 'Quiz Docker Basics',
              questions: [
                { prompt: 'Que signifie Docker ?', options: ['Un moteur de conteneurisation', 'Un langage', 'Un OS', 'Une base de données'], correctAnswer: 0 },
                { prompt: 'Quelle commande liste les containers actifs ?', options: ['docker list', 'docker ps', 'docker show', 'docker run'], correctAnswer: 1 },
                { prompt: 'Quel fichier décrit une image Docker ?', options: ['docker.json', 'Dockerfile', 'image.yml', 'container.toml'], correctAnswer: 1 },
              ],
            },
          ],
        },
        {
          title: 'Docker Compose',
          lessons: [
            { title: 'Orchestrer plusieurs services', durationMinutes: 40 },
            { title: 'Volumes & Réseaux', durationMinutes: 30 },
          ],
          quizzes: [],
        },
        {
          title: 'Kubernetes Essentiels',
          lessons: [
            { title: 'Architecture K8s', durationMinutes: 45 },
            { title: 'Pods, Deployments, Services', durationMinutes: 60 },
            { title: 'Ingress & ConfigMaps', durationMinutes: 50 },
          ],
          quizzes: [
            {
              title: 'Quiz Kubernetes',
              questions: [
                { prompt: 'Quel objet K8s représente une unité déployable ?', options: ['Node', 'Pod', 'Volume', 'Service'], correctAnswer: 1 },
                { prompt: 'Que fait un Deployment ?', options: ['Gère les Pods', 'Stocke les secrets', 'Route le trafic', 'Crée des volumes'], correctAnswer: 0 },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'React 18 & TypeScript — Full Course',
      category: 'Frontend',
      description: 'Construisez des applications React modernes avec TypeScript, hooks, suspense et les meilleures pratiques.',
      duration: '50h',
      level: 'Débutant',
      price: 35000,
      icon: 'react',
      instructorId: instructors[1].id,
      modules: [
        {
          title: 'Fondations React',
          lessons: [
            { title: 'JSX & Composants', durationMinutes: 30 },
            { title: 'Props & State', durationMinutes: 35 },
            { title: 'Event Handling', durationMinutes: 25 },
          ],
          quizzes: [
            {
              title: 'React Fundamentals',
              questions: [
                { prompt: 'Quel hook gère un état local ?', options: ['useState', 'useFetch', 'useLocal', 'useVar'], correctAnswer: 0 },
                { prompt: 'Que retourne useEffect ?', options: ['Une promesse', 'Une fonction de cleanup optionnelle', 'Un state', 'Rien'], correctAnswer: 1 },
              ],
            },
          ],
        },
        {
          title: 'Hooks avancés',
          lessons: [
            { title: 'useMemo & useCallback', durationMinutes: 40 },
            { title: 'Custom Hooks', durationMinutes: 45 },
            { title: 'useReducer', durationMinutes: 35 },
          ],
          quizzes: [],
        },
      ],
    },
    {
      title: 'Python pour la Data Science',
      category: 'Data Science',
      description: 'NumPy, Pandas, Matplotlib, Scikit-learn : devenez Data Scientist opérationnel.',
      duration: '60h',
      level: 'Intermédiaire',
      price: 55000,
      icon: 'python',
      instructorId: instructors[2].id,
      modules: [
        {
          title: 'Python Essentiels',
          lessons: [
            { title: 'Syntaxe & types', durationMinutes: 30 },
            { title: 'Structures de données', durationMinutes: 40 },
            { title: 'Fonctions & modules', durationMinutes: 35 },
          ],
          quizzes: [
            {
              title: 'Python Basics',
              questions: [
                { prompt: 'Quel type pour une liste immuable ?', options: ['list', 'tuple', 'dict', 'set'], correctAnswer: 1 },
                { prompt: 'Comment ouvrir un fichier ?', options: ['open()', 'file()', 'read()', 'load()'], correctAnswer: 0 },
              ],
            },
          ],
        },
        {
          title: 'Pandas & NumPy',
          lessons: [
            { title: 'DataFrames', durationMinutes: 50 },
            { title: 'Nettoyage de données', durationMinutes: 45 },
            { title: 'Agrégations', durationMinutes: 40 },
          ],
          quizzes: [],
        },
        {
          title: 'Machine Learning',
          lessons: [
            { title: 'Régression linéaire', durationMinutes: 60 },
            { title: 'Classification', durationMinutes: 60 },
            { title: 'Clustering', durationMinutes: 50 },
          ],
          quizzes: [
            {
              title: 'ML Concepts',
              questions: [
                { prompt: 'Quel algo pour une classification binaire ?', options: ['KMeans', 'RandomForest', 'PCA', 't-SNE'], correctAnswer: 1 },
                { prompt: 'Que mesure l\'accuracy ?', options: ['La vitesse', 'Le ratio de prédictions correctes', 'La mémoire', 'Le F1'], correctAnswer: 1 },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'UX/UI Design avec Figma',
      category: 'Design',
      description: 'De la recherche utilisateur au prototype interactif : maîtrisez le design moderne.',
      duration: '30h',
      level: 'Débutant',
      price: 30000,
      icon: 'figma',
      instructorId: instructors[3].id,
      modules: [
        {
          title: 'Principes UX',
          lessons: [
            { title: 'Recherche utilisateur', durationMinutes: 40 },
            { title: 'Personas & User Journey', durationMinutes: 35 },
          ],
          quizzes: [],
        },
        {
          title: 'Figma en pratique',
          lessons: [
            { title: 'Composants & Variantes', durationMinutes: 50 },
            { title: 'Auto Layout', durationMinutes: 40 },
            { title: 'Prototypage', durationMinutes: 45 },
          ],
          quizzes: [
            {
              title: 'Figma Quiz',
              questions: [
                { prompt: 'À quoi sert l\'Auto Layout ?', options: ['Animer', 'Créer des layouts responsives', 'Exporter', 'Commenter'], correctAnswer: 1 },
                { prompt: 'Qu\'est-ce qu\'un composant ?', options: ['Un calque', 'Un élément réutilisable', 'Un export', 'Un plugin'], correctAnswer: 1 },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Cybersécurité — Ethical Hacking',
      category: 'Cybersécurité',
      description: 'Pentest, réseaux, cryptographie et défense. Devenez un hacker éthique certifié.',
      duration: '45h',
      level: 'Avancé',
      price: 60000,
      icon: 'shield',
      instructorId: instructors[4].id,
      modules: [
        {
          title: 'Fondations Réseau',
          lessons: [
            { title: 'Modèle OSI', durationMinutes: 40 },
            { title: 'TCP/IP en profondeur', durationMinutes: 50 },
          ],
          quizzes: [
            {
              title: 'Réseau Quiz',
              questions: [
                { prompt: 'Combien de couches dans le modèle OSI ?', options: ['5', '6', '7', '8'], correctAnswer: 2 },
                { prompt: 'Port HTTPS par défaut ?', options: ['80', '443', '22', '8080'], correctAnswer: 1 },
              ],
            },
          ],
        },
        {
          title: 'Pentest Web',
          lessons: [
            { title: 'OWASP Top 10', durationMinutes: 60 },
            { title: 'SQL Injection & XSS', durationMinutes: 55 },
            { title: 'Burp Suite', durationMinutes: 50 },
          ],
          quizzes: [],
        },
      ],
    },
    {
      title: 'Node.js & API REST Pro',
      category: 'Backend',
      description: 'Construisez des APIs robustes avec Express, Prisma, JWT et déploiement cloud.',
      duration: '40h',
      level: 'Intermédiaire',
      price: 40000,
      icon: 'node',
      instructorId: instructors[0].id,
      modules: [
        {
          title: 'Node & Express',
          lessons: [
            { title: 'Event Loop', durationMinutes: 35 },
            { title: 'Routing Express', durationMinutes: 40 },
            { title: 'Middlewares', durationMinutes: 30 },
          ],
          quizzes: [
            {
              title: 'Node.js Quiz',
              questions: [
                { prompt: 'Node.js est basé sur ?', options: ['V8', 'SpiderMonkey', 'JSC', 'Chakra'], correctAnswer: 0 },
                { prompt: 'Quel module pour HTTP ?', options: ['fs', 'http', 'net', 'os'], correctAnswer: 1 },
              ],
            },
          ],
        },
        {
          title: 'Prisma & PostgreSQL',
          lessons: [
            { title: 'Modélisation', durationMinutes: 45 },
            { title: 'Migrations', durationMinutes: 30 },
            { title: 'Relations avancées', durationMinutes: 50 },
          ],
          quizzes: [],
        },
      ],
    },
    {
      title: 'Marketing Digital & Growth',
      category: 'Marketing',
      description: 'SEO, SEA, réseaux sociaux et funnel d\'acquisition pour booster votre business.',
      duration: '25h',
      level: 'Débutant',
      price: 25000,
      icon: 'megaphone',
      instructorId: instructors[3].id,
      modules: [
        {
          title: 'SEO Fondamentaux',
          lessons: [
            { title: 'Mots-clés & SERP', durationMinutes: 40 },
            { title: 'On-page SEO', durationMinutes: 35 },
          ],
          quizzes: [],
        },
        {
          title: 'Publicité en ligne',
          lessons: [
            { title: 'Google Ads', durationMinutes: 45 },
            { title: 'Meta Ads', durationMinutes: 45 },
          ],
          quizzes: [
            {
              title: 'Ads Quiz',
              questions: [
                { prompt: 'Que signifie CTR ?', options: ['Click Through Rate', 'Cost To Run', 'Content Tag Ratio', 'Click Track Record'], correctAnswer: 0 },
                { prompt: 'Quel KPI pour l\'acquisition ?', options: ['CAC', 'NPS', 'CSAT', 'LTV'], correctAnswer: 0 },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Flutter — Applications Mobiles',
      category: 'Mobile',
      description: 'Développez des apps iOS & Android performantes avec Flutter et Dart.',
      duration: '35h',
      level: 'Intermédiaire',
      price: 38000,
      icon: 'flutter',
      instructorId: instructors[1].id,
      modules: [
        {
          title: 'Dart Essentiels',
          lessons: [
            { title: 'Syntaxe Dart', durationMinutes: 30 },
            { title: 'Null Safety', durationMinutes: 25 },
          ],
          quizzes: [],
        },
        {
          title: 'UI Flutter',
          lessons: [
            { title: 'Widgets Stateless & Stateful', durationMinutes: 45 },
            { title: 'Navigation', durationMinutes: 40 },
            { title: 'Animations', durationMinutes: 35 },
          ],
          quizzes: [
            {
              title: 'Flutter Quiz',
              questions: [
                { prompt: 'Quel langage pour Flutter ?', options: ['Kotlin', 'Swift', 'Dart', 'JS'], correctAnswer: 2 },
                { prompt: 'Widget principal pour l\'app ?', options: ['Scaffold', 'MaterialApp', 'Container', 'Column'], correctAnswer: 1 },
              ],
            },
          ],
        },
      ],
    },
  ];

  const courses = [];

  for (const c of coursesData) {
    const course = await prisma.course.create({
      data: {
        title: c.title,
        slug: slugify(c.title),
        description: c.description,
        category: c.category,
        duration: c.duration,
        level: c.level,
        price: c.price,
        icon: c.icon,
        isPublished: true,
        instructorId: c.instructorId,
        createdAt: daysAgo(rand(30, 200)),
        modules: {
          create: c.modules.map((m, mi) => ({
            title: m.title,
            position: mi,
            lessons: {
              create: m.lessons.map((l, li) => ({
                title: l.title,
                position: li,
                durationMinutes: l.durationMinutes,
                content: `Contenu détaillé de la leçon "${l.title}".`,
                videoUrl: `https://cdn.ast-academy.com/videos/${slugify(c.title)}-${mi}-${li}.mp4`,
              })),
            },
            quizzes: {
              create: m.quizzes.map((q) => ({
                title: q.title,
                passingScore: 70,
                questions: {
                  create: q.questions.map((qq, qi) => ({
                    prompt: qq.prompt,
                    options: qq.options,
                    correctAnswer: qq.correctAnswer,
                    position: qi,
                    explanation: `La bonne réponse est : ${qq.options[qq.correctAnswer]}`,
                  })),
                },
              })),
            },
          })),
        },
      },
      include: { modules: { include: { lessons: true, quizzes: { include: { questions: true } } } } },
    });
    courses.push(course);
  }
  console.log(`✅ ${courses.length} cours créés\n`);

  // ── 4. INSCRIPTIONS + PROGRESSION + QUIZ + PAIEMENTS + REÇUS + CERTIFICATS ──
  console.log('🎓 Création des inscriptions, paiements, certifications...');

  let enrollmentsCount = 0;
  let paymentsCount = 0;
  let receiptsCount = 0;
  let certificatesCount = 0;
  let quizAttemptsCount = 0;
  let lessonProgressCount = 0;

  for (const student of students) {
    // chaque étudiant s'inscrit à 2 à 5 cours
    const nbCourses = rand(2, 5);
    const shuffled = [...courses].sort(() => Math.random() - 0.5).slice(0, nbCourses);

    for (const course of shuffled) {
      const isCompleted = Math.random() > 0.6;
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
          status: isCompleted ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE,
          createdAt: daysAgo(rand(1, 90)),
        },
      });
      enrollmentsCount++;

      // Paiement lié (90% des cas)
      if (Math.random() > 0.1) {
        const paymentStatus = isCompleted ? PaymentStatus.APPROVED : pick([PaymentStatus.APPROVED, PaymentStatus.PENDING]);
        const payment = await prisma.payment.create({
          data: {
            userId: student.id,
            courseId: course.id,
            amount: course.price,
            currency: 'XOF',
            status: paymentStatus,
            fedapayId: `fedapay_${Date.now()}_${rand(1000, 9999)}`,
            fedapayStatus: paymentStatus === PaymentStatus.APPROVED ? 'approved' : 'pending',
            createdAt: daysAgo(rand(1, 90)),
          },
        });
        paymentsCount++;

        // Reçu si approuvé
        if (paymentStatus === PaymentStatus.APPROVED) {
          await prisma.receipt.create({
            data: {
              userId: student.id,
              paymentId: payment.id,
              pdfUrl: `https://cdn.ast-academy.com/receipts/${payment.id}.pdf`,
              amount: course.price,
              currency: 'XOF',
            },
          });
          receiptsCount++;
        }
      }

      // Progression leçons
      const allLessons = course.modules.flatMap((m) => m.lessons);
      const nbLessonsDone = isCompleted
        ? allLessons.length
        : rand(0, Math.max(1, Math.floor(allLessons.length / 2)));

      for (let i = 0; i < nbLessonsDone; i++) {
        await prisma.lessonProgress.create({
          data: {
            enrollmentId: enrollment.id,
            lessonId: allLessons[i].id,
            completedAt: daysAgo(rand(1, 60)),
          },
        });
        lessonProgressCount++;
      }

      // Tentatives quiz
      const allQuizzes = course.modules.flatMap((m) => m.quizzes);
      for (const quiz of allQuizzes) {
        if (Math.random() > 0.5) {
          const score = rand(40, 100);
          await prisma.quizAttempt.create({
            data: {
              enrollmentId: enrollment.id,
              quizId: quiz.id,
              score,
              passed: score >= quiz.passingScore,
              attemptedAt: daysAgo(rand(1, 45)),
            },
          });
          quizAttemptsCount++;
        }
      }

      // Certificat si complété
      if (isCompleted) {
        const code = `AST-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await prisma.certificate.create({
          data: {
            code,
            enrollmentId: enrollment.id,
            userId: student.id,
            issuedAt: daysAgo(rand(1, 30)),
            revokedAt: Math.random() > 0.95 ? daysAgo(rand(1, 10)) : null,
          },
        });
        certificatesCount++;
      }
    }
  }
  console.log(`✅ ${enrollmentsCount} inscriptions`);
  console.log(`✅ ${paymentsCount} paiements`);
  console.log(`✅ ${receiptsCount} reçus`);
  console.log(`✅ ${lessonProgressCount} progressions de leçons`);
  console.log(`✅ ${quizAttemptsCount} tentatives de quiz`);
  console.log(`✅ ${certificatesCount} certificats\n`);

  // ── 5. AVIS + LIKES ──
  console.log('⭐ Création des avis et likes...');

  const comments = [
    'Excellent cours, très complet !',
    'Formateur pédagogue, je recommande.',
    'Contenu de qualité, exercices pertinents.',
    'Un peu rapide sur certains chapitres mais globalement top.',
    'Meilleur cours que j\'ai suivi sur le sujet.',
    'Très bon rythme, parfait pour débuter.',
    'Les projets pratiques valent de l\'or.',
    'J\'aurais aimé plus d\'exemples avancés.',
    'Clair, concis, efficace. Merci !',
    'Le support est réactif, top expérience.',
  ];

  let reviewsCount = 0;
  let likesCount = 0;
  const createdReviews: { id: string; userId: string }[] = [];

  for (const student of students) {
    const nbReviews = rand(1, 3);
    const shuffledCourses = [...courses].sort(() => Math.random() - 0.5).slice(0, nbReviews);
    for (const course of shuffledCourses) {
      try {
        const review = await prisma.review.create({
          data: {
            userId: student.id,
            courseId: course.id,
            rating: rand(3, 5),
            comment: pick(comments),
            createdAt: daysAgo(rand(1, 60)),
          },
        });
        createdReviews.push({ id: review.id, userId: student.id });
        reviewsCount++;
      } catch {
        // ignore doublon (userId, courseId)
      }
    }
  }

  // Likes sur les avis (pas par leur auteur)
  for (const review of createdReviews) {
    const nbLikes = rand(0, 5);
    const likers = students.filter((s) => s.id !== review.userId).sort(() => Math.random() - 0.5).slice(0, nbLikes);
    for (const liker of likers) {
      try {
        await prisma.reviewLike.create({
          data: { userId: liker.id, reviewId: review.id },
        });
        likesCount++;
      } catch {
        // ignore doublon
      }
    }
  }
  console.log(`✅ ${reviewsCount} avis`);
  console.log(`✅ ${likesCount} likes\n`);

  // ── 6. DISCUSSIONS + MESSAGES ──
  console.log('💬 Création des discussions et messages...');

  const subjects = [
    'Problème d\'installation',
    'Question sur le chapitre 3',
    'Feedback sur le projet final',
    'Accès aux vidéos impossible',
    'Demande de mentorat',
    'Erreur dans le quiz',
  ];
  const messages = [
    'Bonjour, j\'ai un souci pour installer les outils. Quelqu\'un peut m\'aider ?',
    'Merci pour votre retour rapide, je vais tester ça.',
    'J\'ai suivi vos conseils et tout fonctionne, merci !',
    'Le quiz semble contenir une erreur sur la question 4.',
    'Serait-il possible d\'avoir une session live ?',
    'Je bloque sur la configuration réseau, une idée ?',
  ];

  let discussionsCount = 0;
  let messagesCount = 0;

  for (const course of courses) {
    const nbDiscussions = rand(2, 5);
    for (let d = 0; d < nbDiscussions; d++) {
      const student = pick(students);
      const instructor = instructors.find((i) => i.id === course.instructorId) ?? pick(instructors);
      const status = pick([DiscussionStatus.OPEN, DiscussionStatus.OPEN, DiscussionStatus.RESOLVED, DiscussionStatus.CLOSED]);

      const discussion = await prisma.discussion.create({
        data: {
          courseId: course.id,
          studentId: student.id,
          instructorId: instructor.id,
          subject: pick(subjects),
          status,
          createdAt: daysAgo(rand(1, 60)),
        },
      });
      discussionsCount++;

      const nbMsgs = rand(2, 6);
      for (let m = 0; m < nbMsgs; m++) {
        const senderId = m % 2 === 0 ? student.id : instructor.id;
        await prisma.message.create({
          data: {
            discussionId: discussion.id,
            senderId,
            content: pick(messages),
            read: Math.random() > 0.3,
            createdAt: daysAgo(rand(0, 50)),
          },
        });
        messagesCount++;
      }
    }
  }
  console.log(`✅ ${discussionsCount} discussions`);
  console.log(`✅ ${messagesCount} messages\n`);

  // ── 7. PARAMÈTRES PLATEFORME ──
  console.log('⚙️  Création des paramètres plateforme...');

  const settings = [
    { key: 'site.name', value: 'AST-Academy', type: 'string' },
    { key: 'site.email', value: 'contact@ast-academy.com', type: 'string' },
    { key: 'site.phone', value: '+221 33 000 00 00', type: 'string' },
    { key: 'site.currency', value: 'XOF', type: 'string' },
    { key: 'payment.fedapay.enabled', value: 'true', type: 'boolean' },
    { key: 'payment.fedapay.mode', value: 'sandbox', type: 'string' },
    { key: 'certificate.prefix', value: 'AST', type: 'string' },
    { key: 'quiz.defaultPassingScore', value: '70', type: 'number' },
    { key: 'email.smtp.host', value: 'smtp.gmail.com', type: 'string' },
    { key: 'email.smtp.port', value: '587', type: 'number' },
    { key: 'features.discussions', value: 'true', type: 'boolean' },
    { key: 'features.reviews', value: 'true', type: 'boolean' },
    { key: 'maintenance.mode', value: 'false', type: 'boolean' },
  ];

  for (const s of settings) {
    await prisma.platformSetting.create({
      data: { ...s, updatedBy: admin.id },
    });
  }
  console.log(`✅ ${settings.length} paramètres créés\n`);

  // ── 8. RÉCAP ──
  console.log('═══════════════════════════════════════════');
  console.log('🎉 SEED TERMINÉ AVEC SUCCÈS !');
  console.log('═══════════════════════════════════════════');
  console.log(`👑 Admin          : admin@ast-academy.com / Password123!`);
  console.log(`👨‍🏫 Instructeurs   : ${instructors.length}`);
  console.log(`🎓 Étudiants      : ${students.length}`);
  console.log(`📚 Cours          : ${courses.length}`);
  console.log(`📝 Inscriptions   : ${enrollmentsCount}`);
  console.log(`💰 Paiements      : ${paymentsCount}`);
  console.log(`🧾 Reçus          : ${receiptsCount}`);
  console.log(`🏆 Certificats    : ${certificatesCount}`);
  console.log(`⭐ Avis           : ${reviewsCount}`);
  console.log(`💬 Discussions    : ${discussionsCount}`);
  console.log(`✉️  Messages       : ${messagesCount}`);
  console.log('═══════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
const prisma = require('./prismaClient');

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found to seed data for.');
    return;
  }
  const userId = user.id;

  console.log(`Seeding portfolio data for user: ${user.name} (${userId})`);

  await prisma.experience.deleteMany({ where: { userId } });
  await prisma.project.deleteMany({ where: { userId } });
  await prisma.achievement.deleteMany({ where: { userId } });
  await prisma.activity.deleteMany({ where: { userId } });

  await prisma.experience.createMany({
    data: [
      {
        company: 'Itinero',
        role: 'Frontend Developer Intern',
        description: 'Working on frontend development for Itinero Web, focusing on modern UI/UX, component architecture, and performance optimization.',
        startDate: new Date('2026-05-01'),
        current: true,
        type: 'Current Role',
        techStack: ['React.js', 'TypeScript', 'Tailwind CSS', 'TanStack Query'],
        userId
      },
      {
        company: 'UniVoid',
        role: 'AI Research Intern',
        description: 'Built and contributed to AI-powered student ecosystem tools, worked on ML models, and full-stack web development using MERN stack.',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-04-30'),
        current: false,
        type: 'Internship',
        techStack: ['Python', 'Machine Learning', 'Node.js', 'React.js'],
        userId
      },
      {
        company: 'Freelance Developer',
        role: 'Full Stack Developer',
        description: 'Developed web applications and AI-based tools for various clients and personal projects.',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-12-31'),
        current: false,
        type: 'Project',
        techStack: ['JavaScript', 'Node.js', 'MongoDB', 'Express.js'],
        userId
      }
    ]
  });

  await prisma.project.createMany({
    data: [
      {
        title: 'AI Startup Idea Validator',
        subtitle: 'Personal Project',
        description: 'Built an AI tool that evaluates startup ideas using LLMs to provide market analysis and feedback.',
        techStack: ['React', 'Node.js', 'OpenAI API'],
        startDate: new Date('2025-08-01'),
        status: 'Completed',
        userId
      },
      {
        title: 'IPL Chatbot',
        subtitle: 'Hackathon Project',
        description: 'An intelligent chatbot capable of answering complex queries about IPL stats and history.',
        techStack: ['Python', 'NLP', 'React'],
        startDate: new Date('2024-04-01'),
        status: 'Completed',
        userId
      },
      {
        title: 'ReWear',
        subtitle: 'Odoo Hackathon',
        description: 'Sustainable fashion platform built during Odoo Hackathon for reusing and recycling clothes.',
        techStack: ['MongoDB', 'Express.js', 'React.js', 'Odoo'],
        startDate: new Date('2024-03-01'),
        status: 'Completed',
        userId
      }
    ]
  });

  await prisma.achievement.createMany({
    data: [
      {
        title: 'Top 100 Finalist',
        event: 'Aavishkaar Season 3',
        date: new Date('2024-12-01'),
        description: 'Selected among Top 100 out of 600+ teams in Aavishkaar Season 3 Hackathon.',
        category: 'Competition',
        userId
      },
      {
        title: 'Hackathon Finalist',
        event: 'DotSlash 9.0 (NIT Surat)',
        date: new Date('2024-03-01'),
        description: 'Reached the final round in DotSlash 9.0 Hackathon.',
        category: 'Hackathon',
        userId
      },
      {
        title: 'GSSoC 2026 Selected',
        event: 'GirlScript Summer of Code',
        date: new Date('2026-05-01'),
        description: 'Selected as a contributor in GSSoC 2026 (Open Source + AI/Agents Track).',
        category: 'Open Source',
        userId
      },
      {
        title: 'First PR Merged',
        event: 'GirlScript Summer of Code',
        date: new Date('2026-06-01'),
        description: 'Merged my first pull request in an open source project.',
        category: 'Milestone',
        userId
      },
      {
        title: 'NPTEL Certification',
        event: 'AI for Everyone',
        date: new Date('2025-01-01'),
        description: 'Successfully completed NPTEL course with Elite certification.',
        category: 'Certification',
        userId
      }
    ]
  });

  await prisma.activity.createMany({
    data: [
      {
        action: 'Created a new note "DP - Knapsack Problem"',
        context: 'In Data Structures & Algorithms',
        icon: 'document',
        userId
      },
      {
        action: 'Joined the community "AI & ML Enthusiasts"',
        icon: 'group',
        userId
      },
      {
        action: 'Updated your profile',
        icon: 'pencil',
        userId
      }
    ]
  });

  console.log('Successfully seeded portfolio data!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      name: 'Manager User',
      email: 'manager@example.com',
      password: hashedPassword,
      role: 'MANAGER',
    },
  });

  const member1 = await prisma.user.upsert({
    where: { email: 'member1@example.com' },
    update: {},
    create: {
      name: 'Member One',
      email: 'member1@example.com',
      password: hashedPassword,
      role: 'MEMBER',
    },
  });

  // Project
  let project1 = await prisma.project.findFirst({
    where: { name: 'Website Redesign', ownerId: manager.id },
  });

  if (!project1) {
    project1 = await prisma.project.create({
      data: {
        name: 'Website Redesign',
        description: 'Redesigning the company website for Q4',
        status: 'ACTIVE',
        ownerId: manager.id,
        members: {
          connect: [{ id: member1.id }],
        },
      },
    });
  }

  // Task
  let task1 = await prisma.task.findFirst({
    where: { title: 'Design Homepage', projectId: project1.id },
  });

  if (!task1) {
    task1 = await prisma.task.create({
      data: {
        title: 'Design Homepage',
        description: 'Create Figma mockups for the new homepage',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: project1.id,
        assigneeId: member1.id,
        creatorId: manager.id,
      },
    });
  }

  // Comment
  const existingComment = await prisma.comment.findFirst({
    where: { taskId: task1.id, authorId: member1.id },
  });

  if (!existingComment) {
    await prisma.comment.create({
      data: {
        text: 'I will start on this today.',
        taskId: task1.id,
        authorId: member1.id,
      },
    });
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

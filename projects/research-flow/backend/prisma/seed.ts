import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo users FIRST (before Lab, since Lab references advisorId)
  const advisor = await prisma.user.upsert({
    where: { feishuId: 'dev-advisor-1' },
    update: {},
    create: {
      id: 'dev-user-1',
      feishuId: 'dev-advisor-1',
      name: '导师测试',
      role: 'ADVISOR',
    },
  });

  const phd1 = await prisma.user.upsert({
    where: { feishuId: 'dev-phd-1' },
    update: {},
    create: {
      id: 'dev-user-2',
      feishuId: 'dev-phd-1',
      name: '张三',
      role: 'PHD',
    },
  });

  const phd2 = await prisma.user.upsert({
    where: { feishuId: 'dev-phd-2' },
    update: {},
    create: {
      id: 'dev-user-3',
      feishuId: 'dev-phd-2',
      name: '李四',
      role: 'PHD',
    },
  });

  const master = await prisma.user.upsert({
    where: { feishuId: 'dev-master-1' },
    update: {},
    create: {
      id: 'dev-user-4',
      feishuId: 'dev-master-1',
      name: '王五',
      role: 'MASTER',
    },
  });

  console.log('Created users:', { advisor: advisor.name, phd1: phd1.name, phd2: phd2.name, master: master.name });

  // Now create Lab (references existing advisor)
  const lab = await prisma.lab.upsert({
    where: { id: 'dev-lab-1' },
    update: {},
    create: {
      id: 'dev-lab-1',
      name: 'RL+MEC实验室',
      advisorId: advisor.id,
      description: '强化学习与移动边缘计算研究组',
    },
  });

  // Update users to belong to lab
  await prisma.user.updateMany({
    where: { id: { in: [advisor.id, phd1.id, phd2.id, master.id] } },
    data: { labId: lab.id },
  });

  console.log('Created lab:', lab.name);

  // Create demo experiments
  const experiments = [
    {
      title: 'DQN调参实验-lr=0.001',
      type: 'HYPERPARAM_TUNING' as const,
      status: 'COMPLETED' as const,
      purpose: '验证学习率对DQN收敛速度的影响',
      result: 'lr=0.001时收敛最快，约5000步达到稳定',
      conclusion: '推荐使用lr=0.001作为默认超参',
      tags: JSON.stringify(['DQN', 'lr-tuning', 'baseline']),
      authorId: phd1.id,
      labId: lab.id,
    },
    {
      title: 'PPO vs A2C对比实验',
      type: 'ALGORITHM_VERIFICATION' as const,
      status: 'IN_PROGRESS' as const,
      purpose: '比较PPO和A2C在MEC任务卸载场景下的性能差异',
      result: 'PPO在稳定性和样本效率上均优于A2C',
      conclusion: 'PPO更适合MEC任务卸载场景',
      tags: JSON.stringify(['PPO', 'A2C', 'comparison', 'MEC']),
      authorId: phd1.id,
      labId: lab.id,
    },
    {
      title: '消融实验-注意力机制',
      type: 'ABLATION_STUDY' as const,
      status: 'FAILED' as const,
      purpose: '验证注意力机制对任务调度性能的贡献',
      result: '移除注意力机制后性能下降15%',
      conclusion: '注意力机制对性能有显著贡献，需保留',
      tags: JSON.stringify(['attention', 'ablation']),
      authorId: phd2.id,
      labId: lab.id,
    },
    {
      title: 'MEC环境搭建',
      type: 'OTHER' as const,
      status: 'COMPLETED' as const,
      purpose: '搭建多服务器MEC仿真环境',
      result: '成功部署3个边缘服务器节点',
      conclusion: '环境就绪，可开始正式实验',
      tags: JSON.stringify(['setup', 'environment', 'MEC']),
      authorId: phd2.id,
      labId: lab.id,
    },
    {
      title: '复现Federated Learning论文',
      type: 'REPRODUCTION' as const,
      status: 'IN_PROGRESS' as const,
      purpose: '复现FL场景下的MEC任务调度方法',
      tags: JSON.stringify(['FL', 'reproduction', 'MEC']),
      authorId: master.id,
      labId: lab.id,
    },
  ];

  for (const exp of experiments) {
    await prisma.experiment.create({ data: exp });
  }

  console.log('Created experiments:', experiments.length);

  // Create demo paper
  const paper = await prisma.paper.create({
    data: {
      title: '基于强化学习的MEC任务卸载优化',
      abstract_ : '提出一种基于深度强化学习的移动边缘计算任务卸载方法...',
      keywords: JSON.stringify(['RL', 'MEC', 'task offloading', 'optimization']),
      venue: 'IEEE TWC 2026',
      authorId: phd1.id,
      labId: lab.id,
      status: 'EXPERIMENT',
    },
  });

  console.log('Created paper:', paper.title);

  // Create demo equipment
  const gpu = await prisma.equipment.create({
    data: {
      name: 'RTX 4090 GPU服务器',
      model: 'NVIDIA RTX 4090',
      location: 'A301机房',
      description: '24GB显存，用于大模型训练和RL实验',
      labId: lab.id,
    },
  });

  const robot = await prisma.equipment.create({
    data: {
      name: 'UR5e协作机械臂',
      model: 'Universal Robots UR5e',
      location: 'B201实验室',
      description: '6自由度协作机械臂，用于机器人实验',
      labId: lab.id,
    },
  });

  console.log('Created equipment:', gpu.name, robot.name);

  console.log('Seed completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
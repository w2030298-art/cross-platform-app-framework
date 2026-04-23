import { execSync } from 'child_process';
import { existsSync, copyFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();

console.log('🚀 Setting up ResearchFlow development environment...\n');

// Step 1: Check .env
const envPath = join(root, 'backend', '.env');
const envExamplePath = join(root, 'backend', '.env.example');

if (!existsSync(envPath)) {
  if (existsSync(envExamplePath)) {
    copyFileSync(envExamplePath, envPath);
    console.log('✅ Created backend/.env from .env.example');
  } else {
    console.log('⚠️  Please create backend/.env with your Feishu credentials');
  }
} else {
  console.log('✅ backend/.env already exists');
}

// Step 2: Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { cwd: join(root, 'backend'), stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (e) {
  console.log('❌ Failed to install backend dependencies');
}

try {
  execSync('npm install', { cwd: join(root, 'feishu-app'), stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (e) {
  console.log('❌ Failed to install frontend dependencies');
}

// Step 3: Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { cwd: join(root, 'backend'), stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (e) {
  console.log('❌ Failed to generate Prisma client');
}

console.log('\n📋 Next steps:');
console.log('1. Start PostgreSQL: docker-compose up -d postgres');
console.log('2. Run migrations: cd backend && npx prisma migrate dev --name init');
console.log('3. Seed database: cd backend && npx prisma db seed');
console.log('4. Start backend: cd backend && npm run dev');
console.log('5. Start frontend: cd feishu-app && npm run dev');
console.log('6. Open http://localhost:5173\n');
console.log('💡 For Feishu SSO:');
console.log('   1. Go to https://open.feishu.cn/app/');
console.log('   2. Create app and get App ID + App Secret');
console.log('   3. Update backend/.env with your credentials');
console.log('   4. Configure redirect URI: http://localhost:5173/auth/callback');
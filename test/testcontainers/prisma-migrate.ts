import { execSync } from 'child_process';

export async function runPrismaMigrations() {
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
    },
  });
}

import prisma from '../src/utils/db';
import bcrypt from 'bcrypt';

async function main() {
  const adminEmail = 'admin@aau.edu';
  const adminPassword = 'SuperSecretAdminPassword123!';
  const username = 'SystemAdmin';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('Admin already exists.');
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  await prisma.user.create({
    data: {
      username,
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log(`Successfully created ADMIN user:
Email: ${adminEmail}
Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

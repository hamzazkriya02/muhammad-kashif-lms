import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/auth/password";
import { isStrongPassword, passwordRequirementMessage } from "../src/lib/security/validation";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required before running the seed.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required. Default production credentials are intentionally disabled.");
  }

  if (!isStrongPassword(adminPassword)) {
    throw new Error(passwordRequirementMessage());
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingAdmin) {
    console.log("Admin already exists:", adminEmail);
    return;
  }

  const passwordHash = await hashPassword(adminPassword);
  const admin = await prisma.user.create({
    data: {
      name: "Muhammad Kashif",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      status: "APPROVED",
      approvedAt: new Date(),
      verifiedAt: new Date(),
    },
    select: { id: true, email: true },
  });

  console.log("Admin created successfully:", admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

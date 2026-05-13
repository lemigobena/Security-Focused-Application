import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const bookmarks = await prisma.bookmark.findMany();
  console.log(JSON.stringify(bookmarks, null, 2));
}
main();

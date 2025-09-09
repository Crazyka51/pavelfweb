import { PrismaClient } from '@prisma/client';

// Přidáváme deklaraci typu pro global namespace
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // V development prostředí používáme global objekt pro cache
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma as PrismaClient;
}

export default prisma;

import { PrismaClient } from "@prisma/client"

// Přidáváme deklaraci typu pro global namespace
declare global {
  var prisma: PrismaClient | undefined
}

let prismaClient: PrismaClient

if (process.env.NODE_ENV === "production") {
  prismaClient = new PrismaClient()
} else {
  // V development prostředí používáme global objekt pro cache
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prismaClient = global.prisma as PrismaClient
}

export { prismaClient as prisma }
export default prismaClient

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  try {
    console.log("------------------------------------")
    console.log("🔍 Checking DB connection...");
    
    // Ek dummy user create karne ki koshish
    const user = await prisma.user.create({
      data: {
        name: "Satyam_SAM_User",
      }
    })
    console.log("✅ Success! User created:", user);
    
    const allUsers = await prisma.user.findMany();
    console.log("📊 Current Users in DB:", allUsers);
    console.log("------------------------------------")
  } catch (e) {
    console.log("❌ Database connection failed!");
    console.error(e);
  } finally {
    await prisma.$disconnect()
  }
}

test()

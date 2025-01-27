import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create 50 random examinees
  const numberOfUsers = 50
  const saltRounds = 10

  for (let i = 0; i < numberOfUsers; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const middleName = faker.person.firstName() // Using firstName generator for middle name
    const username = faker.internet.username({ firstName, lastName })

    // Generate a simple password (in production, you'd want stronger passwords)
    // const plainPassword = 'Password123!'
    // const hashedPassword = await bcrypt.hash(plainPassword, saltRounds)

    await prisma.user.upsert({
      where: {
        username: username,
      },
      update: {}, // Empty update means it won't update if the user exists
      create: {
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        username: username,
        password: '123',
        role: 'examinee',
        // Optional fields left empty as requested
        email: null,
        accessToken: null,
        refreshToken: null,
      },
    })
  }

  console.log(`Seeded ${numberOfUsers} examinee users`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
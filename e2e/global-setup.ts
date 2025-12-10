import { config } from 'dotenv'
import { seedDatabase } from '../tests/helpers/database.js'

export default async function globalSetup() {
  // Load .env from project root
  config({ path: './.env' })
  console.log('DATABASE_URL:', process.env.DATABASE_URL)
  // Seed the database before running E2E tests
  await seedDatabase()
}
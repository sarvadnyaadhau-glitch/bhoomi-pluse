import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgres://sensotech:sensotech_dev@localhost:5432/sensotech',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  // 30 days in seconds (jsonwebtoken SignOptions.expiresIn accepts number)
  jwtExpiresIn: 60 * 60 * 24 * 30,
}

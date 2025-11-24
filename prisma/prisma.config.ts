import type { MigrateConfig } from 'prisma'

const config: MigrateConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}

export default config

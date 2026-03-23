import path from "node:path"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
  datasource: {
    url: "postgresql://postgres.fypjyivdghkqposuunqd:Sweep2026!!!@aws-1-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true",
  },
})
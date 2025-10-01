# 🔙 العودة إلى SQLite (Turso)

إذا واجهت مشاكل مع MySQL وتريد العودة إلى SQLite، اتبع هذه الخطوات:

## الخطوات

### 1. استعادة ملف client.ts الأصلي
```typescript
// في lib/db/client.ts
// استرجع الكود الأصلي من git
git checkout lib/db/client.ts
```

أو استبدل بالكود التالي:
```typescript
import * as schema from './schema'
import { createClient } from '@libsql/client'
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql'

function makeDb() {
  if (!process.env.LIBSQL_URL) {
    throw new Error('LIBSQL_URL is not set')
  }
  
  const client = createClient({
    url: process.env.LIBSQL_URL!,
    authToken: process.env.LIBSQL_AUTH_TOKEN,
    intMode: 'number',
    concurrency: 20,
  })
  
  return drizzleLibsql(client, { schema, logger: false })
}

export const db = makeDb() as any
export type DB = typeof db
export * as dbSchema from './schema'
```

### 2. استعادة متغيرات البيئة
```bash
# إذا كنت احتفظت بنسخة احتياطية
cp .env.backup .env

# أو أعد إضافة معلومات Turso يدوياً
```

في `.env`:
```env
LIBSQL_URL=libsql://demotasks-ibnbattutatravel1.aws-us-west-2.turso.io
LIBSQL_AUTH_TOKEN=eyJhbGci...
AUTH_SECRET=ergerg ergerhjiolgkjhujfikogjhryjikgt heugyugre re
```

### 3. استعادة drizzle.config.ts
```bash
git checkout drizzle.config.ts
```

أو استبدله بـ:
```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './sqlite/data.db',
  },
  verbose: true,
  strict: true,
} satisfies Config
```

### 4. إعادة تشغيل التطبيق
```bash
npm run dev
```

## ✅ تم!
التطبيق عاد الآن للعمل مع SQLite (Turso)

---

## 💡 نصيحة
احتفظ بنسخ احتياطية من:
- `.env` (قبل وبعد التعديلات)
- `lib/db/client.ts` (قبل التعديل)
- البيانات المصدرة في `scripts/migrate-to-mysql/exported-data/`

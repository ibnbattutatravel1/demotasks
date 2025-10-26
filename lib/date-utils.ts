/**
 * دوال مساعدة للتعامل مع التواريخ بشكل موحد بين SQLite و MySQL
 */

/**
 * تحويل قيمة التاريخ إلى ISO string بشكل آمن
 * يعمل مع SQLite (string) و MySQL (Date object)
 */
export function toISOString(value: any): string {
  if (!value) {
    return new Date().toISOString()
  }
  
  if (typeof value === 'string') {
    return value
  }
  
  if (value instanceof Date) {
    return value.toISOString()
  }
  
  // محاولة تحويل القيمة إلى Date
  try {
    return new Date(value).toISOString()
  } catch {
    return new Date().toISOString()
  }
}

/**
 * تحويل قيمة التاريخ إلى ISO string أو undefined
 */
export function toISOStringOrUndefined(value: any): string | undefined {
  if (!value) {
    return undefined
  }
  
  if (typeof value === 'string') {
    return value
  }
  
  if (value instanceof Date) {
    return value.toISOString()
  }
  
  // محاولة تحويل القيمة إلى Date
  try {
    return new Date(value).toISOString()
  } catch {
    return undefined
  }
}

/**
 * تحويل قيمة التاريخ إلى تنسيق YYYY-MM-DD
 */
export function toDateString(value: any): string {
  if (!value) {
    return new Date().toISOString().split('T')[0]
  }
  
  if (typeof value === 'string') {
    return value.split('T')[0]
  }
  
  if (value instanceof Date) {
    return value.toISOString().split('T')[0]
  }
  
  try {
    return new Date(value).toISOString().split('T')[0]
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

/**
 * تحويل ISO string إلى تنسيق MySQL datetime (YYYY-MM-DD HH:MM:SS)
 * MySQL datetime لا يقبل التنسيق ISO مع Z و milliseconds
 */
export function toMySQLDatetime(value: any): string {
  if (!value) {
    return toMySQLDatetime(new Date())
  }
  
  let date: Date
  
  if (typeof value === 'string') {
    date = new Date(value)
  } else if (value instanceof Date) {
    date = value
  } else {
    try {
      date = new Date(value)
    } catch {
      date = new Date()
    }
  }
  
  // تحويل إلى تنسيق YYYY-MM-DD HH:MM:SS
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * تحويل ISO string إلى تنسيق MySQL datetime أو null
 */
export function toMySQLDatetimeOrNull(value: any): string | null {
  if (!value) {
    return null
  }
  
  try {
    return toMySQLDatetime(value)
  } catch {
    return null
  }
}

/**
 * تحويل كائن من قاعدة البيانات بتحويل جميع التواريخ
 */
export function normalizeDates<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj } as any
  
  // الحقول التي عادة ما تكون تواريخ
  const dateFields = [
    'createdAt', 'updatedAt', 'completedAt', 'approvedAt', 'rejectedAt',
    'startDate', 'dueDate', 'uploadedAt', 'submittedAt', 'returnedAt'
  ]
  
  for (const field of dateFields) {
    if (field in result && result[field] != null) {
      result[field] = toISOString(result[field])
    }
  }
  
  return result as T
}

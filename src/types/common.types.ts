/**
 * Common reusable types
 */

export type Status = 'idle' | 'loading' | 'success' | 'error'

export interface Option<T = string> {
  label: string
  value: T
}

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

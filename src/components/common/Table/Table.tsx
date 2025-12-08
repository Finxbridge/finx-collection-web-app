/**
 * Reusable Table Component
 * A customizable data table with sorting and pagination
 */

import { ReactNode } from 'react'
import { cn } from '@utils'
import './Table.css'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  sortable?: boolean
  width?: string
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  className?: string
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="table-loading">
        <div className="table-loading__spinner"></div>
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className={cn('table-container', className)}>
      <table className="table">
        <thead className="table__head">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="table__th"
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table__body">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={cn('table__row', onRowClick && 'table__row--clickable')}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="table__td">
                    {column.render
                      ? column.render(item)
                      : (item as Record<string, unknown>)[column.key] as ReactNode}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems)

  return (
    <div className="pagination">
      <div className="pagination__info">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>
      <div className="pagination__controls">
        <button
          className="pagination__btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="pagination__current">
          Page {currentPage + 1} of {totalPages}
        </span>
        <button
          className="pagination__btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Table

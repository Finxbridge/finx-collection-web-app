/**
 * Toggle hook
 * Manages boolean state with toggle function
 */

import { useState, useCallback } from 'react'

export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(prev => !prev)
  }, [])

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  return { value, toggle, setTrue, setFalse, setValue }
}

export default useToggle

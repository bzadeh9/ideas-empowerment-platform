import { useEffect, useState } from 'react'

export function useLocalStorageValue(key: string) {
  const [value, setValue] = useState<string>('')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const storedValue = localStorage.getItem(key)
    if (storedValue !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- initializing state from localStorage on mount
      setValue(storedValue)
    }
    setIsInitialized(true)
  }, [key])

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(key, value)
    }
  }, [key, value, isInitialized])

  return [value, setValue] as const
}

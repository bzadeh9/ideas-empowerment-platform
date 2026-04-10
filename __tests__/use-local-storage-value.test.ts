import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorageValue } from '@/lib/use-local-storage-value'

describe('useLocalStorageValue', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty string by default when no stored value', () => {
    const { result } = renderHook(() => useLocalStorageValue('test-key'))
    expect(result.current[0]).toBe('')
  })

  it('reads the initial value from localStorage', () => {
    localStorage.setItem('test-key', 'stored-value')
    const { result } = renderHook(() => useLocalStorageValue('test-key'))
    expect(result.current[0]).toBe('stored-value')
  })

  it('persists updated values to localStorage', () => {
    const { result } = renderHook(() => useLocalStorageValue('test-key'))

    act(() => {
      result.current[1]('new-value')
    })

    expect(result.current[0]).toBe('new-value')
    expect(localStorage.getItem('test-key')).toBe('new-value')
  })

  it('updates when key changes', () => {
    localStorage.setItem('key-a', 'value-a')
    localStorage.setItem('key-b', 'value-b')

    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorageValue(key),
      { initialProps: { key: 'key-a' } }
    )
    expect(result.current[0]).toBe('value-a')

    rerender({ key: 'key-b' })
    expect(result.current[0]).toBe('value-b')
  })
})

import { describe, it, expect } from 'vitest'
import { Deferred } from '@/lib/deferred'

describe('Deferred', () => {
  it('resolves the promise with the given value', async () => {
    const deferred = new Deferred<string>()
    deferred.resolve('hello')
    await expect(deferred.promise).resolves.toBe('hello')
  })

  it('rejects the promise with the given reason', async () => {
    const deferred = new Deferred<string>()
    deferred.reject(new Error('fail'))
    await expect(deferred.promise).rejects.toThrow('fail')
  })

  it('resolves with a numeric value', async () => {
    const deferred = new Deferred<number>()
    deferred.resolve(42)
    await expect(deferred.promise).resolves.toBe(42)
  })

  it('exposes the promise via the getter', () => {
    const deferred = new Deferred<void>()
    expect(deferred.promise).toBeInstanceOf(Promise)
  })
})

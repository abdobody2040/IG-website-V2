import { lazy, Suspense, ComponentType } from 'react'

export function lazyImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): T {
  const LazyComponent = lazy(importFn)
  const Wrapped = (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback ?? <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" /></div>}>
      <LazyComponent {...props} />
    </Suspense>
  )
  return Wrapped as unknown as T
}

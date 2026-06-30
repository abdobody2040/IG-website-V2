import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('useExportCsv', () => {
  let exportCsv: ReturnType<typeof import('../hooks/useExportCsv')['useExportCsv']>['exportCsv']

  beforeEach(async () => {
    vi.restoreAllMocks()
    const mod = await import('../hooks/useExportCsv')
    exportCsv = mod.useExportCsv().exportCsv
  })

  it('does nothing with empty data', () => {
    const createElement = vi.spyOn(document, 'createElement')
    exportCsv([], 'test')
    expect(createElement).not.toHaveBeenCalled()
  })

  it('generates a CSV and triggers download', () => {
    const mockAnchor = { href: '', download: '', click: vi.fn() }
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLAnchorElement)
    vi.spyOn(document.body, 'appendChild').mockReturnValue(document.createElement('div'))
    vi.spyOn(document.body, 'removeChild').mockReturnValue(document.createElement('div'))
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    const data = [
      { name: 'Alice', email: 'alice@test.com', score: 100 },
      { name: 'Bob', email: 'bob@test.com', score: 85 },
    ]

    exportCsv(data, 'test_export', { name: 'Name', email: 'Email', score: 'Score' })

    expect(document.createElement).toHaveBeenCalledWith('a')
    expect(mockAnchor.download).toBe('test_export.csv')
    expect(mockAnchor.click).toHaveBeenCalled()
    expect(document.body.appendChild).toHaveBeenCalled()
    expect(document.body.removeChild).toHaveBeenCalled()
    expect(createObjectURL).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalled()
  })

  it('escapes commas and quotes in CSV values', () => {
    const mockAnchor = { href: '', download: '', click: vi.fn() }
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLAnchorElement)
    vi.spyOn(document.body, 'appendChild').mockReturnValue(mockAnchor as unknown as Node)
    vi.spyOn(document.body, 'removeChild').mockReturnValue(mockAnchor as unknown as Node)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')

    const data = [
      { name: 'Smith, John', email: 'john@test.com', note: 'He said "hello"' },
    ]

    exportCsv(data, 'escape_test')

    expect(mockAnchor.download).toBe('escape_test.csv')
  })
})

export function useExportCsv() {
  function exportCsv<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    columnMap?: Record<string, string>
  ) {
    if (data.length === 0) return

    const keys = Object.keys(data[0]!)
    const headers = keys.map((k) => columnMap?.[k] ?? k)
    const rows = data.map((row) =>
      keys.map((k) => {
        const val = row[k]
        if (val === null || val === undefined) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      })
    )

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return { exportCsv }
}

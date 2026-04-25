export function fmtPrice(v?: number): string {
  if (v == null) return '-'
  return '¥' + v.toLocaleString('ja-JP', { maximumFractionDigits: 0 })
}

export function fmtMarketCap(v?: number): string {
  if (v == null) return '-'
  if (v >= 1e12) return (v / 1e12).toFixed(1) + '兆円'
  if (v >= 1e8) return (v / 1e8).toFixed(0) + '億円'
  return (v / 1e6).toFixed(0) + '百万円'
}

export function fmtPct(v?: number, decimals = 1): string {
  if (v == null) return '-'
  return v.toFixed(decimals) + '%'
}

export function fmtNum(v?: number, decimals = 2): string {
  if (v == null) return '-'
  return v.toFixed(decimals)
}

export function fmtDividend(v?: number): string {
  if (v == null) return '-'
  return (v * 100).toFixed(2) + '%'
}

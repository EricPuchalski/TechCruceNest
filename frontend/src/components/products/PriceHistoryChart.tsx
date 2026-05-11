import { useMemo, useState } from 'react'

import { formatDate, formatPrice } from '../../utils/ui'
import type { PriceHistoryEntry } from '../../types/products/product'
import styles from './PriceHistoryChart.module.css'

interface PriceHistoryChartProps {
  history: PriceHistoryEntry[]
  currency: string
}

const CHART_WIDTH = 860
const CHART_HEIGHT = 300
const PADDING_X = 44
const PADDING_TOP = 20
const PADDING_BOTTOM = 42
const GRID_LINES = 5

function PriceHistoryChart({ history, currency }: PriceHistoryChartProps) {
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null)
  const normalizedHistory = useMemo(
    () =>
      [...history].sort(
        (firstEntry, secondEntry) =>
          new Date(firstEntry.date).getTime() - new Date(secondEntry.date).getTime(),
      ),
    [history],
  )

  const chartData = useMemo(() => {
    if (normalizedHistory.length === 0) {
      return null
    }

    const values = normalizedHistory.map((entry) => entry.price)
    const minPrice = Math.min(...values)
    const maxPrice = Math.max(...values)
    const range = maxPrice - minPrice || Math.max(minPrice * 0.04, 1)
    const safeMin = minPrice - range * 0.15
    const safeMax = maxPrice + range * 0.15
    const usableWidth = CHART_WIDTH - PADDING_X * 2
    const usableHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM

    const points = normalizedHistory.map((entry, index) => {
      const x =
        normalizedHistory.length === 1
          ? CHART_WIDTH / 2
          : PADDING_X + (index / (normalizedHistory.length - 1)) * usableWidth
      const y =
        PADDING_TOP +
        ((safeMax - entry.price) / (safeMax - safeMin)) * usableHeight

      return {
        ...entry,
        x,
        y,
      }
    })

    const linePath = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ')

    const yAxisLabels = Array.from({ length: GRID_LINES }, (_, index) => {
      const progress = index / (GRID_LINES - 1)
      const value = safeMax - progress * (safeMax - safeMin)
      const y = PADDING_TOP + progress * usableHeight

      return { value, y }
    })

    return {
      linePath,
      points,
      yAxisLabels,
    }
  }, [normalizedHistory])

  if (!chartData) {
    return (
      <div className={`${styles.chart} ${styles.empty}`}>
        <p>Todavia no hay historial suficiente para graficar este producto.</p>
      </div>
    )
  }

  const activePoint =
    activePointIndex === null ? null : chartData.points[activePointIndex] ?? null
  const tooltipWidth = 168
  const tooltipX = activePoint
    ? Math.min(
        Math.max(activePoint.x - tooltipWidth / 2, PADDING_X),
        CHART_WIDTH - PADDING_X - tooltipWidth,
      )
    : 0
  const tooltipY = activePoint ? Math.max(activePoint.y - 72, 12) : 0

  return (
    <section className={styles.chart} aria-labelledby="price-history-title">
      <div className={styles.header}>
        <h3 id="price-history-title">Historial de precio</h3>
        <p>Seguimiento del valor registrado en el tiempo.</p>
      </div>

      <div className={styles.canvas}>
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label="Grafico de evolucion del precio"
        >
          <defs>
            <linearGradient id="price-line-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#d4495b" />
              <stop offset="100%" stopColor="#f08d98" />
            </linearGradient>
          </defs>

          {chartData.yAxisLabels.map((label) => (
            <g key={label.y}>
              <line
                className={styles.gridLine}
                x1={PADDING_X}
                y1={label.y}
                x2={CHART_WIDTH - PADDING_X}
                y2={label.y}
              />
              <text className={styles.yLabel} x="0" y={label.y + 4}>
                {formatPrice(label.value, currency)}
              </text>
            </g>
          ))}

          {chartData.points.map((point) => (
            <line
              key={`vertical-${point.date}`}
              className={`${styles.gridLine} ${styles.gridLineVertical}`}
              x1={point.x}
              y1={PADDING_TOP}
              x2={point.x}
              y2={CHART_HEIGHT - PADDING_BOTTOM}
            />
          ))}

          <path className={styles.lineShadow} d={chartData.linePath} />
          <path className={styles.line} d={chartData.linePath} />

          {chartData.points.map((point, index) => (
            <g
              key={point.date}
              onMouseEnter={() => setActivePointIndex(index)}
              onMouseLeave={() =>
                setActivePointIndex((current) => (current === index ? null : current))
              }
              onFocus={() => setActivePointIndex(index)}
              onBlur={() =>
                setActivePointIndex((current) => (current === index ? null : current))
              }
              onClick={() => setActivePointIndex(index)}
            >
              <circle
                className={styles.pointHitArea}
                cx={point.x}
                cy={point.y}
                r="14"
                tabIndex={0}
              />
              <circle className={styles.point} cx={point.x} cy={point.y} r="4.5" />
              <text className={styles.xLabel} x={point.x} y={CHART_HEIGHT - 12}>
                {formatDate(point.date)}
              </text>
            </g>
          ))}

          {activePoint ? (
            <g className={styles.tooltip} pointerEvents="none">
              <rect
                className={styles.tooltipBox}
                x={tooltipX}
                y={tooltipY}
                width={tooltipWidth}
                height="54"
                rx="12"
              />
              <text className={styles.tooltipPrice} x={tooltipX + 14} y={tooltipY + 23}>
                {formatPrice(activePoint.price, currency)}
              </text>
              <text className={styles.tooltipDate} x={tooltipX + 14} y={tooltipY + 40}>
                {formatDate(activePoint.date)}
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </section>
  )
}

export default PriceHistoryChart

import React from 'react';

interface SparklineProps {
  dataPoints: number[];
  width?: number;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  dataPoints,
  width = 96,
  height = 36,
}) => {
  if (!dataPoints || dataPoints.length < 2) return null;

  const min = Math.min(...dataPoints);
  const max = Math.max(...dataPoints);
  const range = max - min || 1;

  const isUp = dataPoints[dataPoints.length - 1] >= dataPoints[0];
  const strokeColor = isUp ? '#10B981' : '#F87171';

  const padding = 4;
  const effectiveWidth = width - padding * 2;
  const effectiveHeight = height - padding * 2;

  const points = dataPoints.map((val, index) => {
    const x = padding + (index / (dataPoints.length - 1)) * effectiveWidth;
    const y = height - padding - ((val - min) / range) * effectiveHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const lastPoint = points[points.length - 1].split(',');
  const lastX = parseFloat(lastPoint[0]);
  const lastY = parseFloat(lastPoint[1]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-label={`Trend chart showing net worth ${isUp ? 'increasing' : 'decreasing'}`}
    >
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Single endpoint dot */}
      <circle
        cx={lastX}
        cy={lastY}
        r="3"
        fill={strokeColor}
      />
    </svg>
  );
};

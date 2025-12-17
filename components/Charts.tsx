import React, { useState } from 'react';
import { Download } from 'lucide-react';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: ChartDataPoint[];
  color?: string;
}

// Increased base dimensions to reduce text distortion on wide screens
const CHART_WIDTH = 1200;
const CHART_HEIGHT = 400;

export const ResponsiveAreaChart: React.FC<AreaChartProps> = ({ data, color = "var(--accent)" }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const padding = { top: 40, right: 40, bottom: 50, left: 60 };
  const graphWidth = CHART_WIDTH - padding.left - padding.right;
  const graphHeight = CHART_HEIGHT - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => d.value)) * 1.1;
  const minVal = 0;

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * graphWidth;
  const getY = (value: number) => padding.top + graphHeight - ((value - minVal) / (maxVal - minVal)) * graphHeight;

  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPath = `${points} ${getX(data.length - 1)},${CHART_HEIGHT - padding.bottom} ${padding.left},${CHART_HEIGHT - padding.bottom}`;

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const headers = ['Label', 'Value'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + data.map(d => `"${d.label}",${d.value}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "chart_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full min-h-[300px] select-none relative group/chart">
      <button 
        onClick={handleExport}
        className="absolute top-2 right-2 p-1.5 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/50 transition-all opacity-0 group-hover/chart:opacity-100 z-20"
        title="Export Data to CSV"
      >
        <Download className="w-3.5 h-3.5" />
      </button>

      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid Lines (Y-Axis) */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const val = maxVal * tick;
          const y = getY(val);
          return (
            <g key={tick}>
              <line x1={padding.left} y1={y} x2={CHART_WIDTH - padding.right} y2={y} stroke="var(--chart-grid)" strokeWidth="1" />
              <text x={padding.left - 10} y={y + 4} fill="var(--text-muted)" fontSize="12" textAnchor="end">
                ₹{(val / 100000).toFixed(1)}L
              </text>
            </g>
          );
        })}

        {/* X-Axis Labels */}
        {data.map((d, i) => (
          <text key={i} x={getX(i)} y={CHART_HEIGHT - 20} fill="var(--text-muted)" fontSize="12" textAnchor="middle">
            {d.label}
          </text>
        ))}

        {/* Chart Paths */}
        <path d={`M ${areaPath} Z`} fill="url(#areaGradient)" />
        <path d={`M ${points}`} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" />

        {/* Interactive Areas */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d.value);
          const isHovered = hoveredIndex === i;
          
          // Smart Tooltip positioning
          const isLeftEdge = i < 2;
          const isRightEdge = i > data.length - 3;
          let tooltipX = x - 60; // Center default
          if (isLeftEdge) tooltipX = x + 10;
          if (isRightEdge) tooltipX = x - 130;

          return (
            <g 
              key={i} 
              onMouseEnter={() => setHoveredIndex(i)} 
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-crosshair"
            >
              <rect 
                x={x - (graphWidth / data.length / 2)} 
                y={padding.top} 
                width={graphWidth / data.length} 
                height={graphHeight} 
                fill="transparent" 
              />
              
              {isHovered && (
                <line x1={x} y1={padding.top} x2={x} y2={CHART_HEIGHT - padding.bottom} stroke="var(--text-muted)" strokeDasharray="4 4" />
              )}

              <circle 
                cx={x} 
                cy={y} 
                r={isHovered ? 6 : 4} 
                fill="var(--bg-main)" 
                stroke={color} 
                strokeWidth={isHovered ? 3 : 2} 
                className="transition-all duration-200"
              />

              {isHovered && (
                <g>
                  <rect 
                    x={tooltipX} 
                    y={y - 60} 
                    width="120" 
                    height="50" 
                    rx="6" 
                    fill="var(--bg-card)" 
                    stroke="var(--border-primary)" 
                    strokeWidth="1"
                    className="shadow-xl"
                  />
                  <text x={tooltipX + 60} y={y - 40} textAnchor="middle" fill={color} fontSize="14" fontWeight="bold">
                    ₹ {d.value.toLocaleString()}
                  </text>
                  <text x={tooltipX + 60} y={y - 22} textAnchor="middle" fill="var(--text-muted)" fontSize="12">
                    Cumulative Value
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

interface BarChartDataPoint {
  label: string;
  value: number;
  type?: 'win' | 'loss';
}

interface BarChartProps {
  data: BarChartDataPoint[];
}

export const ResponsiveBarChart: React.FC<BarChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const padding = { top: 40, right: 20, bottom: 50, left: 60 };
  const graphWidth = CHART_WIDTH - padding.left - padding.right;
  const graphHeight = CHART_HEIGHT - padding.top - padding.bottom;
  
  const maxVal = Math.max(...data.map(d => d.value)) * 1.2;
  const minVal = Math.min(0, ...data.map(d => d.value)) * 1.2;
  
  const totalRange = maxVal - minVal;
  const zeroY = padding.top + graphHeight - ((0 - minVal) / totalRange) * graphHeight;

  const barWidth = (graphWidth / data.length) * 0.6;

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const headers = ['Label', 'Value', 'Type'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + data.map(d => `"${d.label}",${d.value},${d.type || ''}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "trade_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full min-h-[300px] select-none relative group/chart">
      <button 
        onClick={handleExport}
        className="absolute top-2 right-2 p-1.5 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/50 transition-all opacity-0 group-hover/chart:opacity-100 z-20"
        title="Export Data to CSV"
      >
        <Download className="w-3.5 h-3.5" />
      </button>

      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full h-full" preserveAspectRatio="none">
        
        {/* Zero Line */}
        <line x1={padding.left} y1={zeroY} x2={CHART_WIDTH - padding.right} y2={zeroY} stroke="var(--text-muted)" strokeWidth="1" />

        {/* Grid Lines */}
        {[maxVal, maxVal/2, minVal].map((val, i) => {
            if (val === 0) return null;
            const y = padding.top + graphHeight - ((val - minVal) / totalRange) * graphHeight;
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={CHART_WIDTH - padding.right} y2={y} stroke="var(--chart-grid)" strokeWidth="1" strokeDasharray="4 4"/>
                <text x={padding.left - 10} y={y + 4} fill="var(--text-muted)" fontSize="12" textAnchor="end">
                  {val >= 100000 || val <= -100000 ? `₹${(val / 100000).toFixed(1)}L` : `₹${(val/1000).toFixed(0)}k`}
                </text>
              </g>
            )
        })}

        {data.map((d, i) => {
          const val = d.value;
          const barHeight = Math.abs((val / totalRange) * graphHeight);
          const y = val >= 0 ? zeroY - barHeight : zeroY;
          const x = padding.left + (i * (graphWidth / data.length)) + ((graphWidth / data.length - barWidth) / 2);
          const isHovered = hoveredIndex === i;
          const isPositive = val >= 0;
          const multiplier = (val / 100000).toFixed(1) + 'x';

          return (
            <g 
              key={i} 
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                fill={isHovered ? (isPositive ? "var(--accent-hover)" : "#ff6b6b") : (isPositive ? "var(--accent)" : "#ef4444")}
                rx="4"
                className="transition-all duration-300"
              />
              
              {/* X-Axis Label */}
              <text 
                x={x + barWidth / 2} 
                y={CHART_HEIGHT - 20} 
                fill={isHovered ? "var(--text-main)" : "var(--text-muted)"} 
                fontSize="12" 
                textAnchor="middle"
                className="transition-colors"
              >
                {d.label}
              </text>

              {/* Value Label (Top/Bottom of bar) */}
              {isHovered ? (
                <g>
                   <text x={x + barWidth / 2} y={val >= 0 ? y - 10 : y + barHeight + 20} fill={isPositive ? "var(--accent)" : "#ef4444"} fontSize="14" fontWeight="bold" textAnchor="middle">
                     {val >= 0 ? `+₹${val.toLocaleString()}` : `-₹${Math.abs(val).toLocaleString()}`}
                   </text>
                </g>
              ) : (
                <text 
                  x={x + barWidth / 2} 
                  y={val >= 0 ? y - 8 : y + barHeight + 16} 
                  fill={isPositive ? "var(--accent)" : "#ef4444"} 
                  fontSize="12" 
                  fontWeight="bold" 
                  textAnchor="middle"
                  className="opacity-90"
                >
                  {multiplier}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

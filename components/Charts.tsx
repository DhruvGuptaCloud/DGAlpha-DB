import React, { useState } from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: ChartDataPoint[];
  color?: string;
}

export const ResponsiveAreaChart: React.FC<AreaChartProps> = ({ data, color = "#D2F445" }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const height = 300;
  const width = 800;
  const padding = { top: 40, right: 40, bottom: 40, left: 60 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => d.value)) * 1.1;
  const minVal = 0;

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * graphWidth;
  const getY = (value: number) => padding.top + graphHeight - ((value - minVal) / (maxVal - minVal)) * graphHeight;

  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPath = `${points} ${getX(data.length - 1)},${height - padding.bottom} ${padding.left},${height - padding.bottom}`;

  return (
    <div className="w-full h-full min-h-[300px] select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
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
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#222" strokeWidth="1" />
              <text x={padding.left - 10} y={y + 4} fill="#666" fontSize="10" textAnchor="end">
                ₹{(val / 100000).toFixed(1)}L
              </text>
            </g>
          );
        })}

        {/* X-Axis Labels */}
        {data.map((d, i) => (
          <text key={i} x={getX(i)} y={height - 15} fill="#666" fontSize="10" textAnchor="middle">
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
                <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="#444" strokeDasharray="4 4" />
              )}

              <circle 
                cx={x} 
                cy={y} 
                r={isHovered ? 6 : 4} 
                fill="#000" 
                stroke={color} 
                strokeWidth={isHovered ? 3 : 2} 
                className="transition-all duration-200"
              />

              {isHovered && (
                <g>
                  <rect 
                    x={x - 60} 
                    y={y - 50} 
                    width="120" 
                    height="40" 
                    rx="6" 
                    fill="#1a1a1a" 
                    stroke="#333" 
                    strokeWidth="1"
                    className="shadow-xl"
                  />
                  <text x={x} y={y - 32} textAnchor="middle" fill={color} fontSize="12" fontWeight="bold">
                    ₹ {d.value.toLocaleString()}
                  </text>
                  <text x={x} y={y - 18} textAnchor="middle" fill="#888" fontSize="10">
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

  const height = 300;
  const width = 800;
  const padding = { top: 40, right: 20, bottom: 40, left: 60 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  
  const maxVal = Math.max(...data.map(d => d.value)) * 1.2;
  const minVal = Math.min(0, ...data.map(d => d.value)) * 1.2;
  
  const totalRange = maxVal - minVal;
  const zeroY = padding.top + graphHeight - ((0 - minVal) / totalRange) * graphHeight;

  const barWidth = (graphWidth / data.length) * 0.6;

  return (
    <div className="w-full h-full min-h-[300px] select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        
        <line x1={padding.left} y1={zeroY} x2={width - padding.right} y2={zeroY} stroke="#444" strokeWidth="1" />

        {[maxVal, maxVal/2, minVal].map((val, i) => {
            if (val === 0) return null;
            const y = padding.top + graphHeight - ((val - minVal) / totalRange) * graphHeight;
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#222" strokeWidth="1" strokeDasharray="4 4"/>
                <text x={padding.left - 10} y={y + 4} fill="#666" fontSize="10" textAnchor="end">
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
                fill={isHovered ? (isPositive ? "#c2e33d" : "#ff6b6b") : (isPositive ? "#D2F445" : "#ef4444")}
                rx="2"
                className="transition-all duration-300"
              />
              
              <text 
                x={x + barWidth / 2} 
                y={height - 15} 
                fill={isHovered ? "#fff" : "#666"} 
                fontSize="10" 
                textAnchor="middle"
                className="transition-colors"
              >
                {d.label}
              </text>

              {isHovered ? (
                <g>
                   <text x={x + barWidth / 2} y={val >= 0 ? y - 10 : y + barHeight + 15} fill={isPositive ? "#D2F445" : "#ef4444"} fontSize="12" fontWeight="bold" textAnchor="middle">
                     {val >= 0 ? `+₹${val.toLocaleString()}` : `-₹${Math.abs(val).toLocaleString()}`}
                   </text>
                </g>
              ) : (
                <text 
                  x={x + barWidth / 2} 
                  y={val >= 0 ? y - 6 : y + barHeight + 12} 
                  fill={isPositive ? "#D2F445" : "#ef4444"} 
                  fontSize="10" 
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
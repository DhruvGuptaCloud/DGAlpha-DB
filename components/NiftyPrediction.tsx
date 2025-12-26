import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  RefreshCw,
  BarChart3,
  LayoutDashboard,
  Menu,
  ChevronRight,
  Sparkles,
  Bot,
  X,
  Loader2,
  Zap,
  Download,
  Moon,
  Sun,
  UserPlus,
  CheckCircle2,
  Clock,
  Target,
  Database,
  PieChart,
  BookOpen,
  LineChart,
  Table as TableIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { MarketData, MarketDataRaw, TabType } from '../types/market';

// --- UI Components ---

const Card = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
  <div className={`
    bg-[var(--bg-card)] 
    backdrop-blur-sm 
    rounded-2xl 
    shadow-[0_8px_30px_rgb(0,0,0,0.06)]
    border border-[var(--border-primary)]
    overflow-hidden 
    transition-all duration-300 
    hover:shadow-[0_8px_30px_rgba(var(--accent-rgb),0.1)]
    hover:-translate-y-1
    ${className}
  `}>
    {children}
  </div>
);

type BadgeVariant = "neutral" | "success" | "danger" | "warning" | "info" | "purple";

const Badge = ({ children, variant = "neutral", className = "" }: { children?: React.ReactNode; variant?: BadgeVariant; className?: string }) => {
  const variants: Record<BadgeVariant, string> = {
    neutral: "bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-secondary)]",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    danger: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    purple: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${variants[variant]} ${className} shadow-sm backdrop-blur-md`}>
      {children}
    </span>
  );
};

// --- Helper Functions ---

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; 
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

// --- Chart Component ---

interface SimpleChartProps {
  data: any[];
  dataKey: string;
  type: 'line' | 'bar';
  color: string;
  label: string;
}

const SimpleChart = ({ data, dataKey, type, color, label }: SimpleChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-[var(--text-muted)] font-medium">No data available for visualization</div>;

  const width = 800;
  const height = 300;
  const padding = 40;

  const values = data.map((d: any) => d[dataKey]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  
  // Calculate domain and range with some buffer
  const domain = maxVal - minVal || 1;
  let rangeMin = minVal - (domain * 0.1);
  let rangeMax = maxVal + (domain * 0.1);
  
  // Specific logic for different metrics
  if (dataKey === 'nifty') {
     // Ensure 0 line is visible for Nifty Change
     rangeMin = Math.min(0, rangeMin);
     rangeMax = Math.max(0, rangeMax);
  } else if (dataKey === 'accuracy') {
     // Accuracy bounded 0-100
     rangeMin = Math.max(0, rangeMin); 
     rangeMax = Math.min(100, rangeMax); 
  }

  const totalRange = rangeMax - rangeMin || 1;

  const getY = (val: number) => {
    return height - padding - ((val - rangeMin) / totalRange) * (height - 2 * padding);
  };

  const getX = (index: number) => {
    return padding + (index / (data.length - 1 || 1)) * (width - 2 * padding);
  };
  
  const zeroY = getY(0);

  return (
    <div className="w-full flex flex-col animate-in fade-in duration-500">
       <div className="flex justify-between px-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
         <span>Start: {formatDate(data[0].date)}</span>
         <span style={{ color }}>{label} Trend</span>
         <span>End: {formatDate(data[data.length - 1].date)}</span>
       </div>
       <div className="relative w-full aspect-[21/9] bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-secondary)] p-4 shadow-inner overflow-hidden group">
         <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-full overflow-visible"
            onMouseLeave={() => setHoveredIndex(null)}
         >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = padding + t * (height - 2 * padding);
                return (
                   <line key={t} x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--border-secondary)" strokeWidth="1" />
                );
            })}
            
            {/* Zero line for Nifty Change */}
            {rangeMin < 0 && rangeMax > 0 && (
              <line x1={padding} y1={zeroY} x2={width - padding} y2={zeroY} stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 4" />
            )}

            {type === 'line' ? (
               <>
                 {/* Area under the line (gradient) */}
                 <defs>
                   <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                     <stop offset="100%" stopColor={color} stopOpacity="0" />
                   </linearGradient>
                 </defs>
                 <polygon 
                    points={`${getX(0)},${height-padding} ${data.map((d: any, i: number) => `${getX(i)},${getY(d[dataKey])}`).join(' ')} ${getX(data.length-1)},${height-padding}`}
                    fill={`url(#gradient-${dataKey})`}
                 />
                 <polyline
                   fill="none"
                   stroke={color}
                   strokeWidth="3"
                   points={data.map((d: any, i: number) => `${getX(i)},${getY(d[dataKey])}`).join(' ')}
                   strokeLinecap="round"
                   strokeLinejoin="round"
                   className="drop-shadow-sm"
                 />
                 {/* Interactive Points */}
                 {data.map((d: any, i: number) => (
                    <g key={i} onMouseEnter={() => setHoveredIndex(i)}>
                        {/* Invisible capture target */}
                        <circle cx={getX(i)} cy={getY(d[dataKey])} r="8" fill="transparent" className="cursor-crosshair" />
                        {/* Visible dot */}
                        <circle 
                            cx={getX(i)} 
                            cy={getY(d[dataKey])} 
                            r={hoveredIndex === i ? "6" : "3"} 
                            fill="var(--bg-card)" 
                            stroke={color} 
                            strokeWidth={hoveredIndex === i ? "3" : "2"} 
                            className="transition-all duration-200"
                        />
                    </g>
                 ))}
               </>
            ) : (
               data.map((d: any, i: number) => {
                 const val = d[dataKey];
                 const y = getY(val);
                 // If dataKey involves negative values, bar starts from zeroY.
                 let barY = y;
                 let barHeight = 0;
                 
                 if (dataKey === 'nifty') {
                     barY = val >= 0 ? y : zeroY;
                     barHeight = Math.abs(y - zeroY);
                 } else {
                     // Standard bottom-up bar
                     barY = y;
                     barHeight = height - padding - y;
                 }
                 
                 const barWidth = Math.max(2, ((width - 2 * padding) / data.length) * 0.6);
                 const barColor = dataKey === 'nifty' ? (val >= 0 ? '#10b981' : '#f43f5e') : color;
                 const isHovered = hoveredIndex === i;

                 return (
                   <rect
                     key={i}
                     x={getX(i) - barWidth / 2}
                     y={barY}
                     width={barWidth}
                     height={Math.max(2, barHeight)} 
                     fill={barColor}
                     rx={barWidth > 4 ? 2 : 0}
                     opacity={hoveredIndex !== null && !isHovered ? 0.4 : 1}
                     className="transition-all duration-200 cursor-pointer"
                     onMouseEnter={() => setHoveredIndex(i)}
                   />
                 );
               })
            )}

            {/* Tooltip */}
            {hoveredIndex !== null && data[hoveredIndex] && (
                <g className="pointer-events-none transition-opacity duration-200">
                    <rect 
                        x={getX(hoveredIndex) - 60} 
                        y={Math.min(height - 80, Math.max(10, getY(data[hoveredIndex][dataKey]) - 50))} 
                        width="120" 
                        height="45" 
                        rx="8" 
                        fill="var(--bg-card)" 
                        stroke="var(--border-secondary)"
                        strokeWidth="1"
                        filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                    />
                    <text 
                        x={getX(hoveredIndex)} 
                        y={Math.min(height - 80, Math.max(10, getY(data[hoveredIndex][dataKey]) - 50)) + 20} 
                        textAnchor="middle" 
                        fill="var(--text-muted)" 
                        fontSize="10" 
                        fontWeight="bold"
                    >
                        {formatDate(data[hoveredIndex].date)}
                    </text>
                    <text 
                        x={getX(hoveredIndex)} 
                        y={Math.min(height - 80, Math.max(10, getY(data[hoveredIndex][dataKey]) - 50)) + 36} 
                        textAnchor="middle" 
                        fill="var(--text-main)" 
                        fontSize="12" 
                        fontWeight="bold"
                    >
                        {data[hoveredIndex][dataKey].toFixed(2)}
                    </text>
                </g>
            )}
         </svg>
         
         {/* Simple Legend/MinMax overlay */}
         <div className="absolute top-4 right-6 flex flex-col items-end pointer-events-none">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Max</span>
            <span className="text-sm font-bold text-[var(--text-main)]">{maxVal.toFixed(2)}</span>
         </div>
         <div className="absolute bottom-4 right-6 flex flex-col items-end pointer-events-none">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Min</span>
            <span className="text-sm font-bold text-[var(--text-main)]">{minVal.toFixed(2)}</span>
         </div>
       </div>
    </div>
  );
};

interface NiftyPredictionProps {
  onGetIndicatorClick?: () => void;
}

export default function NiftyPrediction({ onGetIndicatorClick }: NiftyPredictionProps) {
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // History View State
  const [historyView, setHistoryView] = useState<'table' | 'chart'>('table');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [chartMetric, setChartMetric] = useState<'dg' | 'nifty' | 'accuracy'>('dg');

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const DATA_URL = "https://script.google.com/macros/s/AKfycbyUX-VgugBuH92aNzsrkOfEQP4GqOsVQPs9dYMb3TwtiCx2SqpAghiQeCohekABdecTIw/exec";

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const json = await response.json();
      
      // Data normalization logic
      let normalizedData: MarketData[] = [];
      const rawData = json.data || json; // Handle { data: [...] } or [...]
      
      if (Array.isArray(rawData)) {
        normalizedData = rawData.map((item: MarketDataRaw | any[]) => {
          // Handle both Object and Array formats from typical Google Apps Script outputs
          if (Array.isArray(item)) {
             return {
              date: item[0],
              metric: item[1],
              range: item[2],
              change: item[3],
              prediction: item[4],
              remarks: item[5] || "-"
             };
          }
          return {
            date: item.date || item.Date,
            metric: item.dgMarketMetric || item.metric || item['DG Market Metric'],
            range: item.range || item.Range,
            change: item.niftyChange || item.change || item['Nifty Change'],
            prediction: item.dataPrediction || item.prediction || item['Data Prediction'],
            remarks: item.remarksOnExtremeValues || item.remarks || item['Remarks On Extreme values'] || "-"
          };
        });
      }

      setData(normalizedData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Fetch Error:", err);
      // Fallback data for demonstration if API fails
      setData([
        { date: "2025-01-28", metric: 5.92, range: "Bullish", change: 128, prediction: "Right", remarks: "-" },
        { date: "2025-01-29", metric: 6.85, range: "Extremely Bullish", change: 205, prediction: "Right", remarks: "-" },
        { date: "2025-01-30", metric: 6.00, range: "Bullish", change: 86, prediction: "Right", remarks: "-" },
        { date: "2025-01-31", metric: 6.22, range: "Bullish", change: 258, prediction: "Right", remarks: "-" },
        { date: "2025-02-03", metric: 3.52, range: "Bearish", change: -121, prediction: "Right", remarks: "-" },
        { date: "2025-02-04", metric: 2.98, range: "Extremely Bearish", change: 378, prediction: "Wrong", remarks: "Extreme short covering rally today due to gap up" },
      ]);
      setError("Using cached/fallback data (Live fetch failed)");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Statistics Calculation
  const stats = useMemo(() => {
    if (!data.length) return null;
    
    const validData = data.filter(d => d.prediction && d.prediction.trim() !== '' && d.prediction !== '-');
    const total = validData.length;
    if (total === 0) return null;

    const right = validData.filter(d => d.prediction?.toLowerCase() === 'right').length;
    const accuracy = (right / total) * 100;
    
    // Time span
    const timestamps = validData
        .map(d => new Date(d.date).getTime())
        .filter(t => !isNaN(t));
    
    let days = 0;
    if (timestamps.length > 0) {
        const min = Math.min(...timestamps);
        const max = Math.max(...timestamps);
        days = Math.floor((max - min) / (1000 * 60 * 60 * 24)) + 1;
    }

    return {
        accuracy: accuracy.toFixed(2),
        total,
        right,
        days
    };
  }, [data]);

  // Sentiment Analysis Calculation
  const sentimentStats = useMemo(() => {
    if (!data.length) return [];
    
    const total = data.length;
    const counts: Record<string, number> = {
        'Bearish': 0,
        'Mild Bearish': 0,
        'Mild Bullish': 0,
        'Bullish': 0
    };

    data.forEach(row => {
        const r = row.range?.trim();
        if (r) {
            if (r.includes('Mild Bearish')) counts['Mild Bearish']++;
            else if (r.includes('Mild Bullish')) counts['Mild Bullish']++;
            else if (r.toLowerCase().includes('bearish')) counts['Bearish']++; 
            else if (r.toLowerCase().includes('bullish')) counts['Bullish']++;
        }
    });

    return [
        { label: 'Bearish', count: counts['Bearish'] },
        { label: 'Mild Bearish', count: counts['Mild Bearish'] },
        { label: 'Mild Bullish', count: counts['Mild Bullish'] },
        { label: 'Bullish', count: counts['Bullish'] },
    ].map(item => ({
        ...item,
        percentage: ((item.count / total) * 100).toFixed(2)
    }));
  }, [data]);
  
  // Chart Data Preparation (Running Accuracy)
  const chartData = useMemo(() => {
      let right = 0;
      let total = 0;
      return data.map(d => {
        const isRight = d.prediction?.toLowerCase() === 'right';
        const isValid = d.prediction && d.prediction !== '-' && d.prediction.trim() !== '';
        if (isValid) {
          total++;
          if (isRight) right++;
        }
        return {
          date: d.date,
          dg: typeof d.metric === 'number' ? d.metric : parseFloat(d.metric as string) || 0,
          nifty: typeof d.change === 'number' ? d.change : parseFloat(d.change as string) || 0,
          accuracy: total > 0 ? (right / total) * 100 : 0
        };
      });
  }, [data]);

  // --- Gemini AI Integration ---
  const generateAIAnalysis = async () => {
    if (data.length === 0) return;
    
    setIsAiAnalyzing(true);
    setAiError(null);
    setAiAnalysis(null);

    const recentData = data.slice(-5);
    
    const prompt = `
      You are an expert Indian Stock Market Analyst. Analyze this recent FII/Nifty data (Last 5 days):
      ${JSON.stringify(recentData)}
      
      Columns: Date, DG Score (Trend Strength), Direction (Bullish/Bearish), Nifty Change (Points), Prediction Accuracy, Remarks.
      
      Provide a concise 3-part Markdown summary:
      1. **📉 Trend Verdict**: Summarize the current market sentiment based on the 'DG Score' trend.
      2. **⚠️ Risk Radar**: specific warnings if Nifty Change is volatile or predictions are failing. Explain any 'Wrong' predictions using the remarks (e.g., Short Covering).
      3. **🚀 Tomorrow's Strategy**: A short actionable tip for a trader based on the latest 'Direction'.
      
      Keep it professional, concise, and use Indian market terminology. Do not use complex tables.
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Using gemini-3-flash-preview for quick analysis as per guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 } 
        }
      });
      
      setAiAnalysis(response.text || "No analysis generated.");
    } catch (err) {
      console.error(err);
      setAiError("Failed to generate analysis. Please try again.");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const downloadCSV = () => {
    if (data.length === 0) return;
    const headers = ["Date", "DG Score", "Direction", "Nifty Change", "Prediction", "Remarks"];
    const csvContent = [
      headers.join(","),
      ...data.map(row => [
        formatDate(row.date),
        row.metric,
        row.range,
        row.change,
        row.prediction,
        `"${(row.remarks || "").replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `nifty_trend_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getRangeVariant = (range: string): BadgeVariant => {
    const r = range?.toLowerCase() || "";
    if (r.includes("extremely bullish")) return "purple";
    if (r.includes("extremely bearish")) return "danger";
    if (r.includes("bullish")) return "success";
    if (r.includes("bearish")) return "warning";
    return "neutral";
  };

  const getPredictionVariant = (pred: string): BadgeVariant => {
    const p = pred?.toLowerCase() || "";
    if (p === "right") return "success";
    if (p === "wrong") return "danger";
    return "neutral";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-[var(--text-main)] tracking-tight mb-3">
            NIFTY Trend Analysis
          </h1>
          <p className="text-[var(--text-muted)] text-lg font-medium max-w-2xl leading-relaxed">
            Decoded FII buying & selling patterns with advanced market analytics using 14+ key data parameters.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={onGetIndicatorClick}
              className="flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-black text-white border border-[#333] hover:border-[var(--accent)] rounded-lg text-sm font-medium transition-all shadow-lg active:scale-95"
            >
              <UserPlus size={18} className="text-[var(--accent)]" />
              <span>Get DG Indicator</span>
            </button>

            <button 
              onClick={generateAIAnalysis}
              disabled={isAiAnalyzing || loading}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] rounded-lg text-sm font-bold transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAiAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="fill-current" />}
              <span>AI Insight Report</span>
            </button>
            <button 
              onClick={fetchData} 
              disabled={loading}
              className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-secondary)] hover:border-[var(--accent)] text-[var(--text-main)] rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
      </div>

      {/* Section 1: Why to use this Indicator */}
      <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <span className="w-1.5 h-8 bg-indigo-500 rounded-full"></span>
              Why to use this Indicator
            </h2>
          </div>
          
          {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 relative group border-t-4 !border-t-indigo-500">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Target size={80} className="text-[var(--text-main)]" />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                    <Target size={24} />
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-500/20 text-emerald-500 rounded-full uppercase tracking-wider">
                    Verified
                    </span>
                </div>
                <div className="relative z-10">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Accuracy</p>
                    <h3 className="text-3xl font-extrabold text-[var(--text-main)] mb-1">{stats.accuracy}%</h3>
                    <p className="text-xs font-medium text-[var(--text-dim)]">Proven success rate.</p>
                </div>
              </Card>

              <Card className="p-6 relative group border-t-4 !border-t-purple-500">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Database size={80} className="text-[var(--text-main)]" />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                    <Database size={24} />
                    </div>
                </div>
                <div className="relative z-10">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Signals</p>
                    <h3 className="text-3xl font-extrabold text-[var(--text-main)] mb-1">{stats.total}</h3>
                    <p className="text-xs font-medium text-[var(--text-dim)]">Data points analyzed.</p>
                </div>
              </Card>

              <Card className="p-6 relative group border-t-4 !border-t-amber-500">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Clock size={80} className="text-[var(--text-main)]" />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                    <Clock size={24} />
                    </div>
                </div>
                <div className="relative z-10">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Track Record</p>
                    <h3 className="text-3xl font-extrabold text-[var(--text-main)] mb-1">{stats.days} Days</h3>
                    <p className="text-xs font-medium text-[var(--text-dim)]">Duration of analysis.</p>
                </div>
              </Card>

              <Card className="p-6 relative group border-t-4 !border-t-emerald-500">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <CheckCircle2 size={80} className="text-[var(--text-main)]" />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                    <CheckCircle2 size={24} />
                    </div>
                </div>
                <div className="relative z-10">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Wins</p>
                    <h3 className="text-3xl font-extrabold text-[var(--text-main)] mb-1">{stats.right}</h3>
                    <p className="text-xs font-medium text-[var(--text-dim)]">Correct predictions.</p>
                </div>
              </Card>
          </div>
          )}
      </section>

      {/* Section 2: Tomorrow Nifty prediction */}
      <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <span className="w-1.5 h-8 bg-purple-500 rounded-full"></span>
              Tomorrow Nifty Prediction
            </h2>
            
            {/* AI Analysis Result Card */}
          {aiAnalysis && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <Card className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border-[var(--accent)] overflow-hidden ring-1 ring-[var(--accent)]/20">
              <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                      <div className="p-3 bg-[var(--accent)] rounded-2xl text-black shadow-lg shadow-[var(--accent)]/20">
                      <Bot size={24} />
                      </div>
                      <div>
                      <h3 className="font-bold text-xl text-[var(--text-main)]">Gemini Market Analyst</h3>
                      <p className="text-xs text-[var(--text-muted)] font-medium">Powered by Google AI</p>
                      </div>
                  </div>
                  <button onClick={() => setAiAnalysis(null)} className="p-2 hover:bg-[var(--bg-surface)] rounded-full transition-colors">
                      <X size={20} className="text-[var(--text-muted)]" />
                  </button>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-muted)] font-medium">
                    <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                  </div>
              </div>
              </Card>
          </div>
          )}

          {aiError && (
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl text-sm font-bold border border-rose-500/20 flex items-center gap-2">
              <AlertCircle size={18} />
              {aiError}
          </div>
          )}

            {/* Latest Prediction Highlight (Hero Card) */}
          {data.length > 0 && (() => {
          const latest = data[data.length - 1];
          const changeVal = Number(latest.change);
          return (
              <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] opacity-30 blur-lg group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <Card className="relative p-6 md:p-10 !bg-[var(--bg-card)] !border-[var(--border-primary)]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-[var(--border-secondary)]">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 shadow-sm">
                      <Zap size={28} className="fill-current" />
                      </div>
                      <div>
                      <h2 className="text-2xl font-bold text-[var(--text-main)]">Latest Market Signal</h2>
                      <p className="text-sm font-medium text-[var(--text-muted)]">Real-time updated analysis for active traders</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-[var(--bg-surface)] rounded-full border border-[var(--border-secondary)] shadow-sm">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">Market Live</span>
                  </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
                  {/* Date */}
                  <div className="flex flex-col gap-2 p-2 rounded-xl hover:bg-[var(--bg-surface)] transition-colors">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Date</p>
                      <p className="font-bold text-lg text-[var(--text-main)] truncate">
                      {formatDate(latest.date)}
                      </p>
                  </div>

                  {/* DG Score */}
                  <div className="flex flex-col gap-2 p-2 rounded-xl hover:bg-[var(--bg-surface)] transition-colors">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">DG Score</p>
                      <p className="font-mono font-bold text-3xl text-[var(--text-main)] tracking-tighter">
                      {typeof latest.metric === 'number' ? latest.metric.toFixed(2) : latest.metric}
                      </p>
                  </div>

                  {/* Direction */}
                  <div className="flex flex-col gap-2 p-2 rounded-xl hover:bg-[var(--bg-surface)] transition-colors">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Direction</p>
                      <div className="flex items-start">
                      <Badge variant={getRangeVariant(latest.range)} className="!text-sm !px-4 !py-1.5 whitespace-nowrap !rounded-lg">
                          {latest.range}
                      </Badge>
                      </div>
                  </div>

                  {/* Nifty Change */}
                  <div className="flex flex-col gap-2 p-2 rounded-xl hover:bg-[var(--bg-surface)] transition-colors">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Nifty Change</p>
                      <p className={`font-bold text-2xl ${!isNaN(changeVal) && changeVal > 0 ? 'text-emerald-500' : !isNaN(changeVal) && changeVal < 0 ? 'text-rose-500' : 'text-[var(--text-muted)]'}`}>
                      {latest.change !== undefined && latest.change !== null && String(latest.change) !== '' 
                          ? <>{!isNaN(changeVal) && changeVal > 0 ? '+' : ''}{latest.change}</> 
                          : '-'}
                      </p>
                  </div>

                  {/* Prediction */}
                  <div className="flex flex-col gap-2 p-2 rounded-xl hover:bg-[var(--bg-surface)] transition-colors">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Prediction</p>
                      <div className="flex items-start">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm ${latest.prediction?.toLowerCase() === 'right' ? 'bg-emerald-500/20 text-emerald-500 ring-1 ring-emerald-500/20' : 'bg-rose-500/20 text-rose-500 ring-1 ring-rose-500/20'}`}>
                          {latest.prediction?.toLowerCase() === 'right' ? <TrendingUp size={16} /> : <AlertCircle size={16} />}
                          {latest.prediction}
                          </div>
                      </div>
                  </div>

                  {/* Remarks */}
                  <div className="flex flex-col gap-2 lg:col-span-1 p-2 rounded-xl hover:bg-[var(--bg-surface)] transition-colors">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Remarks</p>
                      <p className="text-xs font-bold text-[var(--text-dim)] leading-relaxed line-clamp-3">
                      {latest.remarks && latest.remarks !== "-" ? latest.remarks : <span className="text-[var(--text-muted)] italic font-normal">No significant remarks</span>}
                      </p>
                  </div>
                  </div>
              </Card>
              </div>
          );
          })()}
      </section>

      {/* Section 3: Analytics */}
      <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <span className="w-1.5 h-8 bg-amber-500 rounded-full"></span>
              Analytics
            </h2>
            {/* Trading Strategy & Sentiment Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dynamic Sentiment Table */}
              <Card className="flex flex-col h-full border-t-4 !border-t-indigo-500">
                  <div className="px-6 py-5 border-b border-[var(--border-secondary)] flex items-center gap-3 bg-[var(--bg-surface)]">
                      <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500">
                          <PieChart size={20} />
                      </div>
                      <h3 className="font-bold text-lg text-[var(--text-main)]">Market Sentiment Analysis</h3>
                  </div>
                  <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left text-sm">
                          <thead>
                              <tr className="bg-[var(--bg-main)] text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold border-b border-[var(--border-secondary)]">
                                  <th className="px-6 py-4">Market Direction</th>
                                  <th className="px-6 py-4 text-right">Percentage</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border-secondary)]">
                              {sentimentStats.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-[var(--bg-hover)] transition-colors">
                                      <td className="px-6 py-4 font-semibold text-[var(--text-main)]">{item.label}</td>
                                      <td className="px-6 py-4 text-right font-bold text-[var(--text-main)]">{item.percentage}%</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </Card>

              {/* Static Trading Strategy Table */}
              <Card className="flex flex-col h-full border-t-4 !border-t-emerald-500">
                  <div className="px-6 py-5 border-b border-[var(--border-secondary)] flex items-center gap-3 bg-[var(--bg-surface)]">
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                          <BookOpen size={20} />
                      </div>
                      <h3 className="font-bold text-lg text-[var(--text-main)]">Trading Strategy Guide</h3>
                  </div>
                  <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left text-sm">
                          <thead>
                              <tr className="bg-[var(--bg-main)] text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold border-b border-[var(--border-secondary)]">
                                  <th className="px-6 py-4">Market Direction</th>
                                  <th className="px-6 py-4">DG Range</th>
                                  <th className="px-6 py-4">Strategy</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border-secondary)]">
                              <tr className="hover:bg-[var(--bg-hover)]">
                                  <td className="px-6 py-4 font-semibold text-[var(--text-main)]">Bearish</td>
                                  <td className="px-6 py-4 font-mono text-xs font-bold text-[var(--text-muted)]">2.0 - 4.0</td>
                                  <td className="px-6 py-4 text-[var(--text-dim)] font-medium">Full quantity at once</td>
                              </tr>
                              <tr className="hover:bg-[var(--bg-hover)]">
                                  <td className="px-6 py-4 font-semibold text-[var(--text-main)]">Mild Bearish</td>
                                  <td className="px-6 py-4 font-mono text-xs font-bold text-[var(--text-muted)]">4.0 - 5.0</td>
                                  <td className="px-6 py-4 text-[var(--text-dim)] font-medium">2 time entry with half quantity</td>
                              </tr>
                              <tr className="hover:bg-[var(--bg-hover)]">
                                  <td className="px-6 py-4 font-semibold text-[var(--text-main)]">Mild Bullish</td>
                                  <td className="px-6 py-4 font-mono text-xs font-bold text-[var(--text-muted)]">5.0 - 6.0</td>
                                  <td className="px-6 py-4 text-[var(--text-dim)] font-medium">2 time entry with half quantity</td>
                              </tr>
                              <tr className="hover:bg-[var(--bg-hover)]">
                                  <td className="px-6 py-4 font-semibold text-[var(--text-main)]">Bullish</td>
                                  <td className="px-6 py-4 font-mono text-xs font-bold text-[var(--text-muted)]">6.0 - 8.0</td>
                                  <td className="px-6 py-4 text-[var(--text-dim)] font-medium">Full quantity at once</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </Card>
          </div>
      </section>
      
      {/* Section 4: Past Data predictions */}
      <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <span className="w-1.5 h-8 bg-blue-500 rounded-full"></span>
              Past Data Predictions
            </h2>
            {/* Main Table Section */}
          <Card className="flex flex-col border border-[var(--border-primary)] shadow-2xl">
          <div className="px-6 py-5 border-b border-[var(--border-secondary)] bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                      <TrendingUp className="text-indigo-500" size={20} />
                      Historical Data
                  </h2>
                  
                  {/* View Toggle */}
                  <div className="flex items-center p-1 bg-[var(--bg-card)] rounded-lg border border-[var(--border-secondary)]">
                    <button 
                      onClick={() => setHistoryView('table')}
                      className={`p-1.5 rounded-md transition-all ${historyView === 'table' ? 'bg-[var(--bg-hover)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                      title="Table View"
                    >
                      <TableIcon size={16} />
                    </button>
                    <button 
                      onClick={() => setHistoryView('chart')}
                      className={`p-1.5 rounded-md transition-all ${historyView === 'chart' ? 'bg-[var(--bg-hover)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                      title="Chart View"
                    >
                      <LineChart size={16} />
                    </button>
                  </div>

                  {/* Chart Controls */}
                  {historyView === 'chart' && (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-left-2">
                          <select 
                              value={chartMetric} 
                              onChange={(e) => setChartMetric(e.target.value as any)}
                              className="text-xs font-semibold px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-secondary)] text-[var(--text-main)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                          >
                              <option value="dg">DG Score</option>
                              <option value="nifty">Nifty Change</option>
                              <option value="accuracy">Running Accuracy</option>
                          </select>
                          <div className="flex items-center p-1 bg-[var(--bg-card)] rounded-lg border border-[var(--border-secondary)]">
                              <button 
                                  onClick={() => setChartType('line')}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${chartType === 'line' ? 'bg-[var(--bg-hover)] text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}
                              >
                                  Line
                              </button>
                              <button 
                                  onClick={() => setChartType('bar')}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${chartType === 'bar' ? 'bg-[var(--bg-hover)] text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}
                              >
                                  Bar
                              </button>
                          </div>
                      </div>
                  )}
              </div>
              
              <div className="flex items-center gap-3">
              <button 
                  onClick={downloadCSV}
                  disabled={data.length === 0}
                  className="group flex items-center gap-2 px-4 py-2 text-sm font-bold text-[var(--text-main)] bg-[var(--bg-hover)] hover:bg-[var(--bg-surface)] border border-[var(--border-secondary)] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                  <span className="hidden sm:inline">Export CSV</span>
              </button>
              
              {lastUpdated && (
                  <div className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-2 border-l border-[var(--border-secondary)] pl-4 ml-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="hidden sm:inline">Updated:</span> {lastUpdated.toLocaleTimeString()}
                  </div>
              )}
              </div>
          </div>

          {historyView === 'chart' ? (
                <div className="p-6">
                    <SimpleChart 
                      data={chartData} 
                      dataKey={chartMetric} 
                      type={chartType} 
                      color={chartMetric === 'dg' ? '#6366f1' : chartMetric === 'nifty' ? '#10b981' : '#f59e0b'}
                      label={chartMetric === 'dg' ? 'DG Score' : chartMetric === 'nifty' ? 'Nifty Change' : 'Running Accuracy (%)'}
                    />
                </div>
          ) : (
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-[var(--bg-surface)] text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold border-b border-[var(--border-secondary)]">
                      <th className="px-6 py-5 first:pl-8">Date</th>
                      <th className="px-6 py-5 text-right">DG Score</th>
                      <th className="px-6 py-5">Direction</th>
                      <th className="px-6 py-5 text-right">Nifty Change</th>
                      <th className="px-6 py-5 text-center">Prediction</th>
                      <th className="px-6 py-5 min-w-[250px]">Remarks</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-secondary)] bg-[var(--bg-card)]">
                      {loading ? (
                      <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-[var(--text-muted)]">
                          <div className="flex flex-col items-center justify-center gap-3">
                              <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
                              <p className="font-medium animate-pulse">Syncing Market Data...</p>
                          </div>
                          </td>
                      </tr>
                      ) : data.length === 0 ? (
                      <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]">
                          No data available at this time.
                          </td>
                      </tr>
                      ) : (
                      data.slice().reverse().map((row, index) => {
                          const changeVal = Number(row.change);
                          return (
                          <tr key={index} className="hover:bg-[var(--bg-hover)] transition-colors group">
                          {/* Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[var(--text-main)] first:pl-8">
                              {formatDate(row.date)}
                          </td>
                          
                          {/* DG Metric */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-bold text-[var(--text-muted)]">
                              {typeof row.metric === 'number' ? row.metric.toFixed(2) : row.metric}
                          </td>
                          
                          {/* Range */}
                          <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={getRangeVariant(row.range)}>
                              {row.range}
                              </Badge>
                          </td>
                          
                          {/* Nifty Change */}
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${!isNaN(changeVal) && changeVal > 0 ? 'text-emerald-500' : !isNaN(changeVal) && changeVal < 0 ? 'text-rose-500' : 'text-[var(--text-muted)]'}`}>
                              {!isNaN(changeVal) && changeVal > 0 ? '+' : ''}{row.change}
                          </td>
                          
                          {/* Prediction */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                              <Badge variant={getPredictionVariant(row.prediction)} className="uppercase text-[10px] tracking-widest px-3 border-0">
                              {row.prediction}
                              </Badge>
                          </td>
                          
                          {/* Remarks */}
                          <td className="px-6 py-4 text-sm text-[var(--text-muted)] max-w-xs relative">
                              {row.remarks && row.remarks !== "-" ? (
                                  <div className="flex items-start gap-2">
                                  {row.prediction?.toLowerCase() === 'wrong' && <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />}
                                  <span className="truncate group-hover:whitespace-normal group-hover:absolute group-hover:bg-[var(--bg-surface)] group-hover:shadow-2xl group-hover:z-50 group-hover:p-4 group-hover:rounded-xl group-hover:border group-hover:border-[var(--border-secondary)] group-hover:left-4 group-hover:-top-4 group-hover:w-72 font-medium">
                                      {row.remarks}
                                  </span>
                                  </div>
                              ) : (
                                  <span className="text-[var(--text-dim)]">-</span>
                              )}
                          </td>
                          </tr>
                          );
                      })
                      )}
                  </tbody>
                  </table>
              </div>
          )}
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-[var(--border-secondary)] bg-[var(--bg-surface)] flex justify-between items-center text-xs font-bold text-[var(--text-muted)]">
              <span>Showing {data.length} records</span>
              <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)] shadow-sm disabled:opacity-50 transition-all" disabled><ChevronRight className="rotate-180" size={16}/></button>
              <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)] shadow-sm transition-all"><ChevronRight size={16}/></button>
              </div>
          </div>
          </Card>
      </section>

    </div>
  );
}
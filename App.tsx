import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Activity, 
  ArrowDownRight, 
  Wallet, 
  Calendar, 
  BarChart3, 
  Layers, 
  Sparkles, 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  LineChart, 
  Target, 
  History, 
  BrainCircuit, 
  Zap, 
  ShieldCheck, 
  UserPlus, 
  CheckCircle2,
  Gamepad2,
  LogOut,
  BarChart2,
  User,
  RefreshCw,
  BookOpen,
  Search,
  AlertCircle,
  Inbox,
  Download,
  Sun,
  Moon
} from 'lucide-react';
import { generateAnalysis } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { ResponsiveAreaChart, ResponsiveBarChart } from './components/Charts';

// --- UI Components ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-4 sm:p-6 relative overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; type?: "success" | "danger" | "neutral"; className?: string }> = ({ children, type = "success", className = "" }) => {
  const styles = {
    success: "text-[var(--accent)] bg-[rgba(var(--accent-rgb),0.1)]",
    danger: "text-red-400 bg-red-400/10",
    neutral: "text-[var(--text-muted)] bg-[var(--bg-surface)]"
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[type]} ${className}`}>
      {children}
    </span>
  );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 relative">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-primary)] bg-[var(--bg-card)] sticky top-0 z-10">
          <div className="text-xl font-bold text-[var(--text-main)]">{title}</div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-surface)] rounded-lg transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar text-[var(--text-muted)] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center px-4 py-3 sm:py-4 transition-all group relative ${
      isActive 
        ? 'text-[var(--accent)] bg-[var(--bg-surface)] border-r-2 border-[var(--accent)]' 
        : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--accent)] border-r-2 border-transparent'
    }`}
  >
    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${isActive ? 'text-[var(--accent)]' : ''}`} />
    <span className={`hidden md:block ml-3 font-medium text-sm tracking-wide text-left ${isActive ? 'text-[var(--text-main)]' : ''}`}>
      {label}
    </span>
    {/* Tooltip for mobile */}
    <div className="md:hidden absolute left-14 top-1/2 -translate-y-1/2 bg-[var(--bg-card)] text-[var(--text-main)] text-xs px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-[var(--border-primary)] shadow-xl">
      {label}
    </div>
  </button>
);

interface BuybackData {
  stock: string;
  buyback: number;
  smallShareholderApproxHolding: number;
  shareholderParticipation: number;
  type: string;
  preRecordDateAnnouncementPrice: number;
  buybackPrice: number;
  recordDate: string | null;
  pricePostBuyback: number;
  expectedMoneyGeneralCategory: number;
  expectedMoneySmallShareholder: number;
  generalCategoryAcceptanceRatio: number;
  smallShareholderCategoryAcceptanceRatio: number;
}

interface SuperstarEntry {
  "INVESTOR NAME": string;
  "STOCK NAME": string;
  "Latest Holding Percentage": number;
  "Portfoilo Value (CR)": number;
  "Stake Value (CR)": number;
  "% allocation": number;
  "Latest Qtr Data": string | null;
}

const formatPercent = (val: any) => {
  if (val === null || val === undefined || val === '') return '-';
  if (typeof val === 'string' && val.includes('%')) return val;
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return (num * 100).toFixed(2) + '%';
};

const formatNumber = (val: any) => {
  if (val === null || val === undefined) return '-';
  const num = parseFloat(val);
  return isNaN(num) ? val : num.toLocaleString('en-US');
};

const formatDate = (val: any) => {
  if (!val) return '-';
  const date = new Date(val);
  if (isNaN(date.getTime())) return val;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
};

// Column Configuration for Buyback Tables
const buybackColumns = [
  { key: "stock", label: "Stock", type: "text", className: "font-bold text-[var(--text-main)] sticky left-0 bg-[var(--bg-card)] border-r border-[var(--border-primary)] z-10" },
  { key: "buyback", label: "Buyback %", type: "percent", className: "text-right font-mono font-bold text-[var(--accent)] border-r border-[var(--border-primary)]" },
  { key: "smallShareholderApproxHolding", label: "Small Shareholder Holding", type: "percent", className: "text-right font-mono text-[var(--text-muted)] border-r border-[var(--border-primary)]" },
  { key: "shareholderParticipation", label: "Participation", type: "percent", className: "text-right font-mono font-bold border-r border-[var(--border-primary)]" },
  { key: "type", label: "Type", type: "text", className: "text-center text-xs uppercase tracking-wide text-[var(--text-muted)] font-bold border-r border-[var(--border-primary)]" },
  { key: "preRecordDateAnnouncementPrice", label: "Pre-Record Price", type: "number", className: "text-right font-mono text-[var(--text-muted)] border-r border-[var(--border-primary)]" },
  { key: "buybackPrice", label: "Buyback Price", type: "number", className: "text-right font-mono font-bold text-[var(--text-main)] border-r border-[var(--border-primary)]" },
  { key: "recordDate", label: "Record Date", type: "date", className: "text-center text-[var(--text-muted)] whitespace-nowrap border-r border-[var(--border-primary)]" },
  { key: "pricePostBuyback", label: "Price Post Buyback", type: "number", className: "text-right font-mono text-[var(--text-muted)] border-r border-[var(--border-primary)]" },
  { key: "expectedMoneyGeneralCategory", label: "Exp. Money (Gen)", type: "percent", className: "text-right font-mono text-[var(--text-muted)] border-r border-[var(--border-primary)]" },
  { key: "expectedMoneySmallShareholder", label: "Exp. Money (Small)", type: "percent", className: "text-right font-mono font-bold border-r border-[var(--border-primary)]" },
  { key: "generalCategoryAcceptanceRatio", label: "Acceptance (Gen)", type: "percent", className: "text-right font-mono text-[var(--text-muted)] border-r border-[var(--border-primary)]" },
  { key: "smallShareholderCategoryAcceptanceRatio", label: "Acceptance (Small)", type: "percent", className: "text-right font-mono text-[var(--text-muted)]" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dg-alpha' | 'buyback-game' | 'superstar-tracker'>('dg-alpha');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'executive' | 'trade' | 'buyback'>('executive'); 
  const [reportContent, setReportContent] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Default to dark mode if no preference saved
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  
  // Lead Form States
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isLeadSubmitted, setIsLeadSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '',
    city: '',
    age: '',
    portfolio: 'Above 1 Lakh',
    phone: ''
  });
  
  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'system', text: 'Hello! I am DG Alpha AI. Ask me anything about your Neuland Labs portfolio.' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Buyback Data State
  const [buybackData, setBuybackData] = useState<BuybackData[]>([]);
  const [pastBuybackData, setPastBuybackData] = useState<BuybackData[]>([]);
  const [isBuybackLoading, setIsBuybackLoading] = useState(false);
  const [isPastBuybackLoading, setIsPastBuybackLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Superstar Tracker State
  const [superstarData, setSuperstarData] = useState<SuperstarEntry[]>([]);
  const [isSuperstarLoading, setIsSuperstarLoading] = useState(false);
  const [superstarSearch, setSuperstarSearch] = useState('');

  // Theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- Data ---
  const investmentMetrics = {
    totalQtyFree: 323,
    marketValueRetained: 5462576,
    dividendsCashflow: 13496.5,
    totalValueFree: 5476072.5,
    maxInvested: "3 L (3 Parallel Tracks)",
    time: "3.6 Yr",
    roi: "1825%",
    annualizedYield: "507.04%",
    maxDD: "2.99%",
    ratio: "169.21"
  };

  const pnlData = [
    { entry: 555, date: "Jul '20", qty: 181, doubleDate: "Sep '20", doublePrice: 1110, freeQty: 90.5, currVal: 1530536, time: '3 Months' },
    { entry: 821, date: "Aug '20", qty: 122, doubleDate: "Feb '21", doublePrice: 1642, freeQty: 61, currVal: 1031632, time: '6 Months' },
    { entry: 1356, date: "Feb '21", qty: 74, doubleDate: "May '21", doublePrice: 2712, freeQty: 37, currVal: 625744, time: '4 Months' },
    { entry: 1384, date: "Sep '22", qty: 73, doubleDate: "May '23", doublePrice: 2768, freeQty: 36.5, currVal: 617288, time: '8 Months' },
    { entry: 1617, date: "Feb '23", qty: 62, doubleDate: "Jul '23", doublePrice: 3234, freeQty: 31, currVal: 524272, time: '3 Months' },
    { entry: 1682, date: "Mar '23", qty: 60, doubleDate: "Jul '23", doublePrice: 3364, freeQty: 30, currVal: 507360, time: '5 Months' },
    { entry: 2078, date: "Apr '23", qty: 49, doubleDate: "Aug '23", doublePrice: 4156, freeQty: 24.5, currVal: 414344, time: '4 Months' },
    { entry: 4058, date: "Oct '23", qty: 25, doubleDate: "Jul '24", doublePrice: 8116, freeQty: 12.5, currVal: 211400, time: '9 Months' },
  ];

  const dividends = [
    { year: 2025, amount: 12 },
    { year: 2024, amount: 14 },
    { year: 2023, amount: 10 },
    { year: 2022, amount: 5 },
    { year: 2021, amount: 3 },
    { year: 2020, amount: 2 },
  ];

  const cashflowData = [
    { entry: 3992, qty: 26, exit: 3798, flow: -5044, time: '0.5 Months' },
    { entry: 7158, qty: 14, exit: 6529, flow: -8806, time: '0.5 Months' },
    { entry: 7376, qty: 14, exit: 6225, flow: -16114, time: '0.5 Months' },
  ];

  const whyUseSystem = [
    { 
      title: "1. Proven, Backtested Performance", 
      desc: "Our strategy is backed by years of rigorous testing, consistently delivering 300%+ annual ROI across multiple market cycles.",
      icon: History
    },
    { 
      title: "2. Scalable for Any Capital Size", 
      desc: "Whether you’re investing a few lakhs or managing crores, the system scales effortlessly without losing efficiency or performance.",
      icon: Layers
    },
    { 
      title: "3. No Emotions - Pure Data & Logic", 
      desc: "Remove human judgement, emotions, fear, and overthinking from your trades. The system executes with discipline for superior, consistent results.",
      icon: BrainCircuit
    },
    { 
      title: "4. Powered by Veteran-Level Market Intelligence", 
      desc: "Built using insights from industry experts and decades of market patterns—helping you discover true multibagger opportunities early.",
      icon: Zap
    },
    { 
      title: "5. Zero-Risk Methodology to Control Fear & Greed", 
      desc: "Our structured approach helps you manage emotions by using risk-free entry and exit mechanisms designed for maximum confidence.",
      icon: ShieldCheck
    },
    { 
      title: "6. Best-in-Class Risk Management", 
      desc: "Designed with an average max drawdown of just 0.5%, the system protects your capital while allowing profits to grow.",
      icon: Target
    },
    { 
      title: "7. No Need to Predict Tops or Bottoms", 
      desc: "You don’t need to time the perfect entry or exit. The system automatically identifies high-probability zones so you invest stress-free.",
      icon: Calendar
    },
    { 
      title: "8. Shields You From Extreme Drawdowns", 
      desc: "Avoid painful falls like the 40% drawdown seen in stocks such as Neuland before they rallied. Our system filters out such traps proactively.",
      icon: ArrowDownRight
    }
  ];

  // Process data for charts
  const growthData = useMemo(() => {
    let cumulative = 0;
    return pnlData.map(item => {
      cumulative += item.currVal;
      return { label: item.date, value: cumulative };
    });
  }, [pnlData]);

  const tradePnL = useMemo(() => {
    const winners = pnlData.map(item => ({
      label: item.date,
      value: item.currVal,
      type: 'win' as const
    }));
    
    const losers = cashflowData.map((item, idx) => ({
      label: `Exit ${idx + 1}`,
      value: item.flow, 
      type: 'loss' as const
    }));

    return [...winners, ...losers];
  }, [pnlData, cashflowData]);

  const accuracy = useMemo(() => {
    const wins = pnlData.length;
    const losses = cashflowData.length;
    const total = wins + losses;
    return { wins, total, percent: Math.round((wins/total)*100) };
  }, [pnlData, cashflowData]);

  // Fetch Buyback Data
  const fetchBuybackData = async () => {
    setIsBuybackLoading(true);
    setIsPastBuybackLoading(true);
    try {
      // Fetch Active
      const resActive = await fetch('https://script.google.com/macros/s/AKfycbwzrEhfvJDUbYvmSf2gR0FldTSMCugwzFZjFyCc-Dt_onskqT1GVFGBzEOZPVEx_FBwEg/exec');
      const jsonActive = await resActive.json();
      if (Array.isArray(jsonActive)) setBuybackData(jsonActive);
      else if (jsonActive.data) setBuybackData(jsonActive.data);

      // Fetch Past
      const resPast = await fetch('https://script.google.com/macros/s/AKfycbyBkXynI1RU-fdBi98L_gj469q-jEoNY6F4Q2mFq4dbkHWLnGyNSeh0h4V46EXyonnkwA/exec');
      const jsonPast = await resPast.json();
      if (Array.isArray(jsonPast)) setPastBuybackData(jsonPast);
      else if (jsonPast.data) setPastBuybackData(jsonPast.data);

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Error fetching buyback data:", e);
    } finally {
      setIsBuybackLoading(false);
      setIsPastBuybackLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'buyback-game' && buybackData.length === 0) {
      fetchBuybackData();
    }
  }, [activeTab]);

  // Fetch Superstar Data
  const fetchSuperstarData = async () => {
    setIsSuperstarLoading(true);
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxzmxwSdnLdzDvTU4f1AGOe43bkuj5PRPzsZDrZNbVt2CXH7GivURHuQgwzSnyg5LOdgQ/exec');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSuperstarData(data);
    } catch (error) {
      console.error('Error fetching superstar data:', error);
    } finally {
      setIsSuperstarLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'superstar-tracker' && superstarData.length === 0) {
      fetchSuperstarData();
    }
  }, [activeTab]);
  
  const filteredSuperstarData = useMemo(() => {
    const query = superstarSearch.toLowerCase();
    return superstarData.filter(row => {
      const investor = (row["INVESTOR NAME"] || '').toLowerCase();
      const stock = (row["STOCK NAME"] || '').toLowerCase();
      return investor.includes(query) || stock.includes(query);
    });
  }, [superstarData, superstarSearch]);


  // --- Gemini Handler Wrappers ---
  const handleGenerateReport = async () => {
    setReportType('executive');
    setIsReportModalOpen(true);
    setReportContent('');
    setIsGeneratingReport(true);
    
    const context = `
      Data for Neuland Laboratories (DG Alpha System):
      - Total Free Value: ₹${investmentMetrics.totalValueFree}
      - ROI: ${investmentMetrics.roi} over ${investmentMetrics.time}
      - Annualised Yield: ${investmentMetrics.annualizedYield}
      - Max Drawdown: ${investmentMetrics.maxDD}
      - ROI/DD Ratio: ${investmentMetrics.ratio}
      - Institutional Holding (Vijay Kedia): 17.5x Wealth Multiplier
    `;
    
    const prompt = `
      You are a high-end financial analyst for DG Alpha.
      Analyze this portfolio data for Neuland Laboratories.
      
      ${context}
      
      Write a concise, bullet-point Executive Performance Summary.
      Focus on:
      1. The efficiency of the strategy (ROI vs Risk/Drawdown).
      2. Comparison to standard market returns.
      3. Significance of the 'Free Shares' accumulation.
      4. A brief comment on the institutional alignment (Vijay Kedia).
      
      Keep the tone professional, encouraging, and sophisticated. Use emojis sparingly.
    `;

    const result = await generateAnalysis(prompt);
    setReportContent(result);
    setIsGeneratingReport(false);
  };

  const handleTradeAnalysis = async () => {
    setReportType('trade');
    setIsReportModalOpen(true);
    setReportContent('');
    setIsGeneratingReport(true);
    
    const wins = tradePnL.filter(t => t.type === 'win').map(t => t.value);
    const losses = tradePnL.filter(t => t.type === 'loss').map(t => t.value);
    const avgWin = wins.reduce((a,b)=>a+b,0)/wins.length || 0;
    const avgLoss = losses.reduce((a,b)=>a+b,0)/losses.length || 0;

    const context = `
      Trading Performance Data:
      - Accuracy: ${accuracy.wins}/${accuracy.total} (${accuracy.percent}%)
      - Winning Trades: ${wins.length} (Avg Win: ₹${avgWin.toFixed(0)})
      - Losing Trades: ${losses.length} (Avg Loss: ₹${avgLoss.toFixed(0)})
      - Largest Win: ₹${Math.max(...wins).toFixed(0)}
      - Largest Loss: ₹${Math.min(...losses).toFixed(0)}
    `;

    const prompt = `
      You are a trading psychology and risk management coach.
      Analyze this specific trade sequence for Neuland Laboratories.
      
      ${context}
      
      Provide a tactical analysis in 3 short paragraphs:
      1. **Win/Loss Ratio Analysis:** Comment on the size of winners vs losers. Are we cutting losses fast enough?
      2. **Accuracy vs Profitability:** With ${accuracy.percent}% accuracy, is the strategy sustainable?
      3. **Actionable Advice:** Give one specific tip to improve the risk-reward ratio based on this data.
      
      Format with bold headers. Be direct and concise.
    `;

    const result = await generateAnalysis(prompt);
    setReportContent(result);
    setIsGeneratingReport(false);
  };

  const handleBuybackAiReport = async () => {
    setReportType('buyback');
    setIsReportModalOpen(true);
    setReportContent('');
    setIsGeneratingReport(true);

    if (buybackData.length === 0) {
      setReportContent("No active buyback data available to analyze.");
      setIsGeneratingReport(false);
      return;
    }

    const simplifiedData = buybackData.map(item => ({
        Stock: item.stock,
        BuybackPrice: item.buybackPrice,
        ExpReturnSmall: item.expectedMoneySmallShareholder,
        AcceptanceRatio: item.smallShareholderCategoryAcceptanceRatio,
        Type: item.type
    }));

    const prompt = `
      You are an arbitrage expert. Analyze this live buyback/tender offer data.
      Data: ${JSON.stringify(simplifiedData)}

      Identify top opportunities where the Expected Return (Small Shareholder) is greater than 8%.
      For each opportunity found:
      - Name the stock.
      - State the arbitrage spread/return.
      - Give a quick recommendation on whether to participate based on the acceptance ratio.
      
      If no opportunities >8% exist, clearly state that and suggest the best available option.
      Format neatly with bullet points.
    `;

    const result = await generateAnalysis(prompt);
    setReportContent(result);
    setIsGeneratingReport(false);
  };

  // Superstar AI Handlers
  const handleSuperstarInsightReport = async () => {
    setIsReportModalOpen(true);
    setReportContent('');
    setIsGeneratingReport(true);
    
    const dataToAnalyze = filteredSuperstarData.length > 0 ? filteredSuperstarData.slice(0, 15) : superstarData.slice(0, 15);
    
    const context = dataToAnalyze.map(item => ({
        investor: item["INVESTOR NAME"],
        stock: item["STOCK NAME"],
        allocation: item["% allocation"]
    }));

    const prompt = `
        You are a senior portfolio analyst. Analyze the following portfolio data from top Indian "Superstar" investors.
        
        Data: ${JSON.stringify(context)}
        
        Please provide a brief, high-impact insight report covering:
        1. **Sector Themes:** What industries are they betting on?
        2. **Consensus:** Are multiple investors holding the same stocks?
        3. **Risk Profile:** Based on allocation percentages, is this an aggressive or defensive set?
        
        Format the output in clean Markdown with bold headers. Keep it under 200 words.
    `;
    
    const result = await generateAnalysis(prompt);
    setReportContent(result);
    setIsGeneratingReport(false);
  };

  const handleStockSpecificAi = async (stockName: string, investorName: string) => {
    setIsReportModalOpen(true);
    setReportContent('');
    setIsGeneratingReport(true);
    
    const prompt = `
        You are a stock market expert.
        The investor "${investorName}" holds the stock "${stockName}".
        
        1. Briefly explain what "${stockName}" does (Business Model) in one sentence.
        2. Why might a superstar investor like ${investorName} hold this? (Growth factors, value play, or turnaround).
        
        Keep it punchy, insightful and under 100 words.
    `;
    
    const result = await generateAnalysis(prompt);
    setReportContent(result);
    setIsGeneratingReport(false);
  };

  const handleGetDgIndicator = async () => {
    setIsReportModalOpen(true);
    setReportContent('');
    setIsGeneratingReport(true);
    
    const prompt = `
        Generate a simulated "DG Indicator" market status report.
        Assume a Bullish but cautious market sentiment for Indian Midcaps/Smallcaps.
        
        Output structure:
        - **Market Mood:** (Fear/Greed/Neutral)
        - **DG Alpha Signal:** (Buy on Dips / Hold Cash / Aggressive Buy)
        - **Key Watch:** One sentence advice.
        
        Use emojis. Keep it very short.
    `;
    
    const result = await generateAnalysis(prompt);
    setReportContent(result);
    setIsGeneratingReport(false);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userMsg = { role: 'user', text: chatQuery };
    setChatHistory(prev => [...prev, userMsg]);
    setChatQuery('');
    setIsChatLoading(true);

    const context = `
      Context: User is viewing a dashboard for Neuland Laboratories stock.
      Stats: 
      - ROI: ${investmentMetrics.roi}
      - Total Value: ₹54.76 Lakhs
      - Max DD: ${investmentMetrics.maxDD}
      - Yield: ${investmentMetrics.annualizedYield}
      - Free Shares: ${investmentMetrics.totalQtyFree}
      - Vijay Kedia Gain: 1747.5%
    `;

    const prompt = `
      ${context}
      User Question: ${chatQuery}
      
      Answer as "DG Alpha AI". Keep it short (under 50 words) and specific to the data provided.
    `;

    const result = await generateAnalysis(prompt);
    
    setChatHistory(prev => [...prev, { role: 'system', text: result }]);
    setIsChatLoading(false);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            name: leadForm.name,
            city: leadForm.city,
            age: leadForm.age ? parseInt(leadForm.age) : null,
            portfolio: leadForm.portfolio,
            phone: leadForm.phone,
            submitted_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      
      setIsLeadSubmitted(true);
    } catch (error: any) {
      console.error('Detailed Supabase Error:', error);
      alert(`Submission failed: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--accent)] selection:text-black flex transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-primary)] w-16 md:w-64 transition-all duration-300 z-40 flex flex-col">
         {/* Logo Header */}
         <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-[var(--border-primary)]">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]">
               <Activity className="text-black w-5 h-5 fill-current" />
            </div>
            <span className="hidden md:block ml-3 font-bold text-lg tracking-tight text-[var(--text-main)] truncate">Dhruv Gupta <span className="text-[var(--accent)]">| NCT</span></span>
         </div>

         {/* Menu Items */}
         <div className="flex-1 py-4 space-y-1 overflow-y-auto">
            <SidebarItem 
              icon={Gamepad2} 
              label="Buyback Game" 
              isActive={activeTab === 'buyback-game'}
              onClick={() => setActiveTab('buyback-game')}
            />
            <SidebarItem 
              icon={Zap} 
              label="DG Alpha" 
              isActive={activeTab === 'dg-alpha'}
              onClick={() => setActiveTab('dg-alpha')}
            />
            <SidebarItem 
              icon={BarChart2} 
              label="Market Overview" 
              onClick={() => window.open('https://chartink.com/dashboard/406469', '_blank')}
            />
            <SidebarItem 
              icon={TrendingUp} 
              label="Swing Trading Stocks" 
              onClick={() => window.open('https://chartink.com/dashboard/406475', '_blank')}
            />
            <SidebarItem 
              icon={User} 
              label="Superstar tracker" 
              isActive={activeTab === 'superstar-tracker'}
              onClick={() => setActiveTab('superstar-tracker')}
            />
            <SidebarItem icon={Send} label="Chat with us on telegram" />
            
            <button 
                onClick={toggleTheme}
                className="w-full flex items-center px-4 py-3 sm:py-4 transition-all group relative text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--accent)] border-r-2 border-transparent"
            >
                {isDarkMode ? <Sun className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" /> : <Moon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />}
                <span className="hidden md:block ml-3 font-medium text-sm tracking-wide text-left">
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                </span>
            </button>
         </div>

         {/* Footer Items */}
         <div className="pb-4 border-t border-[var(--border-primary)] pt-4 p-6">
            <button className="flex items-center gap-3 text-[var(--text-muted)] hover:text-red-400 transition-colors w-full text-sm font-medium">
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Sign Out</span>
            </button>
         </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 ml-16 md:ml-64 p-4 sm:p-6 lg:p-10 pt-6 relative overflow-x-hidden">

        {activeTab === 'dg-alpha' ? (
          <div className="animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2 tracking-tight">Neuland Laboratories</h1>
                <div className="flex items-center gap-3">
                   <span className="px-2 py-0.5 rounded bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/30">LIVE</span>
                   <span className="text-[var(--text-muted)] text-sm">Portfolio Dashboard</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <button 
                    onClick={() => { setIsLeadModalOpen(true); setIsLeadSubmitted(false); }}
                    className="bg-[var(--bg-hover)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] px-4 py-2 rounded-lg text-sm font-medium border border-[var(--accent)] transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)]"
                  >
                    <UserPlus className="w-4 h-4 text-[var(--accent)]" />
                    Get DG Indicator
                </button>
                 <button 
                  onClick={handleGenerateReport}
                  className="bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border-secondary)] transition-colors flex items-center gap-2 group"
                >
                  <Sparkles className="w-4 h-4 text-[var(--accent)] group-hover:rotate-12 transition-transform" />
                  AI Insight Report
                </button>
              </div>
            </div>

            {/* Journey Highlight Widget */}
            <div className="w-full bg-[var(--bg-card)] border border-[var(--border-secondary)] rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl shadow-[rgba(var(--accent-rgb),0.05)] relative overflow-hidden group">
               {/* Decorative background element */}
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-[rgba(var(--accent-rgb),0.05)] rounded-full blur-3xl pointer-events-none"></div>
               
               <div className="relative z-10">
                 <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                    <div className="hidden sm:flex w-14 h-14 rounded-xl bg-[var(--accent)] items-center justify-center shrink-0 shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]">
                       <TrendingUp className="w-8 h-8 text-black" />
                    </div>
                    <div>
                       <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] leading-tight tracking-tight mb-2">
                          I started with <span className="text-[var(--accent)] font-black font-mono">₹3 lakhs</span> and grew it to <span className="text-[var(--accent)] font-black font-mono">₹54.76 lakhs</span>, turning my money into <span className="text-[var(--accent)] font-black font-mono">18.25x without any Risk</span>
                       </h2>
                    </div>
                 </div>

                 <div className="bg-[var(--bg-surface)]/50 rounded-xl p-6 border border-[var(--border-secondary)] backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-[var(--text-main)] mb-6 flex items-center gap-2 border-b border-[var(--border-secondary)] pb-3">
                      <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                      The "Math" Behind Your Success
                    </h3>
                    
                    <div className="space-y-4 font-light text-[var(--text-muted)]">
                       <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 rounded-lg bg-[var(--bg-main)]/40 border border-[var(--border-secondary)] hover:border-red-500/30 transition-colors">
                          <span className="font-bold text-[var(--text-main)] min-w-[220px] text-lg">Scenario A (Buy & Hold):</span>
                          <span className="text-base leading-relaxed">
                            Invest <span className="font-bold text-[var(--text-main)] font-mono">₹3L</span>. Stock goes <span className="font-bold text-[var(--text-main)] font-mono">18x</span>. Portfolio = <span className="font-bold text-[var(--text-main)] font-mono">₹91.4L</span>. Capital at risk = <span className="font-bold text-red-400 font-mono">₹3L</span>.
                          </span>
                       </div>

                       <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 rounded-lg bg-[rgba(var(--accent-rgb),0.05)] border border-[rgba(var(--accent-rgb),0.2)] hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors shadow-[0_0_15px_rgba(var(--accent-rgb),0.05)]">
                          <span className="font-bold text-[var(--accent)] min-w-[220px] text-lg">Scenario B (My Strategy):</span>
                          <span className="text-base leading-relaxed">
                            Invest <span className="font-bold text-[var(--accent)] font-mono">₹3L</span>. Stock doubles → Withdraw <span className="font-bold text-[var(--accent)] font-mono">₹3L</span>. Stock goes <span className="font-bold text-[var(--accent)] font-mono">18x</span> (on remaining half). <br className="hidden sm:block" />
                            Portfolio = <span className="font-bold text-[var(--accent)] font-mono">₹54L</span> + <span className="font-bold text-[var(--accent)] font-mono">₹8L</span> (Cash) + New Gains from re-invested cash.
                          </span>
                       </div>
                       
                       <div className="mt-6 pt-2 text-base sm:text-lg italic text-[var(--text-muted)] pl-6 border-l-4 border-[var(--accent)] leading-relaxed">
                          "In Scenario B, your mental stress is zero, allowing you to actually hold for the <span className="text-[var(--accent)] font-bold not-italic font-mono">18x</span> run. In Scenario A, most people sell at <span className="text-red-400 font-bold not-italic font-mono">2x</span> out of fear of losing profits."
                       </div>
                    </div>
                 </div>
               </div>
            </div>

            {/* Hero Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
              <Card className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)]">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="p-2 bg-[rgba(var(--accent-rgb),0.1)] rounded-lg">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent)]" />
                  </div>
                </div>
                <p className="text-[var(--text-muted)] text-xs sm:text-sm font-medium">Total Free Holding Value</p>
                <h2 className="text-lg sm:text-2xl font-bold text-[var(--text-main)] mt-1">₹ {(investmentMetrics.totalValueFree / 100000).toFixed(2)} L</h2>
                <div className="mt-4 h-1 w-full bg-[var(--border-primary)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent)] w-[85%]"></div>
                </div>
              </Card>

              <Card>
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  </div>
                  <Badge type="success">High Perf</Badge>
                </div>
                <p className="text-[var(--text-muted)] text-xs sm:text-sm font-medium">Total ROI</p>
                <h2 className="text-lg sm:text-2xl font-bold text-[var(--text-main)] mt-1">{investmentMetrics.roi}</h2>
                <p className="text-xs text-[var(--text-dim)] mt-2">Over {investmentMetrics.time}</p>
              </Card>

              <Card>
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  </div>
                </div>
                <p className="text-[var(--text-muted)] text-xs sm:text-sm font-medium">Annualised Yield</p>
                <h2 className="text-lg sm:text-2xl font-bold text-[var(--text-main)] mt-1">{investmentMetrics.annualizedYield}</h2>
                <p className="text-xs text-[var(--text-dim)] mt-2">Annual ROI/Max DD : {investmentMetrics.ratio}</p>
              </Card>

              <Card>
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  </div>
                  <Badge type="danger">Risk Low</Badge>
                </div>
                <p className="text-[var(--text-muted)] text-xs sm:text-sm font-medium">Max Drawdown</p>
                <h2 className="text-lg sm:text-2xl font-bold text-[var(--text-main)] mt-1">{investmentMetrics.maxDD}</h2>
                <p className="text-xs text-[var(--text-dim)] mt-2">Historical Max</p>
              </Card>

              <Card>
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  </div>
                  <Badge type="neutral">Passive</Badge>
                </div>
                <p className="text-[var(--text-muted)] text-xs sm:text-sm font-medium">Dividend Income</p>
                <h2 className="text-lg sm:text-2xl font-bold text-[var(--text-main)] mt-1">₹ {investmentMetrics.dividendsCashflow.toLocaleString()}</h2>
                <p className="text-xs text-[var(--text-dim)] mt-2">
                  <span className="text-purple-400 font-bold">{((investmentMetrics.dividendsCashflow / 300000) * 100).toFixed(2)}%</span> of Invested (3L)
                </p>
              </Card>
            </div>

            {/* Analytics Widgets Section */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <Card className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--text-main)] flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-[var(--accent)]" />
                    Total Account Value Growth
                  </h3>
                </div>
                <div className="w-full">
                   <ResponsiveAreaChart data={growthData} />
                </div>
              </Card>

               <Card className="w-full hidden sm:block">
                 <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-[var(--text-main)] flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
                      Trade-wise Profit
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-hover)] rounded-full border border-[var(--border-secondary)]">
                       <Target className="w-3 h-3 text-[var(--accent)]" />
                       <span className="text-xs text-[var(--text-muted)]">Accuracy: <span className="text-[var(--text-main)] font-bold">{accuracy.wins}/{accuracy.total}</span> ({accuracy.percent}%)</span>
                    </div>
                    <button 
                      onClick={handleTradeAnalysis}
                      className="p-1.5 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--bg-surface)] border border-[var(--border-secondary)] transition-colors group flex items-center gap-1.5 px-3"
                      title="Analyze Trading Patterns"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-[var(--accent)] group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--text-main)]">Analyze Patterns</span>
                    </button>
                  </div>
                  
                  <div className="flex gap-2 text-xs">
                     <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                        <span className="text-[var(--text-muted)]">Profit</span>
                     </div>
                     <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                        <span className="text-[var(--text-muted)]">Loss</span>
                     </div>
                  </div>
                </div>
                <div className="w-full">
                   <ResponsiveBarChart data={tradePnL} />
                </div>
               </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-[var(--border-secondary)]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-[var(--text-main)] flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[var(--accent)]" />
                      Core Investment Metrics
                    </h3>
                  </div>
                  
                  <div className="overflow-hidden rounded-xl border border-[var(--border-primary)]">
                    <table className="w-full text-sm text-left">
                      <tbody className="divide-y divide-[var(--border-primary)]">
                        {[
                          { label: "Free Stocks Accumulated", value: investmentMetrics.totalQtyFree, sub: "Qty" },
                          { label: "Market Value of Retained Shares", value: `₹ ${investmentMetrics.marketValueRetained.toLocaleString()}`, sub: "Current" },
                          { label: "Dividends & Cashflow", value: `₹ ${investmentMetrics.dividendsCashflow.toLocaleString()}`, sub: "Realized" },
                          { label: "Max Amount Invested", value: investmentMetrics.maxInvested, sub: "Capital" },
                          { label: "Investment Duration", value: investmentMetrics.time, sub: "Years" },
                          { label: "Annual ROI / Max DD Ratio", value: investmentMetrics.ratio, sub: "Efficiency" },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-[var(--bg-surface)] transition-colors group">
                            <td className="px-3 sm:px-4 py-4 text-[var(--text-muted)] font-medium">{row.label}</td>
                            <td className="px-3 sm:px-4 py-4 text-right">
                              <div className="font-bold text-[var(--text-main)]">{row.value}</div>
                              <div className="text-xs text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors">{row.sub}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card className="overflow-x-auto">
                   <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-[var(--text-main)] flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
                      Profit & Loss Analysis
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
                      <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)] font-medium">
                        <tr>
                          <th className="px-3 sm:px-4 py-3 rounded-l-lg">Entry Date</th>
                          <th className="px-3 sm:px-4 py-3">Entry Price</th>
                          <th className="px-3 sm:px-4 py-3">Qty</th>
                          <th className="px-3 sm:px-4 py-3">Doubled On</th>
                          <th className="px-3 sm:px-4 py-3 text-[var(--accent)]">Free Qty</th>
                          <th className="px-3 sm:px-4 py-3 text-right">Current Val</th>
                          <th className="px-3 sm:px-4 py-3 rounded-r-lg">Invested Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-primary)]">
                        {pnlData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[var(--bg-surface)] transition-colors">
                            <td className="px-3 sm:px-4 py-3 text-[var(--text-muted)]">{row.date}</td>
                            <td className="px-3 sm:px-4 py-3 text-[var(--text-muted)]">₹ {row.entry}</td>
                            <td className="px-3 sm:px-4 py-3 text-[var(--text-dim)]">{row.qty}</td>
                            <td className="px-3 sm:px-4 py-3 text-[var(--text-muted)]">
                              {row.doubleDate} <span className="text-xs text-[var(--text-dim)]">(@ {row.doublePrice})</span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 font-bold text-[var(--accent)]">{row.freeQty}</td>
                            <td className="px-3 sm:px-4 py-3 text-right text-[var(--text-main)] font-medium">₹ {row.currVal.toLocaleString()}</td>
                            <td className="px-3 sm:px-4 py-3 text-[var(--text-muted)]">{row.time}</td>
                          </tr>
                        ))}
                        <tr className="bg-[rgba(var(--accent-rgb),0.05)] border-t border-[rgba(var(--accent-rgb),0.2)] font-bold">
                          <td className="px-3 sm:px-4 py-4 text-[var(--text-main)]">Total</td>
                          <td className="px-3 sm:px-4 py-4"></td>
                          <td className="px-3 sm:px-4 py-4 text-[var(--text-main)]">{pnlData.reduce((acc, curr) => acc + curr.qty, 0)}</td>
                          <td className="px-3 sm:px-4 py-4"></td>
                          <td className="px-3 sm:px-4 py-4 text-[var(--accent)]">{pnlData.reduce((acc, curr) => acc + curr.freeQty, 0)}</td>
                          <td className="px-3 sm:px-4 py-4 text-right text-[var(--accent)]">₹ {pnlData.reduce((acc, curr) => acc + curr.currVal, 0).toLocaleString()}</td>
                          <td className="px-3 sm:px-4 py-4"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-[rgba(var(--accent-rgb),0.2)] to-[var(--bg-main)] border-[rgba(var(--accent-rgb),0.3)]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0">
                      <span className="text-black font-bold">VK</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-main)]">Vijay Kedia Position</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Institutional Tracking</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                     <div className="bg-black/40 p-2 rounded">
                        <div className="text-[10px] text-gray-400">Wealth Multiplier</div>
                        <div className="text-lg font-bold text-[var(--accent)]">17.5x</div>
                     </div>
                     <div className="bg-black/40 p-2 rounded">
                        <div className="text-[10px] text-gray-400">Gain %</div>
                        <div className="text-lg font-bold text-white">1747.5%</div>
                     </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div>
                       <div className="text-[10px] text-[var(--text-dim)]">Initial Value</div>
                       <div className="text-sm font-bold text-[var(--text-main)]">₹ 11.9 Cr</div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] text-[var(--text-dim)]">Current Value</div>
                       <div className="text-sm font-bold text-[var(--accent)]">₹ 219.86 Cr</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="bg-[var(--bg-surface)]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-[var(--text-main)]">Dividends</h3>
                    <span className="text-xs text-[var(--text-dim)]">2020 - 2025</span>
                  </div>
                  <div className="flex items-end justify-between h-48 gap-2">
                    {dividends.map((div, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 w-full group cursor-pointer">
                        <div className="relative w-full flex justify-center">
                           <div 
                            className="w-full bg-[var(--bg-hover)] hover:bg-[var(--accent)] rounded-t-sm transition-all duration-300 relative group-hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]"
                            style={{ height: `${(div.amount / 15) * 100}px` }}
                          ></div>
                          <span className="absolute -top-8 text-xs font-bold text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-opacity">₹{div.amount}</span>
                        </div>
                        <span className="text-xs text-[var(--text-dim)] font-medium">{div.year}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-[var(--text-main)] mb-4">Cashflow Impact</h3>
                  <div className="space-y-4">
                    {cashflowData.map((cf, idx) => (
                      <div key={idx} className="bg-[var(--bg-main)] p-3 rounded-lg border border-[var(--border-primary)] flex justify-between items-center">
                        <div>
                          <div className="text-xs text-[var(--text-muted)] mb-0.5">
                            <span className="text-[var(--text-dim)]">Entry:</span> {cf.entry} <span className="mx-1 text-[var(--text-dim)]">→</span> <span className="text-[var(--text-dim)]">Exit:</span> {cf.exit}
                          </div>
                          <div className="text-sm font-medium text-[var(--text-main)]">Qty: {cf.qty}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-red-500 font-bold text-sm">₹ {cf.flow}</div>
                           <div className="text-[10px] text-[var(--text-dim)]">{cf.time}</div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-[var(--border-primary)] flex justify-between items-center">
                        <span className="text-sm text-[var(--text-muted)]">Total Negative Cashflow</span>
                        <span className="text-red-500 font-bold">₹ -29,964</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-[var(--border-primary)]">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-[var(--text-main)] mb-3">Why You Should Use This System</h2>
                <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
                  A complete ecosystem designed to replace guesswork with precision and transform your investing journey.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {whyUseSystem.map((item, idx) => (
                  <Card key={idx} className="bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] transition-colors group border-[var(--border-primary)] hover:border-[var(--accent)]/30">
                    <div className="mb-4 p-3 rounded-xl bg-[var(--bg-hover)] w-fit text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-[var(--text-main)] mb-2 leading-tight">{item.title}</h3>
                    <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                      {item.desc}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'buyback-game' ? (
          <div className="space-y-12 animate-in fade-in duration-500 pb-12">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">Buyback Game</h1>
                <div className="flex items-center gap-3 mt-2">
                   <span className="bg-[var(--accent)] text-black text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">LIVE MARKET DATA</span>
                   <p className="text-[var(--text-muted)] text-sm">Arbitrage & Special Situations</p>
                </div>
              </div>
              <div className="flex gap-3 pr-12 sm:pr-0">
                 <button 
                  onClick={() => { setIsLeadModalOpen(true); setIsLeadSubmitted(false); }}
                  className="bg-[var(--bg-hover)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] px-4 py-2 rounded-lg text-sm font-medium border border-[var(--accent)] transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)]"
                 >
                   <UserPlus className="w-4 h-4 text-[var(--accent)]" />
                   Get DG Indicator
                 </button>
                 <button 
                  onClick={handleBuybackAiReport}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-black border border-[var(--accent)] rounded-lg hover:bg-[var(--accent-hover)] transition-all font-bold text-xs shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]"
                 >
                   <Sparkles className="w-3.5 h-3.5" />
                   AI Insight Report
                 </button>
              </div>
            </div>

            {/* ACTIVE SECTION */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                  <div className="p-1.5 bg-[rgba(var(--accent-rgb),0.2)] rounded-lg">
                    <Zap className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  Active Opportunities
                </h3>
                <button onClick={fetchBuybackData} className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 transition-opacity opacity-80 hover:opacity-100 bg-[var(--bg-surface)] px-3 py-1.5 rounded-full border border-[var(--border-secondary)]">
                    <RefreshCw className="w-3 h-3" /> 
                    <span>{isBuybackLoading ? 'Syncing...' : (lastUpdated ? `Last updated: ${lastUpdated}` : 'Refresh')}</span>
                </button>
              </div>
              
              <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xl">
                <div className="relative w-full overflow-x-auto">
                  {isBuybackLoading ? (
                      <div className="p-16 text-center">
                        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mx-auto mb-4" />
                        <p className="text-[var(--text-muted)]">Scanning active markets...</p>
                      </div>
                  ) : buybackData.length === 0 ? (
                      <div className="p-8 text-center text-[var(--text-dim)] bg-red-900/10 text-red-400 border-b border-red-900/20">
                        No active buyback opportunities available.
                      </div>
                  ) : (
                      <table className="w-full text-left border-collapse border-spacing-0">
                        <thead>
                            <tr>
                              {buybackColumns.map((col, idx) => (
                                <th key={idx} className={`px-6 py-4 font-bold whitespace-nowrap bg-[var(--bg-surface)] text-[var(--text-muted)] align-bottom text-[10px] uppercase tracking-wider border border-[var(--border-primary)] ${col.className.includes('sticky') ? 'sticky left-0 z-20' : ''}`}>
                                    {col.label}
                                </th>
                              ))}
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {buybackData.map((row, rowIdx) => (
                              <tr key={rowIdx} className="bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] transition-colors group">
                                  {buybackColumns.map((col, colIdx) => {
                                    let val = row[col.key as keyof BuybackData];
                                    let displayVal = val;
                                    let cellClass = `px-6 py-4 whitespace-nowrap border border-[var(--border-primary)] ${col.className}`;

                                    if (col.type === 'percent') displayVal = formatPercent(val);
                                    else if (col.type === 'number') displayVal = formatNumber(val);
                                    else if (col.type === 'date') displayVal = formatDate(val);

                                    // Conditional formatting overrides logic
                                    if (col.key === 'shareholderParticipation') {
                                      cellClass = cellClass.replace('text-[var(--text-muted)]', '').replace('text-[var(--text-main)]', '');
                                      const num = parseFloat(val as string);
                                      if (!isNaN(num)) {
                                          cellClass += (num > 0.05) ? " text-[var(--text-main)]" : " text-red-500";
                                      }
                                    }

                                    if (col.key === 'expectedMoneySmallShareholder') {
                                      let num = parseFloat(val as string);
                                      if (typeof val === 'string' && val.includes('%')) {
                                          num = num / 100;
                                      }
                                      if (!isNaN(num)) {
                                          if (num > 0.08) {
                                              cellClass += " text-[var(--accent)]";
                                          } else {
                                              cellClass += " text-red-500";
                                          }
                                      }
                                    }

                                    return (
                                      <td key={colIdx} className={cellClass}>
                                        {displayVal || '-'}
                                      </td>
                                    );
                                  })}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                  )}
                </div>
              </div>
            </div>

            {/* PAST SECTION */}
            <section>
                <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-[var(--text-muted)]" />
                    Past Opportunity
                </h3>

                <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xl opacity-90 hover:opacity-100 transition-opacity duration-300">
                   <div className="relative w-full overflow-x-auto">
                      {isPastBuybackLoading ? (
                        <div className="p-16 text-center">
                            <Loader2 className="w-6 h-6 text-[var(--text-muted)] animate-spin mx-auto mb-4" />
                            <p className="text-[var(--text-muted)] text-sm">Loading historical data...</p>
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse border-spacing-0">
                           <thead>
                              <tr>
                                 {buybackColumns.map((col, idx) => (
                                   <th key={idx} className={`px-6 py-4 font-bold whitespace-nowrap bg-[var(--bg-surface)] text-[var(--text-muted)] align-bottom text-[10px] uppercase tracking-wider border border-[var(--border-primary)] ${col.className.includes('sticky') ? 'sticky left-0 z-20' : ''}`}>
                                      {col.label}
                                   </th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody className="text-sm">
                              {pastBuybackData.map((row, rowIdx) => (
                                 <tr key={rowIdx} className="bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] transition-colors group">
                                    {buybackColumns.map((col, colIdx) => {
                                      let val = row[col.key as keyof BuybackData];
                                      let displayVal = val;
                                      let cellClass = `px-6 py-4 whitespace-nowrap border border-[var(--border-primary)] ${col.className}`;

                                      if (col.type === 'percent') displayVal = formatPercent(val);
                                      else if (col.type === 'number') displayVal = formatNumber(val);
                                      else if (col.type === 'date') displayVal = formatDate(val);

                                      // Conditional formatting overrides logic (same as above)
                                      if (col.key === 'shareholderParticipation') {
                                         cellClass = cellClass.replace('text-[var(--text-muted)]', '').replace('text-[var(--text-main)]', '');
                                         const num = parseFloat(val as string);
                                         if (!isNaN(num)) {
                                            cellClass += (num > 0.05) ? " text-[var(--text-main)]" : " text-red-500";
                                         }
                                      }
                                      if (col.key === 'expectedMoneySmallShareholder') {
                                         let num = parseFloat(val as string);
                                         if (typeof val === 'string' && val.includes('%')) {
                                             num = num / 100;
                                         }
                                         if (!isNaN(num)) {
                                             if (num > 0.08) {
                                                cellClass += " text-[var(--accent)]";
                                             } else {
                                                cellClass += " text-red-500";
                                             }
                                         }
                                      }

                                      return (
                                        <td key={colIdx} className={cellClass}>
                                           {displayVal || '-'}
                                        </td>
                                      );
                                    })}
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                      )}
                   </div>
                </div>
            </section>
            
            {/* Footer How To Play */}
            <div className="mt-auto pt-8 border-t border-[var(--border-primary)]">
                <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-[var(--border-primary)]">
                    <h4 className="text-[var(--text-main)] font-bold text-xl mb-6 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[var(--accent)]" />
                        How to Play this Game
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm text-[var(--text-muted)]">
                        <ol className="list-decimal list-inside space-y-3 font-medium">
                            <li className="pl-2">Search buyback</li>
                            <li className="pl-2">Market/Tender Offer</li>
                            <li className="pl-2">Buyback size, Buyback Price</li>
                            <li className="pl-2">Small shareholding</li>
                        </ol>
                        <ol start={5} className="list-decimal list-inside space-y-3 font-medium">
                            <li className="pl-2">Record date</li>
                            <li className="pl-2 text-[var(--text-main)]">Buy the share <span className="text-[var(--accent)]">2 days before</span> the record date</li>
                            <li className="pl-2">Calculate returns using Excel</li>
                            <li className="pl-2">If return <span className="text-[var(--accent)] font-bold">&gt; 8%</span> then find offer dates and apply</li>
                        </ol>
                    </div>
                </div>
            </div>

          </div>
        ) : activeTab === 'superstar-tracker' ? (
          <div className="animate-in fade-in duration-500 h-[calc(100vh-80px)] flex flex-col">
            {/* Header Section */}
            <div className="flex-shrink-0 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2">Superstar Tracker</h1>
                        <div className="flex items-center gap-2">
                            <span className="bg-[var(--accent)] text-black text-xs font-bold px-2 py-0.5 rounded">LIVE</span>
                            <p className="text-[var(--text-muted)] text-sm">Portfolio Dashboard</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pr-12 sm:pr-0">
                        <button 
                            onClick={() => { setIsLeadModalOpen(true); setIsLeadSubmitted(false); }}
                            className="bg-[var(--bg-hover)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] px-4 py-2 rounded-lg text-sm font-medium border border-[var(--accent)] transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)]"
                        >
                            <UserPlus className="w-4 h-4 text-[var(--accent)]" />
                            Get DG Indicator
                        </button>
                        <button 
                            onClick={handleSuperstarInsightReport}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--text-dim)] rounded-lg text-sm font-medium transition-all group"
                        >
                            <Sparkles className="w-4 h-4 text-[var(--accent)] group-hover:animate-pulse" />
                            AI Insight Report
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full max-w-md">
                    <input 
                        type="text" 
                        value={superstarSearch}
                        onChange={(e) => setSuperstarSearch(e.target.value)}
                        placeholder="Search Investor or Stock..." 
                        className="w-full pl-11 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-secondary)] rounded-xl text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[#D2F445] transition-all"
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-[var(--text-dim)]" />
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-hidden bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl shadow-xl flex flex-col min-h-0">
                {isSuperstarLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
                        <p className="text-[var(--text-muted)] animate-pulse">Fetching superstar portfolios...</p>
                    </div>
                ) : filteredSuperstarData.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-dim)] p-10">
                         {superstarData.length === 0 ? (
                           <div className="flex flex-col items-center gap-2 text-red-400">
                              <AlertCircle className="w-8 h-8" />
                              <p>Failed to load data or service unavailable.</p>
                              <button onClick={fetchSuperstarData} className="text-sm underline hover:text-[var(--text-main)]">Retry</button>
                           </div>
                         ) : (
                           <>
                             <Inbox className="w-10 h-10 mb-2 opacity-50" />
                             <p>No matching records found.</p>
                           </>
                         )}
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="sticky top-0 z-10 bg-[var(--bg-surface)] shadow-sm">
                                    <tr className="border-b border-[var(--border-primary)]">
                                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider">Investor Name</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider">Stock Name</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider text-right">Latest Holding %</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider text-right">Latest Qtr</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider text-right">Portfolio Val (Cr)</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider text-right">Stake Val (Cr)</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider text-right">% Allocation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-primary)]">
                                    {filteredSuperstarData.map((row, idx) => {
                                        const investor = row["INVESTOR NAME"] || '-';
                                        const stock = row["STOCK NAME"] || '-';
                                        const holdingRaw = row["Latest Holding Percentage"];
                                        const holding = holdingRaw !== null ? (parseFloat(holdingRaw.toString()) * 100).toFixed(2) : '-';
                                        const portValue = row["Portfoilo Value (CR)"];
                                        const stakeValue = row["Stake Value (CR)"];
                                        const allocation = parseFloat(row["% allocation"] as any);
                                        const latestQtr = row["Latest Qtr Data"] ? formatDate(row["Latest Qtr Data"]) : '-';
                                        
                                        let allocColorClass = 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-secondary)]';
                                        if (allocation >= 10) allocColorClass = 'bg-[#D2F445]/20 text-[#D2F445] border-[#D2F445]/30'; // Hardcoded for >10% to keep neon impact
                                        else if (allocation >= 5) allocColorClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                                        else if (allocation >= 2) allocColorClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';

                                        return (
                                            <tr key={idx} className="group hover:bg-[var(--bg-hover)] transition-colors duration-200">
                                                <td className="px-6 py-4 font-medium text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">{investor}</td>
                                                <td className="px-6 py-4 text-[var(--text-muted)]">
                                                    <div className="flex items-center gap-2">
                                                        {stock}
                                                        <button 
                                                            onClick={() => handleStockSpecificAi(stock, investor)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--accent)] hover:text-black rounded text-[var(--accent)]"
                                                            title="Ask AI about this stock"
                                                        >
                                                            <Sparkles className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-[var(--text-muted)] font-mono">{holding}%</td>
                                                <td className="px-6 py-4 text-right text-[var(--text-muted)] font-mono">{latestQtr}</td>
                                                <td className="px-6 py-4 text-right text-[var(--text-muted)] font-mono">₹{formatNumber(portValue)}</td>
                                                <td className="px-6 py-4 text-right text-[var(--text-muted)] font-mono">₹{formatNumber(stakeValue)}</td>
                                                <td className="px-6 py-4 text-right">
                                                     <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${allocColorClass} min-w-[3rem] justify-center`}>
                                                        {allocation}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-3 border-t border-[var(--border-primary)] bg-[var(--bg-main)]/20 flex justify-between items-center text-xs text-[var(--text-dim)] flex-shrink-0">
                            <span>{filteredSuperstarData.length} records found</span>
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></div>
                                Live Data
                            </span>
                        </div>
                    </>
                )}
            </div>
            
             {/* Decorative background glow */}
             <div className="fixed bottom-0 right-0 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/2 translate-y-1/2"></div>
          </div>
        ) : null}

        {/* Floating Chat Button (Refactored for mobile responsiveness) */}
        <div className={`fixed z-50 transition-all duration-300 ${isChatOpen ? 'bottom-0 right-0 left-0 sm:bottom-6 sm:right-6 sm:left-auto' : 'bottom-6 right-6'}`}>
           {!isChatOpen ? (
             <button 
               onClick={() => setIsChatOpen(true)}
               className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black w-14 h-14 rounded-full shadow-lg shadow-[#D2F445]/20 flex items-center justify-center transition-all hover:scale-105"
             >
               <MessageSquare className="w-6 h-6" />
             </button>
           ) : (
             <div className="bg-[var(--bg-card)] border-t sm:border border-[var(--border-primary)] sm:rounded-2xl w-full sm:w-96 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 h-[70vh] sm:h-[500px]">
                {/* Chat Header */}
                <div className="bg-[var(--bg-surface)] p-4 flex items-center justify-between border-b border-[var(--border-primary)]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></div>
                    <h3 className="font-bold text-sm text-[var(--text-main)]">DG Alpha Assistant</h3>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-main)]/50 custom-scrollbar">
                   {chatHistory.map((msg, i) => (
                     <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-xl p-3 text-sm ${
                          msg.role === 'user' 
                            ? 'bg-[#333] text-white rounded-tr-none' 
                            : 'bg-[rgba(var(--accent-rgb),0.1)] text-[var(--text-muted)] border border-[var(--accent)]/20 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                     </div>
                   ))}
                   {isChatLoading && (
                     <div className="flex justify-start">
                        <div className="bg-[rgba(var(--accent-rgb),0.1)] p-3 rounded-xl rounded-tl-none">
                           <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
                        </div>
                     </div>
                   )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleChatSubmit} className="p-3 bg-[var(--bg-surface)] border-t border-[var(--border-primary)] flex gap-2 pb-safe-area">
                  <input 
                    type="text" 
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    placeholder="Ask about your returns..."
                    className="flex-1 bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-3 py-3 text-base sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] placeholder:[var(--text-dim)]"
                  />
                  <button 
                    type="submit"
                    disabled={isChatLoading || !chatQuery.trim()}
                    className="bg-[var(--accent)] text-black p-3 rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
             </div>
           )}
        </div>

      {/* AI Report Modal */}
      <Modal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--accent)]" />
            <span>AI Insight Report</span>
          </div>
        }
      >
        {isGeneratingReport ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mb-4" />
            <p className="text-[var(--text-muted)] animate-pulse">Analyzing market data...</p>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-[var(--text-muted)]">
            <div className="whitespace-pre-wrap">{reportContent}</div>
            
            <div className="mt-8 pt-6 border-t border-[var(--border-primary)] flex justify-end">
               <button 
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 bg-[var(--bg-hover)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] rounded-lg text-sm font-medium transition-colors"
               >
                 Close Report
               </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Lead Generation Modal */}
      <Modal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        title="Get DG Indicator Access"
      >
        {isLeadSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[rgba(var(--accent-rgb),0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle2 className="w-8 h-8 text-[var(--accent)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Request Submitted!</h3>
            <p className="text-[var(--text-muted)]">Our team will contact you shortly to set up your indicator access.</p>
            <button 
              onClick={() => setIsLeadModalOpen(false)}
              className="mt-6 px-6 py-2 bg-[var(--accent)] text-black font-bold rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleLeadSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={leadForm.name}
                  onChange={e => setLeadForm({...leadForm, name: e.target.value})}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="Enter your name"
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">City</label>
                  <input 
                    required
                    type="text" 
                    value={leadForm.city}
                    onChange={e => setLeadForm({...leadForm, city: e.target.value})}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Age</label>
                  <input 
                    required
                    type="number" 
                    value={leadForm.age}
                    onChange={e => setLeadForm({...leadForm, age: e.target.value})}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="Age"
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  value={leadForm.phone}
                  onChange={e => setLeadForm({...leadForm, phone: e.target.value})}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="+91 XXXXX XXXXX"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Portfolio Size</label>
                <select 
                  value={leadForm.portfolio}
                  onChange={e => setLeadForm({...leadForm, portfolio: e.target.value})}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none appearance-none"
                >
                   <option>Above 1 Lakh</option>
                   <option>Above 5 Lakhs</option>
                   <option>Above 10 Lakhs</option>
                   <option>Above 50 Lakhs</option>
                </select>
             </div>
             
             <button 
               type="submit"
               disabled={isSubmitting}
               className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-bold py-3 rounded-lg transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {isSubmitting ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin" />
                   Submitting...
                 </>
               ) : (
                 'Request Access'
               )}
             </button>
          </form>
        )}
      </Modal>

      </main>
    </div>
  );
}
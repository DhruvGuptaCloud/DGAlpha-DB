
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
  Repeat,
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
  Moon,
  LogIn,
  LayoutDashboard,
  Menu,
  MoreHorizontal
} from 'lucide-react';
import { generateAnalysis } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { ResponsiveAreaChart, ResponsiveBarChart } from './components/Charts';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/Auth/AuthModal';
import { LandingPage } from './components/LandingPage';

// --- UI Components ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; type?: "success" | "danger" | "neutral"; className?: string }> = ({ children, type = "success", className = "" }) => {
  const styles = {
    success: "text-[var(--accent)] bg-[rgba(var(--accent-rgb),0.1)] border border-[var(--accent)]/20",
    danger: "text-red-400 bg-red-400/10 border border-red-400/20",
    neutral: "text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-secondary)]"
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-xs font-bold uppercase tracking-wider ${styles[type]} ${className}`}>
      {children}
    </span>
  );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; maxWidth?: string }> = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl w-full ${maxWidth} max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 relative`}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-primary)] bg-[var(--bg-card)] sticky top-0 z-10">
          <div className="text-lg sm:text-xl font-bold text-[var(--text-main)] truncate pr-4">{title}</div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-surface)] rounded-lg transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)] flex-shrink-0">
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
    className={`w-full flex items-center px-4 py-3 sm:py-4 transition-all duration-200 group relative ${
      isActive 
        ? 'text-[var(--accent)] bg-[var(--bg-surface)] border-r-2 border-[var(--accent)]' 
        : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--accent)] border-r-2 border-transparent'
    }`}
  >
    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[var(--accent)]' : ''}`} />
    <span className={`hidden md:block ml-3 font-medium text-sm tracking-wide text-left ${isActive ? 'text-[var(--text-main)]' : ''}`}>
      {label}
    </span>
    <div className="hidden md:hidden lg:hidden absolute left-14 top-1/2 -translate-y-1/2 bg-[var(--bg-card)] text-[var(--text-main)] text-xs px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-[var(--border-primary)] shadow-xl">
      {label}
    </div>
  </button>
);

const BottomNavItem: React.FC<{ icon: React.ElementType; label: string; isActive?: boolean; onClick?: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-all ${
      isActive 
        ? 'text-[var(--accent)]' 
        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
    }`}
  >
    <Icon className={`w-5 h-5 ${isActive ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
    <span className="text-[10px] font-medium truncate max-w-full px-1">{label}</span>
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

const buybackColumns = [
  { key: "stock", label: "Stock", type: "text", className: "font-bold text-[var(--text-main)] sticky left-0 bg-[var(--bg-card)] border-r border-[var(--border-primary)] z-10 min-w-[120px]" },
  { key: "buyback", label: "Buyback %", type: "percent", className: "text-right font-mono font-bold text-[var(--accent)] border-r border-[var(--border-primary)]" },
  { key: "smallShareholderApproxHolding", label: "Small Holding", type: "percent", className: "text-right font-mono text-[var(--text-muted)] border-r border-[var(--border-primary)]" },
  { key: "shareholderParticipation", label: "Participation", type: "percent", className: "text-right font-mono font-bold border-r border-[var(--border-primary)]" },
  { key: "type", label: "Type", type: "text", className: "text-center text-xs uppercase tracking-wide text-[var(--text-muted)] font-bold border-r border-[var(--border-primary)]" },
  { key: "preRecordDateAnnouncementPrice", label: "Pre-Record ₹", type: "number", className: "text-right font-mono text-[var(--text-muted)] border-r border-[var(--border-primary)]" },
  { key: "buybackPrice", label: "Buyback ₹", type: "number", className: "text-right font-mono font-bold text-[var(--text-main)] border-r border-[var(--border-primary)]" },
  { key: "recordDate", label: "Record Date", type: "date", className: "text-center text-[var(--text-muted)] whitespace-nowrap border-r border-[var(--border-primary)]" },
  { key: "pricePostBuyback", label: "Post Buyback ₹", type: "number", className: "text-right font-mono text-[var(--text-muted)] border-r border-[var(--border-primary)]" },
  { key: "expectedMoneyGeneralCategory", label: "Exp. (Gen)", type: "percent", className: "text-right font-mono text-[var(--text-muted)] border-r border-[var(--border-primary)]" },
  { key: "expectedMoneySmallShareholder", label: "Exp. (Small)", type: "percent", className: "text-right font-mono font-bold border-r border-[var(--border-primary)]" },
  { key: "generalCategoryAcceptanceRatio", label: "Acceptance (Gen)", type: "percent", className: "text-right font-mono text-[var(--text-muted)] border-r border-[var(--border-primary)]" },
  { key: "smallShareholderCategoryAcceptanceRatio", label: "Acceptance (Small)", type: "percent", className: "text-right font-mono text-[var(--text-muted)]" }
];

export default function App() {
  const { user, openAuthModal, signOut, userProfile, loading } = useAuth();
  const [showDemo, setShowDemo] = useState(false);
  const showLandingPage = !user && !showDemo;

  const [activeTab, setActiveTab] = useState<'dg-alpha' | 'buyback-game' | 'superstar-tracker'>('dg-alpha');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCaseStudyModalOpen, setIsCaseStudyModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'executive' | 'trade' | 'buyback'>('executive'); 
  const [reportContent, setReportContent] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isLeadSubmitted, setIsLeadSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', city: '', age: '', portfolio: 'Above 1 Lakh', phone: '' });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([{ role: 'system', text: 'Hello! I am DG Alpha AI. Ask me anything about your Neuland Labs portfolio.' }]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [buybackData, setBuybackData] = useState<BuybackData[]>([]);
  const [pastBuybackData, setPastBuybackData] = useState<BuybackData[]>([]);
  const [isBuybackLoading, setIsBuybackLoading] = useState(false);
  const [isPastBuybackLoading, setIsPastBuybackLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [superstarData, setSuperstarData] = useState<SuperstarEntry[]>([]);
  const [isSuperstarLoading, setIsSuperstarLoading] = useState(false);
  const [superstarSearch, setSuperstarSearch] = useState('');

  useEffect(() => {
    if (!user && !loading) {
      setActiveTab('dg-alpha');
      setShowDemo(false);
    }
  }, [user, loading]);

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

  const handleTabChange = (tab: 'dg-alpha' | 'buyback-game' | 'superstar-tracker') => {
    if (tab === 'dg-alpha') {
      setActiveTab(tab);
      return;
    }
    if (!user) {
      openAuthModal('login');
    } else {
      setActiveTab(tab);
    }
  };

  const investmentMetrics = {
    totalQtyFree: 323,
    marketValueRetained: 5462576,
    dividendsCashflow: 13496.5,
    totalValueFree: 5476072.5,
    maxInvested: "3 L (3 Parallel Tracks)",
    time: "3.5 Yr",
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
  
  const caseStudies = [
    { counter: "Va tech WaBag", launchedOn: "1-Sep-20", trades: 8, roi: 298.0, time: 3.5, annualRoi: 85.1, maxDd: 0.1, rr: 851.4 },
    { counter: "NEULANDLAB (Vijay Kishanal Kedia)", launchedOn: "1-Dec-19", trades: 11, roi: 1825.4, time: 3.5, annualRoi: 507.0, maxDd: 0.1, rr: 5070.0 },
    { counter: "DLTCNBL (Mahendra Girdharilal)", launchedOn: "1-Dec-17", trades: 5, roi: 920.0, time: 2, annualRoi: 460.0, maxDd: 0.5, rr: 920.0 },
    { counter: "SUDARSCHEM (Vijay Kishanal Kedia)", launchedOn: "1-Dec-15", trades: 3, roi: 742.7, time: 1.5, annualRoi: 495.1, maxDd: 0.8, rr: 618.9 },
    { counter: "GRAVITA (Ashish Kacholia)", launchedOn: "1-Mar-22", trades: 5, roi: 396.0, time: 1.2, annualRoi: 330.0, maxDd: 0.1, rr: 3299.6 },
  ];

  const whyUseSystem = [
    { title: "1. Proven, Backtested Performance", desc: "Our strategy is backed by years of rigorous testing, consistently delivering 300%+ annual ROI across multiple market cycles.", icon: History },
    { title: "2. Scalable for Any Capital Size", desc: "Whether you’re investing a few lakhs or managing crores, the system scales effortlessly without losing efficiency or performance.", icon: Layers },
    { title: "3. No Emotions - Pure Data & Logic", desc: "Remove human judgement, emotions, fear, and overthinking from your trades. The system executes with discipline for superior, consistent results.", icon: BrainCircuit },
    { title: "4. Powered by Veteran-Level Market Intelligence", desc: "Built using insights from industry experts and decades of market patterns—helping you discover true multibagger opportunities early.", icon: Zap },
    { title: "5. Zero-Risk Methodology to Control Fear & Greed", desc: "Our structured approach helps you manage emotions by using risk-free entry and exit mechanisms designed for maximum confidence.", icon: ShieldCheck },
    { title: "6. Best-in-Class Risk Management", desc: "Designed with an average max drawdown of just 0.5%, the system protects your capital while allowing profits to grow.", icon: Target },
    { title: "7. No Need to Predict Tops or Bottoms", desc: "You don’t need to time the perfect entry or exit. The system automatically identifies high-probability zones so you invest stress-free.", icon: Calendar },
    { title: "8. Shields You From Extreme Drawdowns", desc: "Avoid painful falls like the 40% drawdown seen in stocks such as Neuland before they rallied. Our system filters out such traps proactively.", icon: ArrowDownRight }
  ];

  const growthData = useMemo(() => {
    let cumulative = 0;
    return pnlData.map(item => {
      cumulative += item.currVal;
      return { label: item.date, value: cumulative };
    });
  }, [pnlData]);

  const tradePnL = useMemo(() => {
    const winners = pnlData.map(item => ({ label: item.date, value: item.currVal, type: 'win' as const }));
    const losers = cashflowData.map((item, idx) => ({ label: `Exit ${idx + 1}`, value: item.flow, type: 'loss' as const }));
    return [...winners, ...losers];
  }, [pnlData, cashflowData]);

  const accuracy = useMemo(() => {
    const wins = pnlData.length;
    const losses = cashflowData.length;
    const total = wins + losses;
    return { wins, total, percent: Math.round((wins/total)*100) };
  }, [pnlData, cashflowData]);

  const fetchBuybackData = async () => {
    setIsBuybackLoading(true);
    setIsPastBuybackLoading(true);
    try {
      const resActive = await fetch('https://script.google.com/macros/s/AKfycbwzrEhfvJDUbYvmSf2gR0FldTSMCugwzFZjFyCc-Dt_onskqT1GVFGBzEOZPVEx_FBwEg/exec');
      const jsonActive = await resActive.json();
      if (Array.isArray(jsonActive)) setBuybackData(jsonActive);
      else if (jsonActive.data) setBuybackData(jsonActive.data);
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
    if (activeTab === 'buyback-game' && buybackData.length === 0) fetchBuybackData();
  }, [activeTab]);

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
    if (activeTab === 'superstar-tracker' && superstarData.length === 0) fetchSuperstarData();
  }, [activeTab]);
  
  const filteredSuperstarData = useMemo(() => {
    const query = superstarSearch.toLowerCase();
    return superstarData.filter(row => {
      const investor = (row["INVESTOR NAME"] || '').toLowerCase();
      const stock = (row["STOCK NAME"] || '').toLowerCase();
      return investor.includes(query) || stock.includes(query);
    });
  }, [superstarData, superstarSearch]);

  const handleGenerateReport = async () => {
    if (!user) { openAuthModal('login'); return; }
    setReportType('executive');
    setIsReportModalOpen(true);
    setReportContent('');
    setIsGeneratingReport(true);
    const context = `DG Alpha Neuland Stats: ROI: ${investmentMetrics.roi}, Yield: ${investmentMetrics.annualizedYield}, DD: ${investmentMetrics.maxDD}`;
    const result = await generateAnalysis(`You are a financial analyst. Provide a concise, executive summary for this data: ${context}`);
    setReportContent(result);
    setIsGeneratingReport(false);
  };

  const handleTradeAnalysis = async () => {
    if (!user) { openAuthModal('login'); return; }
    setReportType('trade');
    setIsReportModalOpen(true);
    setReportContent('');
    setIsGeneratingReport(true);
    const result = await generateAnalysis(`Analyze these trading metrics: Accuracy ${accuracy.percent}%, Wins ${accuracy.wins}. Provide 3 tactical insights.`);
    setReportContent(result);
    setIsGeneratingReport(false);
  };

  const handleBuybackAiReport = async () => {
    if (!user) { openAuthModal('login'); return; }
    setReportType('buyback');
    setIsReportModalOpen(true);
    setReportContent('');
    setIsGeneratingReport(true);
    if (buybackData.length === 0) {
      setReportContent("No active buyback data available.");
      setIsGeneratingReport(false);
      return;
    }
    const result = await generateAnalysis(`Arbitrage analysis for: ${JSON.stringify(buybackData.slice(0, 5))}. Suggest top picks.`);
    setReportContent(result);
    setIsGeneratingReport(false);
  };

  const handleSuperstarInsightReport = async () => {
    if (!user) { openAuthModal('login'); return; }
    setIsReportModalOpen(true);
    setReportContent('');
    setIsGeneratingReport(true);
    const result = await generateAnalysis(`Portfolio analyst insight for: ${JSON.stringify(superstarData.slice(0, 10))}. Focus on sector themes.`);
    setReportContent(result);
    setIsGeneratingReport(false);
  };

  const handleStockSpecificAi = async (stockName: string, investorName: string) => {
    if (!user) { openAuthModal('login'); return; }
    setIsReportModalOpen(true);
    setReportContent('');
    setIsGeneratingReport(true);
    const result = await generateAnalysis(`Brief expert insight on ${stockName} held by ${investorName}. Why hold this?`);
    setReportContent(result);
    setIsGeneratingReport(false);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim() || !user) return;
    setChatHistory(prev => [...prev, { role: 'user', text: chatQuery }]);
    setChatQuery('');
    setIsChatLoading(true);
    const result = await generateAnalysis(`DG Alpha Assistant answering: ${chatQuery}. Context: Neuland ROI ${investmentMetrics.roi}`);
    setChatHistory(prev => [...prev, { role: 'system', text: result }]);
    setIsChatLoading(false);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('leads').insert([{ ...leadForm, age: parseInt(leadForm.age), submitted_at: new Date().toISOString() }]);
      if (error) throw error;
      setIsLeadSubmitted(true);
    } catch (error: any) {
      alert(`Submission failed: ${error.message}`);
    } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center"><Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin" /></div>;
  if (showLandingPage) return <><AuthModal /><LandingPage onDemoClick={() => setShowDemo(true)} /></>;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--accent)] selection:text-black flex transition-colors duration-300 pb-20 md:pb-0 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
         <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[var(--accent)]/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      </div>
      <AuthModal />
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-sidebar)] border-b border-[var(--border-primary)] flex items-center justify-between px-4 z-40">
         <div className="flex items-center gap-2"><div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center shrink-0"><Activity className="w-5 h-5 fill-current text-black" /></div><span className="font-bold text-lg">DG Alpha</span></div>
         <div className="flex items-center gap-3"><button onClick={toggleTheme} className="p-2 bg-[var(--bg-card)] border border-[var(--border-secondary)] rounded-lg">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button><button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2"><Menu className="w-6 h-6" /></button></div>
      </div>
      <aside className="hidden md:flex fixed left-0 top-0 h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-primary)] w-64 flex-col z-40">
         <div className="h-20 flex items-center px-6 border-b border-[var(--border-primary)]"><div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center"><Activity className="w-5 h-5 fill-current text-black" /></div><span className="ml-3 font-bold text-lg">Dhruv Gupta | NCT</span></div>
         <div className="flex-1 py-4 space-y-1"><SidebarItem icon={Repeat} label="Buybacks" isActive={activeTab === 'buyback-game'} onClick={() => handleTabChange('buyback-game')} /><SidebarItem icon={Zap} label="DG Alpha" isActive={activeTab === 'dg-alpha'} onClick={() => handleTabChange('dg-alpha')} /><SidebarItem icon={BarChart2} label="Market Overview" onClick={() => window.open('https://chartink.com/dashboard/406469', '_blank')} /><SidebarItem icon={TrendingUp} label="Swing Trading Stocks" onClick={() => window.open('https://chartink.com/dashboard/406475', '_blank')} /><SidebarItem icon={User} label="Superstar tracker" isActive={activeTab === 'superstar-tracker'} onClick={() => handleTabChange('superstar-tracker')} /><SidebarItem icon={Send} label="Telegram Chat" onClick={() => window.open('https://t.me/+kEcdam9RulcwMWVl', '_blank')} /></div>
         <div className="pb-4 border-t border-[var(--border-primary)] pt-4 p-6">{user ? <button onClick={signOut} className="flex items-center gap-3 text-[var(--text-muted)] hover:text-red-400"><LogOut className="w-5 h-5" /><span>Sign Out</span></button> : <button onClick={() => openAuthModal('login')} className="flex items-center gap-3 text-[var(--text-muted)]"><LogIn className="w-5 h-5" /><span>Login</span></button>}</div>
      </aside>
      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-10 pt-20 md:pt-6 relative z-10 overflow-x-hidden">
        {activeTab === 'dg-alpha' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
              <div><h1 className="text-2xl sm:text-3xl font-bold">Neuland Laboratories</h1><div className="flex items-center gap-3 mt-1"><span className="px-2 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)] text-xs font-bold animate-pulse">LIVE</span><span className="text-[var(--text-muted)] text-sm">Portfolio Dashboard</span></div></div>
              <div className="flex flex-wrap items-center gap-3"><button onClick={() => setIsCaseStudyModalOpen(true)} className="bg-[var(--bg-surface)] px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border-secondary)] hover:border-[var(--accent)]">Case Studies</button><button onClick={() => setIsLeadModalOpen(true)} className="bg-[var(--bg-hover)] px-4 py-2 rounded-lg text-sm font-medium border border-[var(--accent)]">Get Indicator</button><button onClick={handleGenerateReport} className="bg-[var(--bg-surface)] px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border-secondary)] flex items-center gap-2"><Sparkles className="w-4 h-4 text-[var(--accent)]" />AI Report</button></div>
            </div>
            <div className="w-full bg-[var(--bg-card)] border border-[var(--border-secondary)] rounded-2xl p-6 sm:p-10 mb-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-[rgba(var(--accent-rgb),0.05)] rounded-full blur-3xl group-hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors"></div>
               <div className="relative z-10">
                 <div className="flex flex-col sm:flex-row items-start gap-6 mb-8"><div className="hidden sm:flex w-14 h-14 rounded-xl bg-[var(--accent)] items-center justify-center shadow-lg"><TrendingUp className="w-8 h-8 text-black" /></div><h2 className="text-xl sm:text-3xl font-bold leading-tight tracking-tight">I started with <span className="text-[var(--accent)] font-black">₹3 lakhs</span> and grew it to <span className="text-[var(--accent)] font-black">₹54.76 lakhs</span>, turning my money into <span className="text-[var(--accent)] font-black">18.25x without any Risk in just 3.5 years</span></h2></div>
                 <div className="bg-[var(--bg-surface)]/50 rounded-xl p-6 border border-[var(--border-secondary)]"><h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-[var(--border-secondary)] pb-3"><Sparkles className="w-5 h-5 text-[var(--accent)]" />The "Math" Behind Your Success</h3><div className="space-y-4 text-[var(--text-muted)]"><div className="p-4 rounded-lg bg-[var(--bg-main)]/40 border border-[var(--border-secondary)] hover:border-red-500/30 transition-colors"><span className="font-bold text-[var(--text-main)] min-w-[220px] inline-block">Scenario A (Buy & Hold):</span> Invest <span className="font-bold text-[var(--text-main)]">₹3L</span>. Stock goes 18x. Portfolio = <span className="font-bold">₹91.4L</span>. Capital at risk = <span className="text-red-400 font-bold">₹3L</span>.</div><div className="p-4 rounded-lg bg-[rgba(var(--accent-rgb),0.05)] border border-[rgba(var(--accent-rgb),0.2)] hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors"><span className="font-bold text-[var(--accent)] min-w-[220px] inline-block">Scenario B (My Strategy):</span> Invest <span className="font-bold text-[var(--accent)]">₹3L</span>. Stock doubles → Withdraw <span className="font-bold">₹3L</span>. Portfolio = <span className="font-bold text-[var(--accent)]">₹54L</span> + <span className="font-bold">₹8L Cash</span> + Zero Risk.</div><div className="mt-6 pt-2 italic border-l-4 border-[var(--accent)] pl-6 text-lg leading-relaxed">"In Scenario B, your mental stress is zero, allowing you to actually hold for the <span className="text-[var(--accent)] font-bold not-italic">18x</span> run."</div></div></div>
               </div>
            </div>
            <div className="grid grid-cols-1 gap-8 mb-8">
              <Card className="w-full">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><LineChart className="w-5 h-5 text-[var(--accent)]" />Total Account Value Growth</h3>
                <div className="w-full h-[450px] md:h-[55vh] lg:h-[65vh] max-h-[750px]"><ResponsiveAreaChart data={growthData} /></div>
              </Card>
              <Card className="w-full">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[var(--accent)]" />Trade-wise Profit</h3><button onClick={handleTradeAnalysis} className="p-2 bg-[var(--bg-hover)] rounded-lg text-xs font-bold text-[var(--accent)] flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" />Analyze</button></div>
                <div className="w-full h-[450px] md:h-[55vh] lg:h-[65vh] max-h-[750px]"><ResponsiveBarChart data={tradePnL} /></div>
              </Card>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card className="col-span-2 lg:col-span-1 border-[var(--accent)]/20"><p className="text-[var(--text-muted)] text-xs uppercase tracking-widest font-bold">Total Value Accumulated</p><h2 className="text-2xl font-bold mt-1">₹ {(investmentMetrics.totalValueFree / 100000).toFixed(2)} L</h2></Card>
              <Card><p className="text-[var(--text-muted)] text-xs uppercase tracking-widest font-bold">Total ROI</p><h2 className="text-2xl font-bold mt-1 text-green-500">{investmentMetrics.roi}</h2></Card>
              <Card><p className="text-[var(--text-muted)] text-xs uppercase tracking-widest font-bold">Annual Yield</p><h2 className="text-2xl font-bold mt-1 text-blue-500">{investmentMetrics.annualizedYield}</h2></Card>
              <Card><p className="text-[var(--text-muted)] text-xs uppercase tracking-widest font-bold">Max Drawdown</p><h2 className="text-2xl font-bold mt-1 text-red-500">{investmentMetrics.maxDD}</h2></Card>
              <Card><p className="text-[var(--text-muted)] text-xs uppercase tracking-widest font-bold">Dividends</p><h2 className="text-2xl font-bold mt-1 text-purple-500">₹ {investmentMetrics.dividendsCashflow.toLocaleString()}</h2></Card>
            </div>
          </div>
        ) : activeTab === 'buyback-game' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-center"><h1 className="text-3xl font-bold">Buybacks</h1><button onClick={handleBuybackAiReport} className="bg-[var(--accent)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Sparkles className="w-4 h-4" />AI Analysis</button></div>
             <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden"><div className="overflow-x-auto">{isBuybackLoading ? <div className="p-16 text-center animate-pulse">Syncing data...</div> : <table className="w-full text-left"><thead><tr>{buybackColumns.map((col, i) => <th key={i} className="px-6 py-4 bg-[var(--bg-surface)] text-xs font-bold uppercase">{col.label}</th>)}</tr></thead><tbody>{buybackData.map((row, i) => <tr key={i} className="border-t border-[var(--border-primary)] hover:bg-[var(--bg-hover)]">{buybackColumns.map((col, j) => <td key={j} className="px-6 py-4 text-sm">{row[col.key as keyof BuybackData] || '-'}</td>)}</tr>)}</tbody></table>}</div></div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6"><div><h1 className="text-3xl font-bold">Superstar Tracker</h1><p className="text-[var(--text-muted)] text-sm">Following Institutional Smart Money</p></div><button onClick={handleSuperstarInsightReport} className="bg-[var(--bg-surface)] border border-[var(--border-secondary)] px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-[var(--accent)]" />AI Insights</button></div>
            <div className="mb-6"><input type="text" value={superstarSearch} onChange={e => setSuperstarSearch(e.target.value)} placeholder="Search Investor or Stock..." className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-secondary)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none" /></div>
            <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-xl">{isSuperstarLoading ? <div className="h-full flex items-center justify-center animate-pulse">Scanning Portfolios...</div> : <div className="overflow-auto h-full"><table className="w-full text-left whitespace-nowrap"><thead><tr className="bg-[var(--bg-surface)]"><th className="px-6 py-4 text-xs font-bold">Investor</th><th className="px-6 py-4 text-xs font-bold">Stock</th><th className="px-6 py-4 text-xs font-bold text-right">Holding %</th><th className="px-6 py-4 text-xs font-bold text-right">% Alloc</th></tr></thead><tbody>{filteredSuperstarData.map((row, i) => <tr key={i} className="border-t border-[var(--border-primary)] group hover:bg-[var(--bg-hover)]"><td className="px-6 py-4 font-bold group-hover:text-[var(--accent)]">{row["INVESTOR NAME"]}</td><td className="px-6 py-4 flex items-center gap-2">{row["STOCK NAME"]}<button onClick={() => handleStockSpecificAi(row["STOCK NAME"], row["INVESTOR NAME"])} className="p-1 hover:bg-[var(--accent)] rounded opacity-0 group-hover:opacity-100"><Sparkles className="w-3 h-3 text-black" /></button></td><td className="px-6 py-4 text-right">{(parseFloat(row["Latest Holding Percentage"] as any) * 100).toFixed(2)}%</td><td className="px-6 py-4 text-right"><span className="px-2 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">{row["% allocation"]}%</span></td></tr>)}</tbody></table></div>}</div>
          </div>
        )}
      </main>
      <div className={`fixed z-50 transition-all duration-300 ${isChatOpen ? 'bottom-20 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto' : 'bottom-20 right-4'}`}>{!isChatOpen ? <button onClick={() => setIsChatOpen(true)} className="bg-[var(--accent)] text-black w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center animate-float ml-auto"><MessageSquare className="w-6 h-6" /></button> : <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl w-full sm:w-96 shadow-2xl flex flex-col h-[60vh] sm:h-[500px]"><div className="bg-[var(--bg-surface)] p-4 flex justify-between border-b border-[var(--border-primary)]"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div><h3 className="font-bold text-sm">DG Alpha AI</h3></div><button onClick={() => setIsChatOpen(false)}><X className="w-5 h-5" /></button></div><div className="flex-1 overflow-y-auto p-4 space-y-4">{chatHistory.map((msg, i) => <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-xl p-3 text-sm ${msg.role === 'user' ? 'bg-[#333] text-white' : 'bg-[var(--accent)]/10 text-[var(--text-muted)] border border-[var(--accent)]/20'}`}>{msg.text}</div></div>)}{isChatLoading && <div className="p-2 animate-pulse text-xs">AI is typing...</div>}</div><form onSubmit={handleChatSubmit} className="p-3 border-t border-[var(--border-primary)] flex gap-2"><input type="text" value={chatQuery} onChange={e => setChatQuery(e.target.value)} placeholder="Ask anything..." className="flex-1 bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-3 py-2 outline-none" /><button type="submit" className="bg-[var(--accent)] p-2 rounded-lg"><Send className="w-5 h-5 text-black" /></button></form></div>}</div>
      <Modal isOpen={isCaseStudyModalOpen} onClose={() => setIsCaseStudyModalOpen(false)} title="Historical Case Studies" maxWidth="max-w-5xl"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="bg-[var(--bg-surface)]"><th className="px-4 py-3 text-xs font-bold">Counter</th><th className="px-4 py-3 text-xs font-bold text-right">ROI</th><th className="px-4 py-3 text-xs font-bold text-center">Duration</th><th className="px-4 py-3 text-xs font-bold text-right">Ann. ROI</th></tr></thead><tbody>{caseStudies.map((s, i) => <tr key={i} className="border-t border-[var(--border-primary)] hover:bg-[var(--bg-hover)]"><td className="px-4 py-3 font-bold">{s.counter}</td><td className="px-4 py-3 text-right text-[var(--accent)] font-mono">{s.roi}%</td><td className="px-4 py-3 text-center">{s.time}y</td><td className="px-4 py-3 text-right font-mono">{s.annualRoi}%</td></tr>)}</tbody></table></div></Modal>
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="AI Insight Report"><div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap">{isGeneratingReport ? <div className="py-10 text-center animate-pulse">Synthesizing data models...</div> : reportContent}</div></Modal>
      <Modal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} title="DG Alpha Indicator Access">{isLeadSubmitted ? <div className="text-center py-8"><CheckCircle2 className="w-16 h-16 text-[var(--accent)] mx-auto mb-4" /><h3 className="text-xl font-bold">Request Sent!</h3><p className="text-[var(--text-muted)] mt-2">We will contact you shortly.</p></div> : <form onSubmit={handleLeadSubmit} className="space-y-4"><div><label className="text-sm font-medium">Name</label><input required className="w-full bg-[var(--bg-main)] border rounded-lg px-4 py-2" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} /></div><div><label className="text-sm font-medium">Phone</label><input required type="tel" className="w-full bg-[var(--bg-main)] border rounded-lg px-4 py-2" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} /></div><button type="submit" disabled={isSubmitting} className="w-full bg-[var(--accent)] py-3 rounded-lg font-bold text-black">{isSubmitting ? 'Sending...' : 'Request Access'}</button></form>}</Modal>
    </div>
  );
}


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
  MoreHorizontal,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Monitor,
  Scale,
  LogOut as ExitIcon,
  Crown,
  Bot,
  Command,
  Briefcase,
  MapPin,
  Globe,
  Mail,
  Clock,
  ChevronRight,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { generateAnalysis } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { ResponsiveAreaChart, ResponsiveBarChart } from './components/Charts';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/Auth/AuthModal';
import { LandingPage } from './components/LandingPage';
import NiftyPrediction from './components/NiftyPrediction';
import { CommandCenter } from './components/CommandCenter';

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
    className={`w-full flex items-center px-4 md:px-0 lg:px-4 py-3 sm:py-4 transition-all duration-200 group relative md:justify-center lg:justify-start ${
      isActive 
        ? 'text-[var(--accent)] bg-[var(--bg-surface)] border-r-2 border-[var(--accent)]' 
        : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--accent)] border-r-2 border-transparent'
    }`}
  >
    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[var(--accent)]' : ''}`} />
    <span className={`hidden lg:block ml-3 font-medium text-sm tracking-wide text-left ${isActive ? 'text-[var(--text-main)]' : ''}`}>
      {label}
    </span>
    {/* Tooltip for tablet (md) only */}
    <div className="hidden md:block lg:hidden absolute left-16 top-1/2 -translate-y-1/2 bg-[var(--bg-card)] text-[var(--text-main)] text-xs px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-[var(--border-primary)] shadow-xl">
      {label}
    </div>
  </button>
);

const BottomNavItem: React.FC<{ icon: React.ElementType; label: string; isActive?: boolean; onClick?: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 min-w-0 flex flex-col items-center justify-center py-2 gap-1 transition-all ${
      isActive 
        ? 'text-[var(--accent)]' 
        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
    }`}
  >
    <Icon className={`w-5 h-5 ${isActive ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
    <span className="text-[10px] font-medium truncate w-full text-center px-0.5">{label}</span>
  </button>
);

const SuperstarScreeningGuide: React.FC = () => (
  <div className="bg-[var(--bg-card)] rounded-xl p-6 sm:p-8 border border-[var(--border-primary)] hover:border-[var(--accent)]/30 transition-all duration-300 shadow-xl">
    <h4 className="text-[var(--text-main)] font-bold text-2xl sm:text-3xl mb-8 flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-[var(--accent)]" />
        How to Screen Superstar Stocks
    </h4>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-[var(--text-main)] flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">1</div>
                <p className="font-medium text-[var(--text-main)] text-base">Screen all stocks held by selected superstars</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-[var(--text-main)] flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">2</div>
                <p className="font-medium text-[var(--text-main)] text-base">Identify newly added vs removed stocks</p>
            </div>
        </div>

        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-[var(--text-main)] flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">3</div>
                <p className="font-medium text-[var(--text-main)] text-base">Apply DG Alpha System to watchlist stocks</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-[var(--text-main)] flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">4</div>
                <p className="font-medium text-[var(--text-main)] text-base">Follow Entry and Exit rules precisely</p>
            </div>
        </div>
    </div>
  </div>
);

// Guide Component to reuse across tabs
const DGAlphaInvestmentSeriesGuide: React.FC = () => (
  <div className="bg-[var(--bg-card)] rounded-xl p-6 sm:p-8 border border-[var(--border-primary)] hover:border-[var(--accent)]/30 transition-all duration-300 shadow-xl">
    <h4 className="text-[var(--text-main)] font-bold text-2xl sm:text-3xl mb-10 flex items-center gap-3">
        <Zap className="w-8 h-8 sm:w-9 sm:h-9 text-[var(--accent)] animate-pulse" />
        How to Play – DG Alpha Investment Series
    </h4>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-sm sm:text-base text-[var(--text-muted)]">
        {/* Column 1: Setup & Rules */}
        <div className="space-y-8">
            {/* System Setup */}
            <div>
                <h5 className="text-[var(--text-main)] font-extrabold text-lg sm:text-xl mb-4 flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-[var(--accent)]" /> System Setup
                </h5>
                <ul className="space-y-3 ml-2">
                    <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 shrink-0"></div>
                        <p>Use <span className="text-[var(--text-main)] font-bold">Weekly</span> time frame</p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 shrink-0"></div>
                        <p>Use <span className="text-[var(--text-main)] font-bold">Line chart only</span> (no candlesticks)</p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 shrink-0"></div>
                        <div>
                            <p className="mb-2">Apply indicators:</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-[var(--accent)] font-bold text-xs">DG Alpha</span>
                                <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-[var(--accent)] font-bold text-xs">DG Vega Gama</span>
                            </div>
                            <p className="text-xs mt-1.5 text-[var(--text-dim)]">(green = bullish, red = bearish)</p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* Entry Rules */}
            <div>
                <h5 className="text-[var(--text-main)] font-extrabold text-lg sm:text-xl mb-4 flex items-center gap-3">
                    <LogIn className="w-5 h-5 text-[var(--accent)]" /> Entry Rules (ALL must be satisfied)
                </h5>
                <ol className="space-y-3 ml-2 list-decimal list-inside">
                    <li className="pl-2">DG Vega Gama line 1 should be <span className="text-[var(--accent)] font-bold">above</span> dotted line</li>
                    <li className="pl-2">DG Alpha (price action) is <span className="text-green-400 font-bold">green</span></li>
                    <li className="pl-2">Identify a <span className="text-[var(--text-main)] font-bold">curve/jerk</span> in price</li>
                    <li className="pl-2">Draw a reference line at the curve peak</li>
                    <li className="pl-2 text-[var(--text-main)] font-bold">Enter immediately when price crosses above reference line</li>
                    <p className="text-xs italic text-[var(--text-dim)] mt-0.5 ml-6">(no candle-close wait required)</p>
                </ol>
            </div>

            {/* Capital Rules */}
            <div>
                <h5 className="text-[var(--text-main)] font-extrabold text-lg sm:text-xl mb-4 flex items-center gap-3">
                    <Scale className="w-5 h-5 text-[var(--accent)]" /> Capital Rules
                </h5>
                <ul className="space-y-3 ml-2">
                    <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 shrink-0"></div>
                        <p>Divide total capital into <span className="text-[var(--text-main)] font-bold">10 equal parts</span></p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 shrink-0"></div>
                        <p>Invest only <span className="text-[var(--accent)] font-bold">1/10th capital</span> per stock</p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 shrink-0"></div>
                        <p>Trade <span className="text-[var(--text-main)] font-bold">cash equity only</span></p>
                    </li>
                </ul>
            </div>
        </div>

        {/* Column 2: Risk, Wealth, Philosophy */}
        <div className="space-y-8">
            {/* Exit & Risk Management */}
            <div>
                <h5 className="text-[var(--text-main)] font-extrabold text-lg sm:text-xl mb-4 flex items-center gap-3">
                    <ExitIcon className="w-5 h-5 text-red-400" /> Exit & Risk Management Rules
                </h5>
                <div className="space-y-4 ml-2">
                    <div className="p-3 rounded-lg bg-[rgba(var(--accent-rgb),0.03)] border border-[rgba(var(--accent-rgb),0.08)]">
                        <p className="font-bold text-[var(--text-main)] text-sm mb-0.5">Break-even rule:</p>
                        <p className="text-sm">After <span className="text-green-400 font-bold">+5% move</span>, place GTT at entry</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-900/5 border border-red-500/10">
                        <p className="font-bold text-[var(--text-main)] text-sm mb-0.5">Stop-loss rule:</p>
                        <p className="text-sm">Exit if <span className="text-red-400 font-bold">weekly close</span> falls below reference line</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-900/5 border border-blue-500/10">
                        <p className="font-bold text-[var(--text-main)] text-sm mb-0.5">Loss recovery rule:</p>
                        <p className="text-sm">Small loss is <span className="text-blue-400 font-bold">recovered</span> in next winning trade</p>
                    </div>
                </div>
            </div>

            {/* Wealth Creation Rule */}
            <div>
                <h5 className="text-[var(--text-main)] font-extrabold text-lg sm:text-xl mb-4 flex items-center gap-3">
                    <Crown className="w-5 h-5 text-[var(--accent)]" /> Wealth Creation Rule (Core Logic)
                </h5>
                <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--accent)]/50 shadow-md relative">
                    <p className="font-bold text-[var(--text-main)] text-lg mb-3">When stock price doubles (100%):</p>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
                            <span className="text-sm"><span className="text-[var(--text-main)] font-bold">Exit 50%</span> quantity</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
                            <span className="text-sm"><span className="text-[var(--text-main)] font-bold">Recover full capital</span></span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
                            <span className="text-sm">Remaining 50% becomes a <span className="text-[var(--accent)] font-bold">“Free Stock”</span></span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Core Philosophy */}
            <div>
                <h5 className="text-[var(--text-main)] font-extrabold text-lg sm:text-xl mb-4 flex items-center gap-3">
                    <BrainCircuit className="w-5 h-5 text-[var(--accent)]" /> Core Philosophy
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        "Focus on asset accumulation",
                        "Recycle capital, minimal risk",
                        "Grows through free stocks",
                        "Compounding long-term wealth"
                    ].map((text, i) => (
                        <div key={i} className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)] text-sm font-medium hover:border-[var(--accent)]/30 transition-colors">
                            {text}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  </div>
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
  
  // New state to control landing page visibility
  const [showDemo, setShowDemo] = useState(false);
  const showLandingPage = !user && !showDemo;

  const [activeTab, setActiveTab] = useState<'dg-alpha' | 'buyback-game' | 'superstar-tracker' | 'nifty-fii-prediction' | 'command-center' | 'careers'>('dg-alpha');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCaseStudyModalOpen, setIsCaseStudyModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'executive' | 'trade' | 'buyback'>('executive'); 
  const [reportContent, setReportContent] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Default to dark mode if no preference saved
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  // Job Application States
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isAppSubmitted, setIsAppSubmitted] = useState(false);
  const [isAppSubmitting, setIsAppSubmitting] = useState(false);
  const [appForm, setAppForm] = useState({
    name: '',
    phone: '',
    college: '',
    age: ''
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
  
  // Superstar Sort State
  const [superstarSortConfig, setSuperstarSortConfig] = useState<{ key: keyof SuperstarEntry | null, direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc'
  });

  // Effect to redirect to home tab if user logs out
  useEffect(() => {
    if (!user && !loading) {
      setActiveTab('dg-alpha');
      // If user logs out, go back to landing page unless they were already viewing demo
      // We can leave showDemo as is, or reset it. Let's reset it to show landing page on logout.
      setShowDemo(false);
    }
  }, [user, loading]);

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

  // Protected Route Handler
  const handleTabChange = (tab: 'dg-alpha' | 'buyback-game' | 'superstar-tracker' | 'nifty-fii-prediction' | 'command-center' | 'careers') => {
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

  const handleLogoClick = () => {
    setShowDemo(false);
    setActiveTab('dg-alpha');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Data ---
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
  
  const handleSuperstarSort = (key: keyof SuperstarEntry) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (superstarSortConfig.key === key && superstarSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSuperstarSortConfig({ key, direction });
  };

  const filteredSuperstarData = useMemo(() => {
    const query = superstarSearch.toLowerCase();
    let data = superstarData.filter(row => {
      const investor = (row["INVESTOR NAME"] || '').toLowerCase();
      const stock = (row["STOCK NAME"] || '').toLowerCase();
      return investor.includes(query) || stock.includes(query);
    });

    if (superstarSortConfig.key) {
      data = [...data].sort((a, b) => {
        const key = superstarSortConfig.key!;
        let aVal = a[key];
        let bVal = b[key];

        // Numeric fields handling
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return superstarSortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // Date fields handling (Sept Qtr Holding)
        if (key === 'Latest Qtr Data') {
           const aDate = aVal ? new Date(aVal as string).getTime() : 0;
           const bDate = bVal ? new Date(bVal as string).getTime() : 0;
           return superstarSortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }

        // Default string comparison
        const aStr = String(aVal || '').toLowerCase();
        const bStr = String(bVal || '').toLowerCase();
        
        if (aStr < bStr) return superstarSortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return superstarSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [superstarData, superstarSearch, superstarSortConfig]);


  // --- Gemini Handler Wrappers ---
  const handleGenerateReport = async () => {
    if (!user) { openAuthModal('login'); return; }
    
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
    if (!user) { openAuthModal('login'); return; }

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
    if (!user) { openAuthModal('login'); return; }

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
    if (!user) { openAuthModal('login'); return; }

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
    if (!user) { openAuthModal('login'); return; }

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

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    if (!user) {
      openAuthModal('login');
      return;
    }

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

  const handleAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAppSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert([
          {
            name: appForm.name,
            phone: appForm.phone,
            college: appForm.college,
            age: appForm.age ? parseInt(appForm.age) : null,
            position: 'Internship: Software Developer and Market Enthusiast',
            submitted_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      
      setIsAppSubmitted(true);
    } catch (error: any) {
      console.error('Detailed Supabase Error:', error);
      alert(`Submission failed: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsAppSubmitting(false);
    }
  };

  // Prevent rendering until auth is determined
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  // --- RENDERING LANDING PAGE ---
  if (showLandingPage) {
    return (
      <>
        <AuthModal />
        <LandingPage onDemoClick={() => setShowDemo(true)} />
      </>
    );
  }

  // --- RENDERING DASHBOARD ---
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--accent)] selection:text-black flex transition-colors duration-300 pb-20 md:pb-0 relative overflow-hidden">
      
      {/* Dashboard Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      </div>

      <AuthModal />

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-sidebar)] border-b border-[var(--border-primary)] flex items-center justify-between px-4 z-40">
         <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]">
               <Activity className={`w-5 h-5 fill-current text-[var(--text-on-accent)]`} />
            </div>
            <span className="font-bold text-lg tracking-tight text-[var(--text-main)]">DG Alpha</span>
         </div>
         <div className="flex items-center gap-3">
            <button 
                onClick={toggleTheme}
                className="p-2 bg-[var(--bg-card)] border border-[var(--border-secondary)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent)] transition-all"
            >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[var(--text-main)]"
            >
              <Menu className="w-6 h-6" />
            </button>
         </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-[var(--bg-card)] border-b border-[var(--border-primary)] z-30 animate-in slide-in-from-top-2 p-4 shadow-xl">
           <div className="space-y-4">
              {user ? (
                <div className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded-lg">
                   <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold text-[var(--text-on-accent)]">
                      {userProfile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-[var(--text-main)] truncate">{userProfile?.name || "User"}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                   </div>
                   <button onClick={signOut} className="text-red-400 hover:bg-red-900/20 p-2 rounded-lg">
                      <LogOut className="w-5 h-5" />
                   </button>
                </div>
              ) : (
                <button 
                  onClick={() => { openAuthModal('login'); setIsMobileMenuOpen(false); }}
                  className="w-full py-3 bg-[var(--accent)] text-[var(--text-on-accent)] font-bold rounded-lg"
                >
                  Login / Sign Up
                </button>
              )}
              
              <div className="flex flex-col gap-3">
                 <button onClick={() => window.open('https://chartink.com/dashboard/406469', '_blank')} className="p-3 bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg text-left text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-2 w-full">
                    <BarChart2 className="w-4 h-4" /> Market Overview
                 </button>
                 
                 {/* NEW BUTTONS ADDED HERE */}
                 <button 
                    onClick={() => { handleTabChange('command-center'); setIsMobileMenuOpen(false); }} 
                    className={`p-3 bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg text-left text-sm font-medium hover:text-[var(--text-main)] flex items-center gap-2 w-full ${activeTab === 'command-center' ? 'text-[var(--accent)] border-[var(--accent)]' : 'text-[var(--text-muted)]'}`}
                 >
                    <Command className="w-4 h-4" /> Tools Center
                 </button>
                 <button 
                    onClick={() => { handleTabChange('careers'); setIsMobileMenuOpen(false); }} 
                    className={`p-3 bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg text-left text-sm font-medium hover:text-[var(--text-main)] flex items-center gap-2 w-full ${activeTab === 'careers' ? 'text-[var(--accent)] border-[var(--accent)]' : 'text-[var(--text-muted)]'}`}
                 >
                    <Briefcase className="w-4 h-4" /> Careers
                 </button>

                 <button onClick={() => window.open('https://t.me/+kEcdam9RulcwMWVl', '_blank')} className="p-3 bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg text-left text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-2 w-full">
                    <Send className="w-4 h-4" /> Telegram Chat
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-primary)] md:w-20 lg:w-64 transition-all duration-300 z-40 flex-col">
         {/* Logo Header */}
         <div onClick={handleLogoClick} className="h-20 flex items-center md:justify-center lg:justify-start md:px-0 lg:px-6 border-b border-[var(--border-primary)] cursor-pointer hover:bg-[var(--bg-surface)] transition-colors">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]">
               <Activity className={`w-5 h-5 fill-current text-[var(--text-on-accent)]`} />
            </div>
            <span className="hidden lg:block ml-3 font-bold text-lg tracking-tight text-[var(--text-main)] truncate">Dhruv Gupta <span className="text-[var(--accent)]">| NCT</span></span>
         </div>

         {/* Menu Items */}
         <div className="flex-1 py-4 space-y-1 overflow-y-auto">
            <SidebarItem 
              icon={Repeat} 
              label="Buybacks" 
              isActive={activeTab === 'buyback-game'}
              onClick={() => handleTabChange('buyback-game')}
            />
            <SidebarItem 
              icon={Zap} 
              label="DG Alpha" 
              isActive={activeTab === 'dg-alpha'}
              onClick={() => handleTabChange('dg-alpha')}
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
              label="Superstar Tracker" 
              isActive={activeTab === 'superstar-tracker'}
              onClick={() => handleTabChange('superstar-tracker')}
            />
            <SidebarItem 
              icon={LineChart} 
              label="Nifty Fii Prediction" 
              isActive={activeTab === 'nifty-fii-prediction'}
              onClick={() => handleTabChange('nifty-fii-prediction')}
            />
            <SidebarItem 
              icon={Command} 
              label="Tools Center" 
              isActive={activeTab === 'command-center'}
              onClick={() => handleTabChange('command-center')}
            />
            <SidebarItem 
              icon={Briefcase} 
              label="Careers" 
              isActive={activeTab === 'careers'}
              onClick={() => handleTabChange('careers')}
            />
            <SidebarItem 
              icon={Send} 
              label="Chat with us on telegram" 
              onClick={() => window.open('https://t.me/+kEcdam9RulcwMWVl', '_blank')}
            />
         </div>

         {/* Footer Items */}
         <div className="pb-4 border-t border-[var(--border-primary)] pt-4 md:p-2 lg:p-6 flex flex-col items-center lg:items-start">
            {user ? (
               <button onClick={signOut} className="flex items-center gap-3 text-[var(--text-muted)] hover:text-red-400 transition-colors w-full text-sm font-medium md:justify-center lg:justify-start">
                  <LogOut className="w-5 h-5" />
                  <span className="hidden lg:block">Sign Out</span>
               </button>
            ) : (
               <button onClick={() => openAuthModal('login')} className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors w-full text-sm font-medium md:justify-center lg:justify-start">
                  <LogIn className="w-5 h-5" />
                  <span className="hidden lg:block">Login</span>
               </button>
            )}
         </div>
      </aside>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-primary)] z-50 flex items-center justify-between px-2 pb-safe-area shadow-[0_-5px_20px_rgba(0,0,0,0.3)] h-16 sm:h-20">
         <BottomNavItem 
            icon={Zap} 
            label="DG Alpha" 
            isActive={activeTab === 'dg-alpha'} 
            onClick={() => handleTabChange('dg-alpha')} 
         />
         <BottomNavItem 
            icon={Repeat} 
            label="Buybacks" 
            isActive={activeTab === 'buyback-game'} 
            onClick={() => handleTabChange('buyback-game')} 
         />
         <BottomNavItem 
            icon={User} 
            label="Superstars" 
            isActive={activeTab === 'superstar-tracker'} 
            onClick={() => handleTabChange('superstar-tracker')} 
         />
         <BottomNavItem 
            icon={LineChart} 
            label="Nifty/FII" 
            isActive={activeTab === 'nifty-fii-prediction'} 
            onClick={() => handleTabChange('nifty-fii-prediction')} 
         />
         {/* Command Center and Careers removed from here as requested */}
         <BottomNavItem 
            icon={TrendingUp} 
            label="Swing" 
            onClick={() => window.open('https://chartink.com/dashboard/406475', '_blank')} 
         />
      </div>

      {/* Main Content Wrapper */}
      <main className="flex-1 md:ml-20 lg:ml-64 p-4 sm:p-6 lg:p-10 pt-20 md:pt-6 relative overflow-x-hidden min-w-0 z-10">

        {/* Desktop Top Right Header Controls */}
        <div className="hidden md:flex absolute top-6 right-6 items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2 duration-500">
            <button 
                onClick={toggleTheme}
                className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-secondary)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent)] transition-all flex items-center gap-2"
            >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="text-xs font-medium">
                    {isDarkMode ? "Light" : "Dark"}
                </span>
            </button>
            
            {user ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-secondary)] rounded-lg">
                <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold text-[var(--text-on-accent)]">
                   {userProfile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-[var(--text-main)] max-w-[100px] truncate">
                   {userProfile?.name || user.email?.split('@')[0]}
                </span>
              </div>
            ) : (
              <button 
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] font-bold rounded-lg text-sm transition-colors shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
            )}
        </div>

        {activeTab === 'dg-alpha' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8 pt-2 md:pt-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] mb-2 tracking-tight leading-tight">Neuland Laboratories</h1>
                <div className="flex items-center gap-3">
                   <span className="px-2 py-0.5 rounded bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/30 animate-pulse">LIVE</span>
                   <span className="text-[var(--text-muted)] text-sm">Portfolio Dashboard</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                 <button 
                    onClick={() => setIsCaseStudyModalOpen(true)}
                    className="bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-[var(--border-secondary)] transition-colors flex items-center gap-2 flex-grow sm:flex-grow-0 justify-center hover:border-[var(--accent)]/50"
                 >
                    <LayoutDashboard className="w-4 h-4 text-[var(--accent)]" />
                    Case Studies
                 </button>
                <button 
                    onClick={() => { setIsLeadModalOpen(true); setIsLeadSubmitted(false); }}
                    className="bg-[var(--bg-hover)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-[var(--accent)] transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)] flex-grow sm:flex-grow-0 justify-center hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)] active:scale-95"
                  >
                    <UserPlus className="w-4 h-4 text-[var(--accent)]" />
                    Get DG Indicator
                </button>
                 <button 
                  onClick={handleGenerateReport}
                  className="bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-[var(--border-secondary)] transition-colors flex items-center gap-2 group flex-grow sm:flex-grow-0 justify-center hover:border-[var(--accent)]/50"
                >
                  <Sparkles className="w-4 h-4 text-[var(--accent)] group-hover:rotate-12 transition-transform" />
                  AI Report
                </button>
              </div>
            </div>

            {/* Journey Highlight Widget */}
            <div className="w-full bg-[var(--bg-card)] border border-[var(--border-secondary)] rounded-2xl p-5 sm:p-8 mb-8 shadow-2xl shadow-[rgba(var(--accent-rgb),0.05)] relative overflow-hidden group hover:border-[var(--accent)]/30 transition-all duration-500">
               {/* Decorative background element */}
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-[rgba(var(--accent-rgb),0.05)] rounded-full blur-3xl pointer-events-none group-hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-500"></div>
               
               <div className="relative z-10">
                 <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="hidden sm:flex w-14 h-14 rounded-xl bg-[var(--accent)] items-center justify-center shrink-0 shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] animate-float">
                       <TrendingUp className="w-8 h-8 text-[var(--text-on-accent)]" />
                    </div>
                    <div>
                       <h2 className="text-xl sm:text-3xl font-bold text-[var(--text-main)] leading-tight tracking-tight mb-2">
                          I started with <span className="text-[var(--accent)] font-black font-mono">₹3 lakhs</span> and grew it to <span className="text-[var(--accent)] font-black font-mono">₹54.76 lakhs</span>, turning my money into <span className="text-[var(--accent)] font-black font-mono">18.25x without any Risk in 3.5 Years</span>
                       </h2>
                    </div>
                 </div>

                 <div className="bg-[var(--bg-surface)]/50 rounded-xl p-4 sm:p-6 border border-[var(--border-secondary)] backdrop-blur-sm hover:border-[var(--border-secondary)] transition-all">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)] mb-4 sm:mb-6 flex items-center gap-2 border-b border-[var(--border-secondary)] pb-3">
                      <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                      The "Math" Behind Your Success
                    </h3>
                    
                    <div className="space-y-4 font-light text-[var(--text-muted)] text-sm sm:text-base">
                       <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-4 rounded-lg bg-[var(--bg-main)]/40 border border-[var(--border-secondary)] hover:border-red-500/30 transition-colors">
                          <span className="font-bold text-[var(--text-main)] min-w-[220px] sm:text-lg">Scenario A (Buy & Hold):</span>
                          <span className="leading-relaxed">
                            Invest <span className="font-bold text-[var(--text-main)] font-mono">₹3L</span>. Stock goes <span className="font-bold text-[var(--text-main)] font-mono">18x</span>. Portfolio = <span className="font-bold text-[var(--text-main)] font-mono">₹91.4L</span>. Capital at risk = <span className="font-bold text-red-400 font-mono">₹3L</span>.
                          </span>
                       </div>

                       <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-4 rounded-lg bg-[rgba(var(--accent-rgb),0.05)] border border-[rgba(var(--accent-rgb),0.2)] hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors shadow-[0_0_15px_rgba(var(--accent-rgb),0.05)]">
                          <span className="font-bold text-[var(--accent)] min-w-[220px] sm:text-lg">Scenario B (My Strategy):</span>
                          <span className="leading-relaxed">
                            Invest <span className="font-bold text-[var(--accent)] font-mono">₹3L</span>. Stock doubles → Withdraw <span className="font-bold text-[var(--accent)] font-mono">₹3L</span>. Stock goes <span className="font-bold text-[var(--accent)] font-mono">18x</span> (on remaining half). <br className="hidden sm:block" />
                            Portfolio = <span className="font-bold text-[var(--accent)] font-mono">₹54L</span> + <span className="font-bold text-[var(--accent)] font-mono">₹8L</span> (Cash) + New Gains from re-invested cash.
                          </span>
                       </div>
                       
                       <div className="mt-6 pt-2 text-sm sm:text-lg italic text-[var(--text-muted)] pl-4 sm:pl-6 border-l-4 border-[var(--accent)] leading-relaxed">
                          "In Scenario B, your mental stress is zero, allowing you to actually hold for the <span className="text-[var(--accent)] font-bold not-italic font-mono">18x</span> run. In Scenario A, most people sell at <span className="text-red-400 font-bold not-italic font-mono">2x</span> out of fear of losing profits."
                       </div>
                    </div>
                 </div>
               </div>
            </div>

            {/* Hero Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <Card className="col-span-2 lg:col-span-1 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] !p-4 sm:!p-6 group hover:border-[var(--accent)]/50">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-[rgba(var(--accent-rgb),0.1)] rounded-lg group-hover:scale-110 transition-transform">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent)]" />
                  </div>
                </div>
                <p className="text-[var(--text-muted)] text-[10px] sm:text-sm font-medium uppercase tracking-wide">Total Free Holding Value</p>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mt-1">₹ {(investmentMetrics.totalValueFree / 100000).toFixed(2)} L</h2>
                <div className="mt-3 sm:mt-4 h-1 w-full bg-[var(--border-primary)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent)] w-[85%] shadow-[0_0_10px_var(--accent)]"></div>
                </div>
              </Card>

              <Card className="col-span-1 !p-3 sm:!p-6 hover:border-green-500/50">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="p-1.5 bg-green-500/10 rounded-lg">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-500" />
                  </div>
                  <span className="text-[9px] sm:text-xs font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">High Perf</span>
                </div>
                <p className="text-[var(--text-muted)] text-[10px] sm:text-sm font-medium">Total ROI</p>
                <h2 className="text-lg sm:text-2xl font-bold text-[var(--text-main)] mt-0.5">{investmentMetrics.roi}</h2>
                <p className="text-[10px] sm:text-xs text-[var(--text-dim)] mt-1">Over {investmentMetrics.time}</p>
              </Card>

              <Card className="col-span-1 !p-3 sm:!p-6 hover:border-blue-500/50">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <PieChart className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-500" />
                  </div>
                </div>
                <p className="text-[var(--text-muted)] text-[10px] sm:text-sm font-medium">Annualised Yield</p>
                <h2 className="text-lg sm:text-2xl font-bold text-[var(--text-main)] mt-0.5">{investmentMetrics.annualizedYield}</h2>
                <p className="text-[10px] sm:text-xs text-[var(--text-dim)] mt-1">ROI/Max DD: {investmentMetrics.ratio}</p>
              </Card>

              <Card className="col-span-1 !p-3 sm:!p-6 hover:border-red-500/50">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="p-1.5 bg-red-500/10 rounded-lg">
                    <Activity className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-red-500" />
                  </div>
                  <span className="text-[9px] sm:text-xs font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">Risk Low</span>
                </div>
                <p className="text-[var(--text-muted)] text-[10px] sm:text-sm font-medium">Max Drawdown</p>
                <h2 className="text-lg sm:text-2xl font-bold text-[var(--text-main)] mt-0.5">{investmentMetrics.maxDD}</h2>
                <p className="text-[10px] sm:text-xs text-[var(--text-dim)] mt-1">Historical Max</p>
              </Card>

              <Card className="col-span-1 !p-3 sm:!p-6 hover:border-purple-500/50">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="p-1.5 bg-purple-500/10 rounded-lg">
                    <DollarSign className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-purple-500" />
                  </div>
                  <span className="text-[9px] sm:text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-secondary)]">Passive</span>
                </div>
                <p className="text-[var(--text-muted)] text-[10px] sm:text-sm font-medium">Dividend Income</p>
                <h2 className="text-lg sm:text-2xl font-bold text-[var(--text-main)] mt-0.5">₹ {investmentMetrics.dividendsCashflow.toLocaleString()}</h2>
                <p className="text-[10px] sm:text-xs text-[var(--text-dim)] mt-1">
                  <span className="text-purple-400 font-bold">{((investmentMetrics.dividendsCashflow / 300000) * 100).toFixed(2)}%</span> of Invested
                </p>
              </Card>
            </div>

            {/* Analytics Widgets Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="w-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--text-main)] flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-[var(--accent)]" />
                    Total Account Value Growth
                  </h3>
                </div>
                <div className="w-full h-[300px] sm:h-[420px]">
                   <ResponsiveAreaChart data={growthData} />
                </div>
              </Card>

               <Card className="w-full flex flex-col">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h3 className="text-lg font-semibold text-[var(--text-main)] flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
                      Trade-wise Profit
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-hover)] rounded-full border border-[var(--border-secondary)] w-fit">
                       <Target className="w-3 h-3 text-[var(--accent)]" />
                       <span className="text-xs text-[var(--text-muted)]">Accuracy: <span className="text-[var(--text-main)] font-bold">{accuracy.wins}/{accuracy.total}</span> ({accuracy.percent}%)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
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
                    <button 
                      onClick={handleTradeAnalysis}
                      className="p-1.5 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--bg-surface)] border border-[var(--border-secondary)] transition-colors group flex items-center gap-1.5 px-3"
                      title="Analyze Trading Patterns"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-[var(--accent)] group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--text-main)]">Analyze</span>
                    </button>
                  </div>
                </div>
                <div className="w-full h-[300px] sm:h-[420px]">
                   <ResponsiveBarChart data={tradePnL} />
                </div>
               </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="border-[var(--border-secondary)] h-full">
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
                            <td className="px-3 sm:px-4 py-4 text-[var(--text-muted)] font-medium text-xs sm:text-sm">{row.label}</td>
                            <td className="px-3 sm:px-4 py-4 text-right">
                              <div className="font-bold text-[var(--text-main)] text-xs sm:text-sm">{row.value}</div>
                              <div className="text-[10px] text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors">{row.sub}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card className="overflow-hidden h-full">
                   <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-[var(--text-main)] flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
                      Profit & Loss Analysis
                    </h3>
                  </div>
                  <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 pb-2">
                    <table className="w-full text-xs text-left whitespace-nowrap min-w-[600px]">
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
                <Card className="bg-gradient-to-br from-[rgba(var(--accent-rgb),0.2)] to-[var(--bg-main)] border border-[rgba(var(--accent-rgb),0.3)] hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0 animate-pulse">
                      <span className="text-[var(--text-on-accent)] font-bold">VK</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-main)]">Vijay Kedia Position</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Institutional Tracking</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                     <div className="bg-[var(--bg-surface)] p-2 rounded">
                        <div className="text-[10px] text-[var(--text-muted)]">Wealth Multiplier</div>
                        <div className="text-lg font-bold text-[var(--accent)]">17.5x</div>
                     </div>
                     <div className="bg-[var(--bg-surface)] p-2 rounded">
                        <div className="text-[10px] text-[var(--text-muted)]">Gain %</div>
                        <div className="text-lg font-bold text-[var(--text-main)]">1747.5%</div>
                     </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[var(--border-primary)] grid grid-cols-2 gap-4">
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
                            className="w-full bg-[rgba(var(--accent-rgb),0.5)] hover:bg-[var(--accent)] rounded-t-sm transition-all duration-300 relative group-hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]"
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
                      <div key={idx} className="bg-[var(--bg-main)] p-3 rounded-lg border border-[var(--border-primary)] flex justify-between items-center hover:bg-[var(--bg-surface)] transition-colors">
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
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] mb-3">Why You Should Use This System</h2>
                <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-sm sm:text-base">
                  A complete ecosystem designed to replace guesswork with precision and transform your investing journey.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {whyUseSystem.map((item, idx) => (
                  <Card key={idx} className="bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] transition-colors group border-[var(--border-primary)] hover:border-[var(--accent)]/30 hover:scale-105 duration-300">
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

            {/* Instruction Footer for DG Alpha Tab */}
            <div className="mt-16 pt-8 border-t border-[var(--border-primary)]">
               <DGAlphaInvestmentSeriesGuide />
            </div>
          </div>
        ) : activeTab === 'buyback-game' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-2 md:pt-6">
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">Buybacks</h1>
                <div className="flex items-center gap-3 mt-2">
                   <span className="bg-[var(--accent)] text-[var(--text-on-accent)] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">LIVE MARKET DATA</span>
                   <p className="text-[var(--text-muted)] text-sm">Arbitrage & Special Situations</p>
                </div>
              </div>
              <div className="flex gap-3 pr-2 sm:pr-0 w-full sm:w-auto">
                 <button 
                  onClick={() => { setIsLeadModalOpen(true); setIsLeadSubmitted(false); }}
                  className="bg-[var(--bg-hover)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] px-4 py-2 rounded-lg text-sm font-medium border border-[var(--accent)] transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)] flex-1 sm:flex-initial justify-center hover:scale-105"
                 >
                   <UserPlus className="w-4 h-4 text-[var(--accent)]" />
                   Get DG Indicator
                 </button>
                 <button 
                  onClick={handleBuybackAiReport}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-on-accent)] border border-[var(--accent)] rounded-lg hover:bg-[var(--accent-hover)] transition-all font-bold text-xs shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] flex-1 sm:flex-initial justify-center hover:scale-105"
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
                <button onClick={fetchBuybackData} className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 transition-opacity opacity-80 hover:opacity-100 bg-[var(--bg-surface)] px-3 py-1.5 rounded-full border border-[var(--border-secondary)] hover:border-[var(--accent)]">
                    <RefreshCw className={`w-3 h-3 ${isBuybackLoading ? 'animate-spin' : ''}`} /> 
                    <span>{isBuybackLoading ? 'Syncing...' : (lastUpdated ? `Last updated: ${lastUpdated}` : 'Refresh')}</span>
                </button>
              </div>
              
              <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xl hover:border-[var(--accent)]/30 transition-colors duration-500">
                <div className="relative w-full overflow-x-auto pb-2">
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
                                <th key={idx} className={`px-6 py-4 font-bold whitespace-nowrap bg-[var(--bg-surface)] text-[var(--text-muted)] align-bottom text-[10px] uppercase tracking-wider border border-[var(--border-primary)] ${col.className.includes('sticky') ? 'sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.1)]' : ''}`}>
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
                   <div className="relative w-full overflow-x-auto pb-2">
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
                                   <th key={idx} className={`px-6 py-4 font-bold whitespace-nowrap bg-[var(--bg-surface)] text-[var(--text-muted)] align-bottom text-[10px] uppercase tracking-wider border border-[var(--border-primary)] ${col.className.includes('sticky') ? 'sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.1)]' : ''}`}>
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
                <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-[var(--border-primary)] hover:border-[var(--accent)]/30 transition-all duration-300">
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-140px)] flex flex-col pb-12">
            {/* Header Section */}
            <div className="flex-shrink-0 mb-6 pt-2 md:pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2">Superstar Tracker</h1>
                        <div className="flex items-center gap-2">
                            <span className="bg-[var(--accent)] text-[var(--text-on-accent)] text-xs font-bold px-2 py-0.5 rounded animate-pulse">LIVE</span>
                            <p className="text-[var(--text-muted)] text-sm">Portfolio Dashboard</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pr-2 sm:pr-0 w-full sm:w-auto">
                        <button 
                            onClick={() => { setIsLeadModalOpen(true); setIsLeadSubmitted(false); }}
                            className="bg-[var(--bg-hover)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] px-4 py-2 rounded-lg text-sm font-medium border border-[var(--accent)] transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)] flex-1 sm:flex-initial justify-center hover:scale-105"
                        >
                            <UserPlus className="w-4 h-4 text-[var(--accent)]" />
                            Get DG Indicator
                        </button>
                        <button 
                            onClick={handleSuperstarInsightReport}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--text-dim)] rounded-lg text-sm font-medium transition-all group flex-1 sm:flex-initial hover:scale-105"
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 mb-8">
                {isSuperstarLoading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mb-4" />
                        <p className="text-[var(--text-muted)]">Loading...</p>
                    </div>
                ) : filteredSuperstarData.length === 0 ? (
                    <div className="text-center py-10 text-[var(--text-dim)]">No matches found.</div>
                ) : (
                    filteredSuperstarData.map((row, idx) => {
                        const investor = row["INVESTOR NAME"] || '-';
                        const stock = row["STOCK NAME"] || '-';
                        const holdingRaw = row["Latest Holding Percentage"];
                        const holding = holdingRaw !== null ? (parseFloat(holdingRaw.toString()) * 100).toFixed(2) : '-';
                        const portValue = row["Portfoilo Value (CR)"];
                        const allocation = parseFloat(row["% allocation"] as any);
                        const latestQtr = row["Latest Qtr Data"] ? formatDate(row["Latest Qtr Data"]) : '-';
                        
                        let allocColorClass = 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-secondary)]';
                        if (isDarkMode) {
                            if (allocation >= 10) allocColorClass = 'bg-[#D2F445]/20 text-[#D2F445] border-[#D2F445]/30'; 
                            else if (allocation >= 5) allocColorClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                            else if (allocation >= 2) allocColorClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
                        } else {
                            if (allocation >= 10) allocColorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                            else if (allocation >= 5) allocColorClass = 'bg-blue-100 text-blue-700 border-blue-200';
                            else if (allocation >= 2) allocColorClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
                        }

                        return (
                            <Card key={idx} className="p-4 border-[var(--border-secondary)]">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-[var(--text-main)] text-lg">{stock}</h3>
                                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
                                            <User className="w-3 h-3" /> {investor}
                                        </p>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold border ${allocColorClass}`}>
                                        {allocation}% Alloc
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-[var(--bg-surface)] p-2 rounded-lg">
                                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Portfolio Val</p>
                                        <p className="font-bold text-[var(--text-main)]">₹{formatNumber(portValue)} Cr</p>
                                    </div>
                                    <div className="bg-[var(--bg-surface)] p-2 rounded-lg">
                                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Holding %</p>
                                        <p className="font-bold text-[var(--text-main)]">{holding}</p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-[var(--border-secondary)] flex justify-between items-center">
                                    <span className="text-xs text-[var(--text-muted)]">Updated: {latestQtr}</span>
                                    <button 
                                        onClick={() => handleStockSpecificAi(stock, investor)}
                                        className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                                    >
                                        <Sparkles className="w-3 h-3" /> Insight
                                    </button>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-xl">
                 <div className="overflow-x-auto">
                    {isSuperstarLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
                            <p className="text-[var(--text-muted)]">Syncing institutional portfolios...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--bg-surface)] text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold border-b border-[var(--border-primary)]">
                                    {[
                                        { key: 'INVESTOR NAME', label: 'Investor' },
                                        { key: 'STOCK NAME', label: 'Stock' },
                                        { key: 'Latest Holding Percentage', label: 'Holding %' },
                                        { key: 'Portfoilo Value (CR)', label: 'Value (Cr)' },
                                        { key: 'Stake Value (CR)', label: 'Stake (Cr)' },
                                        { key: '% allocation', label: 'Allocation %' },
                                        { key: 'Latest Qtr Data', label: 'Latest Qtr' },
                                        { key: 'action', label: 'AI Insight' }
                                    ].map((col) => (
                                        <th 
                                            key={col.label} 
                                            className="px-6 py-4 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors group select-none"
                                            onClick={() => col.key !== 'action' && handleSuperstarSort(col.key as any)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {col.label}
                                                {col.key !== 'action' && superstarSortConfig.key === col.key && (
                                                    superstarSortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-[var(--accent)]" /> : <ChevronDown className="w-3 h-3 text-[var(--accent)]" />
                                                )}
                                                {col.key !== 'action' && superstarSortConfig.key !== col.key && (
                                                    <ArrowUpDown className="w-3 h-3 text-[var(--text-dim)] opacity-0 group-hover:opacity-50" />
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-primary)] text-sm">
                                {filteredSuperstarData.map((row, idx) => {
                                    const investor = row["INVESTOR NAME"] || '-';
                                    const stock = row["STOCK NAME"] || '-';
                                    const holdingRaw = row["Latest Holding Percentage"];
                                    const holding = holdingRaw !== null ? (parseFloat(holdingRaw.toString()) * 100).toFixed(2) + '%' : '-';
                                    const portValue = formatNumber(row["Portfoilo Value (CR)"]);
                                    const stakeValue = formatNumber(row["Stake Value (CR)"]);
                                    const allocation = parseFloat(row["% allocation"] as any);
                                    const latestQtr = row["Latest Qtr Data"] ? formatDate(row["Latest Qtr Data"]) : '-';

                                    // Allocation Color Logic (same as mobile)
                                    let allocStyle = "text-[var(--text-muted)]";
                                    if (allocation >= 10) allocStyle = "text-emerald-500 font-bold";
                                    else if (allocation >= 5) allocStyle = "text-blue-400 font-bold";
                                    else if (allocation >= 2) allocStyle = "text-yellow-400 font-bold";

                                    return (
                                        <tr key={idx} className="hover:bg-[var(--bg-hover)] transition-colors group">
                                            <td className="px-6 py-4 font-bold text-[var(--text-main)] flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[10px] text-[var(--text-muted)] font-bold border border-[var(--border-secondary)]">
                                                    {investor.charAt(0)}
                                                </div>
                                                {investor}
                                            </td>
                                            <td className="px-6 py-4 text-[var(--text-muted)]">{stock}</td>
                                            <td className="px-6 py-4 font-mono text-[var(--text-dim)]">{holding}</td>
                                            <td className="px-6 py-4 font-mono font-bold text-[var(--text-main)]">₹ {portValue}</td>
                                            <td className="px-6 py-4 font-mono text-[var(--text-muted)]">₹ {stakeValue}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${allocation >= 10 ? 'bg-emerald-500' : allocation >= 5 ? 'bg-blue-400' : 'bg-yellow-400'}`} 
                                                            style={{ width: `${Math.min(allocation * 2, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`text-xs ${allocStyle}`}>{allocation}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[var(--text-dim)]">{latestQtr}</td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => handleStockSpecificAi(stock, investor)}
                                                    className="p-2 hover:bg-[var(--bg-surface)] rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                                                    title="Get AI Analysis"
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                 </div>
            </div>

            {/* NEW FOOTERS */}
            <div className="mt-12 space-y-8">
                <SuperstarScreeningGuide />
                <DGAlphaInvestmentSeriesGuide />
            </div>
          </div>
        ) : activeTab === 'nifty-fii-prediction' ? (
           <NiftyPrediction onGetIndicatorClick={() => { setIsLeadModalOpen(true); setIsLeadSubmitted(false); }} />
        ) : activeTab === 'command-center' ? (
           <CommandCenter />
        ) : activeTab === 'careers' ? (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6 pb-12">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                   <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2 tracking-tight">Careers</h1>
                   <p className="text-[var(--text-muted)] text-lg">Join the team building the future of financial intelligence.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                 <Card className="p-6 border-t-4 border-t-[var(--accent)] hover:shadow-xl transition-all">
                     <div className="w-12 h-12 rounded-xl bg-[rgba(var(--accent-rgb),0.1)] flex items-center justify-center mb-4 text-[var(--accent)]">
                         <BrainCircuit className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">High Impact Work</h3>
                     <p className="text-[var(--text-muted)] text-sm leading-relaxed">Solve complex data challenges that directly influence investment decisions.</p>
                 </Card>
                 <Card className="p-6 border-t-4 border-t-blue-500 hover:shadow-xl transition-all">
                     <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500">
                         <Globe className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Remote-First</h3>
                     <p className="text-[var(--text-muted)] text-sm leading-relaxed">Work from anywhere in the world. We care about output, not your location.</p>
                 </Card>
                 <Card className="p-6 border-t-4 border-t-purple-500 hover:shadow-xl transition-all">
                     <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-500">
                         <Zap className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Meritocracy</h3>
                     <p className="text-[var(--text-muted)] text-sm leading-relaxed">Flat hierarchy. The best ideas win, regardless of who proposes them.</p>
                 </Card>
             </div>

             <h2 className="text-2xl font-bold text-[var(--text-main)] mb-6 flex items-center gap-2">
                 <Briefcase className="w-6 h-6 text-[var(--accent)]" />
                 Open Positions
             </h2>

             {/* Revised Job Card per Screenshot */}
             <div className="relative p-8 rounded-2xl bg-[var(--bg-card)] border border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.1)] overflow-hidden group">
               {/* Top Glow */}
               <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
               
               <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
                 <div>
                     <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] mb-3">Internship Software Developer and Market Enthusiast</h3>
                     <div className="flex flex-wrap items-center gap-3 text-sm">
                         <span className="px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-[var(--text-muted)] flex items-center gap-1.5">
                             <Clock className="w-3.5 h-3.5" /> Part-Time
                         </span>
                         <span className="px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-[var(--text-muted)] flex items-center gap-1.5">
                             <MapPin className="w-3.5 h-3.5" /> Remote
                         </span>
                         <span className="text-indigo-400 font-bold ml-2 text-base">Paid internship</span>
                     </div>
                 </div>
                 <button 
                     onClick={() => { setIsAppModalOpen(true); setIsAppSubmitted(false); }}
                     className="px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)] hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                 >
                     Apply Now <ChevronRight className="w-5 h-5" />
                 </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-[var(--border-secondary)] pt-8">
                   {/* Key Responsibilities */}
                   <div>
                       <h4 className="flex items-center gap-2 font-bold text-[var(--text-main)] mb-4 text-lg">
                           <Target className="w-5 h-5 text-[var(--accent)]" /> Key Responsibilities
                       </h4>
                       <ul className="space-y-3 text-[var(--text-muted)] leading-relaxed">
                           <li className="flex items-start gap-3">
                               <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-dim)] mt-2 shrink-0"></span>
                               Develop workflows using Opal/N8n.
                           </li>
                           <li className="flex items-start gap-3">
                               <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-dim)] mt-2 shrink-0"></span>
                               Integrate websites utilizing AI Studio.
                           </li>
                           <li className="flex items-start gap-3">
                               <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-dim)] mt-2 shrink-0"></span>
                               Conduct backtesting of trading strategies.
                           </li>
                           <li className="flex items-start gap-3">
                               <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-dim)] mt-2 shrink-0"></span>
                               Gain hands-on experience with Portfolio Management Systems (PMS).
                           </li>
                       </ul>
                   </div>

                   {/* Qualifications */}
                   <div>
                       <h4 className="flex items-center gap-2 font-bold text-[var(--text-main)] mb-4 text-lg">
                           <CheckCircle2 className="w-5 h-5 text-[var(--accent)]" /> Qualifications
                       </h4>
                       <ul className="space-y-3 text-[var(--text-muted)] leading-relaxed">
                           <li className="flex items-start gap-3">
                               <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-dim)] mt-2 shrink-0"></span>
                               Undergraduate or Graduate degree in Engineering.
                           </li>
                           <li className="flex items-start gap-3">
                               <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-dim)] mt-2 shrink-0"></span>
                               Familiarity with basic stock market concepts and Artificial Intelligence.
                           </li>
                       </ul>
                   </div>
               </div>
             </div>
           </div>
        ) : null}

        {/* --- MODALS --- */}
        
        {/* Report/Insight Modal */}
        <Modal 
            isOpen={isReportModalOpen} 
            onClose={() => setIsReportModalOpen(false)} 
            title={
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                    <span>DG Alpha Intelligence</span>
                </div>
            }
        >
            {isGeneratingReport ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
                    <p className="text-[var(--text-muted)] animate-pulse">Analyzing portfolio data...</p>
                </div>
            ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-muted)]">
                     <div className="whitespace-pre-wrap font-medium leading-relaxed">
                        {reportContent}
                     </div>
                </div>
            )}
        </Modal>

        {/* Case Study Modal */}
        <Modal isOpen={isCaseStudyModalOpen} onClose={() => setIsCaseStudyModalOpen(false)} title="Historical Performance Case Studies" maxWidth="max-w-4xl">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)] font-bold text-xs uppercase">
                      <tr>
                         <th className="px-4 py-3">Stock / Strategy</th>
                         <th className="px-4 py-3">Launch Date</th>
                         <th className="px-4 py-3 text-center">Trades</th>
                         <th className="px-4 py-3 text-right">Total ROI %</th>
                         <th className="px-4 py-3 text-right">Time (Yrs)</th>
                         <th className="px-4 py-3 text-right">Ann. ROI %</th>
                         <th className="px-4 py-3 text-right text-red-400">Max DD %</th>
                         <th className="px-4 py-3 text-right text-[var(--accent)]">ROI/DD Ratio</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[var(--border-primary)]">
                      {caseStudies.map((cs, i) => (
                         <tr key={i} className="hover:bg-[var(--bg-hover)] transition-colors">
                            <td className="px-4 py-3 font-bold text-[var(--text-main)]">{cs.counter}</td>
                            <td className="px-4 py-3 text-[var(--text-muted)]">{cs.launchedOn}</td>
                            <td className="px-4 py-3 text-center text-[var(--text-dim)]">{cs.trades}</td>
                            <td className="px-4 py-3 text-right font-bold text-green-500">{cs.roi}%</td>
                            <td className="px-4 py-3 text-right text-[var(--text-muted)]">{cs.time}</td>
                            <td className="px-4 py-3 text-right font-bold text-[var(--text-main)]">{cs.annualRoi}%</td>
                            <td className="px-4 py-3 text-right text-red-400 font-medium">{cs.maxDd}%</td>
                            <td className="px-4 py-3 text-right font-bold text-[var(--accent)]">{cs.rr}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
        </Modal>

        {/* Lead Form Modal */}
        <Modal 
          isOpen={isLeadModalOpen} 
          onClose={() => setIsLeadModalOpen(false)} 
          title="Get DG Alpha Indicator Access" 
          maxWidth="max-w-md"
        >
          {isLeadSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Request Received!</h3>
              <p className="text-[var(--text-muted)] mb-6">
                Our team will review your profile and contact you on <strong>{leadForm.phone}</strong> shortly to set up your indicator access.
              </p>
              <button 
                onClick={() => setIsLeadModalOpen(false)}
                className="w-full py-3 bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-[var(--text-main)] rounded-xl font-bold hover:bg-[var(--bg-hover)] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Full Name</label>
                  <input required type="text" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} 
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] outline-none" placeholder="Your Name" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">City</label>
                  <input required type="text" value={leadForm.city} onChange={e => setLeadForm({...leadForm, city: e.target.value})} 
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] outline-none" placeholder="City" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Age</label>
                    <input required type="number" value={leadForm.age} onChange={e => setLeadForm({...leadForm, age: e.target.value})} 
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] outline-none" placeholder="Age" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Portfolio Size</label>
                    <select value={leadForm.portfolio} onChange={e => setLeadForm({...leadForm, portfolio: e.target.value})}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] outline-none">
                       <option>Above 1 Lakh</option>
                       <option>Above 5 Lakhs</option>
                       <option>Above 10 Lakhs</option>
                       <option>Above 50 Lakhs</option>
                    </select>
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Phone Number (WhatsApp)</label>
                  <input required type="tel" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} 
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] outline-none" placeholder="+91 XXXXX XXXXX" />
               </div>
               <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3 mt-2 bg-[var(--accent)] text-[var(--text-on-accent)] font-bold rounded-xl hover:bg-[var(--accent-hover)] transition-all shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Access'}
               </button>
            </form>
          )}
        </Modal>

        {/* Application Form Modal */}
        <Modal 
          isOpen={isAppModalOpen} 
          onClose={() => setIsAppModalOpen(false)} 
          title="Apply for Internship" 
          maxWidth="max-w-md"
        >
          {isAppSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Application Received!</h3>
              <p className="text-[var(--text-muted)] mb-6">
                Thank you for applying. We will review your profile and get back to you shortly.
              </p>
              <button 
                onClick={() => setIsAppModalOpen(false)}
                className="w-full py-3 bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-[var(--text-main)] rounded-xl font-bold hover:bg-[var(--bg-hover)] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleAppSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Full Name</label>
                  <input required type="text" value={appForm.name} onChange={e => setAppForm({...appForm, name: e.target.value})} 
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] outline-none" placeholder="Your Name" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">College / University</label>
                  <input required type="text" value={appForm.college} onChange={e => setAppForm({...appForm, college: e.target.value})} 
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] outline-none" placeholder="University Name" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Age</label>
                    <input required type="number" value={appForm.age} onChange={e => setAppForm({...appForm, age: e.target.value})} 
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] outline-none" placeholder="Age" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Phone Number</label>
                    <input required type="tel" value={appForm.phone} onChange={e => setAppForm({...appForm, phone: e.target.value})} 
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] outline-none" placeholder="+91..." />
                  </div>
               </div>
               
               <button 
                  type="submit" 
                  disabled={isAppSubmitting}
                  className="w-full py-3 mt-4 bg-[var(--accent)] text-[var(--text-on-accent)] font-bold rounded-xl hover:bg-[var(--accent-hover)] transition-all shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                  {isAppSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
               </button>
            </form>
          )}
        </Modal>

        {/* Floating Chat Button (Bottom Right) */}
        {!isChatOpen && (
           <button 
             onClick={() => setIsChatOpen(true)}
             className="fixed bottom-20 md:bottom-6 right-6 w-14 h-14 bg-[var(--accent)] rounded-full shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)] flex items-center justify-center hover:scale-110 transition-transform z-40 animate-bounce-slow"
           >
             <MessageSquare className="w-7 h-7 text-[var(--text-on-accent)] fill-current" />
           </button>
        )}

        {/* Chat Window */}
        {isChatOpen && (
            <div className="fixed bottom-20 md:bottom-6 right-6 w-[90vw] md:w-[350px] h-[500px] bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                <div className="bg-[var(--accent)] p-4 flex justify-between items-center text-[var(--text-on-accent)]">
                    <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5" />
                        <span className="font-bold">DG Alpha AI</span>
                    </div>
                    <button onClick={() => setIsChatOpen(false)} className="hover:bg-black/10 p-1 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[var(--bg-surface)]">
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-[var(--accent)] text-[var(--text-on-accent)] rounded-tr-none' : 'bg-[var(--bg-card)] border border-[var(--border-secondary)] text-[var(--text-main)] rounded-tl-none shadow-sm'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                            <div className="bg-[var(--bg-card)] border border-[var(--border-secondary)] p-3 rounded-xl rounded-tl-none">
                                <Loader2 className="w-4 h-4 text-[var(--accent)] animate-spin" />
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleChatSubmit} className="p-3 bg-[var(--bg-card)] border-t border-[var(--border-primary)] flex gap-2">
                    <input 
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        placeholder="Ask about Neuland..." 
                        className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-secondary)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                    />
                    <button type="submit" disabled={!chatQuery.trim() || isChatLoading} className="p-2 bg-[var(--accent)] rounded-lg text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors">
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        )}
      </main>
    </div>
  );
}

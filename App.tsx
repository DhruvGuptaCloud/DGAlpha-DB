import React, { useState, useMemo } from 'react';
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
  Search, 
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
  User
} from 'lucide-react';
import { generateAnalysis } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { ResponsiveAreaChart, ResponsiveBarChart } from './components/Charts';

// --- UI Components ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-[#111111] border border-[#222] rounded-2xl p-4 sm:p-6 relative overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; type?: "success" | "danger" | "neutral"; className?: string }> = ({ children, type = "success", className = "" }) => {
  const styles = {
    success: "text-[#D2F445] bg-[#D2F445]/10",
    danger: "text-red-400 bg-red-400/10",
    neutral: "text-gray-400 bg-gray-400/10"
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[type]} ${className}`}>
      {children}
    </span>
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
        ? 'text-[#D2F445] bg-[#1a1a1a] border-r-2 border-[#D2F445]' 
        : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-[#D2F445] border-r-2 border-transparent'
    }`}
  >
    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${isActive ? 'text-[#D2F445]' : ''}`} />
    <span className={`hidden md:block ml-3 font-medium text-sm tracking-wide text-left ${isActive ? 'text-white' : ''}`}>
      {label}
    </span>
    {/* Tooltip for mobile */}
    <div className="md:hidden absolute left-14 top-1/2 -translate-y-1/2 bg-[#222] text-white text-xs px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-[#333] shadow-xl">
      {label}
    </div>
  </button>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'dg-alpha' | 'buyback-game' | 'superstar-tracker'>('dg-alpha');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'executive' | 'trade'>('executive'); 
  const [reportContent, setReportContent] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D2F445] selection:text-black flex">
      
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full bg-[#111] border-r border-[#222] w-16 md:w-64 transition-all duration-300 z-40 flex flex-col">
         {/* Logo Header */}
         <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-[#222]">
            <div className="w-8 h-8 bg-[#D2F445] rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(210,244,69,0.2)]">
               <Activity className="text-black w-5 h-5" />
            </div>
            <span className="hidden md:block ml-3 font-bold text-lg tracking-tight text-white truncate">Dhruv Gupta <span className="text-[#D2F445]">| NCT</span></span>
         </div>

         {/* Menu Items */}
         <div className="flex-1 py-4 space-y-1">
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
         </div>

         {/* Footer Items */}
         <div className="pb-4 border-t border-[#222] pt-2">
            <SidebarItem icon={LogOut} label="Sign Out" />
         </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 ml-16 md:ml-64 p-4 sm:p-6 lg:p-8 pt-6 relative">
        
        {activeTab === 'dg-alpha' ? (
          <>
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Neuland Laboratories</h1>
                <div className="flex items-center gap-3">
                   <span className="px-2 py-0.5 rounded bg-[#D2F445]/20 text-[#D2F445] text-xs font-bold border border-[#D2F445]/30">LIVE</span>
                   <span className="text-gray-400 text-sm">Portfolio Dashboard</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <button 
                    onClick={() => { setIsLeadModalOpen(true); setIsLeadSubmitted(false); }}
                    className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg text-sm font-medium border border-[#D2F445] transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(210,244,69,0.1)]"
                  >
                    <UserPlus className="w-4 h-4 text-[#D2F445]" />
                    Get DG Indicator
                </button>
                 <button 
                  onClick={handleGenerateReport}
                  className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 py-2 rounded-lg text-sm font-medium border border-[#333] transition-colors flex items-center gap-2 group"
                >
                  <Sparkles className="w-4 h-4 text-[#D2F445] group-hover:rotate-12 transition-transform" />
                  AI Insight Report
                </button>
              </div>
            </div>

            {/* Journey Highlight Widget */}
            <div className="w-full bg-[#111] border border-[#333] rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl shadow-[#D2F445]/5 relative overflow-hidden group">
               {/* Decorative background element */}
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D2F445]/5 rounded-full blur-3xl pointer-events-none"></div>
               
               <div className="relative z-10">
                 <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                    <div className="hidden sm:flex w-14 h-14 rounded-xl bg-[#D2F445] items-center justify-center shrink-0 shadow-[0_0_20px_rgba(210,244,69,0.3)]">
                       <TrendingUp className="w-8 h-8 text-black" />
                    </div>
                    <div>
                       <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight tracking-tight mb-2">
                          I started with <span className="text-[#D2F445] font-black font-mono text-3xl sm:text-4xl">₹3 lakhs</span> and grew it to <span className="text-[#D2F445] font-black font-mono text-3xl sm:text-4xl">₹54.76 lakhs</span>, turning my money into <span className="text-[#D2F445] font-black font-mono text-3xl sm:text-4xl">18.25x without any Risk</span>
                       </h2>
                    </div>
                 </div>

                 <div className="bg-[#1a1a1a]/50 rounded-xl p-6 border border-[#333] backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-[#333] pb-3">
                      <Sparkles className="w-5 h-5 text-[#D2F445]" />
                      The "Math" Behind Your Success
                    </h3>
                    
                    <div className="space-y-4 font-light text-gray-300">
                       <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 rounded-lg bg-black/40 border border-[#333] hover:border-red-500/30 transition-colors">
                          <span className="font-bold text-white min-w-[220px] text-lg">Scenario A (Buy & Hold):</span>
                          <span className="text-base leading-relaxed">
                            Invest <span className="font-bold text-white font-mono">₹3L</span>. Stock goes <span className="font-bold text-white font-mono">18x</span>. Portfolio = <span className="font-bold text-white font-mono">₹91.4L</span>. Capital at risk = <span className="font-bold text-red-400 font-mono">₹3L</span>.
                          </span>
                       </div>

                       <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 rounded-lg bg-[#D2F445]/5 border border-[#D2F445]/20 hover:bg-[#D2F445]/10 transition-colors shadow-[0_0_15px_rgba(210,244,69,0.05)]">
                          <span className="font-bold text-[#D2F445] min-w-[220px] text-lg">Scenario B (My Strategy):</span>
                          <span className="text-base leading-relaxed">
                            Invest <span className="font-bold text-[#D2F445] font-mono">₹3L</span>. Stock doubles → Withdraw <span className="font-bold text-[#D2F445] font-mono">₹3L</span>. Stock goes <span className="font-bold text-[#D2F445] font-mono">18x</span> (on remaining half). <br className="hidden sm:block" />
                            Portfolio = <span className="font-bold text-[#D2F445] font-mono">₹54L</span> + <span className="font-bold text-[#D2F445] font-mono">₹8L</span> (Cash) + New Gains from re-invested cash.
                          </span>
                       </div>
                       
                       <div className="mt-6 pt-2 text-base sm:text-lg italic text-gray-400 pl-6 border-l-4 border-[#D2F445] leading-relaxed">
                          "In Scenario B, your mental stress is zero, allowing you to actually hold for the <span className="text-[#D2F445] font-bold not-italic font-mono">18x</span> run. In Scenario A, most people sell at <span className="text-red-400 font-bold not-italic font-mono">2x</span> out of fear of losing profits."
                       </div>
                    </div>
                 </div>
               </div>
            </div>

            {/* Hero Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
              <Card className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#111] to-[#161616]">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="p-2 bg-[#D2F445]/10 rounded-lg">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-[#D2F445]" />
                  </div>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Total Free Holding Value</p>
                <h2 className="text-lg sm:text-2xl font-bold text-white mt-1">₹ {(investmentMetrics.totalValueFree / 100000).toFixed(2)} L</h2>
                <div className="mt-4 h-1 w-full bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-[#D2F445] w-[85%]"></div>
                </div>
              </Card>

              <Card>
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  </div>
                  <Badge type="success">High Perf</Badge>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Total ROI</p>
                <h2 className="text-lg sm:text-2xl font-bold text-white mt-1">{investmentMetrics.roi}</h2>
                <p className="text-xs text-gray-500 mt-2">Over {investmentMetrics.time}</p>
              </Card>

              <Card>
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  </div>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Annualised Yield</p>
                <h2 className="text-lg sm:text-2xl font-bold text-white mt-1">{investmentMetrics.annualizedYield}</h2>
                <p className="text-xs text-gray-500 mt-2">Annual ROI/Max DD : {investmentMetrics.ratio}</p>
              </Card>

              <Card>
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  </div>
                  <Badge type="danger">Risk Low</Badge>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Max Drawdown</p>
                <h2 className="text-lg sm:text-2xl font-bold text-white mt-1">{investmentMetrics.maxDD}</h2>
                <p className="text-xs text-gray-500 mt-2">Historical Max</p>
              </Card>

              <Card>
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  </div>
                  <Badge type="neutral">Passive</Badge>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Dividend Income</p>
                <h2 className="text-lg sm:text-2xl font-bold text-white mt-1">₹ {investmentMetrics.dividendsCashflow.toLocaleString()}</h2>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="text-purple-400 font-bold">{((investmentMetrics.dividendsCashflow / 300000) * 100).toFixed(2)}%</span> of Invested (3L)
                </p>
              </Card>
            </div>

            {/* Analytics Widgets Section */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <Card className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-[#D2F445]" />
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
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#D2F445]" />
                      Trade-wise Profit
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#222] rounded-full border border-[#333]">
                       <Target className="w-3 h-3 text-[#D2F445]" />
                       <span className="text-xs text-gray-300">Accuracy: <span className="text-white font-bold">{accuracy.wins}/{accuracy.total}</span> ({accuracy.percent}%)</span>
                    </div>
                    <button 
                      onClick={handleTradeAnalysis}
                      className="p-1.5 rounded-lg bg-[#222] hover:bg-[#333] border border-[#333] transition-colors group flex items-center gap-1.5 px-3"
                      title="Analyze Trading Patterns"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-[#D2F445] group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-medium text-gray-300 group-hover:text-white">Analyze Patterns</span>
                    </button>
                  </div>
                  
                  <div className="flex gap-2 text-xs">
                     <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#D2F445]"></div>
                        <span className="text-gray-400">Profit</span>
                     </div>
                     <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                        <span className="text-gray-400">Loss</span>
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
                <Card className="border-[#333]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#D2F445]" />
                      Core Investment Metrics
                    </h3>
                  </div>
                  
                  <div className="overflow-hidden rounded-xl border border-[#222]">
                    <table className="w-full text-sm text-left">
                      <tbody className="divide-y divide-[#222]">
                        {[
                          { label: "Free Stocks Accumulated", value: investmentMetrics.totalQtyFree, sub: "Qty" },
                          { label: "Market Value of Retained Shares", value: `₹ ${investmentMetrics.marketValueRetained.toLocaleString()}`, sub: "Current" },
                          { label: "Dividends & Cashflow", value: `₹ ${investmentMetrics.dividendsCashflow.toLocaleString()}`, sub: "Realized" },
                          { label: "Max Amount Invested", value: investmentMetrics.maxInvested, sub: "Capital" },
                          { label: "Investment Duration", value: investmentMetrics.time, sub: "Years" },
                          { label: "Annual ROI / Max DD Ratio", value: investmentMetrics.ratio, sub: "Efficiency" },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#1a1a1a] transition-colors group">
                            <td className="px-3 sm:px-4 py-4 text-gray-400 font-medium">{row.label}</td>
                            <td className="px-3 sm:px-4 py-4 text-right">
                              <div className="font-bold text-white">{row.value}</div>
                              <div className="text-xs text-gray-600 group-hover:text-[#D2F445] transition-colors">{row.sub}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card className="overflow-x-auto">
                   <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#D2F445]" />
                      Profit & Loss Analysis
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
                      <thead className="bg-[#1a1a1a] text-gray-400 font-medium">
                        <tr>
                          <th className="px-3 sm:px-4 py-3 rounded-l-lg">Entry Date</th>
                          <th className="px-3 sm:px-4 py-3">Entry Price</th>
                          <th className="px-3 sm:px-4 py-3">Qty</th>
                          <th className="px-3 sm:px-4 py-3">Doubled On</th>
                          <th className="px-3 sm:px-4 py-3 text-[#D2F445]">Free Qty</th>
                          <th className="px-3 sm:px-4 py-3 text-right">Current Val</th>
                          <th className="px-3 sm:px-4 py-3 rounded-r-lg">Invested Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222]">
                        {pnlData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#1a1a1a] transition-colors">
                            <td className="px-3 sm:px-4 py-3 text-gray-300">{row.date}</td>
                            <td className="px-3 sm:px-4 py-3 text-gray-300">₹ {row.entry}</td>
                            <td className="px-3 sm:px-4 py-3 text-gray-500">{row.qty}</td>
                            <td className="px-3 sm:px-4 py-3 text-gray-300">
                              {row.doubleDate} <span className="text-xs text-gray-600">(@ {row.doublePrice})</span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 font-bold text-[#D2F445]">{row.freeQty}</td>
                            <td className="px-3 sm:px-4 py-3 text-right text-white font-medium">₹ {row.currVal.toLocaleString()}</td>
                            <td className="px-3 sm:px-4 py-3 text-gray-400">{row.time}</td>
                          </tr>
                        ))}
                        <tr className="bg-[#D2F445]/5 border-t border-[#D2F445]/20 font-bold">
                          <td className="px-3 sm:px-4 py-4 text-white">Total</td>
                          <td className="px-3 sm:px-4 py-4"></td>
                          <td className="px-3 sm:px-4 py-4 text-white">{pnlData.reduce((acc, curr) => acc + curr.qty, 0)}</td>
                          <td className="px-3 sm:px-4 py-4"></td>
                          <td className="px-3 sm:px-4 py-4 text-[#D2F445]">{pnlData.reduce((acc, curr) => acc + curr.freeQty, 0)}</td>
                          <td className="px-3 sm:px-4 py-4 text-right text-[#D2F445]">₹ {pnlData.reduce((acc, curr) => acc + curr.currVal, 0).toLocaleString()}</td>
                          <td className="px-3 sm:px-4 py-4"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-[#D2F445]/20 to-black border-[#D2F445]/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D2F445] flex items-center justify-center shrink-0">
                      <span className="text-black font-bold">VK</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Vijay Kedia Position</h4>
                      <p className="text-xs text-gray-400 mt-1">Institutional Tracking</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                     <div className="bg-black/40 p-2 rounded">
                        <div className="text-[10px] text-gray-400">Wealth Multiplier</div>
                        <div className="text-lg font-bold text-[#D2F445]">17.5x</div>
                     </div>
                     <div className="bg-black/40 p-2 rounded">
                        <div className="text-[10px] text-gray-400">Gain %</div>
                        <div className="text-lg font-bold text-white">1747.5%</div>
                     </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div>
                       <div className="text-[10px] text-gray-500">Initial Value</div>
                       <div className="text-sm font-bold text-white">₹ 11.9 Cr</div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] text-gray-500">Current Value</div>
                       <div className="text-sm font-bold text-[#D2F445]">₹ 219.86 Cr</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="bg-[#161616]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Dividends</h3>
                    <span className="text-xs text-gray-500">2020 - 2025</span>
                  </div>
                  <div className="flex items-end justify-between h-48 gap-2">
                    {dividends.map((div, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 w-full group cursor-pointer">
                        <div className="relative w-full flex justify-center">
                           <div 
                            className="w-full bg-[#333] hover:bg-[#D2F445] rounded-t-sm transition-all duration-300 relative group-hover:shadow-[0_0_15px_rgba(210,244,69,0.3)]"
                            style={{ height: `${(div.amount / 15) * 100}px` }}
                          ></div>
                          <span className="absolute -top-8 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">₹{div.amount}</span>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{div.year}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-white mb-4">Cashflow Impact</h3>
                  <div className="space-y-4">
                    {cashflowData.map((cf, idx) => (
                      <div key={idx} className="bg-[#0f0f0f] p-3 rounded-lg border border-[#222] flex justify-between items-center">
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">
                            <span className="text-gray-500">Entry:</span> {cf.entry} <span className="mx-1 text-gray-600">→</span> <span className="text-gray-500">Exit:</span> {cf.exit}
                          </div>
                          <div className="text-sm font-medium text-white">Qty: {cf.qty}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-red-500 font-bold text-sm">₹ {cf.flow}</div>
                           <div className="text-[10px] text-gray-600">{cf.time}</div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-[#222] flex justify-between items-center">
                        <span className="text-sm text-gray-400">Total Negative Cashflow</span>
                        <span className="text-red-500 font-bold">₹ -29,964</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-[#222]">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-3">Why You Should Use This System</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  A complete ecosystem designed to replace guesswork with precision and transform your investing journey.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {whyUseSystem.map((item, idx) => (
                  <Card key={idx} className="bg-[#111] hover:bg-[#161616] transition-colors group border-[#222] hover:border-[#D2F445]/30">
                    <div className="mb-4 p-3 rounded-xl bg-[#222] w-fit text-gray-400 group-hover:text-[#D2F445] group-hover:bg-[#D2F445]/10 transition-colors">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-white mb-2 leading-tight">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : activeTab === 'buyback-game' ? (
          <div className="flex flex-col items-center justify-center h-[80vh] text-center">
             <div className="p-6 bg-[#111] rounded-full mb-6 border border-[#222] shadow-[0_0_30px_rgba(210,244,69,0.1)] animate-in zoom-in duration-500">
               <Gamepad2 className="w-16 h-16 text-[#D2F445]" />
             </div>
             <h2 className="text-3xl font-bold text-white mb-2">Buyback Game</h2>
             <p className="text-gray-400 max-w-md">
               This feature is currently under development. Check back soon for exciting gameplay!
             </p>
          </div>
        ) : activeTab === 'superstar-tracker' ? (
          <div className="flex flex-col items-center justify-center h-[80vh] text-center">
             <div className="p-6 bg-[#111] rounded-full mb-6 border border-[#222] shadow-[0_0_30px_rgba(210,244,69,0.1)] animate-in zoom-in duration-500">
               <User className="w-16 h-16 text-[#D2F445]" />
             </div>
             <h2 className="text-3xl font-bold text-white mb-2">Superstar Tracker</h2>
             <p className="text-gray-400 max-w-md">
               Track top investors and their portfolios. Coming soon!
             </p>
          </div>
        ) : null}

        {/* AI Report Modal */}
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsReportModalOpen(false)}></div>
            <div className="relative bg-[#111] border border-[#333] w-full max-w-2xl rounded-2xl p-6 shadow-2xl shadow-[#D2F445]/10">
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 mb-6 border-b border-[#222] pb-4">
                <Sparkles className="w-6 h-6 text-[#D2F445]" />
                <h2 className="text-xl font-bold text-white">
                    {reportType === 'executive' ? 'Executive Performance Summary' : 'AI Trade Pattern Analysis'}
                </h2>
              </div>
              
              <div className="min-h-[300px] text-gray-300 leading-relaxed whitespace-pre-wrap font-light">
                {isGeneratingReport ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D2F445]" />
                    <p>{reportType === 'executive' ? 'Analyzing P&L structure...' : 'Evaluating win/loss patterns...'}</p>
                  </div>
                ) : (
                  reportContent
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lead Capture Modal */}
        {isLeadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsLeadModalOpen(false)}></div>
            <div className="relative bg-[#111] border border-[#D2F445]/30 w-full max-w-md rounded-2xl p-8 shadow-2xl shadow-[#D2F445]/10">
              <button 
                onClick={() => setIsLeadModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {!isLeadSubmitted ? (
                <>
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-full bg-[#D2F445]/10 flex items-center justify-center mb-4">
                      <UserPlus className="w-6 h-6 text-[#D2F445]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Get DG Indicator</h2>
                    <p className="text-gray-400 text-sm">Please fill in your details to access the exclusive indicator. Our team will contact you shortly.</p>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D2F445] transition-colors"
                        placeholder="Rahul Sharma"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">City</label>
                        <input 
                          required
                          type="text" 
                          value={leadForm.city}
                          onChange={(e) => setLeadForm({...leadForm, city: e.target.value})}
                          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D2F445] transition-colors"
                          placeholder="Mumbai"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Age</label>
                        <input 
                          required
                          type="number" 
                          min="18"
                          max="100"
                          value={leadForm.age}
                          onChange={(e) => setLeadForm({...leadForm, age: e.target.value})}
                          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D2F445] transition-colors"
                          placeholder="30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Portfolio Size</label>
                      <select 
                        value={leadForm.portfolio}
                        onChange={(e) => setLeadForm({...leadForm, portfolio: e.target.value})}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D2F445] transition-colors"
                      >
                        <option>Above 1 Lakh</option>
                        <option>1L - 10L</option>
                        <option>10L - 1 Cr</option>
                        <option>Above 1 Cr</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Phone Number</label>
                      <input 
                        required
                        type="tel" 
                        value={leadForm.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setLeadForm({...leadForm, phone: val});
                        }}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D2F445] transition-colors"
                        placeholder="9876543210"
                        maxLength={10}
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#D2F445] hover:bg-[#c2e33d] text-black font-bold py-3 rounded-lg transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-[#D2F445]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-[#D2F445]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Request Received!</h3>
                  <p className="text-gray-400">Thank you for your interest. We will contact you shortly regarding your query.</p>
                  <button 
                    onClick={() => setIsLeadModalOpen(false)}
                    className="mt-8 text-[#D2F445] hover:text-white text-sm font-medium transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Chat Button (Refactored for mobile responsiveness) */}
        <div className={`fixed z-50 transition-all duration-300 ${isChatOpen ? 'bottom-0 right-0 left-0 sm:bottom-6 sm:right-6 sm:left-auto' : 'bottom-6 right-6'}`}>
           {!isChatOpen ? (
             <button 
               onClick={() => setIsChatOpen(true)}
               className="bg-[#D2F445] hover:bg-[#c2e33d] text-black w-14 h-14 rounded-full shadow-lg shadow-[#D2F445]/20 flex items-center justify-center transition-all hover:scale-105"
             >
               <MessageSquare className="w-6 h-6" />
             </button>
           ) : (
             <div className="bg-[#111] border-t sm:border border-[#222] sm:rounded-2xl w-full sm:w-96 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 h-[70vh] sm:h-[500px]">
                {/* Chat Header */}
                <div className="bg-[#1a1a1a] p-4 flex items-center justify-between border-b border-[#222]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#D2F445] animate-pulse"></div>
                    <h3 className="font-bold text-sm">DG Alpha Assistant</h3>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50">
                   {chatHistory.map((msg, i) => (
                     <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-xl p-3 text-sm ${
                          msg.role === 'user' 
                            ? 'bg-[#333] text-white rounded-tr-none' 
                            : 'bg-[#D2F445]/10 text-gray-200 border border-[#D2F445]/20 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                     </div>
                   ))}
                   {isChatLoading && (
                     <div className="flex justify-start">
                        <div className="bg-[#D2F445]/10 p-3 rounded-xl rounded-tl-none">
                           <Loader2 className="w-4 h-4 animate-spin text-[#D2F445]" />
                        </div>
                     </div>
                   )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleChatSubmit} className="p-3 bg-[#1a1a1a] border-t border-[#222] flex gap-2 pb-safe-area">
                  <input 
                    type="text" 
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    placeholder="Ask about your returns..."
                    className="flex-1 bg-black border border-[#333] rounded-lg px-3 py-3 text-base sm:text-sm text-white focus:outline-none focus:border-[#D2F445] placeholder:text-gray-600"
                  />
                  <button 
                    type="submit"
                    disabled={isChatLoading || !chatQuery.trim()}
                    className="bg-[#D2F445] text-black p-3 rounded-lg hover:bg-[#c2e33d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
             </div>
           )}
        </div>

      </main>
    </div>
  );
}
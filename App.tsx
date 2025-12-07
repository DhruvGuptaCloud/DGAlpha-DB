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
  Bell, 
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
  CheckCircle2
} from 'lucide-react';
import { generateAnalysis } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { ResponsiveAreaChart, ResponsiveBarChart } from './components/Charts';

// --- UI Components ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-[#001219]/60 backdrop-blur-md border border-[#00A6FB]/20 rounded-2xl p-4 sm:p-6 relative overflow-hidden transition-all hover:border-[#00A6FB]/40 ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; type?: "success" | "danger" | "neutral" }> = ({ children, type = "success" }) => {
  const styles = {
    success: "text-[#9EF01A] bg-[#9EF01A]/10 border border-[#9EF01A]/20",
    danger: "text-red-400 bg-red-400/10 border border-red-400/20",
    neutral: "text-[#00A6FB] bg-[#00A6FB]/10 border border-[#00A6FB]/20"
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[type]}`}>
      {children}
    </span>
  );
};

export default function App() {
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
    { entry: 555, date: 'Jul-20', qty: 181, doubleDate: 'Sep-20', doublePrice: 1110, freeQty: 90.5, currVal: 1530536, time: '3 Months' },
    { entry: 821, date: 'Aug-20', qty: 122, doubleDate: 'Feb-21', doublePrice: 1642, freeQty: 61, currVal: 1031632, time: '6 Months' },
    { entry: 1356, date: 'Feb-21', qty: 74, doubleDate: 'May-21', doublePrice: 2712, freeQty: 37, currVal: 625744, time: '4 Months' },
    { entry: 1384, date: 'Sep-22', qty: 73, doubleDate: 'May-23', doublePrice: 2768, freeQty: 36.5, currVal: 617288, time: '8 Months' },
    { entry: 1617, date: 'Feb-23', qty: 62, doubleDate: 'Jul-23', doublePrice: 3234, freeQty: 31, currVal: 524272, time: '3 Months' },
    { entry: 1682, date: 'Mar-23', qty: 60, doubleDate: 'Jul-23', doublePrice: 3364, freeQty: 30, currVal: 507360, time: '5 Months' },
    { entry: 2078, date: 'Apr-23', qty: 49, doubleDate: 'Aug-23', doublePrice: 4156, freeQty: 24.5, currVal: 414344, time: '4 Months' },
    { entry: 4058, date: 'Oct-23', qty: 25, doubleDate: 'Jul-24', doublePrice: 8116, freeQty: 12.5, currVal: 211400, time: '9 Months' },
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
      title: "3. No Emotional Bias—Pure Data & Logic", 
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#003554] via-[#020617] to-black text-white font-sans selection:bg-[#9EF01A] selection:text-[#003554] pb-24 relative">
      {/* Top Navigation Bar */}
      <nav className="border-b border-white/5 bg-[#001219]/40 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#9EF01A] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(158,240,26,0.3)]">
                  <Activity className="text-[#003554] w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight hidden sm:inline text-white">DG<span className="text-[#9EF01A]">Alpha</span></span>
                <span className="font-bold text-xl tracking-tight sm:hidden text-white">DG<span className="text-[#9EF01A]">A</span></span>
              </div>
              
              <div className="hidden md:flex items-center gap-4">
                 <div className="h-5 w-px bg-[#00A6FB]/20"></div>
                 <span className="text-[#00A6FB] text-[10px] font-bold tracking-[0.2em] uppercase opacity-90">
                  PROCESS DRIVES PERFORMANCE
                 </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => { setIsLeadModalOpen(true); setIsLeadSubmitted(false); }}
                className="flex bg-[#9EF01A] hover:bg-[#8ade16] text-[#003554] px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-[#9EF01A] transition-all hover:shadow-[0_0_20px_rgba(158,240,26,0.4)] items-center gap-2"
              >
                <UserPlus className="w-3 h-3 text-[#003554]" />
                <span className="hidden sm:inline">I want DG Indicator</span>
                <span className="sm:hidden">Get Access</span>
              </button>

              <div className="hidden sm:flex bg-[#001524] border border-[#00A6FB]/20 rounded-full px-4 py-1.5 items-center gap-2 text-sm text-gray-400 focus-within:border-[#00A6FB] transition-colors">
                <Search className="w-4 h-4 text-[#00A6FB]" />
                <input type="text" placeholder="Search ticker..." className="bg-transparent border-none outline-none w-24 placeholder:text-gray-600 text-white" />
              </div>
              <button className="p-2 text-[#00A6FB] hover:text-[#9EF01A] transition-colors"><Bell className="w-5 h-5" /></button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9EF01A] to-[#00A6FB] ring-2 ring-[#001524]"></div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Neuland Laboratories</h1>
            <p className="text-gray-400 flex items-center gap-2 text-sm">
              <span className="bg-[#00A6FB]/10 text-[#00A6FB] px-2 py-0.5 rounded text-xs border border-[#00A6FB]/20 font-medium">PHARMA</span>
              <span className="text-[#94a3b8]">System:</span> <span className="text-white">DG Alpha v2.0</span>
            </p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={handleGenerateReport}
              className="bg-[#001524] hover:bg-[#003554] text-[#00A6FB] px-4 py-2 rounded-lg text-sm font-medium border border-[#00A6FB]/30 transition-all flex items-center gap-2 group w-full sm:w-auto justify-center hover:border-[#00A6FB]"
            >
              <Sparkles className="w-4 h-4 text-[#9EF01A] group-hover:rotate-12 transition-transform" />
              AI Insight Report
            </button>
          </div>
        </div>

        {/* Hero Stats Cards */}
        {/* Optimized for Mobile: 2 columns instead of 1 stack */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="col-span-2 lg:col-span-1 bg-gradient-to-br from-[#003554] to-[#001524] border-[#00A6FB]/30">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#9EF01A]/10 rounded-lg">
                <Wallet className="w-5 h-5 text-[#9EF01A]" />
              </div>
            </div>
            <p className="text-[#94a3b8] text-sm font-medium">Total Free Holding Value</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">₹ {(investmentMetrics.totalValueFree / 100000).toFixed(2)} L</h2>
            <div className="mt-4 h-1 w-full bg-[#001524] rounded-full overflow-hidden">
              <div className="h-full bg-[#9EF01A] w-[85%] shadow-[0_0_10px_rgba(158,240,26,0.5)]"></div>
            </div>
          </Card>

          <Card className="col-span-1">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#9EF01A]/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#9EF01A]" />
              </div>
              <Badge type="success">High</Badge>
            </div>
            <p className="text-[#94a3b8] text-xs sm:text-sm font-medium">Total ROI</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{investmentMetrics.roi}</h2>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-2">Over {investmentMetrics.time}</p>
          </Card>

          <Card className="col-span-1">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#00A6FB]/10 rounded-lg">
                <PieChart className="w-5 h-5 text-[#00A6FB]" />
              </div>
            </div>
            <p className="text-[#94a3b8] text-xs sm:text-sm font-medium">Yield (Ann.)</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{investmentMetrics.annualizedYield}</h2>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-2">Ratio: {investmentMetrics.ratio}</p>
          </Card>

          <Card className="col-span-1">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-red-500" />
              </div>
              <Badge type="danger">Low</Badge>
            </div>
            <p className="text-[#94a3b8] text-xs sm:text-sm font-medium">Max Drawdown</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{investmentMetrics.maxDD}</h2>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-2">Historical Max</p>
          </Card>

          <Card className="col-span-1">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#00A6FB]/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-[#00A6FB]" />
              </div>
              <Badge type="neutral">Passive</Badge>
            </div>
            <p className="text-[#94a3b8] text-xs sm:text-sm font-medium">Dividend Inc.</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">₹ {(investmentMetrics.dividendsCashflow/1000).toFixed(1)}k</h2>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
              <span className="text-[#00A6FB] font-bold">{((investmentMetrics.dividendsCashflow / 300000) * 100).toFixed(2)}%</span> of Inv.
            </p>
          </Card>
        </div>

        {/* Analytics Widgets Section */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <LineChart className="w-5 h-5 text-[#9EF01A]" />
                Total Account Value Growth
              </h3>
            </div>
            <div className="w-full">
               <ResponsiveAreaChart data={growthData} />
            </div>
          </Card>

           <Card className="w-full hidden sm:block">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#9EF01A]" />
                  Trade-wise Profit
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#001524] rounded-full border border-[#00A6FB]/30 w-fit">
                   <Target className="w-3 h-3 text-[#9EF01A]" />
                   <span className="text-xs text-[#94a3b8]">Accuracy: <span className="text-white font-bold">{accuracy.wins}/{accuracy.total}</span> ({accuracy.percent}%)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4">
                 <button 
                  onClick={handleTradeAnalysis}
                  className="p-1.5 rounded-lg bg-[#001524] hover:bg-[#003554] border border-[#00A6FB]/30 transition-colors group flex items-center gap-1.5 px-3"
                  title="Analyze Trading Patterns"
                >
                    <Sparkles className="w-3.5 h-3.5 text-[#9EF01A] group-hover:rotate-12 transition-transform" />
                    <span className="text-xs font-medium text-[#94a3b8] group-hover:text-white">Analyze Patterns</span>
                </button>
                
                <div className="flex gap-2 text-xs">
                   <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#9EF01A]"></div>
                      <span className="text-[#94a3b8]">Profit</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                      <span className="text-[#94a3b8]">Loss</span>
                   </div>
                </div>
              </div>
            </div>
            <div className="w-full">
               <ResponsiveBarChart data={tradePnL} />
            </div>
           </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-[#00A6FB]/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#9EF01A]" />
                  Core Investment Metrics
                </h3>
              </div>
              
              <div className="overflow-hidden rounded-xl border border-[#00A6FB]/10">
                <table className="w-full text-xs sm:text-sm text-left">
                  <tbody className="divide-y divide-[#00A6FB]/10">
                    {[
                      { label: "Free Stocks Accumulated", value: investmentMetrics.totalQtyFree, sub: "Qty" },
                      { label: "Market Value of Retained Shares", value: `₹ ${investmentMetrics.marketValueRetained.toLocaleString()}`, sub: "Current" },
                      { label: "Dividends & Cashflow", value: `₹ ${investmentMetrics.dividendsCashflow.toLocaleString()}`, sub: "Realized" },
                      { label: "Max Amount Invested", value: investmentMetrics.maxInvested, sub: "Capital" },
                      { label: "Investment Duration", value: investmentMetrics.time, sub: "Years" },
                      { label: "Annual ROI / Max DD Ratio", value: investmentMetrics.ratio, sub: "Efficiency" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#003554]/30 transition-colors group">
                        <td className="px-3 sm:px-4 py-3 sm:py-4 text-[#94a3b8] font-medium">{row.label}</td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4 text-right">
                          <div className="font-bold text-white">{row.value}</div>
                          <div className="text-[10px] sm:text-xs text-[#64748b] group-hover:text-[#9EF01A] transition-colors">{row.sub}</div>
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
                  <BarChart3 className="w-5 h-5 text-[#9EF01A]" />
                  Profit & Loss Analysis
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
                  <thead className="bg-[#001524] text-[#94a3b8] font-medium">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 rounded-l-lg">Entry Date</th>
                      <th className="px-3 sm:px-4 py-3">Entry Price</th>
                      <th className="px-3 sm:px-4 py-3">Qty</th>
                      <th className="px-3 sm:px-4 py-3">Doubled On</th>
                      <th className="px-3 sm:px-4 py-3 text-[#9EF01A]">Free Qty</th>
                      <th className="px-3 sm:px-4 py-3 text-right">Current Val</th>
                      <th className="px-3 sm:px-4 py-3 rounded-r-lg">Invested Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00A6FB]/10">
                    {pnlData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#003554]/30 transition-colors">
                        <td className="px-3 sm:px-4 py-3 text-gray-300">{row.date}</td>
                        <td className="px-3 sm:px-4 py-3 text-gray-300">₹ {row.entry}</td>
                        <td className="px-3 sm:px-4 py-3 text-gray-500">{row.qty}</td>
                        <td className="px-3 sm:px-4 py-3 text-gray-300">
                          {row.doubleDate} <span className="text-[10px] sm:text-xs text-gray-600">(@ {row.doublePrice})</span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 font-bold text-[#9EF01A]">{row.freeQty}</td>
                        <td className="px-3 sm:px-4 py-3 text-right text-white font-medium">₹ {row.currVal.toLocaleString()}</td>
                        <td className="px-3 sm:px-4 py-3 text-gray-400">{row.time}</td>
                      </tr>
                    ))}
                    <tr className="bg-[#9EF01A]/5 border-t border-[#9EF01A]/20 font-bold">
                      <td className="px-3 sm:px-4 py-4 text-white">Total</td>
                      <td className="px-3 sm:px-4 py-4"></td>
                      <td className="px-3 sm:px-4 py-4 text-white">{pnlData.reduce((acc, curr) => acc + curr.qty, 0)}</td>
                      <td className="px-3 sm:px-4 py-4"></td>
                      <td className="px-3 sm:px-4 py-4 text-[#9EF01A]">{pnlData.reduce((acc, curr) => acc + curr.freeQty, 0)}</td>
                      <td className="px-3 sm:px-4 py-4 text-right text-[#9EF01A]">₹ {pnlData.reduce((acc, curr) => acc + curr.currVal, 0).toLocaleString()}</td>
                      <td className="px-3 sm:px-4 py-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-[#9EF01A]/10 to-[#001524] border-[#9EF01A]/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#9EF01A] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(158,240,26,0.3)]">
                  <span className="text-[#003554] font-bold">VK</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Vijay Kedia Position</h4>
                  <p className="text-xs text-[#94a3b8] mt-1">Institutional Tracking</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                 <div className="bg-[#001524]/60 p-2 rounded border border-[#00A6FB]/20">
                    <div className="text-[10px] text-[#94a3b8]">Wealth Multiplier</div>
                    <div className="text-lg font-bold text-[#9EF01A]">17.5x</div>
                 </div>
                 <div className="bg-[#001524]/60 p-2 rounded border border-[#00A6FB]/20">
                    <div className="text-[10px] text-[#94a3b8]">Gain %</div>
                    <div className="text-lg font-bold text-white">1747.5%</div>
                 </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#00A6FB]/20 grid grid-cols-2 gap-4">
                <div>
                   <div className="text-[10px] text-[#94a3b8]">Initial Value</div>
                   <div className="text-sm font-bold text-white">₹ 11.9 Cr</div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] text-[#94a3b8]">Current Value</div>
                   <div className="text-sm font-bold text-[#9EF01A]">₹ 219.86 Cr</div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-[#001524]/60">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Dividends</h3>
                <span className="text-xs text-[#64748b]">2020 - 2025</span>
              </div>
              <div className="flex items-end justify-between h-48 gap-2">
                {dividends.map((div, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 w-full group cursor-pointer">
                    <div className="relative w-full flex justify-center">
                       <div 
                        className="w-full bg-[#003554] hover:bg-[#9EF01A] rounded-t-sm transition-all duration-300 relative group-hover:shadow-[0_0_15px_rgba(158,240,26,0.3)]"
                        style={{ height: `${(div.amount / 15) * 100}px` }}
                      ></div>
                      <span className="absolute -top-8 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">₹{div.amount}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-[#64748b] font-medium">{div.year}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Cashflow Impact</h3>
              <div className="space-y-4">
                {cashflowData.map((cf, idx) => (
                  <div key={idx} className="bg-[#001524]/80 p-3 rounded-lg border border-[#00A6FB]/10 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-[#94a3b8] mb-0.5">
                        <span className="text-[#64748b]">Entry:</span> {cf.entry} <span className="mx-1 text-[#64748b]">→</span> <span className="text-[#64748b]">Exit:</span> {cf.exit}
                      </div>
                      <div className="text-sm font-medium text-white">Qty: {cf.qty}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-red-500 font-bold text-sm">₹ {cf.flow}</div>
                       <div className="text-[10px] text-[#64748b]">{cf.time}</div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-[#00A6FB]/20 flex justify-between items-center">
                    <span className="text-sm text-[#94a3b8]">Total Negative Cashflow</span>
                    <span className="text-red-500 font-bold">₹ -29,964</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-12 pt-10 border-t border-[#00A6FB]/20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Why You Should Use This System</h2>
            <p className="text-[#94a3b8] max-w-2xl mx-auto">
              A complete ecosystem designed to replace guesswork with precision and transform your investing journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUseSystem.map((item, idx) => (
              <Card key={idx} className="bg-[#001524]/40 hover:bg-[#003554]/60 transition-colors group border-[#00A6FB]/20 hover:border-[#9EF01A]/50">
                <div className="mb-4 p-3 rounded-xl bg-[#001524] w-fit text-[#00A6FB] group-hover:text-[#9EF01A] group-hover:bg-[#9EF01A]/10 transition-colors border border-[#00A6FB]/20">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2 leading-tight">{item.title}</h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Report Modal */}
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[#000508]/80 backdrop-blur-md" onClick={() => setIsReportModalOpen(false)}></div>
            <div className="relative bg-[#001219] border border-[#00A6FB]/30 w-full max-w-2xl rounded-2xl p-4 sm:p-6 shadow-2xl shadow-[#9EF01A]/5 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="absolute top-4 right-4 text-[#64748b] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 mb-6 border-b border-[#00A6FB]/20 pb-4">
                <Sparkles className="w-6 h-6 text-[#9EF01A]" />
                <h2 className="text-xl font-bold text-white">
                    {reportType === 'executive' ? 'Executive Performance Summary' : 'AI Trade Pattern Analysis'}
                </h2>
              </div>
              
              <div className="min-h-[300px] text-[#cbd5e1] leading-relaxed whitespace-pre-wrap font-light">
                {isGeneratingReport ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#94a3b8]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#9EF01A]" />
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
            <div className="absolute inset-0 bg-[#000508]/80 backdrop-blur-md" onClick={() => setIsLeadModalOpen(false)}></div>
            <div className="relative bg-[#001219] border border-[#9EF01A]/30 w-full max-w-md rounded-2xl p-5 sm:p-8 shadow-2xl shadow-[#9EF01A]/10 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setIsLeadModalOpen(false)}
                className="absolute top-4 right-4 text-[#64748b] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {!isLeadSubmitted ? (
                <>
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-full bg-[#9EF01A]/10 flex items-center justify-center mb-4">
                      <UserPlus className="w-6 h-6 text-[#9EF01A]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Get DG Indicator</h2>
                    <p className="text-[#94a3b8] text-sm">Please fill in your details to access the exclusive indicator. Our team will contact you shortly.</p>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#94a3b8] mb-1">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                        className="w-full bg-[#001524] border border-[#00A6FB]/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#9EF01A] transition-colors placeholder:text-[#334155]"
                        placeholder="Rahul Sharma"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#94a3b8] mb-1">City</label>
                        <input 
                          required
                          type="text" 
                          value={leadForm.city}
                          onChange={(e) => setLeadForm({...leadForm, city: e.target.value})}
                          className="w-full bg-[#001524] border border-[#00A6FB]/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#9EF01A] transition-colors placeholder:text-[#334155]"
                          placeholder="Mumbai"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#94a3b8] mb-1">Age</label>
                        <input 
                          required
                          type="number" 
                          min="18"
                          max="100"
                          value={leadForm.age}
                          onChange={(e) => setLeadForm({...leadForm, age: e.target.value})}
                          className="w-full bg-[#001524] border border-[#00A6FB]/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#9EF01A] transition-colors placeholder:text-[#334155]"
                          placeholder="30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#94a3b8] mb-1">Portfolio Size</label>
                      <select 
                        value={leadForm.portfolio}
                        onChange={(e) => setLeadForm({...leadForm, portfolio: e.target.value})}
                        className="w-full bg-[#001524] border border-[#00A6FB]/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#9EF01A] transition-colors"
                      >
                        <option>Above 1 Lakh</option>
                        <option>1L - 10L</option>
                        <option>10L - 1 Cr</option>
                        <option>Above 1 Cr</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#94a3b8] mb-1">Phone Number</label>
                      <input 
                        required
                        type="tel" 
                        value={leadForm.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setLeadForm({...leadForm, phone: val});
                        }}
                        className="w-full bg-[#001524] border border-[#00A6FB]/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#9EF01A] transition-colors placeholder:text-[#334155]"
                        placeholder="9876543210"
                        maxLength={10}
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#9EF01A] hover:bg-[#8ade16] text-[#003554] font-bold py-3 rounded-lg transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(158,240,26,0.3)] hover:shadow-[0_0_25px_rgba(158,240,26,0.5)]"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-[#9EF01A]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-[#9EF01A]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Request Received!</h3>
                  <p className="text-[#94a3b8]">Thank you for your interest. We will contact you shortly regarding your query.</p>
                  <button 
                    onClick={() => setIsLeadModalOpen(false)}
                    className="mt-8 text-[#9EF01A] hover:text-white text-sm font-medium transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Chat Button */}
        <div className={`fixed z-50 transition-all duration-300 ${
          isChatOpen 
            ? 'bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 sm:w-auto' 
            : 'bottom-6 right-6 w-auto'
        }`}>
           {!isChatOpen ? (
             <button 
               onClick={() => setIsChatOpen(true)}
               className="bg-[#00A6FB] hover:bg-[#0095e0] text-white w-14 h-14 rounded-full shadow-lg shadow-[#00A6FB]/20 flex items-center justify-center transition-all hover:scale-105"
             >
               <MessageSquare className="w-6 h-6" />
             </button>
           ) : (
             <div className="bg-[#001219]/95 backdrop-blur-xl border border-[#00A6FB]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 w-full sm:w-96">
                <div className="bg-[#001524] p-4 flex items-center justify-between border-b border-[#00A6FB]/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#9EF01A] animate-pulse"></div>
                    <h3 className="font-bold text-sm text-white">DG Alpha Assistant</h3>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="text-[#64748b] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="h-[50vh] sm:h-80 overflow-y-auto p-4 space-y-4 bg-black/40">
                   {chatHistory.map((msg, i) => (
                     <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-xl p-3 text-sm ${
                          msg.role === 'user' 
                            ? 'bg-[#003554] text-white rounded-tr-none border border-[#00A6FB]/30' 
                            : 'bg-[#9EF01A]/10 text-gray-200 border border-[#9EF01A]/20 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                     </div>
                   ))}
                   {isChatLoading && (
                     <div className="flex justify-start">
                        <div className="bg-[#9EF01A]/10 p-3 rounded-xl rounded-tl-none">
                           <Loader2 className="w-4 h-4 animate-spin text-[#9EF01A]" />
                        </div>
                     </div>
                   )}
                </div>

                <form onSubmit={handleChatSubmit} className="p-3 bg-[#001524] border-t border-[#00A6FB]/20 flex gap-2">
                  <input 
                    type="text" 
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    placeholder="Ask about your returns..."
                    className="flex-1 bg-[#001219] border border-[#00A6FB]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9EF01A] placeholder:text-[#334155]"
                  />
                  <button 
                    type="submit"
                    disabled={isChatLoading || !chatQuery.trim()}
                    className="bg-[#00A6FB] text-white p-2 rounded-lg hover:bg-[#0095e0] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
             </div>
           )}
        </div>

      </main>
    </div>
  );
}

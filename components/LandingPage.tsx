
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Activity, 
  ArrowRight, 
  BarChart2, 
  Users, 
  Lock,
  CheckCircle2,
  ChevronRight,
  Play,
  Target,
  Quote,
  Clock,
  Smartphone,
  LineChart,
  Command,
  Cpu,
  Star,
  User,
  GraduationCap,
  History
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC<{ onDemoClick: () => void }> = ({ onDemoClick }) => {
  const { openAuthModal } = useAuth();
  
  // Direct path to the image in the public folder.
  // Make sure the file is named 'hero-person.png' inside the 'public' folder.
  const heroImage = "/hero-person.png";

  const testimonials = [
    {
      name: "Aryan Mehta",
      date: "12 Feb, 2025",
      title: "The 'Free Shares' concept is a game changer...",
      review: "“I was skeptical about 'zero risk' at first. But after applying the DG Alpha system, I've withdrawn my capital from all positions and am riding the profits completely stress-free.”"
    },
    {
      name: "Dr. Priya Sharma",
      date: "05 March, 2025",
      title: "Finally, data over gut feelings...",
      review: "“As a doctor, I don't have time to track charts all day. The Nifty Predictor and Superstar Tracker give me precise entry points. I spend maybe 15 minutes a week managing my portfolio now. Highly recommended.”"
    },
    {
      name: "Rahul Verma",
      date: "28 Jul, 2025",
      title: "Best ecosystem for serious compounding...",
      review: "“The logic is undeniable. Following the strategy has completely changed my mindset from gambling on tips to building genuine long-term wealth. The AI insight reports are just the cherry on top.”"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--accent)] selection:text-black flex flex-col overflow-hidden relative">
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.06]"></div>
        
        {/* Moving Orbs - Subtle Depth */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--accent)] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.08] animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-[0.05] animate-blob animation-delay-2000"></div>
        
        {/* Professional Rising Market Data Animation */}
        <div className="absolute inset-0 w-full h-full">
          {/* Vertical Ticker Lines - Fintech Look */}
          {[...Array(8)].map((_, i) => (
            <div 
              key={`line-${i}`}
              className="absolute bottom-0 w-[1px] bg-gradient-to-t from-transparent via-[var(--border-secondary)] to-transparent opacity-20 animate-rise"
              style={{
                height: `${20 + Math.random() * 30}%`, // Variable heights
                left: `${10 + Math.random() * 80}%`, // Random horizontal pos
                animationDuration: `${10 + Math.random() * 15}s`,
                animationDelay: `-${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-main)]/80 backdrop-blur-md border-b border-[var(--border-primary)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
          <div 
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] transition-transform group-hover:scale-110 duration-300">
               <Activity className="w-5 h-5 text-black fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">DG Alpha</span>
          </div>
          
          {/* Centered Navigation Links */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-sm font-bold text-[var(--text-main)] hover:text-[var(--accent)] transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              About
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => openAuthModal('login')}
              className="hidden sm:block text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => openAuthModal('signup')}
              className="bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border-secondary)] hover:border-[var(--accent)] px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 shadow-sm hover:shadow-[0_0_10px_rgba(var(--accent-rgb),0.2)]"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 lg:pb-20 px-6 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-xs font-medium text-[var(--accent)] mb-8 animate-slide-up hover:border-[var(--accent)] transition-colors duration-300 cursor-default shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
              </span>
              Live Institutional Tracking
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight animate-slide-up delay-100">
              The Complete Ecosystem <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-main)] via-[var(--text-main)] to-[var(--text-muted)] animate-shine bg-[length:200%_auto]">For Intelligent Investors.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed animate-slide-up delay-200">
              From discovering <span className="text-[var(--text-main)] font-bold">multibaggers</span> to predicting <span className="text-[var(--text-main)] font-bold">Daily Nifty Trend</span> from FII Data. We replace luck with data, logic, and proven systems.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-slide-up delay-300">
              <button 
                onClick={() => openAuthModal('signup')}
                className="group w-full sm:w-auto px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onDemoClick}
                className="w-full sm:w-auto px-8 py-4 bg-[var(--bg-card)] border border-[var(--border-secondary)] hover:border-[var(--text-muted)] text-[var(--text-main)] font-medium rounded-xl transition-all flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-95 hover:shadow-lg"
              >
                <Play className="w-4 h-4 fill-current" /> Explore Dashboard
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 relative w-full max-w-md lg:max-w-full animate-slide-up delay-200 flex flex-col items-center lg:items-end">
             {/* Glow Background - Strengthened for better contrast with black shirt */}
             <div className="absolute top-1/2 left-1/2 lg:left-auto lg:right-10 -translate-x-1/2 lg:translate-x-0 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[var(--accent)]/30 via-blue-500/20 to-purple-500/20 rounded-full blur-[80px] opacity-70 pointer-events-none"></div>
             
             {/* Floating Elements (Decorative) */}
             <div className="absolute top-10 -right-4 lg:right-4 bg-[var(--bg-card)]/80 backdrop-blur-md p-4 rounded-2xl border border-[var(--border-primary)] shadow-2xl z-20 animate-float hidden sm:block">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                      <TrendingUp size={20} />
                   </div>
                   <div>
                      <p className="text-xs text-[var(--text-muted)] font-bold">Nifty Accuracy</p>
                      <p className="text-lg font-bold text-[var(--text-main)]">75%+</p>
                   </div>
                </div>
             </div>

             <div className="absolute bottom-20 -left-4 lg:left-10 bg-[var(--bg-card)]/80 backdrop-blur-md p-4 rounded-2xl border border-[var(--border-primary)] shadow-2xl z-20 animate-float animation-delay-2000 hidden sm:block">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-[var(--accent)]/10 rounded-lg text-[var(--accent)]">
                      <Users size={20} />
                   </div>
                   <div>
                      <p className="text-xs text-[var(--text-muted)] font-bold">Community</p>
                      <p className="text-lg font-bold text-[var(--text-main)]">1,200+</p>
                   </div>
                </div>
             </div>

             {/* Main Image with Robust Fallback */}
             <div className="relative z-10 flex justify-center lg:justify-end w-full">
                <img 
                  src={heroImage} 
                  alt="Dhruv Gupta" 
                  className="w-full max-w-[500px] lg:max-w-full h-auto max-h-[600px] object-cover rounded-2xl shadow-2xl border border-[var(--border-primary)] hover:scale-105 transition-transform duration-700 pointer-events-none"
                />
             </div>
          </div>

        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-10 border-y border-[var(--border-primary)] bg-[var(--bg-card)]/30 backdrop-blur-md animate-slide-up delay-500 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { label: "AVG ANNUAL ROI", value: "312.12%", color: "text-[var(--accent)]" },
              { label: "AVG MAX DD", value: "0.57", color: "text-[var(--accent)]" },
              { label: "AVG RISK REWARD", value: "1299.1", color: "text-[var(--accent)]" },
              { label: "NIFTY ACCURACY", value: "75%+", color: "text-blue-400" },
              { label: "SUPERSTARS TRACKED", value: "50+", color: "text-purple-400" },
              { label: "ACTIVE MEMBERS", value: "1,200+", color: "text-[var(--text-main)]" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group cursor-default">
                <div className={`text-2xl lg:text-3xl font-bold mb-1 ${stat.color} transition-transform duration-300 group-hover:scale-110`}>{stat.value}</div>
                <div className="text-[10px] md:text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">{stat.label}</div>
              </div>
            ))}
        </div>
      </section>

      {/* Feature Grid - Replaced with Specific Modules */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A Powerful Toolkit</h2>
            <p className="text-[var(--text-muted)]">Everything you need to outperform the market, all in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={TrendingUp}
              title="DG Alpha System"
              desc="Our flagship investing framework. Accumulate 'Free Shares' of high-growth companies with zero capital risk."
              delay="delay-100"
            />
            <FeatureCard 
              icon={Cpu}
              title="Nifty Predictor"
              desc="Daily market direction analysis using 14+ FII/Pro data points and advanced algorithms."
              delay="delay-200"
            />
            <FeatureCard 
              icon={Users}
              title="Superstar Tracker"
              desc="Clone the portfolios of legends like Vijay Kedia. See their latest adds, removes, and allocations."
              delay="delay-300"
            />
            <FeatureCard 
              icon={Zap}
              title="Buyback Arbitrage"
              desc="Live scanner for special situations offering >8% safe returns in short timeframes."
              delay="delay-100"
            />
            <FeatureCard 
              icon={Command}
              title="Command Center"
              desc="Access essential tools: PEaD Scanners, IPO Grey Market Premium, Margin Calculators, and more."
              delay="delay-200"
            />
            <FeatureCard 
              icon={Target}
              title="Swing Trading"
              desc="Curated list of high-probability swing setups updated weekly for active income generation."
              delay="delay-300"
            />
          </div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section className="py-24 px-6 bg-[var(--bg-surface)]/30 border-y border-[var(--border-primary)] relative overflow-hidden z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-slide-up">
            <span className="text-[var(--accent)] font-bold tracking-widest text-xs uppercase mb-2 block">The Philosophy</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Build Wealth on Autopilot</h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
              We don't just give tips. We provide a systematic engine for compounding capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProcessCard 
              number="01"
              title="Identify"
              icon={Target}
              desc="Use our DG Alpha Indicator and Superstar Tracker to spot high-conviction setups early."
              tags={["Screening", "Copy-Trading"]}
              delay="delay-100"
            />
            <ProcessCard 
              number="02"
              title="Zero-Risk"
              icon={ShieldCheck}
              desc="Once a stock doubles, we withdraw initial capital. You retain 'Free Shares' for infinite ROI."
              tags={["Capital Protection", "Stress-Free"]}
              delay="delay-200"
            />
            <ProcessCard 
              number="03"
              title="Predict"
              icon={LineChart}
              desc="Navigate daily volatility with our Nifty Predictor to hedge or time your entries perfectly."
              tags={["Market Timing", "FII Data"]}
              delay="delay-300"
            />
          </div>
        </div>
      </section>

      {/* Case Study Teaser */}
      <section className="py-24 px-6 bg-[var(--bg-card)]/50 relative group overflow-hidden z-10 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--accent)]/5 to-transparent pointer-events-none transition-opacity duration-700 group-hover:opacity-80"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10">
          <div className="flex-1 space-y-8 animate-slide-up">
             <div className="inline-block px-3 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/20 shadow-[0_0_10px_rgba(var(--accent-rgb),0.2)]">
               CASE STUDY: NEULAND LABS
             </div>
             <h2 className="text-3xl md:text-5xl font-bold leading-tight">
               How we caught the <br/> 
               <span className="text-[var(--accent)] animate-pulse-slow">18x Move</span>
             </h2>
             <p className="text-[var(--text-muted)] text-lg leading-relaxed">
               Most investors sold at 2x profit. We held on. Why? Because our system had already extracted the initial capital, leaving "Free Shares" to ride the entire trend risk-free.
             </p>
             <ul className="space-y-4">
               {[
                 "Invested: ₹3 Lakhs",
                 "Current Value: ₹54.76 Lakhs",
                 "Risk: ₹0 (Capital Withdrawn)",
                 "Stress: Zero"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-4 text-[var(--text-main)] text-lg">
                   <CheckCircle2 className="w-6 h-6 text-[var(--accent)] flex-shrink-0" />
                   {item}
                 </li>
               ))}
             </ul>
             <button 
               onClick={onDemoClick}
               className="mt-6 text-[var(--accent)] font-bold flex items-center gap-2 hover:gap-4 transition-all hover:text-[var(--text-main)] text-lg"
             >
               See the breakdown <ChevronRight className="w-5 h-5" />
             </button>
          </div>
          
          <div className="flex-1 w-full relative animate-slide-up delay-200">
             <div className="aspect-square md:aspect-video rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-secondary)] overflow-hidden shadow-2xl relative group/video hover:border-[var(--accent)] transition-colors duration-500 hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)]">
                {/* Abstract Chart Representation */}
                <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-[var(--accent)]/20 to-transparent opacity-50"></div>
                <svg className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none">
                   <path d="M0,300 C100,280 200,250 300,150 C400,50 500,20 600,10 L600,300 L0,300 Z" fill="url(#grad1)" className="transition-all duration-1000 ease-in-out group-hover/video:translate-y-2" />
                   <defs>
                     <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                       <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                       <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                     </linearGradient>
                   </defs>
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                   <div className="w-16 h-16 bg-[var(--bg-main)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border border-[var(--border-primary)] group-hover/video:scale-110 group-hover/video:border-[var(--accent)] transition-all duration-300 cursor-pointer animate-float" onClick={onDemoClick}>
                      <Play className="w-6 h-6 text-[var(--accent)] fill-current ml-1" />
                   </div>
                   <p className="text-sm font-bold text-[var(--text-muted)] group-hover/video:text-[var(--text-main)] transition-colors">Interactive Dashboard</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Community / Points Section */}
      <section className="py-24 px-6 border-t border-[var(--border-primary)] bg-[var(--bg-main)] relative z-10">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16 animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Members Stay</h2>
              <p className="text-[var(--text-muted)]">It's not just about returns. It's about lifestyle.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <InfoCard 
                icon={Clock}
                title="15 Mins / Week"
                desc="No staring at screens all day. Our system is designed for busy professionals."
                delay="delay-100"
              />
              <InfoCard 
                icon={Smartphone}
                title="Trade Anywhere"
                desc="Get alerts on your phone. Execute trades from the gym, office, or vacation."
                delay="delay-200"
              />
              <InfoCard 
                icon={Quote}
                title="Community Support"
                desc="Join exclusive Telegram groups where we analyze charts and opportunities together."
                delay="delay-300"
              />
              <InfoCard 
                icon={CheckCircle2}
                title="Clear Signals"
                desc="No 'maybe'. We have clear entry, exit, and capital allocation rules."
                delay="delay-400"
              />
           </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-[var(--bg-main)] relative z-10 overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto animate-slide-up delay-200 relative z-20">
           <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-[var(--text-main)] tracking-tight">
              Here What others have to say....
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {testimonials.map((t, idx) => (
                <div key={idx} className="bg-[var(--bg-card)] rounded-2xl p-6 sm:p-8 border border-[var(--border-primary)] hover:border-[var(--accent)] transition-all duration-300 shadow-xl flex flex-col h-full hover:-translate-y-2">
                   {/* Header */}
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center shrink-0 border border-[var(--accent)]/20">
                         <User className="w-6 h-6 text-[var(--accent)] fill-current" />
                      </div>
                      <div>
                         <div className="font-bold text-lg text-[var(--text-main)]">{t.name}</div>
                         <div className="text-sm text-[var(--text-muted)]">{t.date}</div>
                         <div className="flex gap-0.5 mt-1">
                            {[...Array(5)].map((_, i) => (
                               <Star key={i} className="w-3.5 h-3.5 text-[var(--accent)] fill-current" />
                            ))}
                         </div>
                      </div>
                   </div>
                   
                   {/* Content */}
                   <div className="flex-1 flex flex-col">
                      <h3 className="text-[var(--accent)] font-bold text-lg mb-3 leading-tight">{t.title}</h3>
                      <p className="text-[var(--text-muted)] text-sm leading-relaxed flex-1">
                         {t.review}
                      </p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* About DG Alpha Section */}
      <section id="about" className="py-24 px-6 bg-[var(--bg-surface)]/30 relative z-10 border-t border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch gap-16">
          {/* Image/Visual Side */}
          <div className="flex-1 relative w-full lg:min-h-[500px] animate-slide-up">
              <div className="relative rounded-2xl overflow-hidden border border-[var(--border-secondary)] shadow-2xl h-full">
                  {/* Using consistent object-cover and h-full to fill the column height */}
                  <img 
                    src={heroImage} 
                    alt="Dhruv Gupta" 
                    className="w-full h-full object-cover bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-main)]" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8">
                      <p className="text-[var(--accent)] font-bold text-2xl">Dhruv Gupta</p>
                      <p className="text-gray-300 text-sm font-medium">Founder, DG Alpha</p>
                  </div>
              </div>
               {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-[var(--bg-card)] border border-[var(--border-primary)] p-4 rounded-xl shadow-xl flex items-center gap-3 animate-float border-l-4 border-l-[var(--accent)] z-20">
                  <div className="bg-[var(--accent)]/10 p-2.5 rounded-lg">
                      <GraduationCap className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <div>
                      <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Alumni</p>
                      <p className="font-bold text-[var(--text-main)]">NIT Trichy</p>
                  </div>
              </div>
              <div className="absolute -top-6 -left-6 bg-[var(--bg-card)] border border-[var(--border-primary)] p-4 rounded-xl shadow-xl flex items-center gap-3 animate-float animation-delay-2000 border-r-4 border-r-blue-500 hidden sm:flex z-20">
                  <div className="bg-blue-500/10 p-2.5 rounded-lg">
                      <History className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                      <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Experience</p>
                      <p className="font-bold text-[var(--text-main)]">7+ Years</p>
                  </div>
              </div>
          </div>

          {/* Text Side */}
          <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-up delay-200">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs font-bold text-[var(--accent)] w-fit">
                <User className="w-3 h-3" /> The Founder
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-main)] leading-tight">
                  About <span className="text-[var(--accent)]">DG Alpha</span>
              </h2>
              <div className="space-y-6 text-[var(--text-muted)] text-lg leading-relaxed">
                  <p>
                      I am on a mission to help <span className="text-[var(--text-main)] font-bold">100,000 retail investors</span> achieve financial freedom through the DG Alpha Investing Process.
                  </p>
                  <p>
                      With <span className="text-[var(--text-main)] font-bold">7+ years of experience</span> in financial markets and an analytical foundation from <span className="text-[var(--text-main)] font-bold">NIT Trichy</span>, I have built a rule-based, backtested investing framework that prioritizes process over prediction. I believe sustainable wealth is created through discipline, structure, and risk management—not market guesses or tips.
                  </p>
                  <p>
                      My stock market journey began in 2018. Since then, I’ve experienced strong bull runs, sharp corrections, and extreme events like the <span className="text-[var(--text-main)] font-bold">COVID-19 crash</span>. These cycles shaped my understanding of how markets behave and reinforced the importance of having a system that works across all market conditions.
                  </p>
                  <div className="p-6 bg-[var(--bg-card)] border-l-4 border-[var(--accent)] rounded-r-xl italic text-base shadow-lg">
                      "The DG Alpha Investing Process is designed around high-probability strategies, capital protection, and long-term wealth creation, helping retail investors think and act like professionals—with clarity, consistency, and confidence."
                  </div>
              </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center bg-[var(--bg-surface)]/30 backdrop-blur-sm relative z-10">
        <div className="max-w-3xl mx-auto animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to upgrade your portfolio?</h2>
          <p className="text-[var(--text-muted)] mb-8 text-lg">
            Join a community of serious investors using data, not gut feelings.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => openAuthModal('signup')}
              className="px-8 py-4 bg-[var(--text-main)] text-[var(--bg-main)] hover:bg-[var(--text-muted)] font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 duration-200"
            >
              Create Free Account
            </button>
            <button 
              onClick={() => window.open('https://t.me/+kEcdam9RulcwMWVl', '_blank')}
              className="px-8 py-4 bg-transparent border border-[var(--border-secondary)] hover:border-[var(--text-main)] text-[var(--text-main)] font-bold rounded-xl transition-all hover:bg-[var(--bg-surface)] hover:-translate-y-1 active:scale-95 duration-200"
            >
              Join Telegram Community
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--border-primary)] bg-[var(--bg-card)] mt-auto relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Activity className="w-5 h-5 text-[var(--accent)] group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-[var(--text-main)]">DG Alpha</span>
          </div>
          <div className="flex gap-8 text-sm text-[var(--text-muted)]">
            <a href="#" className="hover:text-[var(--text-main)] transition-colors hover:underline">Privacy</a>
            <a href="#" className="hover:text-[var(--text-main)] transition-colors hover:underline">Terms</a>
            <a href="#" className="hover:text-[var(--text-main)] transition-colors hover:underline">Contact</a>
          </div>
          <div className="text-sm text-[var(--text-dim)]">
            © {new Date().getFullYear()} DG Alpha. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, desc: string, delay?: string }> = ({ icon: Icon, title, desc, delay }) => (
  <div className={`p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-surface)] transition-all duration-300 group h-full flex flex-col hover:-translate-y-1 hover:shadow-lg animate-slide-up ${delay} relative overflow-hidden`}>
    <div className="w-10 h-10 bg-[var(--bg-main)] rounded-lg flex items-center justify-center mb-3 border border-[var(--border-secondary)] group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)] relative z-10 flex-shrink-0">
      <Icon className="w-5 h-5 text-[var(--accent)]" />
    </div>
    <h3 className="text-base font-bold text-[var(--text-main)] mb-2 group-hover:text-[var(--accent)] transition-colors relative z-10">{title}</h3>
    <p className="text-sm text-[var(--text-muted)] leading-relaxed relative z-10 flex-1">{desc}</p>
    {/* Subtle gradient blob on hover */}
    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[var(--accent)]/5 rounded-full blur-xl group-hover:bg-[var(--accent)]/10 transition-colors duration-500"></div>
  </div>
);

const ProcessCard: React.FC<{ number: string, title: string, icon: React.ElementType, desc: string, tags: string[], delay?: string }> = ({ number, title, icon: Icon, desc, tags, delay }) => (
  <div className={`relative p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-secondary)] hover:border-[var(--accent)] transition-all duration-300 group overflow-hidden hover:shadow-xl hover:-translate-y-1 animate-slide-up ${delay} h-full flex flex-col`}>
    {/* Number Watermark - Reduced size */}
    <div className="absolute -top-2 -right-2 text-7xl font-black text-[var(--bg-surface)] opacity-40 group-hover:text-[var(--bg-hover)] transition-colors select-none duration-500 group-hover:scale-110 group-hover:rotate-6 pointer-events-none">
      {number}
    </div>
    
    <div className="relative z-10 flex-1 flex flex-col h-full">
      {/* Icon - Reduced size */}
      <div className="w-12 h-12 bg-[var(--bg-surface)] rounded-lg flex items-center justify-center mb-4 border border-[var(--border-primary)] group-hover:border-[var(--accent)] group-hover:scale-105 transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)] flex-shrink-0">
        <Icon className="w-6 h-6 text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors" />
      </div>
      
      <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed flex-1">
        {desc}
      </p>
      
      <div className="flex flex-wrap gap-2 mt-auto">
        {tags.map((tag, i) => (
          <span key={i} className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-[var(--bg-surface)] text-[var(--text-dim)] border border-[var(--border-primary)] group-hover:border-[var(--accent)]/30 group-hover:text-[var(--accent)] transition-colors duration-300 tracking-wider">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const InfoCard: React.FC<{ icon: React.ElementType, title: string, desc: string, delay?: string }> = ({ icon: Icon, title, desc, delay }) => (
  <div className={`flex flex-col items-center text-center p-5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)] hover:-translate-y-1 transition-all duration-300 hover:border-[var(--accent)]/40 hover:shadow-md animate-slide-up ${delay} h-full`}>
     <div className="p-3 bg-[var(--bg-surface)] rounded-full mb-3 text-[var(--accent)] group-hover:scale-110 transition-transform flex-shrink-0">
        <Icon className="w-5 h-5" />
     </div>
     <h3 className="text-base font-bold text-[var(--text-main)] mb-2">{title}</h3>
     <p className="text-sm text-[var(--text-muted)] flex-1">{desc}</p>
  </div>
);

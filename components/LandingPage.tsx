import React from 'react';
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
  Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC<{ onDemoClick: () => void }> = ({ onDemoClick }) => {
  const { openAuthModal } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--accent)] selection:text-black flex flex-col overflow-hidden relative">
      
      {/* Dynamic Background Elements */}
      {/* CHANGED: Removed z-[-1] and used z-0 with absolute positioning to ensure visibility above background color */}
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

          {/* Data Particles (Dots) */}
          {[...Array(15)].map((_, i) => (
            <div 
              key={`dot-${i}`}
              className="absolute rounded-full bg-[var(--text-muted)] animate-rise"
              style={{
                width: Math.random() > 0.5 ? '2px' : '3px',
                height: Math.random() > 0.5 ? '2px' : '3px',
                left: `${Math.random() * 100}%`,
                animationDuration: `${15 + Math.random() * 20}s`, 
                animationDelay: `-${Math.random() * 20}s`,
                opacity: Math.random() * 0.3 + 0.1, // Increased opacity
              }}
            />
          ))}
          
          {/* Bullish Indicators (Arrows) */}
          {[...Array(8)].map((_, i) => (
            <div 
              key={`arrow-${i}`}
              className="absolute text-[var(--accent)] font-bold animate-rise"
              style={{
                left: `${Math.random() * 100}%`,
                fontSize: `${8 + Math.random() * 4}px`,
                animationDuration: `${12 + Math.random() * 10}s`,
                animationDelay: `-${Math.random() * 10}s`,
                opacity: 0.4, // Clearly visible opacity
              }}
            >
              ▲
            </div>
          ))}
          
          {/* Wealth Accumulation Symbols (+) */}
           {[...Array(6)].map((_, i) => (
            <div 
              key={`plus-${i}`}
              className="absolute text-[var(--text-dim)] font-bold animate-rise"
              style={{
                left: `${Math.random() * 100}%`,
                fontSize: `${10 + Math.random() * 6}px`,
                animationDuration: `${18 + Math.random() * 10}s`,
                animationDelay: `-${Math.random() * 10}s`,
                opacity: 0.2,
              }}
            >
              +
            </div>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-main)]/80 backdrop-blur-md border-b border-[var(--border-primary)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] transition-transform group-hover:scale-110 duration-300">
               <Activity className="w-5 h-5 text-black fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">DG Alpha</span>
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
      <section className="pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-xs font-medium text-[var(--accent)] mb-8 animate-slide-up hover:border-[var(--accent)] transition-colors duration-300 cursor-default shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
            </span>
            Live Institutional Tracking Enabled
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight animate-slide-up delay-100">
            Turn Market Chaos into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-main)] via-[var(--text-main)] to-[var(--text-muted)] animate-shine bg-[length:200%_auto]">Calculated Wealth.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up delay-200">
            The DG Alpha system replaces emotions with data. Proven backtested strategies that turned <span className="text-[var(--text-main)] font-bold border-b border-[var(--accent)]">₹3 Lakhs into ₹54.76 Lakhs</span> with zero mental stress.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-300">
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
              <Play className="w-4 h-4 fill-current" /> View Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-10 border-y border-[var(--border-primary)] bg-[var(--bg-card)]/30 backdrop-blur-md animate-slide-up delay-500 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Historical ROI", value: "1825%", color: "text-[var(--accent)]" },
              { label: "Max Drawdown", value: "0.5%", color: "text-red-400" },
              { label: "Win Rate", value: "78%", color: "text-blue-400" },
              { label: "Active Users", value: "1,200+", color: "text-[var(--text-main)]" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group cursor-default">
                <div className={`text-2xl md:text-4xl font-bold mb-1 ${stat.color} transition-transform duration-300 group-hover:scale-110`}>{stat.value}</div>
                <div className="text-xs md:text-sm text-[var(--text-muted)] uppercase tracking-wider font-medium">{stat.label}</div>
              </div>
            ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Institutional-Grade Intelligence</h2>
            <p className="text-[var(--text-muted)]">Why retail investors are switching to the DG Alpha system.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={ShieldCheck}
              title="Zero-Risk Methodology"
              desc="Our structured approach manages emotions by using risk-free entry and exit mechanisms designed for maximum confidence."
              delay="delay-100"
            />
            <FeatureCard 
              icon={Zap}
              title="Buyback Arbitrage"
              desc="Identify special situations with >8% guaranteed returns in short timeframes using our live tracker."
              delay="delay-200"
            />
            <FeatureCard 
              icon={Users}
              title="Superstar Tracking"
              desc="Follow the portfolios of legends like Vijay Kedia and Ashish Kacholia with real-time allocation updates."
              delay="delay-300"
            />
            <FeatureCard 
              icon={BarChart2}
              title="Backtested Performance"
              desc="Strategies rigorously tested across multiple market cycles, consistently delivering 300%+ annual ROI."
              delay="delay-100"
            />
            <FeatureCard 
              icon={Lock}
              title="Emotion-Free Trading"
              desc="Remove fear and greed. The system executes with discipline for superior, consistent results."
              delay="delay-200"
            />
            <FeatureCard 
              icon={TrendingUp}
              title="Compound Wealth"
              desc="Don't just trade. Build generational wealth by letting your 'Free Shares' ride the multi-bagger wave."
              delay="delay-300"
            />
          </div>
        </div>
      </section>

      {/* NEW: 3-Step Process Section */}
      <section className="py-24 px-6 bg-[var(--bg-surface)]/30 border-y border-[var(--border-primary)] relative overflow-hidden z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-slide-up">
            <span className="text-[var(--accent)] font-bold tracking-widest text-xs uppercase mb-2 block">The Methodology</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">3 Steps to Financial Freedom</h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
              A simple, repeatable loop that builds wealth without keeping you glued to the screen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProcessCard 
              number="01"
              title="Identify"
              icon={Target}
              desc="Use our DG Alpha Indicator to spot high-probability setups before the market moves."
              tags={["AI Screening", "Trend Analysis"]}
              delay="delay-100"
            />
            <ProcessCard 
              number="02"
              title="Zero-Risk"
              icon={ShieldCheck}
              desc="Once a stock doubles, we withdraw initial capital. You are now holding 'Free Shares' with zero risk."
              tags={["Capital Protection", "Stress-Free"]}
              delay="delay-200"
            />
            <ProcessCard 
              number="03"
              title="Compound"
              icon={TrendingUp}
              desc="Re-deploy your original capital into the next opportunity while your free shares ride the multi-bagger wave."
              tags={["Infinite Returns", "Wealth Creation"]}
              delay="delay-300"
            />
          </div>
        </div>
      </section>

      {/* Case Study Teaser */}
      <section className="py-24 px-6 bg-[var(--bg-card)]/50 relative group overflow-hidden z-10 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--accent)]/5 to-transparent pointer-events-none transition-opacity duration-700 group-hover:opacity-80"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 space-y-6 animate-slide-up">
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
             <ul className="space-y-3">
               {[
                 "Invested: ₹3 Lakhs",
                 "Current Value: ₹54.76 Lakhs",
                 "Risk: ₹0 (Capital Withdrawn)",
                 "Stress: Zero"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-3 text-[var(--text-main)]">
                   <CheckCircle2 className="w-5 h-5 text-[var(--accent)]" />
                   {item}
                 </li>
               ))}
             </ul>
             <button 
               onClick={onDemoClick}
               className="mt-4 text-[var(--accent)] font-bold flex items-center gap-2 hover:gap-4 transition-all hover:text-[var(--text-main)]"
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

      {/* NEW: Community / Points Section */}
      <section className="py-24 px-6 border-t border-[var(--border-primary)] bg-[var(--bg-main)] relative z-10">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16 animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Members Stay</h2>
              <p className="text-[var(--text-muted)]">It's not just about returns. It's about lifestyle.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            © 2024 DG Alpha. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, desc: string, delay?: string }> = ({ icon: Icon, title, desc, delay }) => (
  <div className={`p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-surface)] transition-all duration-300 group h-full hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] animate-slide-up ${delay} relative overflow-hidden`}>
    <div className="w-12 h-12 bg-[var(--bg-main)] rounded-xl flex items-center justify-center mb-4 border border-[var(--border-secondary)] group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)] relative z-10">
      <Icon className="w-6 h-6 text-[var(--accent)]" />
    </div>
    <h3 className="text-lg font-bold text-[var(--text-main)] mb-2 group-hover:text-[var(--accent)] transition-colors relative z-10">{title}</h3>
    <p className="text-sm text-[var(--text-muted)] leading-relaxed relative z-10">{desc}</p>
    {/* Subtle gradient blob on hover */}
    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-2xl group-hover:bg-[var(--accent)]/10 transition-colors duration-500"></div>
  </div>
);

const ProcessCard: React.FC<{ number: string, title: string, icon: React.ElementType, desc: string, tags: string[], delay?: string }> = ({ number, title, icon: Icon, desc, tags, delay }) => (
  <div className={`relative p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-secondary)] hover:border-[var(--accent)] transition-all duration-300 group overflow-hidden hover:shadow-2xl hover:-translate-y-2 animate-slide-up ${delay}`}>
    {/* Number Watermark */}
    <div className="absolute -top-4 -right-4 text-8xl font-black text-[var(--bg-surface)] opacity-50 group-hover:text-[var(--bg-hover)] transition-colors select-none duration-500 group-hover:scale-110 group-hover:rotate-6">
      {number}
    </div>
    
    <div className="relative z-10">
      <div className="w-14 h-14 bg-[var(--bg-surface)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--border-primary)] group-hover:border-[var(--accent)] group-hover:scale-110 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.2)] group-hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]">
        <Icon className="w-7 h-7 text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors" />
      </div>
      
      <h3 className="text-2xl font-bold text-[var(--text-main)] mb-3">{title}</h3>
      <p className="text-[var(--text-muted)] mb-6 leading-relaxed h-20">
        {desc}
      </p>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="text-xs font-bold px-2 py-1 rounded bg-[var(--bg-surface)] text-[var(--text-dim)] border border-[var(--border-primary)] group-hover:border-[var(--accent)]/30 group-hover:text-[var(--accent)] transition-colors duration-300">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const InfoCard: React.FC<{ icon: React.ElementType, title: string, desc: string, delay?: string }> = ({ icon: Icon, title, desc, delay }) => (
  <div className={`flex flex-col items-center text-center p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)] hover:-translate-y-2 transition-all duration-300 hover:border-[var(--accent)]/40 hover:shadow-lg animate-slide-up ${delay}`}>
     <div className="p-3 bg-[var(--bg-surface)] rounded-full mb-4 text-[var(--accent)] group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
     </div>
     <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">{title}</h3>
     <p className="text-sm text-[var(--text-muted)]">{desc}</p>
  </div>
);

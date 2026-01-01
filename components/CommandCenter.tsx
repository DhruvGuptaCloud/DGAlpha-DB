
import React, { useState } from 'react';
import { Search, ExternalLink, Activity, TrendingUp, FileText, Database, BarChart2, Landmark } from 'lucide-react';

const toolsData = [
  {
    id: 1,
    name: "PEaD Website",
    link: "https://www.stockscans.in/scans/saved/63062bdffa71c4b1b12ef647",
    category: "Scanner",
    icon: <Activity className="w-5 h-5 text-blue-400" />
  },
  {
    id: 2,
    name: "Nifty Strangle Expiry Margin Calculation",
    link: "https://claude.ai/public/artifacts/3a097858-fd43-4490-b5f3-b37303eb6fa1",
    category: "Calculator",
    icon: <BarChart2 className="w-5 h-5 text-purple-400" />
  },
  {
    id: 3,
    name: "Demergers Listings",
    link: "https://www.nseindia.com/market-data/new-stock-exchange-listings-recent",
    category: "Market Data",
    icon: <FileText className="w-5 h-5 text-green-400" />
  },
  {
    id: 4,
    name: "IPOs Play",
    link: "https://www.investorgain.com/report/ipo-subscription-live/333/ipo/",
    category: "IPO",
    icon: <TrendingUp className="w-5 h-5 text-yellow-400" />
  },
  {
    id: 5,
    name: "MMI Value Dashboard",
    link: "https://claude.ai/public/artifacts/89ab49e5-80c8-4fee-8032-61d6e810f5e0",
    category: "Dashboard",
    icon: <Activity className="w-5 h-5 text-red-400" />
  },
  {
    id: 6,
    name: "MMI Data",
    link: "https://docs.google.com/spreadsheets/d/1oZorj65QGHtE3aHPqKPNGfnk3-CknqCA/edit?gid=1945278892#gid=1945278892",
    category: "Data Sheet",
    icon: <Database className="w-5 h-5 text-indigo-400" />
  },
  {
    id: 7,
    name: "Fundamental Analysis",
    link: "https://www.screener.in/",
    category: "Analysis",
    icon: <BarChart2 className="w-5 h-5 text-teal-400" />
  },
  {
    id: 8,
    name: "MF Buyings in Stocks",
    link: "https://scanx.trade/",
    category: "Market Activity",
    icon: <TrendingUp className="w-5 h-5 text-orange-400" />
  },
  {
    id: 9,
    name: "All Banks Data (Private/Psu/Housing/Small Banks)",
    link: "https://lookerstudio.google.com/u/0/reporting/a457803f-0833-41d6-b904-2db4c3613b34/page/p_7jpqlgu1rd",
    category: "Dashboard",
    icon: <Landmark className="w-5 h-5 text-cyan-400" />
  }
];

export const CommandCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = toolsData.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full relative animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6 pb-12 overflow-hidden rounded-2xl">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[128px] opacity-25 animate-pulse"></div>
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[128px] opacity-25 animate-pulse delay-1000"></div>
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter blur-[128px] opacity-25 animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10">
            {/* Header */}
            <div className="mb-10 text-center space-y-4">
            <div className="inline-flex items-center justify-center p-2 bg-[var(--bg-surface)] backdrop-blur-sm border border-[var(--border-secondary)] rounded-full mb-4">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Live Toolkit</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-main)] pb-2">
                Tools Center
            </h1>
            <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
                Essential financial tools, scanners, and dashboards curated for intelligent trading.
            </p>
            </div>

            {/* Search Bar */}
            <div className="mb-10 max-w-md mx-auto w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-xl">
                <Search className="ml-4 w-5 h-5 text-[var(--text-dim)]" />
                <input
                type="text"
                placeholder="Search tools (e.g., 'IPO', 'Analysis')..."
                className="w-full bg-transparent border-none focus:ring-0 text-[var(--text-main)] placeholder-[var(--text-dim)] py-4 px-3 text-lg outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            </div>

            {/* Tools Grid */}
            <div className="w-full flex-grow content-start">
            <div className="bg-[var(--bg-card)]/50 backdrop-blur-md rounded-3xl border border-[var(--border-primary)] overflow-hidden shadow-2xl">
                
                {/* Table Header (Hidden on Mobile) */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-5 border-b border-[var(--border-secondary)] bg-[var(--bg-surface)]/50 text-[var(--text-muted)] font-medium text-sm uppercase tracking-wider">
                <div className="col-span-6 pl-2">Tool Name</div>
                <div className="col-span-3 text-center">Category</div>
                <div className="col-span-3 text-right pr-2">Action</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-[var(--border-secondary)]">
                {filteredTools.length > 0 ? (
                    filteredTools.map((tool) => (
                    <div 
                        key={tool.id} 
                        className="group relative md:grid md:grid-cols-12 md:gap-4 p-5 items-center hover:bg-[var(--bg-hover)] transition-all duration-300"
                    >
                        {/* Tool Info */}
                        <div className="col-span-6 flex items-center space-x-4 mb-3 md:mb-0">
                        <div className="flex-shrink-0 p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-secondary)] group-hover:border-blue-500/50 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300">
                            {tool.icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
                            {tool.name}
                            </h3>
                            {/* Mobile Category display */}
                            <div className="md:hidden mt-1 inline-block px-2 py-0.5 rounded-md bg-[var(--bg-surface)] text-[var(--text-muted)] text-xs font-medium border border-[var(--border-secondary)]">
                            {tool.category}
                            </div>
                        </div>
                        </div>

                        {/* Desktop Category */}
                        <div className="hidden md:block col-span-3 text-center">
                        <span className={`
                            px-3 py-1 rounded-full text-xs font-medium border
                            ${tool.category === 'Scanner' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                            tool.category === 'Calculator' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            tool.category === 'IPO' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            tool.category === 'Dashboard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-secondary)]'}
                        `}>
                            {tool.category}
                        </span>
                        </div>

                        {/* Action Button */}
                        <div className="col-span-3 flex justify-end">
                        <a 
                            href={tool.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--accent)] hover:text-[var(--text-on-accent)] border border-[var(--border-secondary)] hover:border-[var(--accent)] text-[var(--text-main)] transition-all duration-300 font-medium group-hover:translate-x-1"
                        >
                            <span>Open Tool</span>
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-[var(--text-muted)]">
                    <div className="inline-block p-4 rounded-full bg-[var(--bg-surface)] mb-4 border border-[var(--border-secondary)]">
                        <Search className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-lg">No tools found matching "{searchTerm}"</p>
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="mt-4 text-[var(--accent)] hover:underline"
                    >
                        Clear search
                    </button>
                    </div>
                )}
                </div>
            </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 text-center text-[var(--text-muted)] text-sm pb-6">
            <p>© {new Date().getFullYear()} Tools Center. All links open in a new tab.</p>
            </footer>
        </div>
    </div>
  );
};

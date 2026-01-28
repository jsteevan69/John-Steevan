
import React, { useState, useEffect, useCallback } from 'react';
import { 
  getLatestEconomicData, 
  getAuctionNotices, 
  getLatestYields,
  getYieldTrendData,
  getLatestNews,
  getWeeklyFridayReport,
  analyzeInvestment,
  generateMarketImage
} from './services/geminiService';
import { SearchResult, YieldDataPoint } from './types';
import DashboardCard from './components/DashboardCard';
import GroundingSources from './components/GroundingSources';
import ChatWidget from './components/ChatWidget';
import YieldChart from './components/YieldChart';

const TextSkeleton = () => (
  <div className="space-y-3 w-full">
    <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
    <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
    <div className="h-4 bg-slate-100 rounded w-[90%] animate-pulse"></div>
    <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
    <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse"></div>
  </div>
);

const App: React.FC = () => {
  const [economicData, setEconomicData] = useState<SearchResult | null>(null);
  const [auctionData, setAuctionData] = useState<SearchResult | null>(null);
  const [yieldsData, setYieldsData] = useState<SearchResult | null>(null);
  const [yieldTrends, setYieldTrends] = useState<YieldDataPoint[]>([]);
  const [newsData, setNewsData] = useState<SearchResult | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<SearchResult | null>(null);
  
  const [loadingEco, setLoadingEco] = useState(false);
  const [loadingAuction, setLoadingAuction] = useState(false);
  const [loadingYields, setLoadingYields] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'auctions' | 'weekly' | 'visualizer' | 'ai'>('dashboard');
  const [lastSync, setLastSync] = useState<string | null>(null);
  
  // Visualizer State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  // AI Analyst State
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const checkKey = async () => {
    const result = await (window as any).aistudio.hasSelectedApiKey();
    setHasKey(result);
  };

  const handleOpenSelectKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasKey(true); // Assume success per instructions
  };

  const fetchData = useCallback(async () => {
    setLoadingEco(true); setLoadingAuction(true); setLoadingYields(true); setLoadingNews(true);
    const [eco, auc, yld, news, trends] = await Promise.all([
      getLatestEconomicData(), getAuctionNotices(), getLatestYields(), getLatestNews(), getYieldTrendData()
    ]);
    setEconomicData(eco); setAuctionData(auc); setYieldsData(yld); setNewsData(news); setYieldTrends(trends);
    setLoadingEco(false); setLoadingAuction(false); setLoadingYields(false); setLoadingNews(false);
    setLastSync(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    fetchData();
    checkKey();
  }, [fetchData]);

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;
    setIsGenerating(true);
    try {
      const img = await generateMarketImage(imagePrompt, imageSize);
      setGeneratedImage(img);
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message.includes("Requested entity was not found")) {
        handleOpenSelectKey();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsAnalyzing(true);
    const response = await analyzeInvestment(query);
    setAiResponse(response);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-50 glass-effect border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <span className="text-xl font-bold text-slate-900">LankaDebt<span className="text-blue-600">Monitor</span></span>
            </div>
            <div className="hidden md:flex space-x-4">
              {['dashboard', 'auctions', 'weekly', 'visualizer', 'ai'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`text-sm font-medium px-3 py-2 rounded-md capitalize ${activeTab === tab ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}>{tab}</button>
              ))}
            </div>
            <button onClick={fetchData} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">Sync Data</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard title="LKR/USD (Spot)" value={loadingEco ? "..." : (economicData?.stats?.usdRate || "N/A")} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" /></svg>} loading={loadingEco} />
              <DashboardCard title="Inflation (CCPI)" value={loadingEco ? "..." : (economicData?.stats?.inflation || "N/A")} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} loading={loadingEco} trend={economicData?.stats?.inflationTrend} />
              <DashboardCard title="SDFR Rate" value={loadingEco ? "..." : (economicData?.stats?.sdfr || "N/A")} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7" /></svg>} loading={loadingEco} />
              <DashboardCard title="SLFR Rate" value={loadingEco ? "..." : (economicData?.stats?.slfr || "N/A")} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2" /></svg>} loading={loadingEco} />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold mb-4">Treasury Yield Trends (Last 5 Weeks)</h2>
              <YieldChart data={yieldTrends} loading={loadingYields} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white rounded-2xl p-6 border border-slate-200 h-96 overflow-y-auto">
                 <h3 className="font-bold mb-4">Detailed Market Analysis</h3>
                 {loadingEco ? <TextSkeleton /> : <p className="text-sm text-slate-700 whitespace-pre-wrap">{economicData?.text}</p>}
               </div>
               <div className="bg-white rounded-2xl p-6 border border-slate-200 h-96 overflow-y-auto">
                 <h3 className="font-bold mb-4">Market News</h3>
                 {loadingNews ? <TextSkeleton /> : <p className="text-sm text-slate-700 whitespace-pre-wrap">{newsData?.text}</p>}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'visualizer' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
              <h2 className="text-2xl font-bold mb-2">Market Visualizer</h2>
              <p className="text-slate-500 mb-6">Generate AI infographics or conceptual art for debt reports using Gemini 3 Pro Image.</p>
              
              {!hasKey ? (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl text-center">
                  <p className="text-blue-800 mb-4 font-medium">Image generation requires a paid API key for high-quality Pro models.</p>
                  <button onClick={handleOpenSelectKey} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Select API Key</button>
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="block mt-4 text-xs text-blue-500 underline">Learn about billing</a>
                </div>
              ) : (
                <form onSubmit={handleGenerateImage} className="space-y-4">
                  <div className="flex gap-4">
                    <input type="text" value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} placeholder="Describe the market visual (e.g. A futuristic 3D chart of Sri Lanka's economic recovery)..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
                    <select value={imageSize} onChange={e => setImageSize(e.target.value as any)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none">
                      <option value="1K">1K Res</option>
                      <option value="2K">2K Res</option>
                      <option value="4K">4K Res</option>
                    </select>
                  </div>
                  <button disabled={isGenerating} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50">
                    {isGenerating ? "Generating Masterpiece..." : "Generate Infographic"}
                  </button>
                </form>
              )}

              {generatedImage && (
                <div className="mt-8 rounded-2xl overflow-hidden border border-slate-200 shadow-2xl">
                  <img src={generatedImage} alt="AI Generated Market Visual" className="w-full object-cover" />
                  <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                    <span className="text-xs opacity-70">Generated at {imageSize} Resolution</span>
                    <button onClick={() => {const link = document.createElement('a'); link.href = generatedImage; link.download = 'market-visual.png'; link.click();}} className="text-xs bg-white/10 px-3 py-1 rounded">Download PNG</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other tabs follow previous structure but with upgraded models in service */}
        {activeTab === 'weekly' && (
           <div className="bg-white rounded-3xl p-8 border border-slate-200">
             <h2 className="text-2xl font-bold mb-4">Fixed Income Analyst Weekly Report</h2>
             {loadingWeekly ? <TextSkeleton /> : <div className="prose prose-slate max-w-none text-slate-800 whitespace-pre-wrap">{weeklyReport?.text}</div>}
             <button onClick={async () => { setLoadingWeekly(true); const r = await getWeeklyFridayReport(); setWeeklyReport(r); setLoadingWeekly(false); }} className="mt-6 bg-slate-900 text-white px-6 py-2 rounded-xl">Generate New Weekly Analysis</button>
           </div>
        )}

        {activeTab === 'ai' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6">Expert Debt Analyst</h2>
              <form onSubmit={handleAiSearch} className="flex gap-4 mb-8">
                <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Complex market queries (e.g. Impact of USD rate on T-bond demand)..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                <button disabled={isAnalyzing} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Analyze</button>
              </form>
              {isAnalyzing ? <TextSkeleton /> : aiResponse && <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 whitespace-pre-wrap text-sm leading-relaxed">{aiResponse}</div>}
            </div>
          </div>
        )}
      </main>

      <ChatWidget />
    </div>
  );
};

export default App;

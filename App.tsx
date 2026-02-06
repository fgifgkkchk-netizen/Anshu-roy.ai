
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Sparkles, 
  RefreshCcw, 
  Download, 
  Image as ImageIcon,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Copy,
  Zap,
  User,
  ShieldCheck,
  Send,
  Trash2,
  Heart,
  Star,
  Flower2,
  Globe,
  Activity,
  Share2,
  ExternalLink,
  X,
  Rocket,
  Search,
  Pointer,
  Gift,
  MousePointer2,
  Terminal
} from 'lucide-react';
import { GenerationResult, ChatMessage } from './types';
import { extractPromptFromImage, generateNewImage } from './services/geminiService';

const App: React.FC = () => {
  const [result, setResult] = useState<GenerationResult>({
    status: 'idle',
    extractedPrompt: '',
    chatHistory: [],
  });
  const [userInputMessage, setUserInputMessage] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(124);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showLiveGuide, setShowLiveGuide] = useState(false);
  
  const styleInputRef = useRef<HTMLInputElement>(null);
  const userInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadingMessages = [
    "Deep Identity Scan: Aapki facial features analyze ho rahi hain...",
    "Floral Pattern Extraction: Pink floral design dhoonda ja raha hai...",
    "Neural Style Fusion: Aapki shakal aur background ko milaya ja raha hai...",
    "Color Gradient Balancing: Colors aur lighting theek ki ja rahi hain...",
    "High-Res Finalization: Best quality photo generate ho rahi hai..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result.chatHistory]);

  useEffect(() => {
    let interval: number;
    if (result.status === 'generating') {
      setLoadingStep(0);
      setSimulatedProgress(0);
      
      interval = window.setInterval(() => {
        setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
        setSimulatedProgress(prev => Math.min(prev + (100 / 45), 100));
      }, 1000); 
    }
    return () => clearInterval(interval);
  }, [result.status]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const addChatMessage = (role: 'user' | 'assistant', text: string) => {
    setResult(prev => ({
      ...prev,
      chatHistory: [...(prev.chatHistory || []), { role, text }]
    }));
  };

  const handleStyleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setResult(prev => ({
        ...prev,
        originalImage: base64,
        extractedPrompt: '',
        status: 'analyzing',
      }));
      addChatMessage('assistant', "Namaste! Photo mil gayi. Iska pink floral style analyze kar raha hoon... 🌸");

      try {
        const prompt = await extractPromptFromImage(base64);
        setResult(prev => ({
          ...prev,
          extractedPrompt: prompt,
          status: 'completed',
        }));
        addChatMessage('assistant', "Style samajh liya! ✨ Ab apni face photo upload karein taaki hum result bana sakein.");
      } catch (error) {
        setResult(prev => ({ ...prev, status: 'error' }));
        addChatMessage('assistant', "Style samajhne mein dikkat hui. Dubara try karein.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUserPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setResult(prev => ({ ...prev, userImage: base64 }));
      addChatMessage('assistant', "Aapki photo mil gayi! 📸 Ab main bohot dhyan se (45 sec mein) aapki high-quality photo banauga.");
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAction = async (refinement?: string) => {
    if (!result.extractedPrompt) {
      addChatMessage('assistant', "Pehle style wali photo upload karein!");
      return;
    }

    setResult(prev => ({ ...prev, status: 'generating' }));
    
    if (refinement) {
      addChatMessage('user', refinement);
    }
    addChatMessage('assistant', "Processing shuru ho gayi hai! 🌟 Main har detail par kaam kar raha hoon taaki result perfect aaye. Please 45 seconds wait karein...");

    try {
      const imageUrl = await generateNewImage(result.extractedPrompt, result.userImage, refinement);
      
      setTimeout(() => {
        setResult(prev => ({
          ...prev,
          generatedImageUrl: imageUrl,
          status: 'completed'
        }));
        addChatMessage('assistant', "Dhyan se bani hui aapki photo taiyaar hai! ✨ Kaisi lagi?");
      }, 45000); 

    } catch (error: any) {
      setResult(prev => ({ ...prev, status: 'error' }));
      addChatMessage('assistant', "Generation fail ho gaya. Kripya dubara koshish karein.");
    }
    setUserInputMessage('');
  };

  const onChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInputMessage.trim() || result.status === 'generating') return;
    handleGenerateAction(userInputMessage);
  };

  const reset = () => {
    setResult({ status: 'idle', extractedPrompt: '', chatHistory: [] });
    setUserInputMessage('');
    setSimulatedProgress(0);
    if (styleInputRef.current) styleInputRef.current.value = '';
    if (userInputRef.current) userInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col font-sans">
      
      {/* Live Deployment Guide Modal (ULTIMATE FREE GUIDE) */}
      {showLiveGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-pink-900/60 backdrop-blur-md" onClick={() => setShowLiveGuide(false)}></div>
          <div className="glass w-full max-w-3xl h-[85vh] overflow-y-auto rounded-[3rem] p-6 md:p-12 shadow-[0_0_100px_rgba(173,20,87,0.5)] border-4 border-pink-100 relative animate-[scale_0.3s_ease-out] custom-scrollbar">
            <button 
              onClick={() => setShowLiveGuide(false)}
              className="absolute top-6 right-6 p-3 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-500 hover:text-white transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200">
                <Rocket className="w-10 h-10 text-white animate-bounce" />
              </div>
              <h2 className="text-4xl font-black text-pink-700 tracking-tight">Step-by-Step Free Guide 🌐</h2>
              <p className="text-green-600 font-black mt-2 bg-green-50 inline-block px-4 py-1 rounded-full text-xs uppercase tracking-widest">Chrome pe apna naam kaise layein (FREE)</p>
            </div>

            <div className="grid gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-pink-50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-pink-500"></div>
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 bg-pink-600 text-white rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg">1</div>
                  <div className="space-y-3">
                    <h4 className="font-black text-pink-800 text-xl uppercase tracking-tight">Github Par Code Daalein</h4>
                    <p className="text-sm text-pink-600 font-medium leading-relaxed">
                      Pehle <span className="font-black underline">github.com</span> par account banayein. Wahan "New Repository" banayein aur is website ki saari files (index.html, App.tsx, etc.) upload kar dein. Ye bilkul free hai.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-green-50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg">2</div>
                  <div className="space-y-3">
                    <h4 className="font-black text-green-800 text-xl uppercase tracking-tight">Vercel Connect Karein</h4>
                    <p className="text-sm text-green-700 font-medium leading-relaxed">
                      Ab <span className="font-black underline">vercel.com</span> par jayein aur "Continue with Github" karein. Apni repository select karein aur "Deploy" button daba dein. 
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-yellow-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400"></div>
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 bg-yellow-400 text-pink-900 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg">3</div>
                  <div className="space-y-3">
                    <h4 className="font-black text-pink-900 text-xl uppercase tracking-tight">Apna FREE Naam Chuney</h4>
                    <p className="text-sm text-pink-800 font-medium leading-relaxed">
                      Deployment ke baad Vercel settings mein "Domains" par jayein. Wahan aap apna naam likh sakte hain, jaise <span className="italic font-black">anshuroyai.vercel.app</span>. Ye link ab Chrome par kahin bhi khulega!
                    </p>
                  </div>
                </div>
              </div>

              {/* Optional Step 4 */}
              <div className="p-8 rounded-[2.5rem] bg-pink-50 border-4 border-dashed border-pink-100">
                <div className="flex gap-6 items-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <Pointer className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="font-black text-pink-700 text-sm uppercase tracking-widest">Agar .com chahiye to? (PAID)</h4>
                    <p className="text-[11px] text-pink-500 font-bold mt-1">
                      Agar paise aa jayein, toh Hostinger se domain kharid ke Vercel settings mein "Add Domain" kar dena. Phir aapka link <span className="font-black">anshuroyai.com</span> ho jayega!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowLiveGuide(false)}
              className="w-full mt-10 py-6 bg-pink-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-pink-200 hover:scale-[1.02] transition-all active:scale-95"
            >
              Abhi Try Karta Hoon! 🚀
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full px-4 py-8 md:py-12 flex-1 flex flex-col">
        
        {/* Top Status Bar */}
        <div className="flex justify-between items-center mb-8 px-4">
          <div className="flex items-center gap-2 bg-white/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-sm">System: Live</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowLiveGuide(true)}
              className="group relative flex items-center gap-2 bg-green-400 text-white px-6 py-3 rounded-full font-black text-[11px] uppercase tracking-widest shadow-[0_10px_20px_rgba(34,197,94,0.4)] hover:scale-110 transition-all active:scale-95 animate-bounce"
            >
              <MousePointer2 className="w-4 h-4 animate-[bounce_1s_infinite]" /> 
              FREE LIVE ON CHROME 🚀
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-green-600 text-[8px] font-black px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-green-100">
                CLICK FOR STEP-BY-STEP!
              </div>
            </button>
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-white/30 backdrop-blur-md px-4 py-3 rounded-full border border-white/50 hover:bg-white/50 transition-all active:scale-95 shadow-sm"
            >
              {copySuccess ? <CheckCircle2 className="w-3 h-3 text-green-300" /> : <Share2 className="w-3 h-3 text-white" />}
              <span className="text-[10px] font-black uppercase tracking-widest text-white">{copySuccess ? 'Copied!' : 'Share'}</span>
            </button>
            <div className="flex items-center gap-2 bg-pink-600/20 backdrop-blur-md px-4 py-3 rounded-full border border-pink-300/30">
              <Globe className="w-3 h-3 text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">{onlineUsers} Active</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="text-center mb-12 shrink-0">
          <div className="inline-flex items-center justify-center gap-3 px-6 py-2 rounded-full bg-white text-pink-500 font-black shadow-xl mb-6 border-2 border-pink-100">
            <Flower2 className="w-5 h-5 text-pink-400" />
            <span className="text-xs uppercase tracking-[0.2em]">Official AI Studio</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-4 text-white drop-shadow-[0_5px_15px_rgba(173,20,87,0.4)] tracking-tighter">
            Anshu Roy. Ai
          </h1>
          <p className="text-white text-lg md:text-xl max-w-2xl mx-auto font-black drop-shadow-md opacity-95">
            Ghera Pink Floral & Accurate Masterpieces 🌸
          </p>
        </header>

        {/* Main Interface */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1">
          
          {/* Uploads Center */}
          <section className="lg:col-span-3 flex flex-col gap-6">
            <div className="glass rounded-[3.5rem] p-8 shadow-2xl flex-1 flex flex-col space-y-8 deep-pink-shadow border-2 border-white/50">
              <h3 className="text-pink-700 font-black flex items-center gap-3 text-xl">
                <ImageIcon className="w-6 h-6 text-pink-400" />
                Select Photos
              </h3>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[12px] font-black text-pink-400 uppercase tracking-widest px-2">1. Like this Style</label>
                  <div 
                    className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-pink-50/50 border-4 border-dashed border-pink-200 cursor-pointer hover:border-pink-500 hover:bg-white transition-all flex items-center justify-center group shadow-inner"
                    onClick={() => styleInputRef.current?.click()}
                  >
                    {result.originalImage ? (
                      <img src={result.originalImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6">
                        <Upload className="w-10 h-10 mb-2 mx-auto text-pink-200 group-hover:text-pink-400 transition-colors" />
                        <span className="text-[10px] font-black text-pink-300 tracking-tighter uppercase text-center block">Upload Style Image</span>
                      </div>
                    )}
                    <input type="file" ref={styleInputRef} onChange={handleStyleUpload} className="hidden" accept="image/*" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[12px] font-black text-pink-400 uppercase tracking-widest px-2">2. Put my face</label>
                  <div 
                    className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-pink-50/50 border-4 border-dashed border-pink-200 cursor-pointer hover:border-pink-500 hover:bg-white transition-all flex items-center justify-center group shadow-inner"
                    onClick={() => userInputRef.current?.click()}
                  >
                    {result.userImage ? (
                      <img src={result.userImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6">
                        <User className="w-10 h-10 mb-2 mx-auto text-pink-200 group-hover:text-pink-400 transition-colors" />
                        <span className="text-[10px] font-black text-pink-300 tracking-tighter uppercase text-center block">Upload Your Face</span>
                      </div>
                    )}
                    <input type="file" ref={userInputRef} onChange={handleUserPhotoUpload} className="hidden" accept="image/*" />
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-pink-100">
                <button onClick={reset} className="w-full py-4 text-pink-400 hover:text-white hover:bg-pink-500 flex items-center justify-center gap-2 rounded-[2rem] transition-all text-xs font-black uppercase tracking-widest">
                  <Trash2 className="w-4 h-4" /> Reset All
                </button>
              </div>
            </div>
          </section>

          {/* AI Chat & Refine */}
          <section className="lg:col-span-5 flex flex-col h-[600px] lg:h-auto">
            <div className="glass rounded-[3.5rem] p-8 shadow-2xl flex flex-col h-full overflow-hidden deep-pink-shadow border-2 border-pink-100">
              <h3 className="text-pink-700 font-black mb-6 flex items-center gap-3 text-xl">
                <MessageSquare className="w-6 h-6 text-pink-400" />
                Live AI Assistant
              </h3>

              <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 custom-scrollbar min-0">
                {(result.chatHistory || []).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                    <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                      <Flower2 className="w-12 h-12 text-pink-400 animate-[spin_10s_linear_infinite]" />
                    </div>
                    <p className="text-pink-300 font-black text-sm italic tracking-tight leading-relaxed max-w-[200px]">
                      "Anshu Roy. Ai is online! Dono photos upload karke command dijiye."
                    </p>
                  </div>
                ) : (
                  result.chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-5 rounded-[2.5rem] text-sm leading-relaxed font-bold shadow-md ${
                        msg.role === 'user' 
                          ? 'bg-pink-500 text-white rounded-tr-none shadow-pink-200' 
                          : 'bg-white text-pink-800 border-2 border-pink-50 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="space-y-4 shrink-0">
                <form onSubmit={onChatSubmit} className="relative">
                  <input 
                    type="text"
                    value={userInputMessage}
                    onChange={(e) => setUserInputMessage(e.target.value)}
                    placeholder="Bataiye kya badalna hai? ✨"
                    className="w-full bg-white border-4 border-pink-50 rounded-[2.5rem] py-5 pl-10 pr-16 text-sm font-bold focus:outline-none focus:border-pink-300 focus:ring-8 focus:ring-pink-50 transition-all placeholder:text-pink-100 shadow-inner"
                    disabled={result.status === 'idle' || result.status === 'generating'}
                  />
                  <button 
                    type="submit"
                    disabled={!userInputMessage.trim() || result.status === 'generating'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3.5 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:bg-pink-100 transition-all active:scale-90 shadow-lg shadow-pink-200"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>

                {!result.generatedImageUrl && result.extractedPrompt && (
                  <button 
                    onClick={() => handleGenerateAction()}
                    disabled={result.status === 'generating'}
                    className="w-full py-5 bg-pink-500 text-white rounded-[2.5rem] text-sm font-black uppercase tracking-[0.3em] border-none hover:bg-pink-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-pink-200 active:scale-95"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" /> Start (Wait 45s)
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Final Result Area */}
          <section className="lg:col-span-4 flex flex-col">
            <div className="glass rounded-[3.5rem] p-8 shadow-2xl flex flex-col h-full overflow-hidden deep-pink-shadow border-2 border-pink-100">
              <h3 className="text-pink-700 font-black mb-6 flex items-center gap-3 text-xl">
                <Zap className="w-6 h-6 text-pink-400" />
                Live Result
              </h3>

              <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white border-[12px] border-pink-50 group mb-8 shadow-inner">
                {result.generatedImageUrl ? (
                  <>
                    <img src={result.generatedImageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-pink-600/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <a 
                        href={result.generatedImageUrl} 
                        download="anshu-roy-live-ai.png"
                        className="bg-white text-pink-600 px-10 py-5 rounded-[2.5rem] font-black flex items-center gap-3 hover:scale-110 transition-transform shadow-2xl border-2 border-pink-100"
                      >
                        <Download className="w-6 h-6" /> Save Image
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                    {result.status === 'generating' ? (
                      <div className="space-y-8 flex flex-col items-center w-full">
                        <div className="relative">
                          <div className="w-24 h-24 border-8 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-pink-500 animate-pulse" />
                        </div>
                        <div className="space-y-4 w-full">
                          <p className="text-pink-600 font-black text-sm uppercase tracking-widest animate-pulse">
                            Generating Live...
                          </p>
                          <div className="h-2 w-full bg-pink-100 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="h-full bg-pink-500 transition-all duration-100 ease-linear" 
                              style={{ width: `${simulatedProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-[11px] text-pink-400 font-bold italic h-8 flex items-center justify-center px-4 leading-tight">
                            {loadingMessages[loadingStep]}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="opacity-10 flex flex-col items-center">
                        <Flower2 className="w-24 h-24 mb-6 text-pink-800" />
                        <span className="text-[12px] font-black uppercase tracking-[0.5em] text-pink-900">PREVIEW</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {result.generatedImageUrl && (
                <div className="p-6 bg-white border-4 border-pink-50 text-pink-700 rounded-[2.5rem] flex items-start gap-4 shadow-xl">
                  <ShieldCheck className="w-6 h-6 shrink-0 mt-1 text-pink-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-black tracking-tight leading-none uppercase text-pink-900">Live Match Success!</p>
                    <p className="text-[10px] font-bold opacity-80 leading-relaxed italic">
                      "AI ne dhyan se aapki identity aur floral design ko live server par accurate banaya hai."
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      <footer className="py-12 text-center text-white font-black text-[12px] uppercase tracking-[0.8em] drop-shadow-md">
        Anshu Roy. Ai • Global Live Edition 🌸
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f8bbd0; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f06292; border: 2px solid transparent; background-clip: padding-box; }
        
        @keyframes scale {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default App;

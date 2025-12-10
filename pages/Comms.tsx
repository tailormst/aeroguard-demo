import React, { useState } from 'react';
import { generateMultiChannelComms } from '../services/geminiService';
import { Radio, MessageSquare, Mail, MessageCircle, Languages, Copy, Check, Send } from 'lucide-react';
import { CommDrafts } from '../types';

const Comms: React.FC = () => {
  const [context, setContext] = useState('');
  const [crisisType, setCrisisType] = useState('Cancellation');
  const [drafts, setDrafts] = useState<CommDrafts | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!context) return;
    setLoading(true);
    setDrafts(null);
    setCopiedField(null);
    
    try {
      const results = await generateMultiChannelComms(context, crisisType);
      setDrafts(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const OutputCard = ({ title, icon, content, fieldKey }: { title: string, icon: React.ReactNode, content: string, fieldKey: string }) => (
    <div className="bg-aero-900 border border-aero-700 rounded-xl p-4 flex flex-col h-full shadow-sm hover:border-aero-500 transition-colors">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-aero-700/50">
        <div className="flex items-center space-x-2 text-aero-300">
          {icon}
          <span className="font-semibold text-sm uppercase tracking-wide">{title}</span>
        </div>
        <button
          onClick={() => handleCopy(content, fieldKey)}
          className={`p-1.5 rounded-lg transition-all ${
            copiedField === fieldKey 
            ? 'bg-aero-success text-white' 
            : 'hover:bg-aero-700 text-aero-500 hover:text-white'
          }`}
          title="Copy to clipboard"
        >
          {copiedField === fieldKey ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className="flex-1 bg-aero-950/30 rounded-lg p-3 text-sm text-aero-200 font-light leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-60 scrollbar-thin scrollbar-thumb-aero-700">
        {content || "No content generated."}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
          <Radio className="mr-3 text-aero-accent" />
          Comms Center
        </h2>
        <p className="text-aero-400 mt-2 text-sm md:text-base">
          Multi-channel alert generation system. Instantly draft consistent messaging across all platforms.
        </p>
      </header>

      {/* Input Section */}
      <div className="bg-aero-800 p-5 md:p-6 rounded-2xl border border-aero-700 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-1 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-aero-300 mb-2">Crisis Type</label>
              <select
                value={crisisType}
                onChange={(e) => setCrisisType(e.target.value)}
                className="w-full bg-aero-900 border border-aero-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-aero-accent focus:border-transparent outline-none transition-all"
              >
                <option value="Cancellation">Cancellation</option>
                <option value="4-Hour Delay">4-Hour Delay</option>
                <option value="Diversion">Diversion</option>
                <option value="Gate Change">Gate Change</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Weather Alert">Weather Alert</option>
              </select>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={loading || !context}
              className={`w-full h-12 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg ${
                loading || !context
                  ? 'bg-aero-700 text-aero-500 cursor-not-allowed'
                  : 'bg-aero-accent hover:bg-sky-500 text-white shadow-aero-accent/20'
              }`}
            >
              {loading ? (
                <span className="animate-pulse">Generating...</span>
              ) : (
                <>
                  <Send className="mr-2" size={18} />
                  Draft Alerts
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-sm font-semibold text-aero-300 mb-2">Context / Specific Details</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., Flight UA920 to LHR delayed due to hydraulic leak. New departure time 18:30. Vouchers provided at Gate C12."
              className="w-full h-40 lg:h-32 bg-aero-900 border border-aero-600 rounded-xl p-4 text-white placeholder-aero-600 focus:ring-2 focus:ring-aero-accent focus:border-transparent transition-all resize-none text-sm md:text-base"
            />
          </div>
        </div>
      </div>

      {/* Output Grid */}
      <div className="bg-aero-800 p-5 md:p-6 rounded-2xl border border-aero-700">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <MessageSquare className="mr-2 text-aero-accent" size={20} />
          Generated Alerts
        </h3>
        
        {drafts ? (
          /* Responsive Grid: 1 col (mobile) -> 2 cols (tablet/md) -> 4 cols (desktop/lg) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            <OutputCard 
              title="SMS" 
              icon={<MessageSquare size={16} />} 
              content={drafts.sms} 
              fieldKey="sms" 
            />
            <OutputCard 
              title="WhatsApp" 
              icon={<MessageCircle size={16} />} 
              content={drafts.whatsapp} 
              fieldKey="whatsapp" 
            />
            <OutputCard 
              title="Email" 
              icon={<Mail size={16} />} 
              content={drafts.email} 
              fieldKey="email" 
            />
            <OutputCard 
              title="Hindi (Translation)" 
              icon={<Languages size={16} />} 
              content={drafts.hindi} 
              fieldKey="hindi" 
            />
          </div>
        ) : (
          <div className="h-48 md:h-64 flex flex-col items-center justify-center text-aero-500 border-2 border-dashed border-aero-700 rounded-xl bg-aero-800/50 p-4 text-center">
            <Radio size={40} className="mb-4 opacity-50" />
            <p className="font-medium">Ready to Draft</p>
            <p className="text-sm mt-1">Select a crisis type and enter details to generate multi-channel alerts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comms;
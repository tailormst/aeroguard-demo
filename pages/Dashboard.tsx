import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { Activity, AlertTriangle, Wind, Clock, Upload, Check, AlertOctagon, Loader2, Users, FileJson } from 'lucide-react';
import { getShortagePrediction } from '../services/geminiService';
import { ShortagePrediction } from '../types';

interface KPICardProps {
  title: string;
  value: string;
  trend?: string;
  icon: React.ReactNode;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, icon, color }) => (
  <div className="bg-aero-800 p-5 md:p-6 rounded-2xl border border-aero-700 shadow-sm flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <div className={color}>{icon}</div>
      </div>
      {trend && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-aero-700 text-aero-300">{trend}</span>}
    </div>
    <div>
      <h3 className="text-aero-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const resilienceData = [
  { time: '06:00', score: 92 },
  { time: '08:00', score: 88 },
  { time: '10:00', score: 94 },
  { time: '12:00', score: 91 },
  { time: '14:00', score: 85 },
  { time: '16:00', score: 89 },
  { time: '18:00', score: 95 },
];

const flightStatusData = [
  { name: 'JFK', onTime: 45, delayed: 12, cancelled: 2 },
  { name: 'LHR', onTime: 38, delayed: 5, cancelled: 0 },
  { name: 'HND', onTime: 52, delayed: 8, cancelled: 1 },
  { name: 'DXB', onTime: 40, delayed: 15, cancelled: 3 },
];

const Dashboard: React.FC = () => {
  const [crewFile, setCrewFile] = useState<string | null>(null);
  const [crewData, setCrewData] = useState<string>("");
  
  const [fdtlFile, setFdtlFile] = useState<string | null>(null);
  const [fdtlData, setFdtlData] = useState<string>("");

  const [prediction, setPrediction] = useState<ShortagePrediction | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'crew' | 'fdtl') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const text = await file.text();
      
      if (type === 'crew') {
        setCrewFile(file.name);
        setCrewData(text);
      } else {
        setFdtlFile(file.name);
        setFdtlData(text);
      }
    }
  };

  const runPrediction = async () => {
    if (!crewFile || !fdtlFile) return;
    setLoading(true);
    try {
      const result = await getShortagePrediction(crewData, fdtlData);
      setPrediction(result);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const getRiskColor = (level?: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL': return 'text-aero-danger';
      case 'HIGH': return 'text-orange-500';
      case 'MEDIUM': return 'text-aero-warning';
      default: return 'text-aero-success';
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Mission Control</h2>
        <p className="text-aero-400 text-sm md:text-base">Real-time operational resilience overview</p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard 
          title="Resilience Score" 
          value="92.4%" 
          trend="+2.1%" 
          icon={<Activity size={24} />} 
          color="text-aero-accent" 
        />
        <KPICard 
          title="Active Alerts" 
          value="3" 
          trend="Critical" 
          icon={<AlertTriangle size={24} />} 
          color="text-aero-danger" 
        />
        <KPICard 
          title="Weather Impact" 
          value="Moderate" 
          trend="N. Atlantic" 
          icon={<Wind size={24} />} 
          color="text-aero-warning" 
        />
        <KPICard 
          title="Avg. Delay" 
          value="14 min" 
          trend="-2 min" 
          icon={<Clock size={24} />} 
          color="text-aero-success" 
        />
      </div>

      {/* Shortage Predictor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Inputs */}
        <div className="bg-aero-800 p-5 md:p-6 rounded-2xl border border-aero-700 h-full flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
            <Upload className="mr-2 text-aero-accent" size={20} />
            Real-time Inputs
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 flex-1">
            {/* Crew Upload */}
            <div className="relative">
              <input 
                type="file" 
                id="crew-upload" 
                accept=".csv"
                onChange={(e) => handleFileChange(e, 'crew')}
                className="hidden" 
              />
              <label 
                htmlFor="crew-upload"
                className={`flex flex-col items-center justify-center min-h-[8rem] h-full border-2 border-dashed rounded-xl cursor-pointer transition-all p-4 text-center ${
                  crewFile 
                    ? 'border-aero-success bg-aero-success/10' 
                    : 'border-aero-600 hover:border-aero-400 hover:bg-aero-700/50'
                }`}
              >
                {crewFile ? (
                  <>
                    <Check className="text-aero-success mb-2" size={24} />
                    <span className="text-xs md:text-sm text-white font-medium break-all">{crewFile}</span>
                  </>
                ) : (
                  <>
                    <Users className="text-aero-500 mb-2" size={24} />
                    <span className="text-xs md:text-sm text-aero-400">Upload crew.csv</span>
                  </>
                )}
              </label>
            </div>

            {/* FDTL Rules Upload */}
            <div className="relative">
              <input 
                type="file" 
                id="fdtl-upload" 
                accept=".json"
                onChange={(e) => handleFileChange(e, 'fdtl')}
                className="hidden" 
              />
              <label 
                htmlFor="fdtl-upload"
                className={`flex flex-col items-center justify-center min-h-[8rem] h-full border-2 border-dashed rounded-xl cursor-pointer transition-all p-4 text-center ${
                  fdtlFile 
                    ? 'border-aero-success bg-aero-success/10' 
                    : 'border-aero-600 hover:border-aero-400 hover:bg-aero-700/50'
                }`}
              >
                {fdtlFile ? (
                  <>
                    <Check className="text-aero-success mb-2" size={24} />
                    <span className="text-xs md:text-sm text-white font-medium break-all">{fdtlFile}</span>
                  </>
                ) : (
                  <>
                    <FileJson className="text-aero-500 mb-2" size={24} />
                    <span className="text-xs md:text-sm text-aero-400">Upload fdtl_rules.json</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <button
            onClick={runPrediction}
            disabled={!crewFile || !fdtlFile || loading}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center transition-all ${
              !crewFile || !fdtlFile 
                ? 'bg-aero-700 text-aero-500 cursor-not-allowed'
                : 'bg-aero-accent text-white hover:bg-sky-500 shadow-lg shadow-aero-accent/20'
            }`}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Activity className="mr-2" />}
            {loading ? 'Analyzing...' : 'Run Shortage Predictor'}
          </button>
        </div>

        {/* Risk Forecast */}
        <div className="bg-aero-800 p-5 md:p-6 rounded-2xl border border-aero-700 relative overflow-hidden h-full flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
            <AlertOctagon className="mr-2 text-aero-warning" size={20} />
            Risk Forecast
          </h3>

          {prediction ? (
            <div className="space-y-6 animate-fade-in relative z-10 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                  <p className="text-aero-400 text-sm font-medium">Risk Level</p>
                  <p className={`text-4xl font-bold ${getRiskColor(prediction.riskLevel)} mt-1`}>
                    {prediction.riskLevel}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-aero-400 text-sm font-medium">Violations</p>
                  <p className="text-4xl font-bold text-white mt-1">{prediction.projectedShortageCount}</p>
                </div>
              </div>

              <div className="bg-aero-900/50 rounded-xl p-4 border border-aero-700/50 max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-aero-600">
                <p className="text-aero-300 italic text-sm leading-relaxed whitespace-pre-line">"{prediction.summary}"</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-aero-500 uppercase tracking-wider mb-3">Impacted Hubs</p>
                <div className="flex flex-wrap gap-2">
                  {prediction.affectedHubs?.length > 0 ? (
                    prediction.affectedHubs.map((hub: string) => (
                      <span key={hub} className="px-3 py-1 rounded-full bg-aero-700 text-aero-200 text-sm font-medium border border-aero-600">
                        {hub}
                      </span>
                    ))
                  ) : (
                     <span className="text-aero-500 text-sm">None detected</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-aero-500 min-h-[200px]">
               <div className="bg-aero-900 p-3 rounded-full mb-3">
                 <Activity size={32} className="opacity-50" />
               </div>
               <p className="text-sm px-4">Upload crew.csv and fdtl_rules.json to generate AI forecast.</p>
            </div>
          )}
          
          {/* Background decoration */}
          <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
            <AlertOctagon size={200} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-aero-800 p-5 md:p-6 rounded-2xl border border-aero-700">
          <h3 className="text-lg font-semibold text-white mb-6">Network Resilience (24h)</h3>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resilienceData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} domain={[60, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#0ea5e9' }}
                />
                <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="bg-aero-800 p-5 md:p-6 rounded-2xl border border-aero-700">
          <h3 className="text-lg font-semibold text-white mb-6">Hub Status</h3>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flightStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={40} />
                <Tooltip 
                  cursor={{fill: '#334155', opacity: 0.2}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="onTime" name="On Time" stackId="a" fill="#10b981" barSize={20} radius={[0, 0, 0, 0]} />
                <Bar dataKey="delayed" name="Delayed" stackId="a" fill="#f59e0b" barSize={20} radius={[0, 0, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill="#ef4444" barSize={20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
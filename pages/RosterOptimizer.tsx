import React, { useState } from 'react';
import { optimizeRoster } from '../services/geminiService';
import { Users, RefreshCw, CheckCircle, AlertCircle, FileText, Upload, Download, FileCheck, Plane } from 'lucide-react';

const RosterOptimizer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  
  const [fdtlFile, setFdtlFile] = useState<string | null>(null);
  const [fdtlData, setFdtlData] = useState<string>("");

  const [flightsFile, setFlightsFile] = useState<string | null>(null);
  const [flightsData, setFlightsData] = useState<string>("");

  const [crewFile, setCrewFile] = useState<string | null>(null);
  const [crewData, setCrewData] = useState<string>("");

  const [result, setResult] = useState<any | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'fdtl' | 'flights' | 'crew') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const text = await file.text();
      
      if (type === 'fdtl') {
        setFdtlFile(file.name);
        setFdtlData(text);
      } else if (type === 'flights') {
        setFlightsFile(file.name);
        setFlightsData(text);
      } else if (type === 'crew') {
        setCrewFile(file.name);
        setCrewData(text);
      }
    }
  };

  const handleOptimize = async () => {
    if (!flightsData || !crewData || !fdtlData) return;
    
    setLoading(true);
    setResult(null);
    try {
      // Pass all three contexts to the service
      const data = await optimizeRoster(flightsData, crewData, fdtlData);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.optimizedRoster) return;
    // The service returns a base64 encoded string as requested
    const linkSource = `data:text/csv;base64,${result.optimizedRoster}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = "optimized_roster.csv";
    downloadLink.click();
  };

  const isReady = flightsFile && crewFile && fdtlFile;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
          <Users className="mr-3 text-aero-accent" />
          Roster Optimizer
        </h2>
        <p className="text-aero-400 mt-2 text-sm md:text-base">
          Intelligent crew resource management. Detect fatigue risks and auto-suggest replacements based on FDTL compliance.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Config */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-aero-800 p-5 md:p-6 rounded-2xl border border-aero-700 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <FileCheck className="mr-2 text-aero-accent" size={20} />
              Configuration
            </h3>
            
            <div className="space-y-4 mb-8">
              {/* Flights Upload */}
              <div className="relative">
                <input 
                  type="file" 
                  id="flights-upload" 
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'flights')}
                  className="hidden" 
                />
                <label 
                  htmlFor="flights-upload"
                  className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                    flightsFile 
                      ? 'border-aero-success bg-aero-success/10' 
                      : 'border-aero-600 hover:border-aero-400 hover:bg-aero-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <Plane className={`shrink-0 ${flightsFile ? "text-aero-success" : "text-aero-500"}`} size={20} />
                    <span className={`text-sm font-medium truncate ${flightsFile ? "text-white" : "text-aero-400"}`}>
                      {flightsFile || "Upload flights.csv"}
                    </span>
                  </div>
                  {flightsFile && <CheckCircle className="text-aero-success shrink-0" size={18} />}
                </label>
              </div>

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
                  className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                    crewFile 
                      ? 'border-aero-success bg-aero-success/10' 
                      : 'border-aero-600 hover:border-aero-400 hover:bg-aero-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <Users className={`shrink-0 ${crewFile ? "text-aero-success" : "text-aero-500"}`} size={20} />
                    <span className={`text-sm font-medium truncate ${crewFile ? "text-white" : "text-aero-400"}`}>
                      {crewFile || "Upload crew.csv"}
                    </span>
                  </div>
                  {crewFile && <CheckCircle className="text-aero-success shrink-0" size={18} />}
                </label>
              </div>

              {/* FDTL Rules Upload */}
              <div className="relative">
                <input 
                  type="file" 
                  id="fdtl-upload" 
                  accept=".pdf,.json"
                  onChange={(e) => handleFileChange(e, 'fdtl')}
                  className="hidden" 
                />
                <label 
                  htmlFor="fdtl-upload"
                  className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                    fdtlFile 
                      ? 'border-aero-success bg-aero-success/10' 
                      : 'border-aero-600 hover:border-aero-400 hover:bg-aero-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <FileText className={`shrink-0 ${fdtlFile ? "text-aero-success" : "text-aero-500"}`} size={20} />
                    <span className={`text-sm font-medium truncate ${fdtlFile ? "text-white" : "text-aero-400"}`}>
                      {fdtlFile || "Upload FDTL Rules"}
                    </span>
                  </div>
                  {fdtlFile && <CheckCircle className="text-aero-success shrink-0" size={18} />}
                </label>
              </div>
            </div>

            <button
              onClick={handleOptimize}
              disabled={loading || !isReady}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg text-sm uppercase tracking-wide ${
                 loading || !isReady
                 ? 'bg-aero-700 text-aero-500 cursor-not-allowed'
                 : 'bg-aero-accent hover:bg-sky-500 text-white shadow-aero-accent/20'
              }`}
            >
              {loading ? <RefreshCw className="animate-spin mr-2" /> : <Users className="mr-2" />}
              Generate Compliant Roster
            </button>
            {!isReady && (
              <p className="text-center text-xs text-aero-500 mt-3">All 3 files are required to run optimization.</p>
            )}
          </div>
        </div>

        {/* Right Column: AI Output */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Summary of Changes */}
              <div className="bg-aero-800 border border-aero-700 p-5 md:p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <FileText className="mr-2 text-aero-accent" size={20} />
                    Optimization Summary
                  </h3>
                  <span className="text-xs bg-aero-success/20 text-aero-success px-2 py-1 rounded-full border border-aero-success/30">
                    Compliant
                  </span>
                </div>
                <div className="bg-aero-900/50 border border-aero-600/30 rounded-xl p-5">
                  <p className="text-aero-300 text-sm mb-2 font-semibold">Strategic Adjustments:</p>
                  <ul className="text-aero-200 text-sm leading-relaxed space-y-2 list-disc list-inside">
                     {result.summary && result.summary.split('\n').map((line: string, i: number) => (
                       <li key={i}>{line.replace(/^-\s*/, '')}</li>
                     ))}
                  </ul>
                </div>
              </div>

              {/* Optimized Roster Download */}
              <div className="bg-gradient-to-r from-aero-800 to-aero-900 border border-aero-700 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-lg text-center md:text-left space-y-4 md:space-y-0">
                <div className="mb-2 md:mb-0">
                  <h3 className="text-white font-semibold text-xl flex items-center justify-center md:justify-start">
                    <CheckCircle className="mr-2 text-aero-success" size={24} />
                    Roster Optimized
                  </h3>
                  <p className="text-aero-400 text-sm mt-2">
                    AI has successfully minimized cancellations.<br/>
                    Download the compliant roster CSV below.
                  </p>
                </div>
                <button 
                  onClick={handleDownload}
                  className="w-full md:w-auto flex items-center justify-center space-x-3 bg-aero-accent hover:bg-sky-500 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-aero-accent/20 font-bold"
                >
                  <Download size={20} />
                  <span>Download Roster.csv</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-aero-700 rounded-2xl p-6 md:p-12 text-center text-aero-500 bg-aero-800/30">
               <div className="bg-aero-800 p-4 rounded-full mb-4 shadow-lg">
                 <AlertCircle className="text-aero-600" size={40} />
               </div>
               <h3 className="text-lg font-medium text-aero-300">Awaiting Optimization</h3>
               <p className="text-sm mt-2 max-w-sm mx-auto">Upload flights, crew, and FDTL rules to generate an AI-optimized compliant schedule.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RosterOptimizer;
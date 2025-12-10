import React, { useState } from 'react';
import { generateSimulation } from '../services/geminiService';
import { Zap, Play, Loader2, DollarSign, Clock, ShieldAlert, Code, Check, Plane, FileJson } from 'lucide-react';

const Simulator: React.FC = () => {
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const [flightsFile, setFlightsFile] = useState<string | null>(null);
  const [flightsData, setFlightsData] = useState<string>("");
  
  const [rulesFile, setRulesFile] = useState<string | null>(null);
  const [rulesData, setRulesData] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'flights' | 'rules') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const text = await file.text();
      
      if (type === 'flights') {
        setFlightsFile(file.name);
        setFlightsData(text);
      } else {
        setRulesFile(file.name);
        setRulesData(text);
      }
    }
  };

  const handleSimulate = async () => {
    if (!scenario.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await generateSimulation(scenario, flightsData, rulesData);
      setResult(data);
    } catch (e) {
      console.error(e);
      // Basic error handling visual
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
          <Zap className="mr-3 text-aero-warning" />
          Scenario Analysis
        </h2>
        <p className="text-aero-400 mt-2 text-sm md:text-base">
          Predict operational impacts using Gemini generative AI. Test hypothetical disruptions to prepare mitigation strategies.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-aero-800 p-5 md:p-6 rounded-2xl border border-aero-700 shadow-lg">
            
            {/* Context Data Uploads */}
            <div className="mb-6 space-y-3">
               <h4 className="text-sm font-semibold text-aero-300 uppercase tracking-wider mb-2">Simulation Context</h4>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <input 
                      type="file" 
                      id="sim-flights-upload" 
                      accept=".csv"
                      onChange={(e) => handleFileChange(e, 'flights')}
                      className="hidden" 
                    />
                    <label 
                      htmlFor="sim-flights-upload"
                      className={`flex flex-col items-center justify-center h-20 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        flightsFile 
                          ? 'border-aero-success bg-aero-success/10' 
                          : 'border-aero-600 hover:border-aero-400 hover:bg-aero-700/50'
                      }`}
                    >
                      {flightsFile ? (
                        <Check className="text-aero-success" size={20} />
                      ) : (
                        <Plane className="text-aero-500" size={20} />
                      )}
                      <span className="text-[10px] mt-1 text-aero-400 font-medium truncate max-w-[90%] px-2">
                        {flightsFile || "flights.csv"}
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <input 
                      type="file" 
                      id="sim-rules-upload" 
                      accept=".json"
                      onChange={(e) => handleFileChange(e, 'rules')}
                      className="hidden" 
                    />
                    <label 
                      htmlFor="sim-rules-upload"
                      className={`flex flex-col items-center justify-center h-20 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        rulesFile 
                          ? 'border-aero-success bg-aero-success/10' 
                          : 'border-aero-600 hover:border-aero-400 hover:bg-aero-700/50'
                      }`}
                    >
                      {rulesFile ? (
                        <Check className="text-aero-success" size={20} />
                      ) : (
                        <FileJson className="text-aero-500" size={20} />
                      )}
                      <span className="text-[10px] mt-1 text-aero-400 font-medium truncate max-w-[90%] px-2">
                        {rulesFile || "fdtl_rules.json"}
                      </span>
                    </label>
                  </div>
               </div>
            </div>

            <label className="block text-sm font-semibold text-aero-300 mb-2">
              New Rule or Delay Scenario
            </label>
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full h-32 md:h-40 bg-aero-900 border border-aero-600 rounded-xl p-4 text-white placeholder-aero-600 focus:ring-2 focus:ring-aero-accent focus:border-transparent transition-all resize-none text-sm md:text-base"
              placeholder="e.g., 'night landings limit=2' or 'Severe blizzard at O'Hare lasting 6 hours'."
            />
            <button
              onClick={handleSimulate}
              disabled={loading || !scenario}
              className={`w-full mt-4 flex items-center justify-center py-4 px-6 rounded-xl text-white font-bold text-base md:text-lg transition-all ${
                loading || !scenario
                  ? 'bg-aero-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-aero-accent to-blue-600 hover:shadow-lg hover:shadow-aero-accent/30'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="mr-2 fill-current" size={20} />
                  Run Simulation
                </>
              )}
            </button>
            
            <div className="mt-6">
              <h4 className="text-xs font-semibold text-aero-500 uppercase tracking-wider mb-3">Quick Scenarios</h4>
              <div className="space-y-2">
                {[
                  "Volcanic ash cloud over Iceland",
                  "IT systems outage at JFK Hub",
                  "Wildcat strike ground crew LHR"
                ].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setScenario(s)}
                    className="w-full text-left text-sm text-aero-300 hover:text-white py-2 px-3 hover:bg-aero-700 rounded-lg transition-colors truncate"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-6 animate-fade-in">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-aero-800 border border-aero-700 p-5 rounded-xl">
                  <div className="flex items-center space-x-2 text-aero-danger mb-2">
                    <ShieldAlert size={20} />
                    <span className="font-semibold text-sm">Predicted Cancellations</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{result.predictedCancellationCount ?? "N/A"}</div>
                </div>
                <div className="bg-aero-800 border border-aero-700 p-5 rounded-xl">
                  <div className="flex items-center space-x-2 text-aero-warning mb-2">
                    <DollarSign size={20} />
                    <span className="font-semibold text-sm">Est. Cost</span>
                  </div>
                  <div className="text-2xl font-bold text-white">${result.estimatedCost?.toLocaleString() ?? "N/A"}</div>
                </div>
                <div className="bg-aero-800 border border-aero-700 p-5 rounded-xl">
                  <div className="flex items-center space-x-2 text-aero-success mb-2">
                    <Clock size={20} />
                    <span className="font-semibold text-sm">Recovery Time</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{result.recoveryTimeHours ?? 0} hrs</div>
                </div>
              </div>

              {/* Analysis */}
              <div className="bg-aero-800 border border-aero-700 p-6 md:p-8 rounded-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Zap size={100} />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-4">Impact Assessment</h3>
                 <p className="text-aero-300 leading-relaxed text-base md:text-lg">
                   {result.impactAssessment}
                 </p>
              </div>

              {/* Actions */}
              <div className="bg-aero-800 border border-aero-700 p-6 md:p-8 rounded-2xl">
                 <h3 className="text-xl font-bold text-white mb-6">Recommended Actions</h3>
                 <div className="space-y-4">
                   {result.suggestedActions?.map((action: string, idx: number) => (
                     <div key={idx} className="flex items-start bg-aero-900/50 p-4 rounded-xl border border-aero-700/50 hover:border-aero-accent/50 transition-colors">
                       <div className="bg-aero-accent/20 text-aero-accent p-2 rounded-lg mr-4 shrink-0">
                         <span className="font-bold text-sm">{idx + 1}</span>
                       </div>
                       <p className="text-aero-200 mt-1 text-sm md:text-base">{action}</p>
                     </div>
                   ))}
                 </div>
              </div>

              {/* JSON Viewer */}
              <div className="bg-aero-900 border border-aero-700 rounded-xl overflow-hidden mt-8 shadow-inner">
                 <div className="bg-aero-800 px-4 py-3 border-b border-aero-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                       <Code size={16} className="text-aero-accent"/>
                       <span className="text-xs font-mono font-bold text-aero-300 uppercase tracking-wider">JSON Output</span>
                    </div>
                    <span className="text-[10px] text-aero-500 font-mono">raw_response.json</span>
                 </div>
                 <pre className="p-4 text-xs font-mono text-green-400 bg-black/50 overflow-x-auto whitespace-pre-wrap max-h-64 scrollbar-thin scrollbar-thumb-aero-700">
                   {JSON.stringify(result, null, 2)}
                 </pre>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-aero-700 rounded-2xl text-aero-500 p-4 text-center">
              <div className="bg-aero-800 p-4 rounded-full mb-4">
                <Zap className="text-aero-600" size={40} />
              </div>
              <p className="text-lg font-medium">Ready to Simulate</p>
              <p className="text-sm mt-2 max-w-sm">Upload flights.csv and fdtl_rules.json, then enter a scenario to see AI predictions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulator;
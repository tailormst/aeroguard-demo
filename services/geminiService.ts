import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSimulation = async (scenario: string, flightsData?: string, rulesData?: string): Promise<any> => {
  try {
    const ai = getAIClient();
    // Use Gemini 3 Pro for complex cascading simulation reasoning
    const modelId = "gemini-3-pro-preview"; 

    const prompt = `
      Act as an Airline Operations Center Chief. 
      Analyze the following disruption scenario: "${scenario}".
      
      CONTEXT DATA:
      Flights CSV: ${flightsData ? flightsData.substring(0, 15000) : "No flight data provided."}
      FDTL Rules JSON: ${rulesData ? rulesData.substring(0, 5000) : "No rules provided."}
      
      Simulate the cascading effect of this scenario on the provided flight schedule, strictly adhering to the FDTL rules.
      
      Provide a structured JSON response with the following keys:
      {
        "impactAssessment": "A 2-sentence summary of the operational impact.",
        "predictedCancellationCount": 0, // Integer number of flights that must be cancelled
        "suggestedActions": ["Action 1", "Action 2", "Action 3"],
        "estimatedCost": 0, // Number only
        "recoveryTimeHours": 0 // Number only
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Simulation Error:", error);
    throw error;
  }
};

export const optimizeRoster = async (flightsData: string, crewData: string, rulesData: string): Promise<any> => {
  try {
    const ai = getAIClient();
    // Use Gemini 3 Pro for complex optimization and regulatory reasoning
    const modelId = "gemini-3-pro-preview"; 

    // Truncate inputs to avoid token limits for this demo, ensuring key headers are kept
    const flightContext = flightsData.substring(0, 10000);
    const crewContext = crewData.substring(0, 10000);
    const rulesContext = rulesData.substring(0, 5000);

    const prompt = `
      Act as an expert Crew Resources Scheduler.
      
      CONTEXT FILES:
      1. FDTL Rules (Regulations): ${rulesContext}
      2. Flights Schedule: ${flightContext}
      3. Crew Roster: ${crewContext}

      OBJECTIVE:
      Optimize the roster to minimize cancellations.
      Identify fatigue risks or rule violations in the current data and perform strategic pilot swaps to fix them.
      Strictly obey the provided FDTL Rules.

      OUTPUT:
      Return a JSON object with exactly these keys:
      {
        "summary": "A 3-point bulleted list (string) summarizing the specific fixes made.",
        "optimizedRosterCsv": "The FULL CSV content of the new, compliant roster."
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const jsonResponse = JSON.parse(response.text || "{}");
    
    // Encode the CSV string to Base64 to strictly meet the "base64 encoded CSV string" requirement
    const base64Roster = jsonResponse.optimizedRosterCsv ? btoa(jsonResponse.optimizedRosterCsv) : "";

    return {
      summary: jsonResponse.summary,
      optimizedRoster: base64Roster // Return as 'optimizedRoster' to match UI expectation
    };

  } catch (error) {
    console.error("Gemini Optimizer Error:", error);
    throw error;
  }
};

export const getShortagePrediction = async (crewData?: string, rulesData?: string): Promise<any> => {
  try {
    const ai = getAIClient();
    // Use Gemini 3 Pro for complex regulatory reasoning
    const modelId = "gemini-3-pro-preview";

    // Fallback if data is missing (for demo purposes if user uploads empty files or just clicks run)
    const context = crewData && rulesData 
      ? `Crew Data CSV: ${crewData.substring(0, 10000)}... \n\n FDTL Rules JSON: ${rulesData.substring(0, 5000)}...`
      : "No specific file content provided. Generate a realistic simulation based on standard FDTL constraints.";

    const prompt = `
      Act as an airline analyst.
      Analyze the provided crew.csv and fdtl_rules.json data below to identify any crew that will breach FDTL's 48-hour rest or 6-night landing limit in the next 7 days.
      
      DATA CONTEXT:
      ${context}
      
      Return a JSON object strictly matching this structure:
      {
        "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        "affectedHubs": ["HUB1", "HUB2"],
        "projectedShortageCount": 0, // number
        "summary": "Explain specific violations found, e.g., 'Captain X exceeds 6 consecutive night landings.'"
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    throw error;
  }
};

export const generateMultiChannelComms = async (context: string, crisisType: string): Promise<any> => {
  try {
    const ai = getAIClient();
    // Use Gemini 3 Pro for professional, multi-channel creative writing
    const modelId = "gemini-3-pro-preview"; 

    const prompt = `
      Act as a Senior Airline Corporate Communications Manager.
      
      TASK: Draft customer communications for a specific operational disruption.
      
      INPUTS:
      - Crisis Type: "${crisisType}" (e.g., Cancellation, Delay, Gate Change)
      - Context/Details: "${context}"
      
      OUTPUTS (JSON):
      Generate a JSON object with exactly these 4 keys:
      {
        "sms": "Max 160 characters. Urgent, clear.",
        "whatsapp": "Professional yet conversational. Use line breaks and 1-2 emojis.",
        "email": "Subject line, apology, explanation, next steps.",
        "hindi": "Polite translation of the WhatsApp draft into Hindi (Devanagari script)."
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Comms Error:", error);
    return {
      sms: "Error generating draft.",
      whatsapp: "Error generating draft.",
      email: "Error generating draft.",
      hindi: "Error generating draft."
    };
  }
};
"use client";

import { useState } from "react";
import Results from "@/components/results";
import Error from "@/components/error";
import MainScreen from "@/components/mainScreen";
import { ResultsData } from "@/types/main";

/**
 * Main Application Component - UN SDG Advocate
 *
 * Flow:
 * 1. User enters GitHub repository URL, problem statement, solution approach, target audience and long term goal
 * 2. The data is then sent to Flask backend for analysis
 * 4. Results show SDG predictions with confidence levels
 * 5. User can edit predictions via modal interface
 */
export default function Home() {
  const [results, setResults] = useState<ResultsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br">
      {results ? (
        // Results Screen
        <Results
          results={results}
          setResults={setResults}
          setError={setError}
        />
      ) : error ? (
        // Error Screen
        <Error error={error} setError={setError} setResults={setResults} />
      ) : (
        // Main Content
        <MainScreen setResults={setResults} />
      )}
    </div>
  );
}

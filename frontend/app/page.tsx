"use client";

import { useState } from "react";


import axios from "axios";
import Loading from "@/components/loading";
import Results from "@/components/results";
import Error from "@/components/error";
import MainScreen from "@/components/mainScreen";

export default function Home() {
  const [githubUrl, setGithubUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    sdg_predictions?: Record<string, number>;
    [key: string]: unknown;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const determineGoals = async () => {
    const response = await axios.post("http://127.0.0.1:5000/api/classify", {
      url: githubUrl,
    });
    return response.data;
  };

  const handleInteract = async () => {
    // Check the url if it contains "github.com"
    if (githubUrl.includes("github.com")) {
      setIsLoading(true);
      setError(null);
      setResults(null);
      console.log("Processing GitHub repository:", githubUrl);

      try {
        // Make the actual API call
        const data = await determineGoals();
        setResults(data);
        console.log("Processing completed:", data);
      } catch (error) {
        console.error("Error processing repository:", error);
        setError("Failed to analyze repository. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please enter a valid GitHub repository URL.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br">
      {isLoading ? (
        // Loading Screen
        <Loading />
      ) : results ? (
        // Results Screen
        <Results
          results={results}
          setResults={setResults}
          setError={setError}
          githubUrl={githubUrl}
          setGithubUrl={setGithubUrl}
        />
      ) : error ? (
        // Error Screen
        <Error error={error} setError={setError} setResults={setResults} />
      ) : (
        // Main Content (Initial Form)
        <MainScreen
          githubUrl={githubUrl}
          setGithubUrl={setGithubUrl}
          handleInteract={handleInteract}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

import { useState } from "react";
import { MdDone } from "react-icons/md";
import CardGrid from "./cardGrid";
import SummaryCard from "./summaryCard";
import RawResults from "./rawResults";
import EditModal from "./editModal";
import axios, { AxiosError } from "axios";

type ResultsProps = {
  results: {
    sdg_predictions?: Record<string, number>;
    [key: string]: unknown;
  } | null;
  setResults: (
    value: {
      sdg_predictions?: Record<string, number>;
      [key: string]: unknown;
    } | null
  ) => void;
  setError: (value: string | null) => void;
  githubUrl: string;
  setGithubUrl: (value: string) => void;
};

const Results = ({
  results,
  setResults,
  setError,
  githubUrl,
  setGithubUrl,
}: ResultsProps) => {
  const [editableResults, setEditableResults] = useState<
    Record<string, number>
  >({});

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPRLoading, setIsPRLoading] = useState(false);
  const [prMessage, setPrMessage] = useState<React.ReactNode | null>(null);
  const saveEditedResults = () => {
    // Update the results with edited values
    if (results) {
      setResults({
        ...results,
        sdg_predictions: editableResults,
      });
    }
    setIsModalOpen(false);
    setSaveMessage("SDG predictions updated successfully!");

    // Clear the message after 3 seconds
    setTimeout(() => {
      setSaveMessage(null);
    }, 3000);
  };

  const extractRepoInfo = (url: string) => {
    // Extract owner and repo from GitHub URL (supports various formats)
    const patterns = [
      /github\.com\/([^/]+)\/([^/]+)/, // https://github.com/owner/repo
      /^([^/]+)\/([^/]+)$/, // owner/repo
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const [, owner, repo] = match;
        // Remove .git suffix if present and clean up any trailing slashes or query params
        const cleanRepo = repo
          .replace(/\.git$/, "")
          .replace(/[?#].*$/, "")
          .replace(/\/$/, "");
        return { owner, repo: cleanRepo };
      }
    }
    return null;
  };

  const handlePullRequest = async () => {
    if (!results?.sdg_predictions) {
      setError("No SDG predictions available to create pull request.");
      return;
    }

    const repoInfo = extractRepoInfo(githubUrl);
    if (!repoInfo) {
      setError("Invalid GitHub URL format.");
      return;
    }

    setIsPRLoading(true);
    setPrMessage(null);

    try {
      // Prepare the unsdg.json content
      const unsdgData = {
        sdg_analysis: {
          analyzed_at: new Date().toISOString(),
          repository: githubUrl,
          predictions: results.sdg_predictions,
          summary: {
            total_sdgs: Object.keys(results.sdg_predictions).length,
            high_confidence: Object.values(results.sdg_predictions).filter(
              (score) => Number(score) >= 0.7
            ).length,
            medium_confidence: Object.values(results.sdg_predictions).filter(
              (score) => Number(score) >= 0.4 && Number(score) < 0.7
            ).length,
            low_confidence: Object.values(results.sdg_predictions).filter(
              (score) => Number(score) < 0.4
            ).length,
          },
        },
      };

      // Call your backend API to create the pull request
      const response = await axios.post("http://127.0.0.1:5000/api/create-pr", {
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        content: JSON.stringify(unsdgData, null, 2),
        message: "Add UN SDG analysis results",
        description: `This pull request adds UN SDG (Sustainable Development Goals) analysis results for this repository.\n\nAnalysis Summary:\n- Total SDGs analyzed: ${
          Object.keys(results.sdg_predictions).length
        }\n- High confidence matches: ${
          Object.values(results.sdg_predictions).filter(
            (score) => Number(score) >= 0.7
          ).length
        }\n- Medium confidence matches: ${
          Object.values(results.sdg_predictions).filter(
            (score) => Number(score) >= 0.4 && Number(score) < 0.7
          ).length
        }\n- Low confidence matches: ${
          Object.values(results.sdg_predictions).filter(
            (score) => Number(score) < 0.4
          ).length
        }\n\nThe \`unsdg.json\` file contains detailed predictions for each SDG goal.`,
      });

      if (response.data.success) {
        setPrMessage(
          <span>
            Pull request created successfully!
            <a
              href={response.data.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline hover:text-blue-900"
            >
              PR #{response.data.pr_number}
            </a>
          </span>
        );
      } else {
        setError(`Failed to create pull request: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Error creating pull request:", error);
      let errorMessage = "Unknown error";

      if (error instanceof AxiosError && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(`Failed to create pull request: ${errorMessage}`);
    } finally {
      setIsPRLoading(false);
    }
  };

  const handleChanges = () => {
    // Open modal with current SDG predictions for editing
    if (results?.sdg_predictions) {
      setEditableResults({ ...results.sdg_predictions });
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <main className="container mx-auto px-8 py-12">
        <div className="space-y-8">
          {/* Header with back button */}
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-black">
              UN SDG Analysis Results
            </h1>
            <button
              onClick={() => {
                setResults(null);
                setError(null);
                setGithubUrl("");
                setSaveMessage(null);
              }}
              className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl transition-colors duration-200"
            >
              Analyze Another Repository
            </button>
          </div>

          {/* Success Message */}
          {saveMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
              <MdDone className="mr-2" />
              {saveMessage}
            </div>
          )}

          {/* Pull Request Success Message */}
          {prMessage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center">
              <MdDone className="mr-2" />
              {prMessage}
            </div>
          )}

          {/* Repository URL */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Analyzed Repository:
            </h3>
            <p className="text-purple-700 font-medium break-all">{githubUrl}</p>
          </div>

          {/* Results Display */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800">
              UN SDG Goals Analysis
            </h3>

            {results?.sdg_predictions ? (
              <>
                {/* Summary Card */}
                <SummaryCard predictions={results?.sdg_predictions} />

                {/* SDG Cards Grid */}
                <CardGrid sdgPredictions={results.sdg_predictions} />
                {/* Buttons for "Yes, that's our goal" and "Maybe, we need some edits" */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handlePullRequest}
                    disabled={isPRLoading}
                    className="cursor-pointer mx-4 px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isPRLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating PR...
                      </span>
                    ) : (
                      "Yes, that's our goal"
                    )}
                  </button>
                  <button
                    onClick={handleChanges}
                    className="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
                  >
                    Maybe, we need some edits
                  </button>
                </div>
              </>
            ) : (
              <RawResults results={results} />
            )}
          </div>
        </div>
      </main>

      {/* Edit SDG Predictions Modal */}
      {isModalOpen && (
        <EditModal
          editableResults={editableResults}
          setEditableResults={setEditableResults}
          setIsModalOpen={setIsModalOpen}
          saveEditedResults={saveEditedResults}
        />
      )}
    </div>
  );
};

export default Results;

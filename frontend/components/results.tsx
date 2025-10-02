import { useState } from "react";
import { MdDone } from "react-icons/md";
import CardGrid from "./cardGrid";
import SummaryCard from "./summaryCard";
import RawResults from "./rawResults";
import EditModal from "./editModal";

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

  const handleChanges = () => {
    // Open modal with current SDG predictions for editing
    if (results?.sdg_predictions) {
      setEditableResults({ ...results.sdg_predictions });
      setIsModalOpen(true);
    }
  };

  const handleDownload = () => {
    if (!results?.sdg_predictions) {
      setError("No SDG predictions available to create pull request.");
      return;
    }
    try {
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

      // Convert to JSON string and create a Blob for download
      const jsonString = JSON.stringify(unsdgData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "unsdg.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSaveMessage("SDG analysis file downloaded successfully!");

      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch {
      setError("Failed to create json file for download.");
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
                    onClick={handleDownload}
                    className="cursor-pointer mx-4 px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <span className="flex items-center">
                      Yes, Download SDG Analysis File
                    </span>
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

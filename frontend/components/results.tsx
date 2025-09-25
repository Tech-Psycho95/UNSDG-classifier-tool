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

  const handlePullRequest = () => {
    // Logic to handle pull request creation
    alert("Pull request started");
    console.log("Pull request creation logic goes here.");
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
              <MdDone />
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
                    onClick={handlePullRequest}
                    className="cursor-pointer mx-4 px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-md"
                  >
                    Yes, that&apos;s our goal
                  </button>
                  <button
                    onClick={handleChanges}
                    className="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded-md"
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

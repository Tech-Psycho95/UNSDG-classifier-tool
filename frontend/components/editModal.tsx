import React from "react";
import { ImCross } from "react-icons/im";
import { RiDeleteBin5Line } from "react-icons/ri";

type EditModalProps = {
  editableResults: Record<string, number>;
  setEditableResults: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  saveEditedResults: () => void;
};

const EditModal: React.FC<EditModalProps> = ({
  editableResults,
  setEditableResults,
  setIsModalOpen,
  saveEditedResults,
}) => {
  const updateEditableResult = (sdgKey: string, newValue: number) => {
    setEditableResults((prev) => ({
      ...prev,
      [sdgKey]: newValue,
    }));
  };

  const removeSDG = (sdgKey: string) => {
    setEditableResults((prev) => {
      const updated = { ...prev };
      delete updated[sdgKey];
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Edit SDG Predictions</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <ImCross />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <p className="text-gray-600 mb-4">
            Adjust the confidence scores for each SDG goal (0.000 to 1.000)
          </p>
          <div className="space-y-4">
            {Object.entries(editableResults)
              .sort(([, a], [, b]) => Number(b) - Number(a))
              .map(([sdgKey, confidence]) => {
                const sdgMatch = sdgKey.match(/SDG (\d+): (.+)/);
                const sdgNumber = sdgMatch ? sdgMatch[1] : "";
                const sdgName = sdgMatch ? sdgMatch[2] : sdgKey;

                return (
                  <div
                    key={sdgKey}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* SDG Number */}
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {sdgNumber}
                      </div>

                      {/* SDG Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm">
                          SDG {sdgNumber}
                        </h4>
                        <p
                          className="text-gray-600 text-sm truncate"
                          title={sdgName}
                        >
                          {sdgName}
                        </p>
                      </div>

                      {/* Confidence Input */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <label className="text-sm text-gray-600 font-medium">
                          Score:
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.001"
                          value={confidence}
                          onChange={(e) =>
                            updateEditableResult(
                              sdgKey,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <span className="text-sm text-gray-500">
                          ({Math.round(Number(confidence) * 100)}%)
                        </span>
                        <button
                          onClick={() => removeSDG(sdgKey)}
                          className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                          title="Remove this SDG"
                        >
                          <RiDeleteBin5Line />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 ml-16">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.round(Number(confidence) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveEditedResults}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;

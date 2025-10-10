import React from "react";

interface SummaryCardProps {
  predictions: { [key: string]: number | string };
}

const SummaryCard: React.FC<SummaryCardProps> = ({ predictions }) => {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold">
            {Object.keys(predictions).length}
          </div>
          <div className="text-purple-100">SDGs Analyzed</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">
            {
              Object.values(predictions).filter((score) => Number(score) >= 0.7)
                .length
            }
          </div>
          <div className="text-purple-100">Potential Matches</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">
            {
              Object.values(predictions).filter((score) => Number(score) >= 0.9)
                .length
            }
          </div>
          <div className="text-purple-100">Strong Matches</div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;

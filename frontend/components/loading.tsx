import React from "react";
import { Spinner } from "./spinner";

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br">
      <div className="text-center space-y-6">
        <Spinner variant="ring" size={64} className="text-purple mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-purple">
            Analyzing Repository
          </h2>
          <p className="text-purple-600 text-lg">
            Checking which UN SDG goals your project satisfies...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loading;

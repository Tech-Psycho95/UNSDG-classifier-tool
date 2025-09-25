import React from "react";
import Goals from "@/assets/UNSDG Goals Image.jpg";
import Image from "next/image";

interface MainScreenProps {
  githubUrl: string;
  setGithubUrl: (url: string) => void;
  handleInteract: () => void;
  isLoading: boolean;
}

const MainScreen: React.FC<MainScreenProps> = ({
  githubUrl,
  setGithubUrl,
  handleInteract,
  isLoading,
}) => {
  return (
    <main className="container mx-auto px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-6xl font-bold text-black leading-tight">
              Check which <span className="text-purple-700">UN SDG goals</span>{" "}
              your project satisfy
            </h1>
            <p className="text-xl text-gray-800 leading-relaxed">
              A simple tool that identifies relevant UN Sustainable Development
              Goals (SDGs) based on the content of a Github repository.
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Paste your github repository link here.."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="flex-1 px-6 py-4 rounded-2xl border-0 text-gray-600 placeholder-gray-400 text-lg shadow-sm focus:outline-none"
              />
              <button
                onClick={handleInteract}
                disabled={isLoading}
                className="px-8 py-4 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-colors duration-200 shadow-lg"
              >
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="flex justify-center lg:justify-end">
          <Image src={Goals} alt="UN SDG Goals" className="max-w-full h-auto" />
        </div>
      </div>
    </main>
  );
};

export default MainScreen;

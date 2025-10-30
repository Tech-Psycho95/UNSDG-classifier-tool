import React, { useRef, useState } from "react";
import Goals from "@/assets/UNSDG Goals Image.jpg";
import Image from "next/image";
import axios from "axios";
import { SlCloudUpload } from "react-icons/sl";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const [projectName, setProjectName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadMsg(null);
    if (!file) return;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // handleInteract();
    if (!selectedFile) {
      setUploadMsg("Please upload an SDG.md file before submitting.");
    }

    if (!projectName || !projectUrl) {
      setUploadMsg("Please fill in all required fields before submitting.");
    }

    if (projectUrl.includes("github.com") === false) {
      setUploadMsg("Please enter a valid GitHub repository URL.");
    }

    const formData = new FormData();
    formData.append("project_name", projectName);
    formData.append("project_url", projectUrl);
    formData.append("file", selectedFile);
    try {
      setIsUploading(true);
      const base = "http://127.0.0.1:5000/";
      const response = await axios.post(base + "api/upload_md", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (!response.statusText || response.statusText !== "OK") {
        throw new Error("File Upload Failed");
      }
      if (response.data && response.data.repo_url) {
        setGithubUrl(response.data.repo_url);
        setUploadMsg("File Uploaded Successfully!");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadMsg("File Upload Failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <div>
      <div className="container mx-auto px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-6xl font-bold text-black leading-tight">
                Check which{" "}
                <span className="text-purple-700">UN SDG goals</span> your
                project satisfy
              </h1>
              <p className="text-xl text-gray-800 leading-relaxed">
                A simple tool that identifies relevant UN Sustainable
                Development Goals (SDGs) based on the content of a Github
                repository.
              </p>
            </div>

            {/* Input section */}
            {/* <div className="space-y-4">
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
            </div> */}
          </div>

          {/* Upload your SDG.md file */}
          {/* <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            accept=".md, text/markdown"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-gray-800 font-medium border border-gray-200"
          >
            {isUploading ? "Uploading..." : "Upload your SDG.md file"}
          </button>
          {selectedFile && (
            <span className="text-sm text-gray-600 truncate max-w-[50%">
              {selectedFile.name}
            </span>
          )}
          {uploadMsg && (
            <span className="text-sm text-gray-500">{uploadMsg}</span>
          )}
        </div> */}

          {/* Right Illustration */}
          <div className="flex justify-center lg:justify-end">
            <Image
              src={Goals}
              alt="UN SDG Goals"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      </div>
      <div className="text-center px-8 py-16 bg-purple-400">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Analyze Your Project
            </h2>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="projectName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Project Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter your project name"
                required
                className="w-full bg-white px-6 py-4 rounded-2xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="projectUrl"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Project GitHub URL
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="projectUrl"
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                required
                className="w-full bg-white px-6 py-4 rounded-2xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none  focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SDG.md file
                <span className="text-red-500 ml-1">*</span>
              </label>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md, text/markdown"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full bg-white  px-6 py-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-500 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-left flex items-center justify-between"
                >
                  <span className="text-gray-600">
                    {selectedFile ? (
                      <span className="flex items-center gap-2">
                        <SlCloudUpload className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-700">
                          {selectedFile.name}
                        </span>
                      </span>
                    ) : (
                      "Click to upload your SDG.md file"
                    )}
                  </span>

                  <SlCloudUpload className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {selectedFile && (
                <p className="mt-2 text-sm text-gray-500">
                  File size: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              )}
            </div>

            {/* Upload Message */}
            {uploadMsg && (
              <div
                className={`p-4 rounded-2xl ${
                  uploadMsg.includes("success")
                    ? "bg-green-50  border border-green-200 "
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {uploadMsg.includes("success") ? (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <TiTick className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <ImCross className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className="font-medium">{uploadMsg}</span>
                </div>
              </div>
            )}
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading || !projectName || !projectUrl}
              className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  {/* <svg
                    className="animate-spin h-5 w-5"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg> */}
                  <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                  Processing...
                </span>
              ) : (
                "Analyze SDG Alignment"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MainScreen;

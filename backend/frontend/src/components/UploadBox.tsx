import { useState } from "react";
import api from "../services/api";

export default function UploadBox() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const uploadFile = async () => {
    if (!file) {
      setMessage("Please select a PDF file.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(
        `✅ Uploaded successfully! Chunks: ${response.data.chunks}`
      );
    } catch (error) {
      console.error(error);
      setMessage("❌ Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
      <h2 className="text-2xl font-bold text-center mb-6">
        Upload Contract
      </h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setFile(e.target.files ? e.target.files[0] : null)
        }
        className="mb-4 w-full"
      />

      <button
        onClick={uploadFile}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Upload PDF"}
      </button>

      {message && (
        <p className="mt-4 text-center font-medium">
          {message}
        </p>
      )}
    </div>
  );
}
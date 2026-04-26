import { useState } from "react";
import { useNavigate } from "react-router";
import { Upload, X, FileText } from "lucide-react";
import { uploadReceipt } from "../../src/lib/api";

export default function UploadReceipt() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError("");

    try {
      const result = await uploadReceipt(selectedFile);
      navigate("/dashboard/processing", {
        state: { receiptId: result.receiptId },
      });
    } catch (err) {
      setError("Chyba pri nahrávaní. Skús znova.");
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Upload Receipt</h1>

      {!selectedFile ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100">
          <div className="max-w-2xl mx-auto">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center hover:border-blue-400 transition-colors">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-linear-to-r from-blue-100 to-violet-100 rounded-full flex items-center justify-center mb-6">
                  <Upload className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Drag & drop your receipt here
                </h3>
                <p className="text-gray-500 mb-6">
                  Supported formats: JPG, PNG, PDF
                </p>
                <label className="px-6 py-3 bg-linear-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all cursor-pointer">
                  Choose file
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Selected file
            </h2>
            <div className="border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-32 h-40 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <FileText className="w-16 h-16 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-800">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex gap-4">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "Scanning..." : "Start scanning"}
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

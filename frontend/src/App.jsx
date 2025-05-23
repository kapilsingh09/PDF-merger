import { useState } from 'react';

function App() {
  const [files, setFiles] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prevFiles) => {
      const combined = [...prevFiles];
      newFiles.forEach((newFile) => {
        if (!combined.some(f => f.name === newFile.name && f.size === newFile.size)) {
          combined.push(newFile);
        }
      });
      return combined;
    });
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('Please select at least 2 PDF files to merge!');
      return;
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append('pdfs', file);
    }

    try {
      const response = await fetch('http://localhost:5000/api/merge', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to merge PDFs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">PDF Merger</h2>

      <div className="mb-6">
        <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
          + Add PDF Files
        </label>
        <input id="file-upload" type="file" multiple accept="application/pdf" onChange={handleFileChange} className="hidden" />

        {files.length > 0 && (
          <button onClick={clearAllFiles} className="ml-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition text-sm">
            Clear All
          </button>
        )}
      </div>

      <div className="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50 min-h-[120px]">
        {files.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No PDFs selected yet.</p>
            <p className="text-sm">Click "Add PDF Files" to start selecting files.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-gray-700">{files.length} PDF{files.length > 1 ? 's' : ''} selected</p>
              <p className="text-sm text-gray-500">Total size: {formatFileSize(totalSize)}</p>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {files.map((file, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 px-3 bg-white rounded border mb-2 hover:bg-gray-50 transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)} • Added {idx + 1}</p>
                  </div>
                  <button onClick={() => removeFile(idx)} className="ml-4 text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {files.length > 0 && files.length < 2 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">📝 Add at least one more PDF to enable merging.</p>
        </div>
      )}

      <button
        onClick={handleMerge}
        disabled={files.length < 2}
        className={`w-full font-semibold py-3 rounded-md transition ${
          files.length < 2 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {files.length < 2 ? 'Select at least 2 PDFs to merge' : `Merge ${files.length} PDFs`}
      </button>

      {showInstructions && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md relative">
          <button onClick={() => setShowInstructions(false)} className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 p-1 rounded transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-sm font-semibold text-blue-800 mb-2">How to use:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Click "Add PDF Files" to select multiple PDFs</li>
            <li>• You can add more files by clicking the button again</li>
            <li>• Remove individual files using the × button</li>
            <li>• Files will be merged in the order they appear</li>
            <li>• At least 2 PDFs are required for merging</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;

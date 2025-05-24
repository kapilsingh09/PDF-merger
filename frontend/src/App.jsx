import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  FileText, 
  X, 
  Trash2, 
  Sun, 
  Moon, 
  Loader, 
  Download,
  Check,
  AlertCircle
} from 'lucide-react';

const PDFMerger = () => {
  const [files, setFiles] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [notification, setNotification] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFileChange = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== selectedFiles.length) {
      showNotification('Only PDF files are allowed', 'error');
    }
    
    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
      showNotification(`Added ${pdfFiles.length} PDF file${pdfFiles.length > 1 ? 's' : ''}`, 'success');
    }
    
    // Reset input
    e.target.value = '';
  }, []);

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    showNotification('File removed', 'info');
  }, []);

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    showNotification('All files cleared', 'info');
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const handleMerge = async () => {
    if (files.length < 2) return;

    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:5000/api/merge', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to merge PDFs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showNotification('PDFs merged successfully! Download started.', 'success');
    } catch (error) {
      showNotification('Error merging PDFs. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`min-h-[100vh] transition-all duration-500 ${darkMode ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-200 via-purple-200 via-blue-200 via-cyan-200 to-green-200 dark:from-purple-900 dark:via-blue-900 dark:via-indigo-900 dark:to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent dark:from-black/20"></div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-r from-pink-300/30 to-purple-300/30 blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -150, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-blue-300/30 to-cyan-300/30 blur-xl"
        />
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <div className={`p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
              notification.type === 'success' ? 'bg-green-100/90 border-green-300 text-green-800' :
              notification.type === 'error' ? 'bg-red-100/90 border-red-300 text-red-800' :
              'bg-blue-100/90 border-blue-300 text-blue-800'
            }`}>
              <div className="flex items-center gap-2">
                {notification.type === 'success' && <Check size={16} />}
                {notification.type === 'error' && <AlertCircle size={16} />}
                <span className="text-sm font-medium">{notification.message}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto py-8 px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div 
            variants={itemVariants}
            className="flex justify-between items-center mb-9"
          >
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                PDF Merger
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Combine multiple PDFs into one seamless document
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
            >
              {darkMode ? (
                <Sun className="text-yellow-500 w-6 h-6" />
              ) : (
                <Moon className="text-indigo-600 w-6 h-6" />
              )}
            </motion.button>
          </motion.div>

          {/* Upload Controls completed checked */}
          <motion.div 
            variants={itemVariants}
            className="mb-4 flex flex-wrap items-center gap-4"
          >
            <motion.label
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              htmlFor="file-upload"
              className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl backdrop-blur-sm"
            >
              <UploadCloud size={20} />
              <span className="font-semibold">Add PDF Files</span>
            </motion.label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <AnimatePresence>
              {files.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAllFiles}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Trash2 size={16} />
                  <span className="font-medium">Clear All</span>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* File Display Area */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 mb-4 min-h-[200px]"
          >
            <AnimatePresence mode="wait">
              {files.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    No PDFs selected yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Click "Add PDF Files" to start building your merged document
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="files"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* File Stats  completed*/}
                  <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl">
                    <div>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {files.length} PDF{files.length > 1 ? 's' : ''} Ready to Merge
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total size: {formatFileSize(totalSize)}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
                    >
                      <FileText className="text-white w-6 h-6" />
                    </motion.div>
                  </div>

                  {/* File List */}
                  <div className="max-h-80 overflow-y-auto space-y-3 custom-scrollbar">
                    <AnimatePresence>
                      {files.map((file, idx) => (
                        <motion.div
                          key={`${file.name}-${idx}`}
                          initial={{ opacity: 0, x: -20, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 20, scale: 0.9 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          transition={{ duration: 0.2 }}
                          className="flex justify-between items-center p-4 bg-white/60 dark:bg-gray-700/60 rounded-2xl shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/30 dark:border-gray-600/30"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                              <FileText className="text-white w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white truncate text-lg">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatFileSize(file.size)} • Position #{idx + 1}
                              </p>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFile(idx)}
                            className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X size={18} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Merge Requirements Alert */}
          <AnimatePresence>
            {files.length > 0 && files.length < 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-300 dark:border-yellow-700 rounded-2xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-yellow-600 dark:text-yellow-400 w-5 h-5" />
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    Add at least one more PDF to enable merging
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Merge Button */}
          <motion.button
            variants={itemVariants}
            whileHover={{ 
              scale: files.length >= 2 && !loading ? 1.05 : 1,
              boxShadow: files.length >= 2 && !loading ? "0 20px 40px rgba(0,0,0,0.1)" : "none"
            }}
            whileTap={{ scale: files.length >= 2 && !loading ? 0.98 : 1 }}
            onClick={handleMerge}
            disabled={files.length < 2 || loading}
            className={`w-full font-bold py-5 rounded-3xl transition-all duration-300 text-white text-xl flex justify-center items-center gap-3 shadow-2xl ${
              files.length < 2 || loading
                ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600'
            }`}
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={24} />
                <span>Merging Your PDFs...</span>
              </>
            ) : (
              <>
                <Download size={24} />
                <span>Merge {files.length} PDFs Into One</span>
              </>
            )}


          </motion.button>
          {/* Instructions Panel */}
          <AnimatePresence>
            {showInstructions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm border border-blue-200 dark:border-blue-700 rounded-3xl p-6 relative overflow-hidden"
              >
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowInstructions(false)}
                  className="absolute top-4 right-4 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 p-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-all duration-200"
                  aria-label="Close instructions"
                >
                  <X size={20} />
                {/* //here the cut option at the end for instructions */}
                </motion.button>
                
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  How to Use PDF Merger
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold mt-0.5">1</div>
                      <p className="text-blue-700 dark:text-blue-300">Click "Add PDF Files" to select multiple PDFs from your device</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold mt-0.5">2</div>
                      <p className="text-blue-700 dark:text-blue-300">Add more files anytime by clicking the button again</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold mt-0.5">3</div>
                      <p className="text-blue-700 dark:text-blue-300">Remove individual files using the × button if needed</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold mt-0.5">4</div>
                      <p className="text-blue-700 dark:text-blue-300">Files will be merged in the exact order they appear in the list</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold mt-0.5">5</div>
                      <p className="text-blue-700 dark:text-blue-300">At least 2 PDFs are required to start the merging process</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold mt-0.5">6</div>
                      <p className="text-blue-700 dark:text-blue-300">Your merged PDF will be ready for download once complete</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          display:none;
       
        }
        
        `}</style>
        {/* {*
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0,0,0,0.1);
        border-radius: 10px;
           // width: 6px;  
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #667eea, #764ba2);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #5a6fd8, #6a4190);
      }
     *}  */}
    </div>
  );
};

export default PDFMerger;
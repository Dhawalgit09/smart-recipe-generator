'use client';

import React, { useState, useCallback, useRef } from 'react';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  onIngredientsDetected: (ingredients: string[]) => void;
  isLoading?: boolean;
}

export default function ImageUpload({ onImageUpload, onIngredientsDetected, isLoading = false }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    setError(null);
    
    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      setError('Please upload a JPG or PNG image');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDetectIngredients = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/ingredients-from-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to detect ingredients');
      }

      const data = await response.json();
      
      if (data.ingredients && Array.isArray(data.ingredients)) {
        setDetectedIngredients(data.ingredients);
        onIngredientsDetected(data.ingredients);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error detecting ingredients:', err);
      setError(err instanceof Error ? err.message : 'Failed to detect ingredients');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateRecipes = () => {
    if (detectedIngredients.length > 0) {
      onImageUpload(selectedFile!);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDetectedIngredients([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const editIngredients = (index: number, value: string) => {
    const newIngredients = [...detectedIngredients];
    newIngredients[index] = value;
    setDetectedIngredients(newIngredients);
    onIngredientsDetected(newIngredients);
  };

  const addIngredient = () => {
    const newIngredients = [...detectedIngredients, ''];
    setDetectedIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = detectedIngredients.filter((_, i) => i !== index);
    setDetectedIngredients(newIngredients);
    onIngredientsDetected(newIngredients);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="space-y-4">
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            dragActive
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-gray-600 hover:border-purple-500/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileInput}
            className="hidden"
          />

          {!selectedFile ? (
            <div className="space-y-4">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-xl font-bold text-white">
                Upload Food Image
              </h3>
              <p className="text-gray-300">
                Drag & drop your image here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  browse files
                </button>
              </p>
              <p className="text-gray-400 text-sm">
                Supports JPG, PNG up to 5MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={previewUrl!}
                  alt="Preview"
                  className="max-w-full max-h-64 rounded-lg object-cover"
                />
                <button
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-300">{selectedFile.name}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {selectedFile && !detectedIngredients.length && (
        <div className="text-center">
          <button
            onClick={handleDetectIngredients}
            disabled={isProcessing}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300"
          >
            {isProcessing ? (
              <span className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Detecting Ingredients...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>🔍</span>
                <span>Detect Ingredients</span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* Detected Ingredients */}
      {detectedIngredients.length > 0 && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              Detected Ingredients
            </h3>
            <p className="text-gray-300 text-sm">
              Review and edit the detected ingredients
            </p>
          </div>

          <div className="bg-[#1a1a2e] rounded-2xl border border-[#2d2d5a] p-6">
            <div className="space-y-3">
              {detectedIngredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => editIngredients(index, e.target.value)}
                    className="flex-1 bg-[#0f0f23] border border-[#2d2d5a] rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="Ingredient name"
                  />
                  <button
                    onClick={() => removeIngredient(index)}
                    className="w-8 h-8 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <button
                onClick={addIngredient}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                + Add Ingredient
              </button>

              <button
                onClick={handleGenerateRecipes}
                disabled={isLoading || detectedIngredients.some(ing => !ing.trim())}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Recipes...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>🍳</span>
                    <span>Generate Recipes</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

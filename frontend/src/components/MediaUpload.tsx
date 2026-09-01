"use client";

import React, { useState } from "react";
import { UploadCloud, Image as ImageIcon, Film, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface MediaUploadProps {
  mediaUrls: string[];
  setMediaUrls: (urls: string[]) => void;
}

export function MediaUpload({ mediaUrls, setMediaUrls }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await api.uploadMedia(file);
        uploaded.push(res.url);
      }
      setMediaUrls([...mediaUrls, ...uploaded]);
    } catch (err: any) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const removeUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
        <UploadCloud className="w-4 h-4 text-primary-container" />
        Photo & Video Evidence (S3 Storage)
      </label>

      {error && (
        <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
          {error}
        </p>
      )}

      {/* Upload Box */}
      <label className="border-2 border-dashed border-slate-300 hover:border-primary-container rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-white transition-all hover:bg-slate-50">
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin text-primary-container" />
            Uploading evidence to S3 storage...
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <ImageIcon className="w-6 h-6" />
              <Film className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Click or drag photos/videos of the issue
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports JPEG, PNG, MP4 (Max 25MB)
            </p>
          </>
        )}
      </label>

      {/* Previews */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {mediaUrls.map((url, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center">
              {url.endsWith(".mp4") || url.endsWith(".webm") ? (
                <video src={url} className="w-full h-full object-cover" controls />
              ) : (
                <img src={url} alt="Evidence" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeUrl(idx)}
                className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity shadow"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

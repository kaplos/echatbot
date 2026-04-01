import React, { useState, useRef } from "react";
import { useSupabase } from "./SupaBaseProvider";

/**
 * FolderBulkUpload
 * - Select a folder (browser supports via `webkitdirectory`).
 * - Expects each immediate child folder name to be a styleNumber.
 * - Uploads each file to: public/{filename}
 * - Inserts a row into `images` and then `image_link` linking to the sample that matches the folder name.
 *
 * Props:
 *   entity      - string, DB entity to write to image_link.entity (default "sample")
 *   bucket      - storage bucket (default "echatbot")
 *   type        - image_link.type (default "image")
 *   concurrency - parallel uploads (default 5)
 *   onComplete  - fn({ successCount, failCount, details })
 */
export default function FolderBulkUpload({
  entity = "starting_info",
  type = "image",
  bucket = "echatbot",
  concurrency = 5,
  onComplete,
}) {
  const { supabase } = useSupabase();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [pendingGrouped, setPendingGrouped] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);
  const [completedFiles, setCompletedFiles] = useState(0);
  const inputRef = useRef(null);

  // Try to find a sample id given the folder name.
  async function findSampleId(folderName) {
    // Try common column names until one matches
      const { data, error } = await supabase
        .from("samples")
        .select("id, starting_info_id")
        .eq("styleNumber", folderName)
        .limit(1)
        .maybeSingle();
      if (error) {
        // continue on error for a column; log silently
      }
      if (data && data.starting_info_id) return data.starting_info_id;
    return null;
  }

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const grouped = files.reduce((acc, f) => {
      const rel = f.webkitRelativePath || f.name;
      const parts = rel.split("/").filter(Boolean);
      let style = parts.length >= 2 ? parts[1] : parts[0];
      style = style || "unknown";
      acc[style] = acc[style] || [];
      acc[style].push(f);
      return acc;
    }, {});

    // Save grouped files and show confirmation
    setPendingGrouped(grouped);
    setShowConfirm(true);
  };

  // Start upload after user confirms
  const startUpload = async () => {
    if (!pendingGrouped) return;
    
    setShowConfirm(false);
    setUploading(true);
    const grouped = pendingGrouped;
    const stats = { successCount: 0, failCount: 0, details: [] };
    const progInit = {};
    const total = Object.values(grouped).reduce((acc, arr) => acc + arr.length, 0);
    setTotalFiles(total);
    setCompletedFiles(0);
    Object.keys(grouped).forEach((s) => {
      progInit[s] = { total: grouped[s].length, done: 0, errors: [] };
    });
    setProgress(progInit);

    // Pre-resolve sample ids for folders
    const sampleIdMap = {};
    await Promise.all(
      Object.keys(grouped).map(async (style) => {
        const id = await findSampleId(style);
        sampleIdMap[style] = id; // may be null
      })
    );

    const allTasks = Object.entries(grouped).flatMap(([style, fls]) =>
      fls.map((file) => ({ style, file }))
    );

    let idx = 0;
    const workers = Array.from(
      { length: Math.max(1, Math.min(concurrency, allTasks.length)) },
      async () => {
        while (true) {
          const i = idx++;
          if (i >= allTasks.length) break;
          const { style, file } = allTasks[i];
          try {
            const filename = file.name.replace(/\s+/g, "_");
            const dest = `public/${filename}`;
            const { error: uploadErr } = await supabase.storage.from(bucket).upload(dest, file, { upsert: false });
            if (uploadErr && uploadErr.status !== 409) throw uploadErr;

            const imagePath = `public/${filename}`;

            const { data: imgData, error: insertErr } = await supabase
              .from("images")
              .insert([{ imageUrl: imagePath, originalUrl: imagePath }])
              .select("id, imageUrl")
              .single();

            if (insertErr) throw insertErr;

            // Use matched sample id if found, otherwise fallback to folder name
            const entityId = sampleIdMap[style] ?? style;

            const { error: linkErr } = await supabase.from("image_link").insert([{
              imageId: imgData.id,
              styleNumber: style,
              entity,
              entityId,
              type,
            }]);

            if (linkErr) throw linkErr;

            stats.successCount++;
            stats.details.push({ style, file: filename, ok: true });
          } catch (err) {
            stats.failCount++;
            stats.details.push({ style, file: file.name, ok: false, error: (err?.message || err) });
            setProgress((p) => {
              const cur = { ...(p[style] || { total: 0, done: 0, errors: [] }) };
              cur.errors = [...(cur.errors || []), file.name];
              return { ...p, [style]: cur };
            });
          } finally {
            setProgress((p) => {
              const cur = { ...(p[allTasks[i]?.style] || { total: 0, done: 0, errors: [] }) };
              cur.done = (cur.done || 0) + 1;
              return { ...p, [allTasks[i]?.style]: cur };
            });
            setCompletedFiles(prev => prev + 1);
          }
        }
      }
    );

    await Promise.all(workers);
    setUploading(false);
    setPendingGrouped(null);
    onComplete?.(stats);
  };

  const handleCancel = () => {
    setPendingGrouped(null);
    setShowConfirm(false);
    setProgress({});
    setTotalFiles(0);
    setCompletedFiles(0);
    if (inputRef.current) inputRef.current.value = null;
  };

  const progressPercent = totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select folder to upload</label>
        <input
          ref={inputRef}
          type="file"
          webkitdirectory="true"
          directory="true"
          multiple={false}
          onChange={handleFiles}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none hover:bg-gray-100 p-2"
        />
      </div>

      {pendingGrouped && showConfirm && (
        <div className="p-6 border-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="font-bold text-xl text-gray-800">Confirm Upload</h4>
          </div>
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-100 rounded-lg">
                <div className="text-3xl font-bold text-blue-700">{Object.keys(pendingGrouped).length}</div>
                <div className="text-sm text-gray-600 mt-1">Folders</div>
              </div>
              <div className="text-center p-3 bg-indigo-100 rounded-lg">
                <div className="text-3xl font-bold text-indigo-700">{Object.values(pendingGrouped).reduce((acc, arr) => acc + arr.length, 0)}</div>
                <div className="text-sm text-gray-600 mt-1">Files</div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              onClick={startUpload}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Start Upload
            </button>
            <button
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {uploading && (
        <div className="p-6 border-2 rounded-lg bg-white border-gray-300 shadow-lg">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-lg text-gray-800">Uploading...</h4>
              <span className="text-2xl font-bold text-blue-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out rounded-full flex items-center justify-end pr-2"
                style={{ width: `${progressPercent}%` }}
              >
                {progressPercent > 10 && (
                  <span className="text-xs font-semibold text-white">{completedFiles}/{totalFiles}</span>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {completedFiles} of {totalFiles} files uploaded
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {Object.entries(progress).map(([style, s]) => {
              const folderPercent = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
              return (
                <div key={style} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">{style}</span>
                    <span className="text-sm text-gray-600">{s.done}/{s.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${folderPercent}%` }}
                    />
                  </div>
                  {s.errors?.length > 0 && (
                    <div className="text-xs text-red-600 mt-1">⚠️ {s.errors.length} error{s.errors.length !== 1 ? 's' : ''}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

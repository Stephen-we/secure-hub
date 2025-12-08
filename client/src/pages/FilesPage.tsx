import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Search, File, Download, Trash2 } from "lucide-react";
import { apiGet, apiUpload, apiDelete, apiDownloadFile } from "@/lib/api";

const API_URL = "http://localhost:5000";

// Normalize backend file → frontend friendly object
function normalize(file: any) {
  return {
    ...file,
    name: file.originalName || file.name || "Unnamed",
    type: file.type || "unknown",
  };
}

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  // Load user + files on mount
  useEffect(() => {
    const raw = localStorage.getItem("securehub_user");
    if (raw) {
      try {
        setCurrentUser(JSON.parse(raw));
      } catch {
        setCurrentUser(null);
      }
    }

    loadFiles();
  }, []);

  async function loadFiles() {
    try {
      const list = await apiGet(`${API_URL}/api/files`);
      if (Array.isArray(list)) {
        setFiles(list.map(normalize));
      }
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  }

  async function handleUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await apiUpload(`${API_URL}/api/files/upload`, file);

    if (res.file) {
      setFiles((prev) => [normalize(res.file), ...prev]);
    }
  }

  async function handleDownload(file: any) {
    try {
      await apiDownloadFile(
        `${API_URL}/api/files/${file._id}/download`,
        file.name
      );
    } catch (err: any) {
      alert(err.message || "Download failed");
    }
  }

  async function handleDelete(file: any) {
    if (!window.confirm(`Delete file "${file.name}"?`)) return;

    const res = await apiDelete(`${API_URL}/api/files/${file._id}`);

    if (res.message === "File deleted") {
      setFiles((prev) => prev.filter((f) => f._id !== file._id));
      if (selected?._id === file._id) setSelected(null);
    } else {
      alert(res.message || "Delete failed");
    }
  }

  // SAFE FILTER
  const filteredFiles = files.filter((f) =>
    (f.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const isAdmin = currentUser?.role === "admin";

  // ----------------------------------------------------
  // ----------------------  UI  -------------------------
  // ----------------------------------------------------
  return (
    <div className="space-y-6 text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Files</h1>
          <p className="text-slate-400">
            Securely upload, download and manage company files.
          </p>
        </div>

        {/* Hidden upload input */}
        <input
          id="fileUpload"
          type="file"
          className="hidden"
          onChange={handleUpload}
        />

        <Button
          className="bg-blue-600 hover:bg-blue-700 flex gap-2"
          onClick={() => document.getElementById("fileUpload")?.click()}
        >
          <Upload size={18} />
          Upload File
        </Button>
      </div>

      {/* SEARCH */}
      <div className="flex gap-4">
        <div className="relative w-80">
          <Search
            className="absolute left-2 top-2.5 text-slate-400"
            size={18}
          />
          <Input
            placeholder="Search files..."
            className="pl-9 bg-slate-900/50 border-slate-700 text-slate-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-12 gap-4">
        {/* FILE LIST */}
        <Card className="col-span-4 bg-slate-900/70 border-slate-700 p-4 h-[75vh] overflow-auto">
          <h2 className="text-slate-300 text-sm mb-3">Files</h2>

          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <div
                key={file._id}
                onClick={() => setSelected(file)}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                  selected?._id === file._id
                    ? "bg-blue-600/20 border border-blue-500/40"
                    : "hover:bg-slate-800"
                }`}
              >
                <File size={18} className="text-slate-300" />

                <div className="flex flex-col">
                  <p className="text-slate-100 text-sm">{file.name}</p>
                  <p className="text-slate-500 text-[11px]">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ))}

            {filteredFiles.length === 0 && (
              <p className="text-slate-500 text-sm mt-4">No files found.</p>
            )}
          </div>
        </Card>

        {/* FILE PREVIEW PANEL */}
        <Card className="col-span-8 bg-slate-900/70 border-slate-700 p-6 h-[75vh]">
          {selected ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selected.name}</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Uploaded: {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 flex gap-1"
                    onClick={() => handleDownload(selected)}
                  >
                    <Download size={16} />
                    Download
                  </Button>

                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex gap-1"
                      onClick={() => handleDelete(selected)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  )}
                </div>
              </div>

              {/* Meta info */}
              <div className="mt-6 p-4 border border-slate-700 rounded-lg text-sm space-y-1">
                <p>
                  <span className="text-slate-400">Type:</span>{" "}
                  <span className="text-slate-200">{selected.type}</span>
                </p>
                <p>
                  <span className="text-slate-400">Size:</span>{" "}
                  <span className="text-slate-200">
                    {(selected.size / 1024).toFixed(2)} KB
                  </span>
                </p>
              </div>

              {/* Preview placeholder */}
              <div className="mt-6 flex-1 flex items-center justify-center border border-dashed border-slate-700 rounded-lg">
                <p className="text-slate-500 text-sm">
                  File preview area (coming soon)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500 text-sm">
                Select a file from the left to view.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

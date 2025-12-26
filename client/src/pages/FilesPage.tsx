import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Search, File, Download, Trash2 } from "lucide-react";
import { apiGet, apiUpload, apiDelete, apiDownloadFile } from "@/lib/api";
import FilePreviewModal from "@/components/FilePreviewModal";
import OnlyOfficeEditor from "@/components/OnlyOfficeEditor";

const API_URL = "http://localhost:5000";

function normalize(file: any) {
  return {
    ...file,
    name: file.originalName || file.name || "Unnamed",
    type: file.type || "unknown",
  };
}

function isOfficeFile(file: any) {
  const ext = file?.name?.split(".").pop()?.toLowerCase();
  return ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext);
}

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [previewFile, setPreviewFile] = useState<any | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("securehub_user");
    if (raw) setCurrentUser(JSON.parse(raw));
    loadFiles();
  }, []);

  async function loadFiles() {
    const list = await apiGet(`${API_URL}/api/files`);
    if (Array.isArray(list)) setFiles(list.map(normalize));
  }

  async function handleUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await apiUpload(`${API_URL}/api/files/upload`, file);
    if (res.file) setFiles((p) => [normalize(res.file), ...p]);
  }

  async function handleDownload(file: any) {
    await apiDownloadFile(
      `${API_URL}/api/files/${file._id}/download`,
      file.name
    );
  }

  async function handleDelete(file: any) {
    if (!confirm(`Delete "${file.name}"?`)) return;
    await apiDelete(`${API_URL}/api/files/${file._id}`);
    setFiles((p) => p.filter((f) => f._id !== file._id));
    setSelected(null);
  }

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="space-y-6 text-white">
      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Files</h1>
          <p className="text-slate-400">Secure company documents</p>
        </div>

        <input
          id="fileUpload"
          type="file"
          hidden
          onChange={handleUpload}
        />
        <Button onClick={() => document.getElementById("fileUpload")?.click()}>
          <Upload size={18} /> Upload
        </Button>
      </div>

      {/* SEARCH */}
      <Input
        placeholder="Search files..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-12 gap-4">
        {/* FILE LIST */}
        <Card className="col-span-4 p-4 h-[75vh] overflow-auto">
          {filteredFiles.map((file) => (
            <div
              key={file._id}
              onClick={() => setSelected(file)}
              className="p-2 hover:bg-slate-800 cursor-pointer"
            >
              <File size={16} /> {file.name}
            </div>
          ))}
        </Card>

        {/* DETAILS */}
        <Card className="col-span-8 p-6 h-[75vh]">
          {selected && (
            <>
              <h2 className="text-xl font-bold">{selected.name}</h2>

              <div className="mt-4 flex gap-2">
                <Button onClick={() => handleDownload(selected)}>
                  <Download size={16} /> Download
                </Button>

                <Button onClick={() => setPreviewFile(selected)}>
                  Open Preview
                </Button>

                {isAdmin && (
                  <Button variant="destructive" onClick={() => handleDelete(selected)}>
                    <Trash2 size={16} /> Delete
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* ================= PREVIEW RENDERING ================= */}

      {previewFile && isOfficeFile(previewFile) && (
        <OnlyOfficeEditor
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {previewFile && !isOfficeFile(previewFile) && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}

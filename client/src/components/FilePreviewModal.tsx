import { X } from "lucide-react";

export default function FilePreviewModal({ file, onClose }: any) {
  if (!file) return null;

  const url = `http://localhost:5000/uploads/${file.storedName}`;
  const type = file.type.toLowerCase();

  const isPDF = type.includes("pdf");
  const isImage = type.includes("image");

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 p-2 rounded-full"
        onClick={onClose}
      >
        <X size={22} color="white" />
      </button>

      {/* Viewer */}
      <div className="w-full h-full max-w-5xl max-h-[90vh] bg-slate-900 rounded-lg overflow-hidden p-4">
        <h2 className="text-white text-xl mb-3">{file.name}</h2>

        {/* PDF Viewer */}
        {isPDF && (
          <iframe
            src={url}
            className="w-full h-[80vh] rounded border border-slate-700"
          />
        )}

        {/* Image Viewer */}
        {isImage && (
          <img
            src={url}
            className="mx-auto max-h-[80vh] rounded border border-slate-700"
            alt={file.name}
          />
        )}

        {/* Unsupported Format */}
        {!isPDF && !isImage && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300">
            <p className="text-lg mb-4">
              Preview not available for this file type.
            </p>
            <a
              href={url}
              download={file.name}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            >
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect } from "react";
import {
  apiGet,
  apiUpload,
  apiDelete,
  apiDownloadFile,
} from "@/lib/api";

declare global {
  interface Window {
    DocsAPI: any;
  }
}

export default function OnlyOfficeEditor({ fileId }: { fileId: string }) {
  useEffect(() => {
    const initEditor = async () => {
      const res = await api.get(`/files/onlyoffice/${fileId}`);
      const { config, token } = res.data;

      const container = document.getElementById("onlyoffice-editor");
      if (!container) return;
      container.innerHTML = "";

      if (!window.DocsAPI) {
        const script = document.createElement("script");
        script.src =
          "http://localhost:8080/web-apps/apps/api/documents/api.js";
        script.onload = () => {
          new window.DocsAPI.DocEditor("onlyoffice-editor", {
            ...config,
            token,
          });
        };
        document.body.appendChild(script);
      } else {
        new window.DocsAPI.DocEditor("onlyoffice-editor", {
          ...config,
          token,
        });
      }
    };

    initEditor();
  }, [fileId]);

  return (
    <div
      id="onlyoffice-editor"
      style={{ width: "100%", height: "100vh" }}
    />
  );
}

// src/Editor.jsx
import React, { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // loaded via CDN or installed
import "./Editor.css";

const TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ header: [1, 2, 3, false] }],
  ["clean"],
];
const SAVE_INTERVAL_MS = 2000;

export default function Editor() {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const [status, setStatus] = useState("Loading...");

  // 1. Connect socket
  useEffect(() => {
    const s = io("http://localhost:3001");
    setSocket(s);
    return () => s.disconnect();
  }, []);

  // 2. Load or create document
  useEffect(() => {
    if (!socket || !quill) return;
    socket.once("load-document", (doc) => {
      quill.setContents(doc);
      quill.enable();
      setStatus("Saved ✓");
    });
    socket.emit("get-document", documentId);
  }, [socket, quill, documentId]);

  // 3. Broadcast local changes
  useEffect(() => {
    if (!socket || !quill) return;
    const handler = (delta, _, source) => {
      if (source === "user") {
        socket.emit("send-changes", delta);
        setStatus("Saving...");
      }
    };
    quill.on("text-change", handler);
    return () => quill.off("text-change", handler);
  }, [socket, quill]);

  // 4. Apply remote changes
  useEffect(() => {
    if (!socket || !quill) return;
    const handler = (delta) => quill.updateContents(delta);
    socket.on("receive-changes", handler);
    return () => socket.off("receive-changes", handler);
  }, [socket, quill]);

  // 5. Auto‑save periodically
  useEffect(() => {
    if (!socket || !quill) return;
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
      setStatus("Saved ✓");
    }, SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [socket, quill]);

  // 6. Initialize Quill editor
  const wrapperRef = useCallback((wrapper) => {
    if (!wrapper) return;
    wrapper.innerHTML = "";
    const editorDiv = document.createElement("div");
    wrapper.append(editorDiv);
    const q = new Quill(editorDiv, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    q.disable();
    q.setText("Loading document...");
    setQuill(q);
  }, []);

  return (
    <div className="editor-container container">
      <header className="editor-header">
        <h2>Document: {documentId}</h2>
        <span className="status">{status}</span>
      </header>
      <main className="editor-body">
        <div ref={wrapperRef} className="quill-wrapper" />
      </main>
    </div>
  );
}

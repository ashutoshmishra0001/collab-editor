import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Editor from "./Editor";

export default function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="home">
            <h1>📄 Collab Editor</h1>
            <button onClick={() => navigate(`/doc/${Date.now()}`)}>
              + Create New Document
            </button>
          </div>
        }
      />
      <Route path="/doc/:id" element={<Editor />} />
    </Routes>
  );
}

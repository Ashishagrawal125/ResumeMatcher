"use client";
import React, { useState } from "react";

export default function ResumeUploader() {
  const [resumes, setResumes] = useState([]);
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState(null);
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!token) {
      alert("Please enter JWT token");
      return;
    }

    const formData = new FormData();

    // Attach resumes
    for (let file of resumes) {
      formData.append("files", file);
    }

    // JD text or JD file
    if (jdText.trim() !== "") {
      formData.append("jd_text", jdText);
    }
    if (jdFile) {
      formData.append("jd_file", jdFile);
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/resumes/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Resume Parser Uploader</h2>

      <label>JWT Token:</label>
      <input
        type="text"
        placeholder="Paste JWT token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={{ width: "400px", display: "block", marginBottom: "10px" }}
      />

      <label>Upload Resumes:</label>
      <input
        type="file"
        multiple
        onChange={(e) => setResumes([...e.target.files])}
      />

      <br />

      <label>Write JD Text (optional):</label>
      <textarea
        rows={4}
        style={{ width: "400px" }}
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
      ></textarea>

      <br />

      <label>OR Upload JD File:</label>
      <input
        type="file"
        onChange={(e) => setJdFile(e.target.files[0])}
      />

      <br /><br />

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{ padding: "10px 20px", background: "blue", color: "white" }}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {result && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #999" }}>
          <h3>Upload Results:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

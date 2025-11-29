export async function uploadResumes({ resumes, jdText, jdFile, token }) {
  const formData = new FormData();

  // Append multiple resume files
  resumes.forEach((file) => {
    formData.append("files", file);
  });

  // Append JD text if provided
  if (jdText) {
    formData.append("jd_text", jdText);
  }

  // Append JD file if selected
  if (jdFile) {
    formData.append("jd_file", jdFile);
  }

  const response = await fetch("http://localhost:8000/resumes/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}` // REQUIRED
      // ❌ Do NOT add Content-Type → browser sets multipart boundary automatically
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
}

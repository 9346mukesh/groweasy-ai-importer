import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${API_BASE_URL}/api/import/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

export async function confirmImport({ file, fileName, headers, rows }) {
  if (file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE_URL}/api/import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  }

  const response = await axios.post(`${API_BASE_URL}/api/import`, {
    fileName,
    headers,
    rows,
  });

  return response.data;
}

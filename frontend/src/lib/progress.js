export async function fetchImportProgress() {
  const response = await fetch(
    "http://localhost:5001/api/import/progress"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch progress");
  }

  const result = await response.json();

  return result.data;
}
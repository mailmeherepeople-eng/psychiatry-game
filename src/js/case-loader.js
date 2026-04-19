export async function loadCase(caseId) {
  const url = `data/cases/${caseId}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load case ${caseId}: ${res.status}`);
  return await res.json();
}

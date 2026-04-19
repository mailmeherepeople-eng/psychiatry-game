const ANON_KEY = 'jsp.anon_id';

export function getOrCreateAnonId() {
  let id = localStorage.getItem(ANON_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

export async function ensurePlayer(supabase, anonId) {
  const { data: existing, error: readErr } = await supabase
    .from('players')
    .select('id, anon_id')
    .eq('anon_id', anonId)
    .maybeSingle();
  if (readErr) throw readErr;
  if (existing) return existing;

  const { data: created, error: insertErr } = await supabase
    .from('players')
    .insert({ anon_id: anonId })
    .select('id, anon_id')
    .single();
  if (insertErr) throw insertErr;
  return created;
}

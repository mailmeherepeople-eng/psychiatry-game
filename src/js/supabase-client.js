import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = 'https://gthsqksuujywpyxxxazu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cSlfBvXQVq-eXzLLb6gbMg_V4-pH0Ne';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// ----- Cases -----
export async function upsertCaseRow(caseData) {
  const { error } = await supabase
    .from('cases')
    .upsert({
      id: caseData.id,
      title: caseData.title,
      version: 1,
      content: caseData,
    });
  if (error) throw error;
}

// ----- Sessions -----
export async function loadActiveSession(playerId, caseId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('player_id', playerId)
    .eq('case_id', caseId)
    .eq('status', 'in_progress')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createSession(playerId, caseId, startNode) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      player_id: playerId,
      case_id: caseId,
      current_node: startNode,
      rapport: 0,
      status: 'in_progress',
      auto_advance: false,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateSession(sessionId, patch) {
  const { error } = await supabase
    .from('sessions')
    .update(patch)
    .eq('id', sessionId);
  if (error) throw error;
}

// ----- Choices -----
export async function insertChoice(sessionId, ordinal, nodeId, choiceId, rapportDelta) {
  const { error } = await supabase
    .from('session_choices')
    .insert({
      session_id: sessionId,
      ordinal,
      node_id: nodeId,
      choice_id: choiceId,
      rapport_delta: rapportDelta,
    });
  if (error) throw error;
}

export async function loadChoices(sessionId) {
  const { data, error } = await supabase
    .from('session_choices')
    .select('*')
    .eq('session_id', sessionId)
    .order('ordinal', { ascending: true });
  if (error) throw error;
  return data || [];
}

// ----- Snippets -----
export async function upsertSnippet(sessionId, snippetId, x, y, clusterId = null) {
  const { error } = await supabase
    .from('session_snippets')
    .upsert(
      {
        session_id: sessionId,
        snippet_id: snippetId,
        x_position: x,
        y_position: y,
        cluster_id: clusterId,
      },
      { onConflict: 'session_id,snippet_id' }
    );
  if (error) throw error;
}

export async function updateSnippetPosition(sessionId, snippetId, x, y) {
  const { error } = await supabase
    .from('session_snippets')
    .update({ x_position: x, y_position: y })
    .eq('session_id', sessionId)
    .eq('snippet_id', snippetId);
  if (error) throw error;
}

export async function updateSnippetCluster(sessionId, snippetId, clusterId) {
  const { error } = await supabase
    .from('session_snippets')
    .update({ cluster_id: clusterId })
    .eq('session_id', sessionId)
    .eq('snippet_id', snippetId);
  if (error) throw error;
}

export async function loadSnippets(sessionId) {
  const { data, error } = await supabase
    .from('session_snippets')
    .select('*')
    .eq('session_id', sessionId);
  if (error) throw error;
  return data || [];
}

// ----- Clusters -----
export async function deleteClusters(sessionId) {
  const { error } = await supabase
    .from('clusters')
    .delete()
    .eq('session_id', sessionId);
  if (error) throw error;
}

export async function insertCluster(sessionId) {
  const { data, error } = await supabase
    .from('clusters')
    .insert({ session_id: sessionId })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function loadClusters(sessionId) {
  const { data, error } = await supabase
    .from('clusters')
    .select('*')
    .eq('session_id', sessionId);
  if (error) throw error;
  return data || [];
}

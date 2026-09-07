import { useEffect, useState } from "react";

const emptyForm = { behaviorType: "", description: "", impactScore: 0 };

const apiRequest = async (url, options = {}, onUnauthorized) => {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      ...options.headers,
    },
  });
  const data = await response.json();
  if (response.status === 401) onUnauthorized();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

function BehaviorManager({ onUnauthorized }) {
  const [behaviors, setBehaviors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    apiRequest("/api/behaviors", {}, onUnauthorized)
      .then(setBehaviors)
      .catch((error) => setMessage(error.message))
        .finally(() => setIsLoading(false));
      }, [onUnauthorized]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);
    try {
      const requestBody = editingId
        ? JSON.stringify(form)
        : (() => {
            const body = new FormData();
            body.append("behaviorType", form.behaviorType);
            body.append("description", form.description);
            body.append("impactScore", String(form.impactScore));
            if (attachment) body.append("attachment", attachment);
            return body;
          })();
      const data = await apiRequest(editingId ? `/api/behaviors/${editingId}` : "/api/behaviors", {
        method: editingId ? "PUT" : "POST",
        body: requestBody,
      }, onUnauthorized);
      setBehaviors((current) => editingId
        ? current.map((behavior) => behavior._id === editingId ? data.behavior : behavior)
        : [data.behavior, ...current]);
      setForm(emptyForm);
      setAttachment(null);
      setEditingId(null);
      setMessage(editingId ? "Behavior updated." : "Behavior recorded.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this behavior record?")) return;
    try {
      await apiRequest(`/api/behaviors/${id}`, { method: "DELETE" }, onUnauthorized);
      setBehaviors((current) => current.filter((behavior) => behavior._id !== id));
      setMessage("Behavior deleted.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const startEditing = (behavior) => {
    setEditingId(behavior._id);
    setForm({ behaviorType: behavior.behaviorType, description: behavior.description, impactScore: behavior.impactScore });
    setAttachment(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const downloadAttachment = async (behavior) => {
    try {
      const response = await fetch(`/api/behaviors/${behavior._id}/attachment`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      if (response.status === 401) return onUnauthorized();
      if (!response.ok) throw new Error("Attachment download failed");
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = behavior.attachment.originalName;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const averageImpact = behaviors.length
    ? Math.round(behaviors.reduce((total, behavior) => total + behavior.impactScore, 0) / behaviors.length)
    : 0;

  return (
    <main className="dashboard">
      <section className="dashboard-heading">
        <div><p className="eyebrow">Your workspace</p><h2>Behavior dashboard</h2><p>Record meaningful actions and watch their impact take shape over time.</p></div>
        <div className="stats-row"><div><strong>{behaviors.length}</strong><span>Records</span></div><div><strong>{averageImpact}/10</strong><span>Average impact</span></div></div>
      </section>
      <section className="behavior-layout">
        <form className="behavior-form" onSubmit={handleSubmit}>
          <div className="section-label">{editingId ? "Edit record" : "Add a record"}</div>
          <label>Behavior type<input required value={form.behaviorType} onChange={(event) => setForm({ ...form, behaviorType: event.target.value })} placeholder="e.g. Daily exercise" /></label>
          <label>Description<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What happened?" rows="4" /></label>
          <label>Impact score <span className="score-value">{form.impactScore}/10</span><input type="range" min="0" max="10" value={form.impactScore} onChange={(event) => setForm({ ...form, impactScore: Number(event.target.value) })} /></label>
          {!editingId && <label>Evidence file <span className="file-hint">PDF, PNG, JPG, or TXT up to 5 MB</span><input type="file" accept=".pdf,.png,.jpg,.jpeg,.txt,application/pdf,image/png,image/jpeg,text/plain" onChange={(event) => setAttachment(event.target.files?.[0] || null)} /></label>}
          <div className="form-actions"><button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : editingId ? "Update record" : "Save record"}</button>{editingId && <button type="button" className="button-muted" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}</div>
          {message && <p className="form-message">{message}</p>}
        </form>
        <section className="behavior-list">
          <div className="section-label">Recent activity</div>
          {isLoading && <p className="empty-state">Loading your records...</p>}
          {!isLoading && !behaviors.length && <p className="empty-state">No records yet. Add your first behavior.</p>}
          {behaviors.map((behavior) => <article className="behavior-card" key={behavior._id}><div className="behavior-card-top"><span className="behavior-type">{behavior.behaviorType}</span><span className="impact-badge">{behavior.impactScore}/10</span></div><p>{behavior.description}</p>{behavior.attachment && <button className="attachment-link" onClick={() => downloadAttachment(behavior)}>Download {behavior.attachment.originalName}</button>}<div className="behavior-card-actions"><button onClick={() => startEditing(behavior)}>Edit</button><button className="text-danger" onClick={() => handleDelete(behavior._id)}>Delete</button></div></article>)}
        </section>
      </section>
    </main>
  );
}

export default BehaviorManager;
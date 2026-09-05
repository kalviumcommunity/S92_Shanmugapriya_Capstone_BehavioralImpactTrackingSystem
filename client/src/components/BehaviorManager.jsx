import React, { useState } from "react";

function BehaviorManager() {
  const [behaviors, setBehaviors] = useState([
    {
      id: 1,
      behaviorType: "Saving",
      description: "Saved money this month",
      impactScore: 8,
    },
    {
      id: 2,
      behaviorType: "Budgeting",
      description: "Created a monthly budget",
      impactScore: 7,
    },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    behaviorType: "",
    description: "",
    impactScore: "",
  });

  const handleEdit = (behavior) => {
    setEditingId(behavior.id);
    setEditData({
      behaviorType: behavior.behaviorType,
      description: behavior.description,
      impactScore: behavior.impactScore,
    });
  };

  const handleUpdate = (id) => {
    setBehaviors(
      behaviors.map((behavior) =>
        behavior.id === id
          ? { ...behavior, ...editData, impactScore: Number(editData.impactScore) }
          : behavior
      )
    );

    setEditingId(null);
    alert("Behavior updated successfully!");
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this behavior?"
    );

    if (confirmDelete) {
      setBehaviors(behaviors.filter((behavior) => behavior.id !== id));
      alert("Behavior deleted successfully!");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Behavior Management</h2>

      {behaviors.map((behavior) => (
        <div
          key={behavior.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            margin: "15px 0",
            borderRadius: "8px",
          }}
        >
          {editingId === behavior.id ? (
            <>
              <input
                type="text"
                value={editData.behaviorType}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    behaviorType: e.target.value,
                  })
                }
                placeholder="Behavior Type"
              />

              <br />
              <br />

              <input
                type="text"
                value={editData.description}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    description: e.target.value,
                  })
                }
                placeholder="Description"
              />

              <br />
              <br />

              <input
                type="number"
                value={editData.impactScore}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    impactScore: e.target.value,
                  })
                }
                placeholder="Impact Score"
              />

              <br />
              <br />

              <button onClick={() => handleUpdate(behavior.id)}>
                Update
              </button>

              <button
                onClick={() => setEditingId(null)}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <h3>{behavior.behaviorType}</h3>
              <p>{behavior.description}</p>
              <p>
                <strong>Impact Score:</strong> {behavior.impactScore}
              </p>

              <button onClick={() => handleEdit(behavior)}>
                Edit
              </button>

              <button
                onClick={() => handleDelete(behavior.id)}
                style={{ marginLeft: "10px" }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default BehaviorManager;
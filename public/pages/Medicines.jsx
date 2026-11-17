
import React from "react";
import MedicineCard from "../components/MedicineCard";

export default function Medicines({
  medicines,
  onTaken,
  onDeleteMedicine,
  onAdd,
}) {
  return (
    <section className="content-card full-card">
      <div className="section-head">
        <div>
          <h2>All medicines</h2>
          <p>Manage your active medication schedule.</p>
        </div>

        <button
          className="primary-btn small"
          onClick={onAdd}
        >
          + Add medicine
        </button>
      </div>

      <div className="medicine-list">
        {medicines.length ? (
          medicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              onTaken={onTaken}
              onDelete={onDeleteMedicine}
            />
          ))
        ) : (
          <div className="empty-state">
            No medicines match your search.
          </div>
        )}
      </div>
    </section>
  );
}

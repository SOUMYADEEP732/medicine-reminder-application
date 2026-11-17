
import React from "react";
import {
  Check,
  Clock3,
  Pill,
  Trash2,
} from "lucide-react";

export default function MedicineCard({
  medicine,
  onTaken,
  onDelete,
}) {
  const taken = medicine.status === "taken";

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Remove the recurring schedule for ${medicine.name}? Its dose history will also be deleted.`
    );

    if (confirmed) {
      onDelete?.(medicine.id);
    }
  };

  return (
    <div className="medicine-card">
      <div className={`medicine-icon ${medicine.color}`}>
        <Pill size={21} />
      </div>

      <div className="medicine-main">
        <div className="medicine-title-row">
          <div>
            <h3>{medicine.name}</h3>
            <p>
              {medicine.dosage} · {medicine.instruction}
            </p>
          </div>

          <button
            className="delete-dose-btn"
            onClick={handleDelete}
            title="Remove recurring schedule"
            aria-label={`Remove ${medicine.name} schedule`}
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="medicine-bottom">
          <span className="time">
            <Clock3 size={15} />
            {medicine.time}
          </span>

          {taken ? (
            <span className="status taken">
              <Check size={14} /> Taken
            </span>
          ) : (
            <button
              className="take-btn"
              onClick={() => onTaken(medicine.id)}
            >
              Mark as taken
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

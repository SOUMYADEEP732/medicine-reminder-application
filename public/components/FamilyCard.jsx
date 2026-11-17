
import React from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Pill
} from "lucide-react";

import ProgressBar from "./ProgressBar";

function formatDoseDate(date) {
  if (!date) return "";

  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
}

export default function FamilyCard({ member }) {
  const needsAttention =
    member.adherence != null &&
    member.adherence < 80;

  const missedDoses = member.missedDoses || [];

  return (
    <article className="family-card family-card-expanded">

      <div className="family-avatar">
        {member.initials}
      </div>

      <div className="family-main">

        {/* Member information */}
        <div className="family-title">
          <div>
            <strong>{member.name}</strong>
            <span>{member.relation}</span>
          </div>

          <span className={
            needsAttention ? "attention" : "good"
          }>
            {needsAttention
              ? <AlertTriangle size={14} />
              : <Check size={14} />
            }

            {member.status}
          </span>
        </div>

        {/* Adherence progress */}
        <ProgressBar value={member.adherence} />

        <div className="family-meta">
          <span>Adherence</span>

          <strong>
            {member.adherence == null
              ? "No data"
              : `${member.adherence}%`
            }
          </strong>
        </div>

        {/* Expandable missed doses section */}
        <details className="missed-dose-details">

          <summary>
            <span className="missed-dose-summary">
              <AlertTriangle size={14} />

              Missed doses

              <strong>{missedDoses.length}</strong>
            </span>

            <ChevronDown
              size={16}
              className="missed-dose-chevron"
            />
          </summary>

          {missedDoses.length > 0 ? (

            <ul className="missed-dose-list">

              {missedDoses.map(dose => (
                <li key={dose.id}>

                  <span className="missed-dose-icon">
                    <Pill size={14} />
                  </span>

                  <span className="missed-dose-info">
                    <strong>
                      {dose.medicineName}
                    </strong>

                    {dose.dosage && (
                      <small>{dose.dosage}</small>
                    )}
                  </span>

                  <span className="missed-dose-when">
                    {formatDoseDate(dose.date)}
                    {" · "}
                    {dose.time}
                  </span>

                </li>
              ))}

            </ul>

          ) : (

            <p className="no-missed-doses">
              No missed doses recorded.
            </p>

          )}

        </details>

      </div>

    </article>
  );
}

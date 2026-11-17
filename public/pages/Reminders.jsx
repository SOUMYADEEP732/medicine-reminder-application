
import React from "react";
import {
  Clock3,
  Pill,
  Trash2,
  Check,
  AlertTriangle,
} from "lucide-react";

function todayKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00`);

  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString();
}

export default function Reminders({
  reminders = [],
  doseLogs = [],
  onDeleteDose,
}) {
  const history = doseLogs
    .filter((log) => log.date !== todayKey())
    .sort((a, b) =>
      `${b.date} ${b.time}`.localeCompare(
        `${a.date} ${a.time}`
      )
    );

  const removeDose = (id, medicine, date) => {
    const confirmed = window.confirm(
      `Delete the ${medicine} dose record for ${formatDate(date)}?`
    );

    if (confirmed) {
      onDeleteDose?.(id);
    }
  };

  return (
    <>
      {/* Today's reminder schedule */}
      <section className="content-card full-card">
        <div className="section-head">
          <div>
            <h2>Reminder schedule</h2>
            <p>
              Today's medication timeline. Delete an
              individual dose without removing the
              recurring medicine schedule.
            </p>
          </div>
        </div>

        <div className="reminder-list large">
          {reminders.length ? (
            reminders.map((reminder) => (
              <div
                className="reminder-row"
                key={reminder.id}
              >
                <div
                  className={`reminder-icon ${
                    reminder.type === "done" ? "done" : ""
                  }`}
                >
                  {reminder.type === "done" ? (
                    <Check size={17} />
                  ) : (
                    <Pill size={17} />
                  )}
                </div>

                <div className="reminder-info">
                  <strong>{reminder.medicine}</strong>
                  <span>{reminder.date}</span>
                </div>

                <div className="reminder-time">
                  <Clock3 size={15} />
                  {reminder.time}
                </div>

                <span
                  className={`reminder-status ${
                    reminder.type === "done"
                      ? "done"
                      : "upcoming"
                  }`}
                >
                  {reminder.type === "done"
                    ? "Completed"
                    : "Upcoming"}
                </span>

                <button
                  className="delete-dose-btn"
                  onClick={() =>
                    removeDose(
                      reminder.id,
                      reminder.medicine,
                      todayKey()
                    )
                  }
                  title="Delete this scheduled dose"
                  aria-label={`Delete ${reminder.medicine} scheduled dose`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              No doses are scheduled for today.
            </div>
          )}
        </div>
      </section>

      {/* Previous dose history */}
      <section className="content-card full-card">
        <div className="section-head">
          <div>
            <h2>Dose history</h2>
            <p>
              Remove individual taken or missed dose
              records when they are no longer needed.
            </p>
          </div>
        </div>

        <div className="reminder-list large">
          {history.length ? (
            history.map((log) => (
              <div
                className="reminder-row"
                key={log.id}
              >
                <div
                  className={`reminder-icon ${
                    log.status === "taken" ? "done" : ""
                  }`}
                >
                  {log.status === "taken" ? (
                    <Check size={17} />
                  ) : (
                    <AlertTriangle size={17} />
                  )}
                </div>

                <div className="reminder-info">
                  <strong>{log.medicineName}</strong>
                  <span>{formatDate(log.date)}</span>
                </div>

                <div className="reminder-time">
                  <Clock3 size={15} />
                  {log.time}
                </div>

                <span
                  className={`reminder-status ${
                    log.status === "taken"
                      ? "done"
                      : "upcoming"
                  }`}
                >
                  {log.status === "taken"
                    ? "Taken"
                    : log.status === "missed"
                    ? "Missed"
                    : "Upcoming"}
                </span>

                <button
                  className="delete-dose-btn"
                  onClick={() =>
                    removeDose(
                      log.id,
                      log.medicineName,
                      log.date
                    )
                  }
                  title="Delete dose history"
                  aria-label={`Delete ${log.medicineName} dose history`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              No previous dose records yet.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

import React from "react";
import { Check, Clock3, Pill } from "lucide-react";

export default function ReminderCard({ reminder }) {
  const done = reminder.type === "done";

  return (
    <div className="reminder-row">
      <div className={`reminder-icon ${done ? "done" : ""}`}>
        {done ? <Check size={17} /> : <Pill size={17} />}
      </div>
      <div className="reminder-info">
        <strong>{reminder.medicine}</strong>
        <span>{reminder.date}</span>
      </div>
      <div className="reminder-time">
        <Clock3 size={15} />
        {reminder.time}
      </div>
      <span className={`reminder-status ${done ? "done" : "upcoming"}`}>
        {done ? "Completed" : "Upcoming"}
      </span>
    </div>
  );
}
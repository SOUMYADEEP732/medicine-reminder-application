import React from "react";

export default function ProgressBar({ value }) {
  return (
    <div className="progress-track">
      <div
        className={`progress-fill ${value < 80 ? "warning" : ""}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
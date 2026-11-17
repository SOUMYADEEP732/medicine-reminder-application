import React from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Pill,
  TrendingUp,
} from "lucide-react";

import StatCard from "../components/StatCard";
import MedicineCard from "../components/MedicineCard";
import ReminderCard from "../components/ReminderCard";
import FamilyCard from "../components/FamilyCard";

export default function Dashboard({
  medicines,
  reminders,
  family,
  adherence,
  takenCount,
  upcomingCount,
  nextReminder,
  refillCount,
  weeklyAdherence = [],
  onTaken,
  onAdd,
  onNavigate,
}) {
  return (
    <>
      <section className="stat-grid">
        <StatCard
          icon={Pill}
          label="Today's medicines"
          value={`${takenCount}/${medicines.length}`}
          helper="taken today"
          tone="blue"
        />

        <StatCard
          icon={TrendingUp}
          label="Adherence rate"
          value={`${adherence}%`}
          helper="Based on today's due doses"
          tone="green"
        />

        <StatCard
          icon={Clock3}
          label="Upcoming"
          value={upcomingCount}
          helper={
            nextReminder
              ? `next reminder at ${nextReminder.time}`
              : "no more doses scheduled today"
          }
          tone="purple"
        />

        <StatCard
          icon={CalendarDays}
          label="Refills needed"
          value={refillCount}
          helper="medicines at or below refill limit"
          tone="orange"
        />
      </section>

      <div className="content-grid">
        <section className="content-card">
          <div className="section-head">
            <div>
              <h2>Today's medicines</h2>
              <p>Stay on track with your medication schedule.</p>
            </div>

            <button
              className="text-btn"
              onClick={() => onNavigate("Medicines")}
            >
              View all
            </button>
          </div>

          <div className="medicine-list">
            {medicines.map((medicine) => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                onTaken={onTaken}
              />
            ))}
          </div>

          <button className="add-row-btn" onClick={onAdd}>
            <span>
              <span className="plus-circle">+</span>
              Add another medicine
            </span>
          </button>
        </section>

        <section className="content-card">
          <div className="section-head">
            <div>
              <h2>Adherence</h2>
              <p>Your medication consistency.</p>
            </div>

            <button className="small-select" type="button">
              This week ▾
            </button>
          </div>

          <div className="adherence-box">
            <div
              className="donut"
              style={{
                "--progress": `${adherence * 3.6}deg`,
              }}
            >
              <div>
                <strong>{adherence}%</strong>
                <span>on track</span>
              </div>
            </div>

            <div className="adherence-copy">
              <div>
                <CheckCircle2 size={17} />
                <span>{takenCount} doses taken today</span>
              </div>

              <div>
                <Clock3 size={17} />
                <span>{upcomingCount} doses upcoming today</span>
              </div>

              <div className="muted-line">
                Weekly adherence from recorded doses.
              </div>
            </div>
          </div>

          <div className="mini-chart">
            <div className="chart-labels">
              {weeklyAdherence.map((day) => (
                <span key={day.date}>{day.label}</span>
              ))}
            </div>

            <div className="bars">
              {weeklyAdherence.map((day) => (
                <div className="bar-wrap" key={day.date}>
                  <div
                    className="bar"
                    title={`${day.label}: ${day.percent}% (${day.taken}/${day.total} doses)`}
                    style={{
                      height: `${day.percent}%`,
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="chart-labels chart-values">
              {weeklyAdherence.map((day) => (
                <span key={day.date}>
                  {day.total ? `${day.percent}%` : "—"}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="content-grid lower">
        <section className="content-card">
          <div className="section-head">
            <div>
              <h2>Upcoming reminders</h2>
              <p>Never miss the next dose.</p>
            </div>

            <button
              className="text-btn"
              onClick={() => onNavigate("Reminders")}
            >
              View schedule
            </button>
          </div>

          <div className="reminder-list">
            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
              />
            ))}
          </div>
        </section>

        <section className="content-card">
          <div className="section-head">
            <div>
              <h2>Family health</h2>
              <p>Quick view of your care circle.</p>
            </div>

            <button
              className="text-btn"
              onClick={() => onNavigate("Family")}
            >
              Manage
            </button>
          </div>

          <div className="family-list">
            {family.map((member) => (
              <FamilyCard
                key={member.id}
                member={member}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
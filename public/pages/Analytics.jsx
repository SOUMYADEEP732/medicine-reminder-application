import React from "react";
import { Activity, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import ProgressBar from "../components/ProgressBar";

export default function Analytics({ family, adherence }) {
  const weekly = [74, 90, 82, 96, 86, 92, 88];

  return (
    <>
      <div className="analytics-grid">
        <div className="metric-box"><TrendingUp size={20} /><span>Overall adherence</span><strong>{adherence}%</strong></div>
        <div className="metric-box"><CheckCircle2 size={20} /><span>Doses taken</span><strong>18</strong></div>
        <div className="metric-box"><AlertTriangle size={20} /><span>Needs attention</span><strong>1</strong></div>
        <div className="metric-box"><Activity size={20} /><span>Family average</span><strong>{family.length ? Math.round(family.reduce((a,b)=>a+b.adherence,0)/family.length) : 0}%</strong></div>
      </div>

      <section className="content-card full-card">
        <div className="section-head">
          <div>
            <h2>Weekly adherence</h2>
            <p>Track consistency across the last seven days.</p>
          </div>
        </div>
        <div className="big-chart">
          {weekly.map((v, i) => (
            <div className="big-bar-wrap" key={i}>
              <div className="big-bar-value">{v}%</div>
              <div className="big-bar" style={{ height: `${v}%` }} />
              <span>{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="content-card full-card">
        <div className="section-head">
          <div>
            <h2>Family adherence</h2>
            <p>Who is doing well and who may need support.</p>
          </div>
        </div>
        <div className="analytics-members">
          {family.map((member) => (
            <div className="analytics-member" key={member.id}>
              <div><strong>{member.name}</strong><span>{member.adherence}%</span></div>
              <ProgressBar value={member.adherence} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
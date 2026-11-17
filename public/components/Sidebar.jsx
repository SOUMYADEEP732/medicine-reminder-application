import React from "react";
import {
  BarChart3,
  CalendarClock,
  ChevronRight,
  LayoutDashboard,
  Pill,
  Settings,
  Users,
  X,
} from "lucide-react";

const items = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Medicines", icon: Pill },
  { label: "Reminders", icon: CalendarClock },
  { label: "Family", icon: Users },
  { label: "Analytics", icon: BarChart3 },
];

export default function Sidebar({ activePage, setActivePage, mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="logo">
          <div className="logo-mark"><Pill size={20} /></div>
          <div>
            <strong>MediCare</strong>
            <span>Health companion</span>
          </div>
          <button className="mobile-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="nav-label">MENU</div>
        <nav>
          {items.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`side-link ${activePage === label ? "active" : ""}`}
              onClick={() => setActivePage(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {activePage === label && <ChevronRight className="nav-arrow" size={16} />}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="care-card">
          <div className="care-icon"><Users size={18} /></div>
          <strong>Family care</strong>
          <p>Keep an eye on everyone’s adherence.</p>
          <button onClick={() => setActivePage("Family")}>View family <ChevronRight size={15} /></button>
        </div>

        <button className="side-link settings-link">
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <div className="profile-mini">
          <div className="avatar">S</div>
          <div>
            <strong>Soumyadeep</strong>
            <span>Patient account</span>
          </div>
        </div>
      </aside>
    </>
  );
}
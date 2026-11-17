
import React from "react";
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
  LogOut
} from "lucide-react";

export default function Navbar({
  search,
  setSearch,
  onMenu,
  darkMode,
  setDarkMode,
  onLogout
}) {
  return (
    <header className="navbar">

      <button
        className="mobile-menu"
        onClick={onMenu}
      >
        <Menu size={22} />
      </button>

      <div className="search-box">
        <Search size={18} />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search medicines..."
        />
      </div>

      <div className="nav-actions">

        <button
          className="circle-btn"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle theme"
        >
          {darkMode
            ? <Sun size={18} />
            : <Moon size={18} />
          }
        </button>

        <button
          className="circle-btn notification-btn"
          title="Notifications"
        >
          <Bell size={18} />
          <span />
        </button>

        <div className="top-avatar">S</div>

        {/* Logout button */}
        <button
          className="circle-btn logout-btn"
          onClick={onLogout}
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>

      </div>
    </header>
  );
}

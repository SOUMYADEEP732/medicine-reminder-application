import React, { useEffect, useMemo, useState, useRef} from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  LayoutDashboard,
  Menu,
  Moon,
  Pill,
  Plus,
  Search,
  Settings,
  Sun,
  UserRound,
  Users,
  X,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import StatCard from "./components/StatCard";
import MedicineCard from "./components/MedicineCard";
import ReminderCard from "./components/ReminderCard";
import FamilyCard from "./components/FamilyCard";
import ProgressBar from "./components/ProgressBar";
import AuthPage from "./components/AuthPage";

import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import Reminders from "./pages/Reminders";
import Family from "./pages/Family";
import Analytics from "./pages/Analytics";

import { api } from "./api";

function todayString() {
  return localDateString();
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseReminderTime(time) {
  if (!time) return null;

  const value = time.trim().toUpperCase();

  // Supports 08:30 AM and 08:30 PM.
  const twelveHour = value.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
  );

  if (twelveHour) {
    let hours = Number(twelveHour[1]);
    const minutes = Number(twelveHour[2]);
    const period = twelveHour[3];

    if (hours < 1 || hours > 12 || minutes > 59) {
      return null;
    }

    if (period === "AM" && hours === 12) hours = 0;
    if (period === "PM" && hours !== 12) hours += 12;

    return hours * 60 + minutes;
  }

  // Also supports 24-hour times such as 13:30.
  const twentyFourHour = value.match(
    /^([01]\d|2[0-3]):([0-5]\d)$/
  );

  if (twentyFourHour) {
    return (
      Number(twentyFourHour[1]) * 60 +
      Number(twentyFourHour[2])
    );
  }

  return null;
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [medicines, setMedicines] = useState([]);
  const [doseLogs, setDoseLogs] = useState([]);
  const [family, setFamily] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({ email: "", username: "" });
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const spokenReminders = useRef(new Set());
  const [activeReminder, setActiveReminder] = useState(null);

  // Merge each medicine with today's dose status, since "taken/upcoming" now
  // lives on the DoseLog rather than on the medicine itself.
  const medicinesForDisplay = useMemo(() => {
    const today = todayString();
    return medicines.map((medicine) => {
      const log = doseLogs.find((l) => l.medicineId === medicine.id && l.date === today);
      return {
        ...medicine,
        status: log?.status === "taken" ? "taken" : "upcoming",
        doseLogId: log?.id,
      };
    });
  }, [medicines, doseLogs]);

  const reminders = useMemo(() => {
    const today = todayString();
    return doseLogs
      .filter((log) => log.date === today)
      .map((log) => ({
        id: log.id,
        medicine: log.medicineName,
        time: log.time,
        date: "Today",
        type: log.status === "taken" ? "done" : "upcoming",
      }));
  }, [doseLogs]);

  const now = new Date();
  const today = todayString();

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  // All dose records for today.
  const todayLogs = doseLogs.filter(
    (log) => log.date === today
  );

  // Count doses taken today.
  const takenCount = todayLogs.filter(
    (log) => log.status === "taken"
  ).length;

  // Include every pending dose, including overdue doses.
  const pendingTodayLogs = todayLogs
    .filter((log) => log.status === "upcoming")
    .sort((a, b) => {
      const timeA = parseReminderTime(a.time) ?? 9999;
      const timeB = parseReminderTime(b.time) ?? 9999;
      return timeA - timeB;
    });

  // Prefer the next future reminder. If all pending doses
  // are overdue, still show the earliest pending dose.
  const futureUpcomingLogs = pendingTodayLogs.filter((log) => {
    const scheduled = parseReminderTime(log.time);
    return scheduled !== null && scheduled >= currentMinutes;
  });

  const nextReminder =
    futureUpcomingLogs[0] || pendingTodayLogs[0] || null;

  const upcomingCount = pendingTodayLogs.length;

  // Today's adherence: only count doses that are due,
  // already taken, or explicitly marked missed.
  const dueTodayLogs = todayLogs.filter((log) => {
    if (log.status === "taken" || log.status === "missed") {
      return true;
    }

    const scheduled = parseReminderTime(log.time);

    return (
      log.status === "upcoming" 
      // scheduled !== null &&
      // scheduled <= currentMinutes
    );
  });

  // Today's adherence: consider ALL doses scheduled today.
  const totalTodayDoses = todayLogs.length;

  const adherence = totalTodayDoses > 0
    ? Math.round((takenCount / totalTodayDoses) * 100)
    : 0;


  // Medicines that have reached their refill threshold.
  const refillMedicines = medicines.filter((medicine) => {
    const remaining = Number(medicine.remainingDoses ?? 30);
    const threshold = Number(medicine.refillThreshold ?? 5);

    return (
      Number.isFinite(remaining) &&
      Number.isFinite(threshold) &&
      remaining <= threshold
    );
  });

// Weekly graph: calculate each day independently.
const weeklyAdherence = Array.from(
  { length: 7 },
  (_, index) => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    const dateKey = localDateString(date);

    const dayLogs = doseLogs.filter((log) => {
      if (log.date !== dateKey) return false;

      if (log.status === "taken" || log.status === "missed") {
        return true;
      }

      const scheduled = parseReminderTime(log.time);

      // Previous days: an uncompleted dose is overdue.
      if (dateKey < today) {
        return log.status === "upcoming";
      }

      // Today: include only doses whose scheduled time has passed.
      return (
        dateKey === today &&
        log.status === "upcoming" &&
        scheduled !== null &&
        scheduled <= currentMinutes
      );
    });

    const dayTaken = dayLogs.filter(
      (log) => log.status === "taken"
    ).length;

    const dayTotal = dayLogs.length;

    const percent = dayTotal > 0
      ? Math.round((dayTaken / dayTotal) * 100)
      : 0;

    return {
      date: dateKey,
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      percent,
      total: dayTotal,
      taken: dayTaken,
    };
  }
);

  const filteredMedicines = useMemo(
    () =>
      medicinesForDisplay.filter((m) =>
        `${m.name} ${m.dosage} ${m.instruction}`.toLowerCase().includes(search.toLowerCase())
      ),
    [medicinesForDisplay, search]
  );

  const loadData = async () => {
    setDataLoading(true);
    setDataError("");
    try {
      const [medicineDocs, doseLogDocs, familyDocs] = await Promise.all([
        api.getMedicines(),
        api.getDoseLogs(),
        api.getFamily(),
      ]);

      setMedicines(
        medicineDocs.map((m) => ({
          ...m,
          id: String(m._id),
          remainingDoses: Number(m.remainingDoses ?? 30),
          refillThreshold: Number(m.refillThreshold ?? 5),
        }))
      );

      setDoseLogs(
        doseLogDocs.map((log) => ({
          id: log._id,
          medicineId: String(log.medicine._id),
          medicineName: log.medicine.name,
          date: log.date,
          time: log.time,
          status: log.status,
        }))
      );

      
      setFamily(
        familyDocs.map((member) => ({
          id: member.id,
          name: member.username,
          relation: member.email === currentUser.email ? "You" : "Family member",
          initials: member.username.slice(0, 1).toUpperCase(),

          // Adherence percentage
          adherence: member.adherence ?? null,

          // Newly added: missed doses
          missedDoses: member.missedDoses || [],

          status:
            member.adherence == null
              ? "No data yet"
              : member.adherence >= 80
              ? "Good"
              : "Needs attention",
        }))
      );
    } catch (err) {
      setDataError(err.message || "Couldn't load your data. Is the backend running?");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  
  // Automatic voice reminders
  


useEffect(() => {
  if (!isLoggedIn || !voiceEnabled || activeReminder) return;

  const checkReminders = () => {
    const now = new Date();
    const today = todayString();
    const currentMinutes =
      now.getHours() * 60 + now.getMinutes();

    // Find only the earliest pending reminder.
    const dueLog = doseLogs
      .filter((log) => {
        if (log.date !== today || log.status !== "upcoming") {
          return false;
        }

        const scheduled = parseReminderTime(log.time);
        return scheduled !== null && currentMinutes >= scheduled;
      })
      .sort(
        (a, b) =>
          parseReminderTime(a.time) - parseReminderTime(b.time)
      )
      .find((log) => {
        const key = `${log.id}:${log.date}`;
        return !spokenReminders.current.has(key);
      });

    if (!dueLog) return;

    const medicine = medicines.find(
      (item) => String(item.id) === String(dueLog.medicineId)
    );

    if (!medicine) return;

    const reminderKey = `${dueLog.id}:${dueLog.date}`;

    const dosage = medicine.dosage ? `, ${medicine.dosage}` : "";
    const instruction = medicine.instruction
      ? ` Instructions: ${medicine.instruction}.`
      : "";

    const message =
      `It is time to take your medicine. ` +
      `${medicine.name}${dosage}.` +
      instruction;

    // Mark it only after a valid medicine has been found.
    spokenReminders.current.add(reminderKey);

    setActiveReminder({
      key: reminderKey,
      medicineName: medicine.name,
      time: dueLog.time,
      message,
    });
  };

  checkReminders();

  const timer = window.setInterval(checkReminders, 5000);
  return () => window.clearInterval(timer);
}, [isLoggedIn, voiceEnabled, activeReminder, medicines, doseLogs]);





useEffect(() => {
  if (!activeReminder || !voiceEnabled) return;

  let stopped = false;
  let repeatTimer = null;

  const speak = () => {
    if (stopped) return;

    const synth = window.speechSynthesis;

    // Cancel only when starting a new announcement.
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(
      activeReminder.message
    );

    utterance.lang = "en-US";
    utterance.volume = 1;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      console.log("Medicine reminder voice started");
    };

    utterance.onend = () => {
      if (!stopped) {
        repeatTimer = setTimeout(speak, 3500);
      }
    };

    utterance.onerror = (event) => {
      console.error("Medicine reminder voice error:", event.error);
    };

    synth.speak(utterance);
  };

  // Start speaking after the reminder becomes active.
  speak();

  return () => {
    stopped = true;
    clearTimeout(repeatTimer);
    window.speechSynthesis.cancel();
  };
}, [activeReminder, voiceEnabled]);



  const markTaken = async (medicineId) => {
    const target = medicinesForDisplay.find(
      (medicine) => medicine.id === medicineId
    );

    if (!target?.doseLogId) return;

    try {
      await api.markDose(target.doseLogId, "taken");

      // Update the dose-log status immediately.
      setDoseLogs((current) =>
        current.map((log) =>
          log.id === target.doseLogId
            ? { ...log, status: "taken" }
            : log
        )
      );

      // Update stock only if this dose was not already taken.
      if (target.status !== "taken") {
        setMedicines((current) =>
          current.map((medicine) => {
            if (String(medicine.id) !== String(medicineId)) {
              return medicine;
            }

            const currentStock = Number(
              medicine.remainingDoses ?? 30
            );

            return {
              ...medicine,
              remainingDoses: Math.max(0, currentStock - 1),
            };
          })
        );
      }
    } catch (err) {
      setDataError(
        err.message || "Couldn't update that reminder."
      );
    }
  };

  const deleteDose = async (doseLogId) => {
    try {
      await api.deleteDose(doseLogId);

      setDoseLogs((current) =>
        current.filter((log) => log.id !== doseLogId)
      );

      if (activeReminder?.doseLogId === doseLogId) {
        setActiveReminder(null);
      }
    } catch (err) {
      setDataError(err.message || "Couldn't delete that dose record.");
    }
  };

  
  const deleteMedicine = async (medicineId) => {
    try {
      await api.deleteMedicine(medicineId);

      // Remove medicine from the UI immediately after successful deletion
      setMedicines((current) =>
        current.filter(
          (medicine) => String(medicine.id) !== String(medicineId)
        )
      );

      // Also remove its dose history from the UI
      setDoseLogs((current) =>
        current.filter(
          (log) => String(log.medicineId) !== String(medicineId)
        )
      );

      setDataError("");
    } catch (err) {
      console.error("Medicine deletion failed:", err);
      setDataError(err.message || "Couldn't remove that medicine schedule.");
    }
  };

  const addMedicine = async (medicine) => {
    try {
      await api.addMedicine(medicine);
      setShowAdd(false);
      // Re-fetching picks up the new medicine and the dose log the backend
      // generates for it, instead of guessing that shape on the frontend.
      await loadData();
    } catch (err) {
      setDataError(err.message || "Couldn't add that medicine.");
    }
  };

  const inviteMember = async ({ email, password }) => {
    await api.addFamilyMember({ email, password });
    await loadData();
  };

  const handleLogin = (email, username) => {
    setCurrentUser({
      email,
      username: username || email.split("@")[0] || "User",
    });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Remove authentication token
    localStorage.removeItem("token");

    // Stop voice reminders
    window.speechSynthesis?.cancel();

    // Clear user session
    setIsLoggedIn(false);
    setCurrentUser({
      email: "",
      username: "",
    });

    // Clear previously loaded user data
    setMedicines([]);
    setDoseLogs([]);
    setFamily([]);

    // Reset application state
    setActivePage("Dashboard");
    setVoiceEnabled(false);
    setActiveReminder(null);
    setDataError("");
    setSearch("");
  };


 
  
const toggleVoiceReminders = () => {
  if (!("speechSynthesis" in window)) {
    setDataError("Your browser does not support voice reminders.");
    return;
  }

  if (voiceEnabled) {
    window.speechSynthesis.cancel();
    setActiveReminder(null);
    setVoiceEnabled(false);
    return;
  }

  // Test the browser voice and enable reminders.
  const testVoice = new SpeechSynthesisUtterance(
    "Voice medicine reminders are enabled."
  );

  testVoice.lang = "en-US";
  testVoice.volume = 1;
  testVoice.rate = 0.9;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(testVoice);

  setVoiceEnabled(true);
};

  const stopVoiceReminder = () => {
    window.speechSynthesis.cancel();
    setActiveReminder(null);
  };


  if (!isLoggedIn) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (dataLoading && medicines.length === 0 && family.length === 0) {
    return <div className="app-loading">Loading your data…</div>;
  }

  return (
    <div className={darkMode ? "app dark" : "app"}>
      
    {activeReminder && (
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="medicine-reminder-title"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(0, 0, 0, 0.65)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: darkMode ? "#1f2937" : "#ffffff",
            color: darkMode ? "#ffffff" : "#111827",
            borderRadius: "20px",
            padding: "28px",
            width: "100%",
            maxWidth: "420px",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontSize: "42px", marginBottom: "12px" }}>
            💊
          </div>

          <h2 id="medicine-reminder-title">
            Medicine Reminder!
          </h2>

          <p>
            It is time to take your scheduled medicine.
          </p>

          <h3>{activeReminder.medicineName}</h3>

          <p>
            Scheduled time: <strong>{activeReminder.time}</strong>
          </p>

          <p style={{ fontSize: "14px", opacity: 0.75 }}>
            The voice reminder will repeat until you press Stop.
          </p>

          <button
            onClick={stopVoiceReminder}
            style={{
              background: "#dc2626",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "13px 28px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "12px",
              width: "100%",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <X size={20} />
              Stop Voice Reminder
            </span>
          </button>
        </div>
      </div>
    )}

      <Sidebar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setMobileOpen(false);
        }}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="main-shell">
        
        <Navbar
          search={search}
          setSearch={setSearch}
          onMenu={() => setMobileOpen(true)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onLogout={handleLogout}
        />
        <main className="page">
          {dataError && (
            <div className="data-error-banner">
              {dataError}
              <button onClick={loadData}>Retry</button>
            </div>
          )}

          <div className="page-top">
            <div>
              <div className="eyebrow">Saturday, August 15</div>
              <h1>{activePage === "Dashboard" ? `Good morning, ${currentUser.username}` : activePage}</h1>
              <p className="page-subtitle">
                {activePage === "Dashboard"
                  ? "Here’s a simple overview of your medicines and family health."
                  : `Manage your ${activePage.toLowerCase()} from one place.`}
              </p>
            </div>

            <button className="primary-btn" onClick={() => setShowAdd(true)}>
              <Plus size={18} />
              Add Medicine
            </button>
            <button
              className="secondary-btn"
              onClick={toggleVoiceReminders}
              aria-pressed={voiceEnabled}
            >
              <Bell size={18} />
              {voiceEnabled
                ? "Disable Voice"
                : "Enable Voice Reminders"}
            </button>
          </div>

          {activePage === "Dashboard" && (
            <Dashboard
              medicines={medicinesForDisplay}
              reminders={reminders}
              family={family}
              adherence={adherence}
              takenCount={takenCount}
              upcomingCount={upcomingCount}
              nextReminder={nextReminder}
              refillCount={refillMedicines.length}
              weeklyAdherence={weeklyAdherence}
              onTaken={markTaken}
              onDeleteMedicine={deleteMedicine}
              onAdd={() => setShowAdd(true)}
              onNavigate={setActivePage}
            />
          )}

          {activePage === "Medicines" && (
            <Medicines
              medicines={filteredMedicines}
              onTaken={markTaken}
              onDeleteMedicine={deleteMedicine}
              onAdd={() => setShowAdd(true)}
            />
          )}

          {activePage === "Reminders" && (
            <Reminders 
              reminders={reminders} 
              // medicines={medicinesForDisplay}
              doseLogs={doseLogs}
              onDeleteDose={deleteDose}
            />
          )}

          {activePage === "Family" && (
            <Family family={family} onInvite={() => setShowInvite(true)} />
          )}

          {activePage === "Analytics" && (
            <Analytics medicines={medicinesForDisplay} family={family} adherence={adherence} />
          )}
        </main>
      </div>

      {showAdd && (
        <AddMedicineModal onClose={() => setShowAdd(false)} onAdd={addMedicine} />
      )}

      {showInvite && (
        <AddFamilyMemberModal onClose={() => setShowInvite(false)} onInvite={inviteMember} />
      )}
    </div>
  );
}

function AddMedicineModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("08:30 AM");
  const [instruction, setInstruction] = useState("After food");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [remainingDoses, setRemainingDoses] = useState("30");
  const [refillThreshold, setRefillThreshold] = useState("5");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      await onAdd({
          name: name.trim(),
          dosage: dosage.trim() || "As prescribed",
          instruction,
          time,
          color: ["blue", "purple", "orange"][name.length % 3],

          // NEW: Save medicine stock information
          remainingDoses: Number(remainingDoses),
          refillThreshold: Number(refillThreshold),
      });
    } catch (err) {
      setError(err.message || "Couldn't add that medicine.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-icon"><Pill size={20} /></div>
            <h2>Add medicine</h2>
            <p>Create a reminder in a few seconds.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <label>
            Medicine name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Metformin" autoFocus />
          </label>

          <label>
            Dosage
            <input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 500 mg" />
          </label>

          <div className="form-grid">
          <label>
            Remaining doses
            <input
              type="number"
              min="0"
              value={remainingDoses}
              onChange={(e) => setRemainingDoses(e.target.value)}
              required
            />
          </label>

          <label>
            Refill alert at (doses)
            <input
              type="number"
              min="0"
              value={refillThreshold}
              onChange={(e) => setRefillThreshold(e.target.value)}
              required
            />
          </label>
        </div>

          <div className="form-grid">
            <label>
              Reminder time
              <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="08:30 AM" />
            </label>

            <label>
              Instruction
              <select value={instruction} onChange={(e) => setInstruction(e.target.value)}>
                <option>After food</option>
                <option>Before food</option>
                <option>With food</option>
                <option>Any time</option>
              </select>
            </label>
          </div>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              <Plus size={17} /> {submitting ? "Adding..." : "Add medicine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddFamilyMemberModal({ onClose, onInvite }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setSubmitting(true);
    setError("");
    try {
      await onInvite({ email: email.trim(), password });
      onClose();
    } catch (err) {
      setError(err.message || "Couldn't add that member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-icon"><Users size={20} /></div>
            <h2>Add family member</h2>
            <p>Enter their existing account email and password to link them to your family.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <label>
            Their email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@gmail.com"
              autoFocus
            />
          </label>

          <label>
            Their password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Their account password"
            />
          </label>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              <Users size={17} /> {submitting ? "Adding..." : "Add member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;


import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Medicine from "../models/Medicine.js";
import DoseLog from "../models/DoseLog.js";

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Convert reminder time into minutes
function parseDoseTime(value) {
  if (!value) return null;

  const match = String(value)
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (minutes > 59 || hours > 23) return null;

  if (meridiem) {
    if (hours < 1 || hours > 12) return null;

    hours = (hours % 12) +
      (meridiem === "PM" ? 12 : 0);
  }

  return hours * 60 + minutes;
}

// Check whether a dose has been missed
function isMissedDose(log, now) {
  if (log.status === "missed") return true;

  if (log.status !== "upcoming") return false;

  const today = getLocalDateKey(now);

  if (log.date < today) return true;
  if (log.date > today) return false;

  const scheduledMinutes = parseDoseTime(log.time);
  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  return (
    scheduledMinutes !== null &&
    scheduledMinutes <= currentMinutes
  );
}

// Create today's dose logs if they don't exist
async function ensureTodayDoseLogs(userId) {
  const date = getLocalDateKey();

  const medicines = await Medicine.find({
    user: userId
  });

  for (const medicine of medicines) {
    await DoseLog.updateOne(
      {
        medicine: medicine._id,
        date
      },
      {
        $setOnInsert: {
          medicine: medicine._id,
          date,
          time: medicine.time,
          status: "upcoming"
        }
      },
      {
        upsert: true
      }
    );
  }
}

// Calculate adherence and missed doses

// Calculate adherence and missed doses for a family member
async function computeMemberStats(userId) {
  await ensureTodayDoseLogs(userId);

  const medicines = await Medicine.find({
    user: userId
  }).select("_id");

  const medicineIds = medicines.map(
    medicine => medicine._id
  );

  if (medicineIds.length === 0) {
    return {
      adherence: null,
      missedDoses: []
    };
  }

  // Exclude deleted dose records.
  const logs = await DoseLog.find({
    medicine: { $in: medicineIds },
    isDeleted: { $ne: true }
  }).populate("medicine", "name dosage");

  if (logs.length === 0) {
    return {
      adherence: null,
      missedDoses: []
    };
  }

  const now = new Date();

  // Include only doses that are actually due:
  // 1. Already taken
  // 2. Explicitly marked as missed
  // 3. Upcoming doses whose scheduled time has passed
  const dueLogs = logs.filter(log => {
    return (
      log.status === "taken" ||
      log.status === "missed" ||
      isMissedDose(log, now)
    );
  });

  const takenCount = dueLogs.filter(
    log => log.status === "taken"
  ).length;

  // Identify all missed doses.
  const missedDoses = dueLogs
    .filter(log => isMissedDose(log, now))
    .sort((a, b) =>
      b.date.localeCompare(a.date) ||
      b.time.localeCompare(a.time)
    )
    .map(log => ({
      id: String(log._id),
      medicineName: log.medicine?.name || "Medicine",
      dosage: log.medicine?.dosage || "",
      date: log.date,
      time: log.time
    }));

  // Calculate adherence using only due doses.
  const adherence = dueLogs.length > 0
    ? Math.round(
        (takenCount / dueLogs.length) * 100
      )
    : null;

  return {
    adherence,
    missedDoses
  };
}


// Get all family members with their adherence
// and missed dose information
export async function getFamilyMembers(req, res) {
  const members = await User.find({
    family: req.user.family
  });

  const withStats = await Promise.all(
    members.map(async member => {
      const stats = await computeMemberStats(
        member._id
      );

      return {
        id: String(member._id),
        username: member.username,
        email: member.email,
        adherence: stats.adherence,
        missedDoses: stats.missedDoses
      };
    })
  );

  res.json(withStats);
}

// Add family member
export async function addFamilyMember(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required."
    });
  }

  const target = await User.findOne({
    email: email.toLowerCase()
  });

  if (!target) {
    return res.status(404).json({
      message: "No account found with that email."
    });
  }

  const matches = await bcrypt.compare(
    password,
    target.passwordHash
  );

  if (!matches) {
    return res.status(401).json({
      message: "Incorrect password for that account."
    });
  }

  if (target._id.equals(req.user._id)) {
    return res.status(400).json({
      message: "You're already in this family."
    });
  }

  if (target.family.equals(req.user.family)) {
    return res.status(400).json({
      message: "That person is already in your family."
    });
  }

  target.family = req.user.family;
  await target.save();

  res.json({
    message: `${target.username} joined the family.`,
    member: target
  });
}

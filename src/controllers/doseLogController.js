
import Medicine from "../models/Medicine.js";
import DoseLog from "../models/DoseLog.js";
import User from "../models/User.js";

async function isSameFamily(req, targetUserId) {
  if (String(targetUserId) === String(req.user._id)) {
    return true;
  }

  const target = await User.findById(targetUserId);

  return Boolean(
    target && target.family.equals(req.user.family)
  );
}

// Get today's local date.
function todayString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Create today's dose records if they do not exist.
async function ensureTodayDoseLogs(userId) {
  const date = todayString();

  const medicines = await Medicine.find({
    user: userId,
  });

  for (const medicine of medicines) {
    const exists = await DoseLog.findOne({
      medicine: medicine._id,
      date,
    });

    if (!exists) {
      await DoseLog.create({
        medicine: medicine._id,
        date,
        time: medicine.time,
        status: "upcoming",
      });
    }
  }
}

export async function listDoseLogs(req, res) {
  const targetUserId = req.params.userId || req.user._id;

  if (!(await isSameFamily(req, targetUserId))) {
    return res.status(403).json({
      message: "You don't have access to that person's reminders.",
    });
  }

  await ensureTodayDoseLogs(targetUserId);

  const medicines = await Medicine.find({
    user: targetUserId,
  }).select("_id");

  const medicineIds = medicines.map(
    (medicine) => medicine._id
  );

  const logs = await DoseLog.find({
    medicine: { $in: medicineIds },
    isDeleted: { $ne: true },
  })
    .populate("medicine")
    .sort({
      date: -1,
      time: 1,
    });

  res.json(logs);
}

export async function markDoseStatus(req, res) {
  const { status } = req.body;

  if (!["upcoming", "taken", "missed"].includes(status)) {
    return res.status(400).json({
      message: "Status must be upcoming, taken, or missed.",
    });
  }

  const log = await DoseLog.findById(
    req.params.id
  ).populate("medicine");

  if (!log || log.isDeleted) {
    return res.status(404).json({
      message: "Reminder not found.",
    });
  }

  if (!(await isSameFamily(req, log.medicine.user))) {
    return res.status(403).json({
      message: "You don't have access to update this reminder.",
    });
  }

  const previousStatus = log.status;

  log.status = status;
  await log.save();

  // Decrease stock only when newly marked as taken.
  if (status === "taken" && previousStatus !== "taken") {
    await Medicine.updateOne(
      {
        _id: log.medicine._id,
        remainingDoses: { $gt: 0 },
      },
      {
        $inc: {
          remainingDoses: -1,
        },
      }
    );
  }

  res.json(log);
}

// Delete one dose record without deleting the medicine schedule.
export async function deleteDoseLog(req, res) {
  const log = await DoseLog.findById(
    req.params.id
  ).populate("medicine");

  if (!log || !log.medicine || log.isDeleted) {
    return res.status(404).json({
      message: "Dose record not found.",
    });
  }

  if (!(await isSameFamily(req, log.medicine.user))) {
    return res.status(403).json({
      message: "You don't have access to delete this dose record.",
    });
  }

  // Soft delete: prevents today's dose from being recreated.
  log.isDeleted = true;
  await log.save();

  res.json({
    message: "Dose record deleted.",
  });
}

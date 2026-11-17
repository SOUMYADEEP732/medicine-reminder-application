import Medicine from "../models/Medicine.js";
import User from "../models/User.js";
import DoseLog from "../models/DoseLog.js";

async function isSameFamily(req, targetUserId) {
  if (String(targetUserId) === String(req.user._id)) {
    return true;
  }

  const target = await User.findById(targetUserId);

  return Boolean(
    target && target.family.equals(req.user.family)
  );
}

export async function listMedicines(req, res) {
  const targetUserId = req.params.userId || req.user._id;

  if (!(await isSameFamily(req, targetUserId))) {
    return res.status(403).json({
      message:
        "You don't have access to that person's medicines.",
    });
  }

  const medicines = await Medicine.find({
    user: targetUserId,
  }).sort({ createdAt: -1 });

  res.json(medicines);
}

export async function createMedicine(req, res) {
  const targetUserId = req.body.userId || req.user._id;

  if (!(await isSameFamily(req, targetUserId))) {
    return res.status(403).json({
      message:
        "You don't have access to add medicines for that person.",
    });
  }

  const {
    name,
    dosage,
    instruction,
    time,
    color,
    remainingDoses,
    refillThreshold,
  } = req.body;

  if (!name || !time) {
    return res.status(400).json({
      message: "Medicine name and time are required.",
    });
  }

  const medicine = await Medicine.create({
    user: targetUserId,
    name,
    dosage,
    instruction,
    time,
    color,

    remainingDoses:
      Number.isFinite(Number(remainingDoses))
        ? Math.max(0, Number(remainingDoses))
        : 30,

    refillThreshold:
      Number.isFinite(Number(refillThreshold))
        ? Math.max(0, Number(refillThreshold))
        : 5,
  });

  res.status(201).json(medicine);
}

export async function updateMedicine(req, res) {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return res.status(404).json({
      message: "Medicine not found.",
    });
  }

  if (!(await isSameFamily(req, medicine.user))) {
    return res.status(403).json({
      message:
        "You don't have access to edit this medicine.",
    });
  }

  Object.assign(medicine, req.body);

  await medicine.save();

  res.json(medicine);
}

export async function deleteMedicine(req, res) {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return res.status(404).json({
      message: "Medicine not found.",
    });
  }

  if (!(await isSameFamily(req, medicine.user))) {
    return res.status(403).json({
      message: "You don't have access to delete this medicine.",
    });
  }

  // Delete all dose records associated with this medicine.
  await DoseLog.deleteMany({
    medicine: medicine._id,
  });

  // Delete the recurring medicine schedule.
  await medicine.deleteOne();

  res.json({
    message: "Medicine schedule and its dose records deleted.",
  });
}

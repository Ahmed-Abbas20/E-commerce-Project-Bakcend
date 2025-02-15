const express = require("express");
const router = express.Router();
const {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} = require("../repos/branch.repo");
const { validateBranch } = require("../middlewares/branchValidation.midleware");

router.post("/", validateBranch, async (req, res, next) => {
  try {
    const branch = await createBranch(req.body);
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const branches = await getAllBranches();
    res.status(200).json({ success: true, data: branches });
  } catch (error) {
    next(error);
  }
});

router.get("/:branchId", async (req, res, next) => {
  try {
    const branch = await getBranchById(req.params.branchId);
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});

router.put("/:branchId", validateBranch, async (req, res, next) => {
  try {
    const branch = await updateBranch(req.params.branchId, req.body);
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});

router.delete("/:branchId", async (req, res, next) => {
  try {
    const branch = await deleteBranch(req.params.branchId);
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
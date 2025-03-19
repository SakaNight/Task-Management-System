const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");
const { authMiddleware } = require("./auth"); // protect the route
const multer = require("multer");
const path = require("path");
const prisma = new PrismaClient();
const router = express.Router();

const VALID_STATUSES = ["todo", "in_progress", "stuck", "done"]; // ✅ 允许的状态

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // ✅ 上传文件的目录
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

// 🔹 上传文件API
router.post("/:id/upload", authMiddleware, upload.single("file"), async (req, res) => {
  const { id } = req.params;

  try {
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (existingTask.userId !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized to upload file for this task" });
    }

    const filePath = req.file ? req.file.path : null;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { attachment: filePath },
    });

    res.json({ message: "File uploaded successfully", filePath: filePath });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🔹 获取任务列表
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("获取任务列表 - 用户ID:", req.user.userId);

    const tasks = await prisma.task.findMany({
      where: { userId: req.user.userId }, // 只获取当前用户的任务
      orderBy: { createdAt: "desc" }, // 按时间降序排序
    });

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🔹 创建任务
router.post(
  "/",
  authMiddleware, 
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").optional(),
    body("status")
      .optional()
      .isIn(VALID_STATUSES)
      .withMessage(`Invalid status, must be one of: ${VALID_STATUSES.join(", ")}`), // ✅ 限制 status 值
  ],
  async (req, res) => {
    // ✅ 先检查 express-validator 的错误
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // ✅ 先返回错误
    }

    // ✅ 然后检查用户权限
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const { title, description, status } = req.body;
    try {
      const task = await prisma.task.create({
        data: {
          title,
          description,
          status: status || "todo",
          userId: req.user.userId,
        },
      });

      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// 🔹 更新任务
router.put(
  "/:id", 
  authMiddleware, 
  [
    body("title").optional(),
    body("description").optional(),
    body("status")
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Invalid status, must be one of: ${VALID_STATUSES.join(", ")}`), // ✅ 限制 status 值
  ],
  async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    try {
      console.log("更新任务 - 用户ID:", req.user.userId, "任务ID:", id);

      // 查找任务，确保它属于当前用户
      const existingTask = await prisma.task.findUnique({
        where: { id },
      });

      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (existingTask.userId !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized to update this task" });
      }

      // 更新任务
      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          title: title || existingTask.title,
          description: description || existingTask.description,
          status: status || existingTask.status,
        },
      });

      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// 🔹 删除任务
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    console.log("删除任务 - 用户ID:", req.user.userId, "任务ID:", id);

    // 查找任务，确保它属于当前用户
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (existingTask.userId !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this task" });
    }

    // 删除任务
    await prisma.task.delete({
      where: { id },
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🔹 获取任务统计信息
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    console.log("获取任务统计 - 用户ID:", req.user.userId);

    // 统计不同状态的任务数量
    const stats = await prisma.task.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
      where: { 
        userId: req.user.userId, // 仅统计当前用户的任务
        status: { in: VALID_STATUSES } // ✅ 只统计合法状态
      },
    });

    // 将统计结果转换成 { status: count } 格式
    const formattedStats = {};
    stats.forEach(({ status, _count }) => {
      formattedStats[status] = _count.status;
    });

    res.json(formattedStats);
  } catch (error) {
    console.error("Error fetching task stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
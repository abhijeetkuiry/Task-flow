const prisma = require('../config/prisma');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public/Private
exports.getTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase().replace(' ', '_');
    }
    if (req.query.priority) {
      filter.priority = req.query.priority.toUpperCase().replace(' ', '_');
    }
    if (req.query.project) filter.projectId = req.query.project;
    if (req.query.assignee) filter.assigneeId = req.query.assignee;

    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      if (searchTerm) {
        filter.OR = [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }
    }

    let orderBy = { createdAt: 'desc' };
    if (req.query.sort) {
      if (req.query.sort.startsWith('-')) {
        orderBy = { [req.query.sort.substring(1)]: 'desc' };
      } else {
        orderBy = { [req.query.sort]: 'asc' };
      }
    }

    const tasks = await prisma.task.findMany({
      where: filter,
      include: {
        project: {
          select: { name: true },
        },
        assignee: {
          select: { name: true, email: true, avatar: true },
        },
      },
      orderBy,
    });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
};

// @desc    Get task summary stats
// @route   GET /api/tasks/stats
// @access  Public/Private
exports.getTaskStats = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      select: {
        status: true,
        priority: true,
        dueDate: true,
      },
    });

    const now = new Date();
    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'COMPLETED').length,
      todo: tasks.filter((t) => t.status === 'TODO').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      review: tasks.filter((t) => t.status === 'REVIEW').length,
      urgent: tasks.filter((t) => t.priority === 'URGENT' && t.status !== 'COMPLETED').length,
      high: tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'COMPLETED').length,
      overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'COMPLETED').length,
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Public/Private
exports.createTask = async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.title || !data.title.trim()) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    data.title = data.title.trim();

    if (data.status) data.status = data.status.toUpperCase().replace(' ', '_');
    if (data.priority) data.priority = data.priority.toUpperCase().replace(' ', '_');
    if (data.dueDate !== undefined) {
      data.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    if (data.project) {
      data.projectId = data.project;
      delete data.project;
    }
    if (data.assignee) {
      data.assigneeId = data.assignee;
      delete data.assignee;
    }

    if (data.creator) {
      data.creatorId = data.creator;
      delete data.creator;
    }

    // Using an ObjectId for creator (or fallback if unauthenticated)
    if (!data.creatorId) {
      data.creatorId = req.user ? req.user.id : '000000000000000000000001';
    }

    const task = await prisma.task.create({
      data,
      include: {
        project: {
          select: { name: true },
        },
        assignee: {
          select: { name: true, email: true, avatar: true },
        },
      },
    });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Bad Request', message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Public/Private
exports.updateTask = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.title) data.title = data.title.trim();
    if (data.status) data.status = data.status.toUpperCase().replace(' ', '_');
    if (data.priority) data.priority = data.priority.toUpperCase().replace(' ', '_');
    if (data.dueDate !== undefined) {
      data.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.project) {
      data.projectId = data.project;
      delete data.project;
    }
    if (data.assignee) {
      data.assigneeId = data.assignee;
      delete data.assignee;
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data,
      include: {
        project: {
          select: { name: true },
        },
        assignee: {
          select: { name: true, email: true, avatar: true },
        },
      },
    });
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.status(400).json({ success: false, error: 'Bad Request', message: error.message });
  }
};

// @desc    Toggle task status (COMPLETED <-> TODO)
// @route   PATCH /api/tasks/:id/toggle
// @access  Public/Private
exports.toggleTask = async (req, res) => {
  try {
    const existing = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const newStatus = existing.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status: newStatus },
      include: {
        project: {
          select: { name: true },
        },
        assignee: {
          select: { name: true, email: true, avatar: true },
        },
      },
    });

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.status(400).json({ success: false, error: 'Bad Request', message: error.message });
  }
};

// @desc    Clear all completed tasks
// @route   DELETE /api/tasks/completed/clear
// @access  Public/Private
exports.clearCompleted = async (req, res) => {
  try {
    const result = await prisma.task.deleteMany({
      where: { status: 'COMPLETED' },
    });
    res.status(200).json({ success: true, count: result.count });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Public/Private
exports.deleteTask = async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id },
    });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.status(400).json({ success: false, error: 'Bad Request', message: error.message });
  }
};

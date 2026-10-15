const prisma = require('../config/prisma');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase().replace(' ', '_');
    }
    if (req.query.project) filter.projectId = req.query.project;
    if (req.query.assignee) filter.assigneeId = req.query.assignee;

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
          select: { name: true }
        },
        assignee: {
          select: { name: true, email: true, avatar: true }
        }
      },
      orderBy
    });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const data = { ...req.body };
    
    if (data.status) data.status = data.status.toUpperCase().replace(' ', '_');
    if (data.priority) data.priority = data.priority.toUpperCase().replace(' ', '_');
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    
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
      data
    });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Bad Request', message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.status) data.status = data.status.toUpperCase().replace(' ', '_');
    if (data.priority) data.priority = data.priority.toUpperCase().replace(' ', '_');
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
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
      data
    });
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    if (error.code === 'P2025') {
       return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.status(400).json({ success: false, error: 'Bad Request', message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id }
    });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    if (error.code === 'P2025') {
       return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.status(400).json({ success: false, error: 'Bad Request', message: error.message });
  }
};

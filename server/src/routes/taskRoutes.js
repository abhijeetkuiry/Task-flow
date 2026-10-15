const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  clearCompleted,
  getTaskStats,
} = require('../controllers/taskController');

const router = express.Router();

router.get('/stats', getTaskStats);
router.delete('/completed/clear', clearCompleted);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.patch('/:id/toggle', toggleTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;

import React, { useState } from 'react';
import { Plus, Calendar, Flag, AlignLeft, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'priority-low' },
  { value: 'MEDIUM', label: 'Medium', color: 'priority-medium' },
  { value: 'HIGH', label: 'High', color: 'priority-high' },
  { value: 'URGENT', label: 'Urgent', color: 'priority-urgent' },
];

export default function TaskInput({ onAddTask, isCreating }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || isCreating) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status: 'TODO',
      dueDate: dueDate || null,
    });

    setTitle('');
    setDescription('');
    setDueDate('');
    setShowDetails(false);
  };

  const setQuickDate = (type) => {
    const today = new Date();
    if (type === 'today') {
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setDueDate(`${yyyy}-${mm}-${dd}`);
    } else if (type === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setDueDate(`${yyyy}-${mm}-${dd}`);
    }
  };

  return (
    <div className="task-input-container">
      <form onSubmit={handleSubmit} className="task-input-card">
        <div className="input-primary-row">
          <input
            type="text"
            className="main-task-input"
            placeholder="Add a new task... (e.g., Deploy updates to MongoDB Atlas, review PR)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isCreating}
            id="input-new-task"
            autoFocus
          />

          <button
            type="submit"
            className="btn-add-task"
            disabled={!title.trim() || isCreating}
            id="btn-create-task"
            title="Create task (Enter)"
          >
            {isCreating ? (
              <Loader2 size={18} className="spinning" />
            ) : (
              <>
                <Plus size={18} />
                <span>Add Task</span>
              </>
            )}
          </button>
        </div>

        {/* Option toggles & Quick Bar */}
        <div className="input-options-bar">
          <div className="options-left">
            {/* Priority Selector Pills */}
            <div className="priority-pill-selector" role="group" aria-label="Priority selection">
              <span className="option-label">Priority:</span>
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`priority-chip ${p.value.toLowerCase()} ${
                    priority === p.value ? 'selected' : ''
                  }`}
                  onClick={() => setPriority(p.value)}
                >
                  <Flag size={12} className="priority-icon" />
                  {p.label}
                </button>
              ))}
            </div>

            {/* Quick Due Date */}
            <div className="due-date-quick-bar">
              <span className="option-label">Due:</span>
              <button
                type="button"
                className={`quick-date-btn ${dueDate && new Date().toISOString().startsWith(dueDate) ? 'active' : ''}`}
                onClick={() => setQuickDate('today')}
              >
                Today
              </button>
              <button
                type="button"
                className="quick-date-btn"
                onClick={() => setQuickDate('tomorrow')}
              >
                Tomorrow
              </button>
              <div className="date-picker-wrapper">
                <input
                  type="date"
                  className="date-input-hidden"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  id="task-due-date-input"
                />
                <label htmlFor="task-due-date-input" className="date-input-label" title="Pick specific date">
                  <Calendar size={13} />
                  <span>{dueDate ? dueDate : 'Custom'}</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-toggle-details"
            onClick={() => setShowDetails(!showDetails)}
          >
            <AlignLeft size={14} />
            <span>{showDetails ? 'Hide Details' : 'Add Note'}</span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Expandable Description */}
        {showDetails && (
          <div className="input-expanded-row">
            <textarea
              className="details-textarea"
              placeholder="Add optional notes, links, or sub-details..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        )}
      </form>
    </div>
  );
}

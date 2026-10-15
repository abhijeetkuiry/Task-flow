const API_BASE = '/api';

/**
 * Helper to handle JSON responses and errors
 */
async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || data.error || `HTTP error ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const taskApi = {
  // Check health and MongoDB Atlas connection
  async checkHealth() {
    return request('/health');
  },

  // Get tasks with optional query filters (status, priority, search, sort)
  async getTasks(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.priority && params.priority !== 'ALL') query.set('priority', params.priority);
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/tasks${queryString}`);
  },

  // Get task summary statistics
  async getStats() {
    return request('/tasks/stats');
  },

  // Create new task
  async createTask(taskData) {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Update existing task
  async updateTask(id, taskData) {
    return request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  // Quick toggle task status
  async toggleTask(id) {
    return request(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  // Delete task by ID
  async deleteTask(id) {
    return request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Clear all completed tasks
  async clearCompleted() {
    return request('/tasks/completed/clear', {
      method: 'DELETE',
    });
  },
};

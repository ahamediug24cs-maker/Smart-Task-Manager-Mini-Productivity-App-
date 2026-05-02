import { useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "./lib/api";

const STATUS_OPTIONS = ["todo", "in-progress", "done"];
const STATUS_TITLES = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

const emptyTaskForm = {
  title: "",
  notes: "",
  status: "todo",
};

function App() {
  const [mode, setMode] = useState("login");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const init = async () => {
      try {
        const [{ data: meData }, { data: tasksData }] = await Promise.all([
          api.get("/auth/me"),
          api.get("/tasks"),
        ]);
        setUser(meData.user);
        setTasks(tasksData.tasks);
      } catch {
        logout();
      }
    };

    init();
  }, [token]);

  const tasksByStatus = useMemo(() => {
    return STATUS_OPTIONS.reduce((acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status);
      return acc;
    }, {});
  }, [tasks]);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const payload =
        mode === "signup"
          ? authForm
          : { email: authForm.email, password: authForm.password };

      const { data } = await api.post(endpoint, payload);
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      const taskRes = await api.get("/tasks");
      setTasks(taskRes.data.tasks);
      setAuthForm({ name: "", email: "", password: "" });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Cannot reach backend. Check API server and MongoDB connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setTasks([]);
    setEditingTaskId("");
    setTaskForm(emptyTaskForm);
  };

  const startEditTask = (task) => {
    setEditingTaskId(task._id);
    setTaskForm({
      title: task.title,
      notes: task.notes || "",
      status: task.status,
    });
  };

  const submitTask = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (editingTaskId) {
        const { data } = await api.put(`/tasks/${editingTaskId}`, taskForm);
        setTasks((prev) => prev.map((task) => (task._id === editingTaskId ? data.task : task)));
      } else {
        const { data } = await api.post("/tasks", taskForm);
        setTasks((prev) => [data.task, ...prev]);
      }
      setTaskForm(emptyTaskForm);
      setEditingTaskId("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Task request failed. Backend may be unavailable."
      );
    }
  };

  const deleteTask = async (taskId) => {
    setError("");
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      if (editingTaskId === taskId) {
        setTaskForm(emptyTaskForm);
        setEditingTaskId("");
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Delete failed. Backend may be unavailable."
      );
    }
  };

  const updateTaskStatus = async (task, status) => {
    try {
      const { data } = await api.put(`/tasks/${task._id}`, {
        title: task.title,
        notes: task.notes || "",
        status,
      });
      setTasks((prev) => prev.map((item) => (item._id === task._id ? data.task : item)));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Status update failed. Backend may be unavailable."
      );
    }
  };

  if (!user) {
    return (
      <main className="app-shell auth-shell">
        <div className="auth-layout">
          <section className="brand-panel panel">
            <p className="eyebrow">Workspace</p>
            <h1>Tasks and Notes</h1>
            <p className="subtitle">
              A simple personal board for planning work and saving quick notes.
            </p>
            <ul className="feature-list">
              <li>Secure login and private data per account</li>
              <li>Three-stage workflow: To do, In progress, Done</li>
              <li>Editable notes attached to each task</li>
            </ul>
          </section>

          <section className="auth-panel panel">
            <div className="segmented-control">
              <button
                className={mode === "login" ? "active" : ""}
                type="button"
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                className={mode === "signup" ? "active" : ""}
                type="button"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </div>

            <form className="form-stack" onSubmit={handleAuthSubmit}>
              {mode === "signup" && (
                <input
                  className="auth-input"
                  required
                  value={authForm.name}
                  placeholder="Full name"
                  onChange={(event) => setAuthForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              )}
              <input
                className="auth-input"
                required
                type="email"
                value={authForm.email}
                placeholder="Email"
                onChange={(event) => setAuthForm((prev) => ({ ...prev, email: event.target.value }))}
              />
              <input
                className="auth-input"
                required
                type="password"
                minLength={6}
                value={authForm.password}
                placeholder="Password"
                onChange={(event) =>
                  setAuthForm((prev) => ({ ...prev, password: event.target.value }))
                }
              />

              {error && <p className="error-text">{error}</p>}

              <button className="auth-button" disabled={loading}>
                {loading ? "Working..." : mode === "signup" ? "Create account" : "Login"}
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="board-layout">
        <header className="board-header panel">
          <div>
            <p className="eyebrow">Signed in</p>
            <h1>{user.name}</h1>
            <p className="subtitle">{user.email} · {tasks.length} total tasks</p>
          </div>
          <button className="ghost-button" type="button" onClick={logout}>
            Logout
          </button>
        </header>

        <section className="panel task-editor">
          <h2>
            {editingTaskId ? "Edit Task" : "Create Task"}
          </h2>
          <form className="task-form" onSubmit={submitTask}>
            <input
              className="auth-input"
              required
              maxLength={120}
              value={taskForm.title}
              placeholder="Task title"
              onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
            />
            <select
              className="auth-input"
              value={taskForm.status}
              onChange={(event) => setTaskForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_TITLES[status]}
                </option>
              ))}
            </select>
            <button className="auth-button" type="submit">
              {editingTaskId ? "Update Task" : "Add Task"}
            </button>
            <textarea
              className="auth-input notes-input"
              rows={4}
              value={taskForm.notes}
              placeholder="Notes"
              onChange={(event) => setTaskForm((prev) => ({ ...prev, notes: event.target.value }))}
            />
            {editingTaskId && (
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  setEditingTaskId("");
                  setTaskForm(emptyTaskForm);
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
          {error && <p className="error-text">{error}</p>}
        </section>

        <section className="status-columns">
          {STATUS_OPTIONS.map((status) => (
            <article key={status} className="panel column-panel">
              <h3 className="column-title">
                {STATUS_TITLES[status]} <span>{tasksByStatus[status]?.length || 0}</span>
              </h3>

              <div className="task-list">
                {(tasksByStatus[status] || []).map((task) => (
                  <div key={task._id} className="task-card">
                    <h4>{task.title}</h4>
                    {task.notes && <p>{task.notes}</p>}

                    <div className="status-actions">
                      {STATUS_OPTIONS.map((nextStatus) => (
                        <button
                          key={nextStatus}
                          type="button"
                          className={`chip ${task.status === nextStatus ? "active" : ""}`}
                          onClick={() => updateTaskStatus(task, nextStatus)}
                        >
                          {STATUS_TITLES[nextStatus]}
                        </button>
                      ))}
                    </div>

                    <div className="card-actions">
                      <button
                        className="mini-button"
                        onClick={() => startEditTask(task)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="mini-button danger"
                        onClick={() => deleteTask(task._id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {(!tasksByStatus[status] || tasksByStatus[status].length === 0) && (
                  <p className="empty-state">No tasks here.</p>
                )}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

export default App;

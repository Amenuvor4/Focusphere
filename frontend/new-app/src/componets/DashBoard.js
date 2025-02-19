"use client"

import { useState } from "react"
import {
  FiHome,
  FiCalendar,
  FiBarChart2,
  FiTrash2,
  FiSettings,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi"
import TaskList from "./TaskList"
import ProgressGraph from "./ProgressGraph"
import "../styles/Dashboard.css"

const Dashboard = () => {
  const [activeNav, setActiveNav] = useState("Dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const userName = "John Doe" // This should be fetched from the backend

  const navItems = [
    { name: "Dashboard", icon: <FiHome /> },
    { name: "Progress", icon: <FiBarChart2 /> },
    { name: "Calendar", icon: <FiCalendar /> },
    { name: "Deleted Tasks", icon: <FiTrash2 /> },
    { name: "Settings", icon: <FiSettings /> },
  ]

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className={`dashboard-container ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <nav className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="logo">TaskAI</div>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
        </button>
        <ul className="nav-items">
          {navItems.map((item) => (
            <li
              key={item.name}
              className={`nav-item ${activeNav === item.name ? "active" : ""}`}
              onClick={() => setActiveNav(item.name)}
            >
              {item.icon}
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      </nav>
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Welcome, {userName}</h1>
          <button className="create-task-btn">
            <FiPlus /> Create Task
          </button>
        </header>
        <section className="current-tasks">
          <h2>Current Tasks</h2>
          <TaskList />
        </section>
        <section className="progress-graph">
          <h2>Progress Overview</h2>
          <ProgressGraph />
        </section>
      </main>
    </div>
  )
}

export default Dashboard

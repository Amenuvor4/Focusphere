import { useState, useEffect } from "react"
import {
  FiHome,
  FiCalendar,
  FiBarChart2,
  FiTrash2,
  FiSettings,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiBell,
  FiMoon,
  FiSun,
} from "react-icons/fi"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import "../styles/Dashboard.css"

const Dashboard = () => {
  const [activeNav, setActiveNav] = useState("Dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [tasks, setTasks] = useState({})
  const [userName, setUserName] = useState("")

  const navItems = [
    { name: "Dashboard", icon: <FiHome /> },
    { name: "Calendar", icon: <FiCalendar /> },
    { name: "Analytics", icon: <FiBarChart2 /> },
    { name: "Deleted Tasks", icon: <FiTrash2 /> },
    { name: "Settings", icon: <FiSettings /> },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch("/api/user")
        const userData = await userResponse.json()
        setUserName(userData.name)

        const tasksResponse = await fetch("/api/tasks")
        const tasksData = await tasksResponse.json()
        setTasks(tasksData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleDarkMode = () => setDarkMode(!darkMode)

  const onDragEnd = (result) => {
    const { source, destination } = result
    if (!destination) return

    const sourceColumn = source.droppableId
    const destColumn = destination.droppableId
    const sourceTasks = [...tasks[sourceColumn]]
    const destTasks = sourceColumn === destColumn ? sourceTasks : [...tasks[destColumn]]

    const [removed] = sourceTasks.splice(source.index, 1)
    destTasks.splice(destination.index, 0, removed)

    setTasks({
      ...tasks,
      [sourceColumn]: sourceTasks,
      [destColumn]: destTasks,
    })
  }

  return (
    <div className={`dashboard-container ${sidebarOpen ? "sidebar-open" : "sidebar-closed"} ${darkMode ? "dark-mode" : ""}`}>
      <nav className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="logo">Auranuvor</div>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
        </button>
        <ul className="nav-items">
          {navItems.map((item) => (
            <li key={item.name} className={`nav-item ${activeNav === item.name ? "active" : ""}`} onClick={() => setActiveNav(item.name)}>
              {item.icon}
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      </nav>
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Welcome back, {userName}</h1>
          <div className="header-actions">
            <button className="icon-button" onClick={toggleDarkMode}>
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
            <button className="icon-button">
              <FiBell />
            </button>
            <button className="create-task-btn">
              <FiPlus /> Create Task
            </button>
          </div>
        </header>

        <section className="task-management">
          <h2>Task Management</h2>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="task-columns">
              {Object.entries(tasks).map(([columnId, columnTasks]) => (
                <div key={columnId} className="task-column">
                  <h3>{columnId}</h3>
                  <Droppable droppableId={columnId}>
                    {(provided) => (
                      <ul {...provided.droppableProps} ref={provided.innerRef} className="task-list">
                        {columnTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`task-item priority-${task.priority.toLowerCase()}`}>
                                <h4>{task.content}</h4>
                                <p>Deadline: {task.deadline}</p>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </section>
      </main>
    </div>
  )
}

export default Dashboard

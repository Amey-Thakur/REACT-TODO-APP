/**
 * ----------------------------------------------------------------------------
 * File: TodoApp.js
 * Authors:
 *      Amey Thakur
 *      GitHub: https://github.com/ameythakur
 *
 *      Mega Satish
 *      GitHub: https://github.com/msatmod
 *
 * Repository: https://github.com/Amey-Thakur/REACT-TODO-APP
 * License: MIT License
 * Release Date: June 25, 2022
 * ----------------------------------------------------------------------------
 *
 * File Overview:
 * This file serves as the main entry point and container for the React Todo App.
 * It orchestrates the entire application state, including task management (CRUD),
 * local storage persistence, and the complex animation system driven by
 * Framer Motion.
 *
 * Architecture:
 * - Functional Component Structure using React Hooks (useState, useEffect).
 * - Component-based architecture with `TodoItem` factored out for performance
 *   and animation stability (drag-and-drop isolation).
 * - Integration with `SoundEngine` for HMI audio feedback.
 * - Implements a custom "Loading" state for cinematic effect.
 *
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import './TodoApp.css';
import logo from './logo.svg';
import soundEngine from './SoundEngine';

/**
 * Sub-component for individual Todo Items.
 * 
 * Responsibility:
 * Encapsulates the rendering and behavior of a single task within the list.
 * This separation is critical for `Framer Motion`'s `Reorder` component to 
 * correctly assign drag controls to specific DOM elements (the handle) rather 
 * than the entire row.
 * 
 * @param {Object} props
 * @param {Object} props.todo - The todo data object.
 * @param {Function} props.toggleTodo - Handler for completion toggle.
 * @param {Function} props.deleteTodo - Handler for deletion.
 * @param {Object} props.constraintsRef - Reference to the drag boundary container.
 */
const TodoItem = ({ todo, toggleTodo, deleteTodo, constraintsRef }) => {
  // Hook to manually control drag events (used for the drag handle)
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={todo}
      drag="y"
      dragControls={controls}
      dragListener={false} // Disable default drag on the whole item
      dragConstraints={constraintsRef}
      dragElastic={0.1}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      whileHover={{ scale: 1.02 }}
      whileDrag={{
        scale: 1.05,
        boxShadow: "0 15px 30px rgba(0,0,0,0.4)",
        zIndex: 10
      }}
      className={`Todo-item ${todo.completed ? 'completed' : ''} ${todo.priority || 'Medium'}`}
    >
      <div
        className="Drag-handle"
        title="Drag to reorder"
        onPointerDown={(e) => controls.start(e)}
        style={{ touchAction: "none" }}
      >
        <div className="Handle-dots">
          <span></span><span></span>
          <span></span><span></span>
          <span></span><span></span>
        </div>
      </div>
      <div className="Todo-item-content">
        <span
          onClick={() => toggleTodo(todo.id)}
          className="Todo-text"
          title={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {todo.text}
        </span>
      </div>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="Todo-delete-btn"
        title="Remove this task"
      >
        <div className="Delete-icon">
          <div className="Trash-lid"></div>
          <div className="Trash-body">
            <div className="Trash-line"></div>
          </div>
        </div>
      </button>
    </Reorder.Item>
  );
};

/**
 * Main Application Component.
 * 
 * Manages the high-level state of the application, including the todo list data,
 * UI themes (priority), audio feedback triggers, and the initial loading sequence.
 */
function TodoApp() {
  // --- State Definitions ---

  // Loading Screen States
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Data Store: Initializes from localStorage to persist data across reloads
  const [todos, setTodos] = useState(() => {
    // Load saved todos from LocalStorage
    const savedTodos = localStorage.getItem('react-todo-list');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  // Input & Form States
  const [inputValue, setInputValue] = useState('');
  const constraintsRef = useRef(null); // Ref for drag boundaries
  const [priority, setPriority] = useState('Medium');

  // Animation System States (Particles & Shockwaves)
  const [particles, setParticles] = useState([]);
  const [shockwaves, setShockwaves] = useState([]);
  const [impact, setImpact] = useState(false); // Screen shake trigger
  const [showCelebration, setShowCelebration] = useState(false); // Full-screen victory overlay
  const [showCredits, setShowCredits] = useState(false); // Authorship credits overlay

  /**
   * Effect: Persistence Sync
   * Listens for changes in the `todos` array and writes the updated state
   * to browser localStorage.
   */
  useEffect(() => {
    // Sync todos to LocalStorage whenever they change
    localStorage.setItem('react-todo-list', JSON.stringify(todos));
  }, [todos]);

  /**
   * Cinematic Particle System Generator.
   * Creates a burst of visual particles and shockwaves to celebrate achievements.
   * Triggered when clearing a completed list ("Goal Achieved").
   */
  const triggerBurst = () => {
    // Generate distinct particle objects with randomized vectors and physics properties
    const newParticles = Array.from({ length: 20 }).map((_, i) => {
      const isStreak = Math.random() > 0.6; // Mix of dots and streaks
      return {
        id: Date.now() + i,
        type: isStreak ? 'streak' : 'bit',
        x: (Math.random() - 0.5) * (isStreak ? 400 : 250),
        y: (Math.random() - 0.5) * (isStreak ? 100 : 250),
        rotation: isStreak ? 0 : Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        color: Math.random() > 0.5 ? '#00ff88' : '#61dafb',
        duration: isStreak ? 0.6 : 0.8
      };
    });

    // Trigger Shockwave
    const newShockwave = { id: Date.now() };
    setShockwaves(prev => [...prev, newShockwave]);

    // Trigger Impact Shake
    setImpact(true);
    setTimeout(() => setImpact(false), 300);

    setParticles(prev => [...prev, ...newParticles]);

    // Start Cinematic Sequence after a tiny delay
    setTimeout(() => {
      setShowCelebration(true);
      soundEngine.playVictory();
    }, 400);

    // Auto-return to list
    setTimeout(() => {
      setShowCelebration(false);
    }, 6500);

    // Cleanup
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1000);

    setTimeout(() => {
      setShockwaves(prev => prev.filter(s => s.id !== newShockwave.id));
    }, 800);
  };

  /**
   * Effect: Initial Loading Simulation.
   * Creates a deterministic progress bar animation on application mount
   * to simulate a "system boot" sequence.
   */
  useEffect(() => {
    // Simulate loading progress
    const duration = 2500;
    const intervalTime = 50;
    const increment = (100 / (duration / intervalTime));

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setLoading(false);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, []);

  /**
   * Action: Add Todo.
   * Creates a new task object with current timestamp ID and adds it to the list.
   */
  const addTodo = () => {
    if (inputValue.trim() === '') return;
    const newTodo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
      priority: priority,
    };
    setTodos([newTodo, ...todos]); // Add to top for better feel
    setInputValue('');
    soundEngine.playAdd();
  };

  /**
   * Action: Toggle Todo Completion.
   * FLips the boolean `completed` state of a specific task.
   */
  const toggleTodo = (id) => {
    const todoToToggle = todos.find(t => t.id === id);
    if (todoToToggle) {
      soundEngine.playToggle(!todoToToggle.completed);
    }
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  /**
   * Action: Delete Todo.
   * Removes a task from the list permanently.
   */
  const deleteTodo = (id) => {
    soundEngine.playDelete();
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  // Derived State Calculations
  const totalTasks = todos.length;
  const completedTasks = todos.filter((todo) => todo.completed).length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  /**
   * Effect: Security & Branding.
   * Injects developer credits into the console and attaches security event listeners
   * to prevent inspection in production-like environments.
   */
  useEffect(() => {
    // Console Easter Egg & Identity Protection
    console.log(
      "%c🚀 REACT TODO APP %c v2.0",
      "color: #61dafb; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px rgba(97,218,251,0.5);",
      "color: #777; font-size: 14px;"
    );
    console.log(
      "%cDeveloped by Amey Thakur & Mega Satish %c| Access Restricted",
      "color: #00ff88; font-weight: bold;",
      "color: #ee5253;"
    );
    console.log("%cSearching for vulnerabilities? You won't find any here. 🛡️", "color: #a0a0a0; font-style: italic;");

    // Security Lockdown: Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    const handleKeydown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  if (loading) {
    return (
      <div className="Loading-screen">
        <div className="Loading-content">
          <img src={logo} className="Loading-logo" alt="logo" />
          <h1 className="Loading-title">React Todo App</h1>
          <div className="Loading-progress-container">
            <div
              className="Loading-progress-bar"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="Loading-percentage">{Math.round(loadingProgress)}%</p>
        </div>
        <div className="Loading-footer">
          <p>Created by <a href="https://github.com/Amey-Thakur" target="_blank" rel="noopener noreferrer" className="Author-link">Amey Thakur</a> & <a href="https://github.com/msatmod" target="_blank" rel="noopener noreferrer" className="Author-link">Mega Satish</a></p>
          <p>Released: June 25, 2022 • <a href="https://github.com/Amey-Thakur/REACT-TODO-APP" target="_blank" rel="noopener noreferrer" className="Repo-link">GitHub Repo</a></p>
        </div>
      </div>
    );
  }

  return (
    <div className="TodoApp" onContextMenu={(e) => e.preventDefault()}>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="TodoApp-header"
      >
        <motion.h1
          whileHover={{
            scale: 1.05,
            textShadow: "0 0 15px rgba(97, 218, 251, 0.5)",
            color: "#61dafb"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowCredits(true);
            soundEngine.playCredits();
          }}
          style={{ cursor: 'pointer' }}
          title="Click to reveal authorship credits"
        >
          React Todo App
        </motion.h1>
      </motion.header>

      <AnimatePresence mode="wait">
        {showCredits ? (
          <motion.div
            key="credits-view"
            initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="Celebration-overlay Credits-overlay"
            onClick={() => setShowCredits(false)}
          >
            <div className="Celebration-content" onClick={(e) => e.stopPropagation()}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="Celebration-status-box Credits-box"
              >
                <div className="Status-line" title="Project classification">SOURCE CODE</div>
                <a
                  href="https://github.com/Amey-Thakur/REACT-TODO-APP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="Status-value link"
                  title="View source code on GitHub"
                >
                  GITHUB REPOSITORY
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1.2 }}
                className="Credits-main"
              >
                <p className="Credit-label" title="Engineering team information">CREATED BY</p>
                <div className="Credits-names-interactive">
                  <a href="https://github.com/Amey-Thakur" target="_blank" rel="noopener noreferrer" className="Credits-name link" title="Amey Thakur: Lead Developer">AMEY THAKUR</a>
                  <span className="Credit-and large">&</span>
                  <a href="https://github.com/msatmod" target="_blank" rel="noopener noreferrer" className="Credits-name link" title="Mega Satish: Design & Strategy">MEGA SATISH</a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="Credits-app-name"
                title="Official Application Title"
              >
                REACT TODO APP
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1.5 }}
                className="Celebration-divider"
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="Credits-footer-info"
              >
                <p title="Official Launch Sequence Initiated">June 25, 2022</p>
                <p style={{ opacity: 0.5, fontSize: '0.8rem', marginTop: '10px' }} title="Return to todo list">Click anywhere to return</p>
              </motion.div>
            </div>
            <div className="Celebration-ambient-glow credits-glow" />
          </motion.div>
        ) : !showCelebration ? (
          <motion.div
            key="todo-main"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="App-content-wrapper"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className={`Todo-container ${impact ? 'impact-shake' : ''}`}
              ref={constraintsRef}
            >
              <div className="Todo-stats">
                <div className="Todo-stats-text">
                  <div className="Stats-left">
                    <span>{completedTasks} of {totalTasks} tasks completed</span>
                    {progressPercentage === 100 && totalTasks > 0 && (
                      <div className="Victory-container">
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8, x: -10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(0, 255, 136, 0.2)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={triggerBurst}
                          className="Victory-badge"
                          style={{ cursor: 'pointer' }}
                          title="Perfect Achievement! Click to replay celebration"
                        >
                          <span className="Victory-dot"></span>
                          <span className="Victory-text">GOAL ACHIEVED</span>
                        </motion.span>

                        <AnimatePresence>
                          {/* Shockwaves */}
                          {shockwaves.map(wave => (
                            <motion.div
                              key={wave.id}
                              initial={{ scale: 0, opacity: 1 }}
                              animate={{ scale: 4, opacity: 0 }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className="Victory-shockwave"
                            />
                          ))}

                          {/* Particles */}
                          {particles.map(particle => (
                            <motion.div
                              key={particle.id}
                              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                              animate={{
                                x: particle.x,
                                y: particle.y,
                                opacity: 0,
                                scale: particle.type === 'streak' ? [0, 1.5, 0] : particle.scale,
                                rotate: particle.rotation
                              }}
                              transition={{ duration: particle.duration, ease: "easeOut" }}
                              className={`Achievement-particle ${particle.type}`}
                              style={{ backgroundColor: particle.color }}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                  <span title="Real-time productivity score">{progressPercentage}%</span>
                </div>
                <div className="Progress-bar-container" title={`Mission Completion: ${progressPercentage}%`}>
                  <motion.div
                    className={`Progress-bar-fill ${progressPercentage === 100 && totalTasks > 0 ? 'victory' : ''}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />
                </div>
              </div>

              <div className="Todo-input-area">
                <div className="Todo-input-group">
                  <button
                    className={`Priority-toggle ${priority}`}
                    onClick={() => {
                      const levels = ['Low', 'Medium', 'High'];
                      const next = levels[(levels.indexOf(priority) + 1) % levels.length];
                      setPriority(next);
                    }}
                    title={`Change Priority (Current: ${priority})`}
                  >
                    <div className="Signal-bars">
                      <span className="Bar bar-1"></span>
                      <span className="Bar bar-2"></span>
                      <span className="Bar bar-3"></span>
                    </div>
                  </button>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a new task..."
                    className="Todo-input"
                    title="Enter your task details"
                  />
                  <button onClick={addTodo} className="Todo-add-btn" title="Add Task">
                    <div className="Plus-icon">
                      <div className="Plus-line horizontal"></div>
                      <div className="Plus-line vertical"></div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="Todo-list-wrapper">
                <AnimatePresence mode="wait">
                  {todos.length === 0 ? (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="Empty-state"
                    >
                      <div className="Empty-icon-container">
                        <img
                          src={logo}
                          className="Empty-logo"
                          alt="logo"
                          title="React Todo App: Idle"
                        />
                      </div>
                      <h3>All caught up!</h3>
                      <p>Time to relax or add a new task to get started.</p>
                    </motion.div>
                  ) : (
                    <Reorder.Group
                      axis="y"
                      values={todos}
                      onReorder={setTodos}
                      className="Todo-list"
                      key="todo-list-group"
                    >
                      {todos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          toggleTodo={toggleTodo}
                          deleteTodo={deleteTodo}
                          constraintsRef={constraintsRef}
                        />
                      ))}
                    </Reorder.Group>
                  )}
                </AnimatePresence>
              </div>

              {progressPercentage === 100 && totalTasks > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="Clear-finished-container"
                >
                  <button
                    className="Clear-all-btn-subtle"
                    onClick={() => setTodos([])}
                    title="Remove all tasks and reset list"
                  >
                    Clear Finished Tasks
                  </button>
                </motion.div>
              )}
            </motion.div>

            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="Todo-footer"
            >
              <p>Created by <a href="https://github.com/Amey-Thakur" target="_blank" rel="noopener noreferrer" className="Author-link" title="Amey Thakur: Lead Developer">Amey Thakur</a> & <a href="https://github.com/msatmod" target="_blank" rel="noopener noreferrer" className="Author-link" title="Mega Satish: Design & Strategy">Mega Satish</a></p>
              <p title="Project release branch history">Released: June 25, 2022 • <a href="https://github.com/Amey-Thakur/REACT-TODO-APP" target="_blank" rel="noopener noreferrer" className="Repo-link" title="View source code on GitHub">GitHub Repo</a></p>
            </motion.footer>
          </motion.div>
        ) : (
          <motion.div
            key="celebration-view"
            initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="Celebration-overlay"
          >
            <div className="Celebration-content">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="Celebration-status-box"
                title="Mission Status Report"
              >
                <div className="Status-line" title="System classification">SYSTEM LOG</div>
                <div className="Status-value" title="Current operational state">STATUS: COMPLETE</div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1.2 }}
                className="Celebration-title"
              >
                GOAL ACHIEVED
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1.5 }}
                className="Celebration-divider"
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 1 }}
                className="Celebration-credits"
                title="The Team behind the build"
              >
                <p className="Credit-label" title="Engineering Team">CREATED BY</p>
                <div className="Credit-names">
                  <span title="Amey Thakur: Lead Developer">AMEY THAKUR</span>
                  <span className="Credit-and">&</span>
                  <span title="Mega Satish: Design & Strategy">MEGA SATISH</span>
                </div>
              </motion.div>
            </div>
            <div className="Celebration-ambient-glow" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TodoApp;

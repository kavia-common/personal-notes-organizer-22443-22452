import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean Professional themed Notes App
 * - Sidebar: folders/tags
 * - Header: global actions
 * - Main: note list and editor
 * - CRUD with localStorage mock
 * - Responsive and accessible
 */

// Types
/**
 * @typedef {{ id: string, title: string, content: string, tags: string[], createdAt: number, updatedAt: number, archived?: boolean }} Note
 */

// Utilities
const LS_KEY_NOTES = 'notes_frontend.notes';
const LS_KEY_UI = 'notes_frontend.ui';

// PUBLIC_INTERFACE
export function loadNotesFromStorage() {
  /** Load notes from localStorage or return seed notes */
  try {
    const raw = localStorage.getItem(LS_KEY_NOTES);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : seedNotes();
    }
  } catch {
    // ignore parsing errors
  }
  return seedNotes();
}

// PUBLIC_INTERFACE
export function saveNotesToStorage(notes) {
  /** Persist notes array to localStorage */
  try {
    localStorage.setItem(LS_KEY_NOTES, JSON.stringify(notes));
  } catch {
    // ignore write errors
  }
}

function seedNotes() {
  const now = Date.now();
  return [
    {
      id: cryptoId(),
      title: 'Welcome to Ocean Notes',
      content:
        'This is your personal notes organizer.\n\n- Create notes with the + New button\n- Organize by tags in the sidebar\n- Search notes from the header\n- Edit content with autosave\n\nEnjoy a clean, professional experience!',
      tags: ['Getting Started'],
      createdAt: now - 1000 * 60 * 60 * 24,
      updatedAt: now - 1000 * 60 * 60 * 12,
    },
    {
      id: cryptoId(),
      title: 'Meeting Ideas',
      content:
        'Agenda:\n1. Quarterly goals\n2. Risks and mitigation\n3. Budget overview\n\nAction Items:\n- Prepare slides\n- Share pre-read by Wed',
      tags: ['Work', 'Meetings'],
      createdAt: now - 1000 * 60 * 60 * 6,
      updatedAt: now - 1000 * 60 * 60 * 3,
    },
  ];
}

function cryptoId() {
  // Small ID generator for mock data
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return '';
  }
}

const themeVars = {
  primary: '#1E3A8A',
  secondary: '#F59E0B',
  success: '#059669',
  error: '#DC2626',
  background: '#F3F4F6',
  surface: '#FFFFFF',
  text: '#111827',
};

// Components
function App() {
  const [notes, setNotes] = useState(() => loadNotesFromStorage());
  const [selectedId, setSelectedId] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY_UI);
      return raw ? JSON.parse(raw).selectedId || null : null;
    } catch {
      return null;
    }
  });
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('light');

  // Persist notes
  useEffect(() => {
    saveNotesToStorage(notes);
  }, [notes]);

  // Persist UI selected note
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_UI, JSON.stringify({ selectedId }));
    } catch {
      // ignore
    }
  }, [selectedId]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const allTags = useMemo(() => {
    const s = new Set();
    notes.forEach((n) => n.tags?.forEach((t) => s.add(t)));
    return ['All', ...Array.from(s)];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes
      .filter((n) => !n.archived)
      .filter((n) =>
        activeTag === 'All' ? true : (n.tags || []).includes(activeTag)
      )
      .filter((n) =>
        q
          ? (n.title || '').toLowerCase().includes(q) ||
            (n.content || '').toLowerCase().includes(q)
          : true
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, search, activeTag]);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) || null,
    [notes, selectedId]
  );

  // Actions
  const handleCreate = () => {
    const now = Date.now();
    const newNote = {
      id: cryptoId(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
  };

  const handleDelete = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleArchive = (id) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: true } : n))
    );
    if (selectedId === id) setSelectedId(null);
  };

  const handleUpdate = (id, patch) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n
      )
    );
  };

  const handleAddTag = (id, tag) => {
    const t = tag.trim();
    if (!t) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, tags: Array.from(new Set([...(n.tags || []), t])) }
          : n
      )
    );
  };

  const handleRemoveTag = (id, tag) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, tags: (n.tags || []).filter((x) => x !== tag) } : n
      )
    );
  };

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className="ocean-app">
      <Header
        search={search}
        onSearch={setSearch}
        onCreate={handleCreate}
        onToggleSidebar={toggleSidebar}
        onToggleTheme={toggleTheme}
        theme={theme}
      />
      <div className="layout">
        <Sidebar
          open={sidebarOpen}
          tags={allTags}
          activeTag={activeTag}
          onSelectTag={setActiveTag}
        />
        <main className="main">
          <section className="list-pane" aria-label="Notes list">
            <ListToolbar
              count={filteredNotes.length}
              activeTag={activeTag}
              onClearFilters={() => {
                setActiveTag('All');
                setSearch('');
              }}
            />
            <NotesList
              notes={filteredNotes}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={handleDelete}
              onArchive={handleArchive}
            />
          </section>
          <section className="editor-pane" aria-label="Editor">
            {selectedNote ? (
              <Editor
                key={selectedNote.id}
                note={selectedNote}
                onChangeTitle={(t) => handleUpdate(selectedNote.id, { title: t })}
                onChangeContent={(c) =>
                  handleUpdate(selectedNote.id, { content: c })
                }
                onAddTag={(t) => handleAddTag(selectedNote.id, t)}
                onRemoveTag={(t) => handleRemoveTag(selectedNote.id, t)}
              />
            ) : (
              <EmptyState onCreate={handleCreate} />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function Header({
  search,
  onSearch,
  onCreate,
  onToggleSidebar,
  onToggleTheme,
  theme,
}) {
  return (
    <header className="header" role="banner">
      <div className="left">
        <button className="icon-btn" onClick={onToggleSidebar} aria-label="Toggle navigation">
          ☰
        </button>
        <div className="brand">
          <div className="logo" aria-hidden>🗒️</div>
          <div className="brand-text">
            <div className="brand-title">Ocean Notes</div>
            <div className="brand-sub">Professional</div>
          </div>
        </div>
      </div>
      <div className="center">
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="search"
          placeholder="Search notes..."
          aria-label="Search notes"
        />
      </div>
      <div className="right">
        <button className="btn primary" onClick={onCreate}>
          + New
        </button>
        <button
          className="btn ghost"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}

function Sidebar({ open, tags, activeTag, onSelectTag }) {
  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`} role="navigation">
      <div className="sidebar-section">
        <div className="section-title">Tags</div>
        <ul className="tag-list">
          {tags.map((t) => (
            <li key={t}>
              <button
                className={`tag-item ${activeTag === t ? 'active' : ''}`}
                onClick={() => onSelectTag(t)}
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="sidebar-footer">
        <div className="hint">Classic • Ocean Palette</div>
      </div>
    </aside>
  );
}

function ListToolbar({ count, activeTag, onClearFilters }) {
  return (
    <div className="list-toolbar">
      <div className="count">
        <span className="dot" />
        {count} {count === 1 ? 'note' : 'notes'}
        {activeTag !== 'All' ? (
          <span className="filter-chip">
            Tag: {activeTag}
            <button onClick={onClearFilters} className="chip-close" aria-label="Clear filters">
              ×
            </button>
          </span>
        ) : null}
      </div>
    </div>
  );
}

function NotesList({ notes, selectedId, onSelect, onDelete, onArchive }) {
  if (!notes.length) {
    return <div className="empty-list">No notes found.</div>;
  }
  return (
    <ul className="notes-list">
      {notes.map((n) => (
        <li
          key={n.id}
          className={`note-row ${selectedId === n.id ? 'selected' : ''}`}
          onClick={() => onSelect(n.id)}
        >
          <div className="note-row-main">
            <div className="note-title">{n.title || 'Untitled'}</div>
            <div className="note-meta">
              <span className="date">Updated {formatDate(n.updatedAt)}</span>
              {(n.tags || []).slice(0, 3).map((t) => (
                <span key={t} className="tag-chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="note-actions" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" title="Archive" onClick={() => onArchive(n.id)}>
              📥
            </button>
            <button className="icon-btn danger" title="Delete" onClick={() => onDelete(n.id)}>
              🗑️
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Editor({ note, onChangeTitle, onChangeContent, onAddTag, onRemoveTag }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tagInput, setTagInput] = useState('');

  // Autosave behavior
  useEffect(() => {
    const id = setTimeout(() => {
      if (title !== note.title) onChangeTitle(title);
      if (content !== note.content) onChangeContent(content);
    }, 300);
    return () => clearTimeout(id);
  }, [title, content]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="editor">
      <div className="editor-header">
        <input
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          aria-label="Note title"
        />
        <div className="editor-meta">Created {formatDate(note.createdAt)}</div>
      </div>
      <textarea
        className="content-area"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing your note..."
        aria-label="Note content"
      />
      <div className="tag-editor">
        <div className="tag-list-inline">
          {(note.tags || []).map((t) => (
            <span key={t} className="tag-chip removable">
              {t}
              <button
                className="chip-close"
                onClick={() => onRemoveTag(t)}
                aria-label={`Remove tag ${t}`}
                title="Remove tag"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="tag-input-row">
          <input
            className="tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (tagInput.trim()) {
                  onAddTag(tagInput.trim());
                  setTagInput('');
                }
              }
            }}
            aria-label="Add tag"
          />
          <button
            className="btn secondary"
            onClick={() => {
              if (tagInput.trim()) {
                onAddTag(tagInput.trim());
                setTagInput('');
              }
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="empty-editor">
      <div className="empty-card">
        <div className="empty-icon">🌊</div>
        <div className="empty-title">No note selected</div>
        <div className="empty-desc">
          Select a note from the list or create a new one to get started.
        </div>
        <button className="btn primary" onClick={onCreate}>
          + Create Note
        </button>
      </div>
    </div>
  );
}

export default App;

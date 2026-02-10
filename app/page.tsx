'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('notes')
    if (saved) {
      setNotes(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags))).sort()

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTag = selectedTag === null || note.tags.includes(selectedTag)

    return matchesSearch && matchesTag
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const createNote = () => {
    setCurrentNote(null)
    setTitle('')
    setContent('')
    setTags([])
    setTagInput('')
    setIsEditing(true)
  }

  const editNote = (note: Note) => {
    setCurrentNote(note)
    setTitle(note.title)
    setContent(note.content)
    setTags(note.tags)
    setTagInput('')
    setIsEditing(true)
  }

  const saveNote = () => {
    if (!title.trim() && !content.trim()) return

    const now = new Date().toISOString()

    if (currentNote) {
      setNotes(notes.map(note =>
        note.id === currentNote.id
          ? { ...note, title, content, tags, updatedAt: now }
          : note
      ))
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        tags,
        createdAt: now,
        updatedAt: now
      }
      setNotes([newNote, ...notes])
    }

    setIsEditing(false)
    setCurrentNote(null)
  }

  const deleteNote = (id: string) => {
    if (confirm('Delete this note?')) {
      setNotes(notes.filter(note => note.id !== id))
    }
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  if (isEditing) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => setIsEditing(false)}>
            ← Back
          </button>
          <button className={styles.saveButton} onClick={saveNote}>
            Save
          </button>
        </div>

        <div className={styles.editor}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.titleInput}
          />

          <textarea
            placeholder="Note content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.contentInput}
          />

          <div className={styles.tagSection}>
            <div className={styles.tagInputWrapper}>
              <input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className={styles.tagInput}
              />
              <button onClick={addTag} className={styles.addTagButton}>+</button>
            </div>

            <div className={styles.tagList}>
              {tags.map(tag => (
                <span key={tag} className={styles.tag}>
                  {tag}
                  <button onClick={() => removeTag(tag)} className={styles.removeTag}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Notes</h1>
        <button className={styles.newButton} onClick={createNote}>+</button>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {allTags.length > 0 && (
        <div className={styles.filterTags}>
          <button
            className={`${styles.filterTag} ${selectedTag === null ? styles.active : ''}`}
            onClick={() => setSelectedTag(null)}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`${styles.filterTag} ${selectedTag === tag ? styles.active : ''}`}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className={styles.notesList}>
        {filteredNotes.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery || selectedTag ? 'No notes found' : 'No notes yet. Tap + to create one!'}
          </div>
        ) : (
          filteredNotes.map(note => (
            <div key={note.id} className={styles.noteCard} onClick={() => editNote(note)}>
              <div className={styles.noteHeader}>
                <h3 className={styles.noteTitle}>{note.title || 'Untitled'}</h3>
                <button
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNote(note.id)
                  }}
                >
                  ×
                </button>
              </div>

              <p className={styles.noteContent}>{note.content}</p>

              {note.tags.length > 0 && (
                <div className={styles.noteTags}>
                  {note.tags.map(tag => (
                    <span key={tag} className={styles.noteTag}>{tag}</span>
                  ))}
                </div>
              )}

              <div className={styles.noteDate}>
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

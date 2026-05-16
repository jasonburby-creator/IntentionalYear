'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Download, Printer, Trash2, X, ChevronLeft, ChevronRight, Settings, Share2, LogOut, Link as LinkIcon, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { type Planner, type Category, type Entry, MONTHS, daysInMonth } from '@/lib/types';

type Props = {
  planner: Planner;
  categories: Category[];
  entries: Entry[];
  availableYears: number[];
  userEmail: string;
  readOnly: boolean;
};

export default function PlannerApp({ planner: initialPlanner, categories: initialCategories, entries: initialEntries, availableYears, userEmail, readOnly }: Props) {
  const router = useRouter();
  const [planner, setPlanner] = useState(initialPlanner);
  const [categories, setCategories] = useState(initialCategories);
  const [entries, setEntries] = useState(initialEntries);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [addingFor, setAddingFor] = useState<{ month: number; day: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [draggedEntry, setDraggedEntry] = useState<Entry | null>(null);
  const debouncers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function debounce(key: string, fn: () => void, ms = 600) {
    if (debouncers.current[key]) clearTimeout(debouncers.current[key]);
    debouncers.current[key] = setTimeout(fn, ms);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  function switchYear(delta: number) {
    router.push(`/?year=${planner.year + delta}`);
  }

  // Planner updates
  async function updatePlannerField(patch: Partial<Planner>) {
    setPlanner(p => ({ ...p, ...patch }));
    debounce(`planner-${planner.id}`, async () => {
      await fetch(`/api/planners/${planner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    });
  }

  // Entry CRUD
  async function addEntry(data: Omit<Entry, 'id' | 'planner_id'>) {
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, planner_id: planner.id }),
    });
    if (res.ok) {
      const created = await res.json();
      setEntries(prev => [...prev, created]);
    }
  }

  async function updateEntry(id: string, patch: Partial<Entry>) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
    await fetch(`/api/entries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
  }

  async function deleteEntry(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id));
    await fetch(`/api/entries/${id}`, { method: 'DELETE' });
  }

  // Category CRUD
  async function updateCategory(id: string, patch: Partial<Category>) {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    debounce(`cat-${id}`, async () => {
      await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    });
  }

  async function addCategory() {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planner_id: planner.id,
        name: 'New Category',
        color: '#e5e5e0',
        text_color: '#1a1a1a',
        sort_order: categories.length,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setCategories(prev => [...prev, created]);
    }
  }

  async function deleteCategory(id: string) {
    if (!window.confirm('Remove this category? Entries using it become uncategorized.')) return;
    setCategories(prev => prev.filter(c => c.id !== id));
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
  }

  function getEntriesForDay(month: number, day: number) {
    return entries.filter(e => e.month === month && day >= e.start_day && day <= e.end_day);
  }

  function handleDrop(month: number, day: number) {
    if (!draggedEntry || readOnly) return;
    const span = draggedEntry.end_day - draggedEntry.start_day;
    const newEnd = day + span;
    if (newEnd <= daysInMonth(planner.year, month)) {
      updateEntry(draggedEntry.id, { month, start_day: day, end_day: newEnd });
    }
    setDraggedEntry(null);
  }

  function exportJSON() {
    const data = JSON.stringify({ planner, categories, entries }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${planner.owner_name.toLowerCase() || 'planner'}-${planner.year}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="planner-root">
      <style>{styles}</style>

      <div className="toolbar">
        {!readOnly && (
          <div className="year-control">
            <button onClick={() => switchYear(-1)}><ChevronLeft size={16} /></button>
            <div className="year-display">{planner.year}</div>
            <button onClick={() => switchYear(1)}><ChevronRight size={16} /></button>
          </div>
        )}
        {readOnly && (
          <div style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
            Read-only shared view · {planner.year}
          </div>
        )}
        {!readOnly && <button onClick={() => setShowSettings(true)}><Settings size={14} /> Categories</button>}
        {!readOnly && <button onClick={() => setShowShare(true)}><Share2 size={14} /> Share</button>}
        <button onClick={() => window.print()}><Printer size={14} /> Print</button>
        {!readOnly && <button onClick={exportJSON}><Download size={14} /> Export</button>}
        {!readOnly && (
          <button onClick={signOut} style={{ marginLeft: 'auto' }} title={userEmail}>
            <LogOut size={14} /> Sign out
          </button>
        )}
      </div>

      <div className="printable">
        <div className="planner-header">
          <h1>
            {readOnly ? (
              <>
                <span>{planner.owner_name}</span>
                <span>&apos;s </span>
                <span className="title">{planner.title}</span>
                <span> <span className="year">{planner.year}</span></span>
              </>
            ) : (
              <>
                <input
                  value={planner.owner_name}
                  onChange={e => updatePlannerField({ owner_name: e.target.value })}
                  style={{ width: `${Math.max(planner.owner_name.length, 3)}ch` }}
                />
                <span>&apos;s </span>
                <input
                  className="title"
                  value={planner.title}
                  onChange={e => updatePlannerField({ title: e.target.value })}
                  style={{ fontStyle: 'italic', width: `${Math.max(planner.title.length, 10)}ch` }}
                />
                <span> <span className="year">{planner.year}</span></span>
              </>
            )}
          </h1>
        </div>

        <div className="calendar-grid">
          {MONTHS.map((m, mi) => {
            const maxDay = daysInMonth(planner.year, mi);
            return (
              <div className="month-row" key={mi}>
                <div className="month-label">{m}</div>
                {Array.from({ length: 31 }, (_, di) => {
                  const day = di + 1;
                  const valid = day <= maxDay;
                  const dayEntries = valid ? getEntriesForDay(mi, day) : [];
                  return (
                    <div
                      key={di}
                      className={`day-cell${!valid ? ' invalid' : ''}${readOnly ? ' readonly' : ''}`}
                      onClick={() => !readOnly && valid && setAddingFor({ month: mi, day })}
                      onDragOver={e => { if (valid && !readOnly) e.preventDefault(); }}
                      onDrop={e => { e.preventDefault(); if (valid && !readOnly) handleDrop(mi, day); }}
                    >
                      {valid && <div className="day-number">{day}</div>}
                      {dayEntries.map((entry, idx) => {
                        const cat = categories.find(c => c.id === entry.category_id) || null;
                        const isStart = day === entry.start_day;
                        const isEnd = day === entry.end_day;
                        const isSingle = isStart && isEnd;
                        let cls = 'entry-pill';
                        if (!isSingle) {
                          if (isStart) cls += ' start';
                          else if (isEnd) cls += ' end';
                          else cls += ' continuation';
                        }
                        return (
                          <div
                            key={entry.id}
                            className={cls}
                            style={{
                              background: cat?.color || '#e5e5e0',
                              color: cat?.text_color || '#1a1a1a',
                              top: 16 + idx * 18,
                            }}
                            draggable={isStart && !readOnly}
                            onDragStart={e => { e.stopPropagation(); setDraggedEntry(entry); }}
                            onClick={e => { e.stopPropagation(); if (!readOnly) setEditingEntry(entry); }}
                            title={entry.label}
                          >
                            {isStart || isSingle ? entry.label : ''}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="legend">
          {categories.map(cat => (
            <div className="legend-category" key={cat.id}>
              <div className="legend-header">
                <div className="legend-swatch" style={{ background: cat.color }} />
                {readOnly ? (
                  <div className="legend-name-static">{cat.name}</div>
                ) : (
                  <input
                    className="legend-name"
                    value={cat.name}
                    onChange={e => updateCategory(cat.id, { name: e.target.value })}
                  />
                )}
              </div>
              {readOnly ? (
                <div className="legend-desc-static">{cat.description}</div>
              ) : (
                <textarea
                  className="legend-desc"
                  value={cat.description}
                  onChange={e => updateCategory(cat.id, { description: e.target.value })}
                />
              )}
              {readOnly ? (
                <div className="legend-items-static">
                  {(cat.items || []).filter(Boolean).map((it, i) => <div key={i}>• {it}</div>)}
                </div>
              ) : (
                <textarea
                  className="legend-items"
                  placeholder="Items, one per line…"
                  value={(cat.items || []).join('\n')}
                  onChange={e => updateCategory(cat.id, { items: e.target.value.split('\n') })}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {addingFor && !readOnly && (
        <EntryModal
          mode="add"
          year={planner.year}
          initial={{ month: addingFor.month, start_day: addingFor.day, end_day: addingFor.day, category_id: categories[0]?.id || null, label: '' }}
          categories={categories}
          onSave={(data) => { addEntry(data); setAddingFor(null); }}
          onClose={() => setAddingFor(null)}
        />
      )}

      {editingEntry && !readOnly && (
        <EntryModal
          mode="edit"
          year={planner.year}
          initial={editingEntry}
          categories={categories}
          onSave={(data) => { updateEntry(editingEntry.id, data); setEditingEntry(null); }}
          onDelete={() => { deleteEntry(editingEntry.id); setEditingEntry(null); }}
          onClose={() => setEditingEntry(null)}
        />
      )}

      {showSettings && !readOnly && (
        <CategoriesModal
          categories={categories}
          onUpdate={updateCategory}
          onAdd={addCategory}
          onDelete={deleteCategory}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showShare && !readOnly && (
        <ShareModal
          planner={planner}
          onUpdate={(token) => setPlanner(p => ({ ...p, share_token: token }))}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

type EntryDraft = Omit<Entry, 'id' | 'planner_id'>;

function EntryModal({ mode, year, initial, categories, onSave, onDelete, onClose }: {
  mode: 'add' | 'edit';
  year: number;
  initial: EntryDraft;
  categories: Category[];
  onSave: (data: EntryDraft) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(initial.label || '');
  const [categoryId, setCategoryId] = useState<string | null>(initial.category_id);
  const [month, setMonth] = useState(initial.month);
  const [startDay, setStartDay] = useState(initial.start_day);
  const [endDay, setEndDay] = useState(initial.end_day || initial.start_day);

  const maxDay = daysInMonth(year, month);

  function handleSave() {
    if (!label.trim()) return;
    onSave({
      label: label.trim(),
      category_id: categoryId,
      month,
      start_day: Math.min(startDay, endDay),
      end_day: Math.max(startDay, endDay),
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'add' ? 'Add entry' : 'Edit entry'}</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Label</label>
            <input autoFocus value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. BVI Sailing" onKeyDown={e => e.key === 'Enter' && handleSave()} />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={categoryId || ''} onChange={e => setCategoryId(e.target.value || null)}>
              <option value="">(uncategorized)</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Month</label>
            <select value={month} onChange={e => {
              const m = parseInt(e.target.value);
              setMonth(m);
              const md = daysInMonth(year, m);
              if (startDay > md) setStartDay(md);
              if (endDay > md) setEndDay(md);
            }}>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Start day</label>
              <input type="number" min={1} max={maxDay} value={startDay} onChange={e => setStartDay(parseInt(e.target.value) || 1)} />
            </div>
            <div className="field">
              <label>End day</label>
              <input type="number" min={1} max={maxDay} value={endDay} onChange={e => setEndDay(parseInt(e.target.value) || 1)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {mode === 'edit' && onDelete ? (
            <button className="btn btn-danger" onClick={onDelete}><Trash2 size={14} /> Delete</button>
          ) : <div />}
          <div className="right">
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>{mode === 'add' ? 'Add' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoriesModal({ categories, onUpdate, onAdd, onDelete, onClose }: {
  categories: Category[];
  onUpdate: (id: string, patch: Partial<Category>) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Categories</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {categories.map((cat) => (
            <div key={cat.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto', gap: 8, alignItems: 'center' }}>
              <div className="legend-swatch" style={{ background: cat.color, width: 24, height: 24 }} />
              <input value={cat.name} onChange={e => onUpdate(cat.id, { name: e.target.value })} style={{ padding: '6px 8px', border: '1px solid #d4d4d0', borderRadius: 4 }} />
              <input type="color" value={cat.color} onChange={e => onUpdate(cat.id, { color: e.target.value })} style={{ width: 36, height: 32, border: '1px solid #d4d4d0', borderRadius: 4, padding: 2 }} title="Fill" />
              <input type="color" value={cat.text_color} onChange={e => onUpdate(cat.id, { text_color: e.target.value })} style={{ width: 36, height: 32, border: '1px solid #d4d4d0', borderRadius: 4, padding: 2 }} title="Text" />
              <button className="icon-btn" onClick={() => onDelete(cat.id)}><Trash2 size={16} /></button>
            </div>
          ))}
          <button className="btn" onClick={onAdd}><Plus size={14} /> Add category</button>
        </div>
        <div className="modal-footer">
          <div />
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

function ShareModal({ planner, onUpdate, onClose }: {
  planner: Planner;
  onUpdate: (token: string | null) => void;
  onClose: () => void;
}) {
  const [token, setToken] = useState(planner.share_token);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const shareUrl = token && typeof window !== 'undefined' ? `${window.location.origin}/share/${token}` : '';

  async function toggleShare(enable: boolean) {
    setBusy(true);
    const res = await fetch(`/api/planners/${planner.id}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable }),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.share_token);
      onUpdate(data.share_token);
    }
    setBusy(false);
  }

  function copy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share planner</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: '#555', margin: 0 }}>
            A share link lets anyone view your planner read-only. They can&apos;t edit, but they will see everything.
          </p>
          {token ? (
            <>
              <div className="field">
                <label>Share URL</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input readOnly value={shareUrl} style={{ flex: 1 }} onFocus={e => e.target.select()} />
                  <button className="btn" onClick={copy}>
                    {copied ? <><Check size={14} /> Copied</> : <><LinkIcon size={14} /> Copy</>}
                  </button>
                </div>
              </div>
              <button className="btn btn-danger" disabled={busy} onClick={() => toggleShare(false)}>Disable share link</button>
            </>
          ) : (
            <button className="btn btn-primary" disabled={busy} onClick={() => toggleShare(true)}>Create share link</button>
          )}
        </div>
        <div className="modal-footer">
          <div />
          <button className="btn" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

const styles = `
.planner-root { font-family: 'Inter', -apple-system, sans-serif; background: #fafaf7; min-height: 100vh; color: #1a1a1a; }
.toolbar { position: sticky; top: 0; z-index: 50; background: rgba(250, 250, 247, 0.95); backdrop-filter: blur(8px); border-bottom: 1px solid #e5e5e0; padding: 12px 24px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.toolbar button { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: white; border: 1px solid #d4d4d0; border-radius: 6px; font-size: 13px; font-weight: 500; color: #1a1a1a; cursor: pointer; transition: all 0.15s; font-family: inherit; }
.toolbar button:hover { background: #1a1a1a; color: white; border-color: #1a1a1a; }
.year-control { display: inline-flex; align-items: center; gap: 4px; background: white; border: 1px solid #d4d4d0; border-radius: 6px; padding: 4px; }
.year-control button { padding: 4px 6px; background: transparent; border: none; }
.year-control button:hover { background: #f0f0eb; color: #1a1a1a; border-color: transparent; }
.year-control .year-display { font-weight: 700; font-size: 14px; padding: 0 8px; min-width: 50px; text-align: center; }
.printable { padding: 32px 24px 48px; max-width: 100%; }
.planner-header { margin-bottom: 24px; }
.planner-header h1 { font-family: 'Fraunces', serif; font-weight: 800; font-size: 36px; letter-spacing: -0.02em; margin: 0; color: #0a0a0a; }
.planner-header h1 input { font: inherit; color: inherit; background: transparent; border: none; border-bottom: 2px dashed transparent; padding: 0 2px; }
.planner-header h1 input:hover, .planner-header h1 input:focus { border-bottom-color: #d4d4d0; outline: none; }
.planner-header h1 .title { font-style: italic; font-weight: 600; }
.planner-header h1 .year { color: #888; }
.calendar-grid { border: 1px solid #d4d4d0; background: white; border-radius: 4px; overflow: hidden; }
.month-row { display: grid; grid-template-columns: 60px repeat(31, 1fr); border-bottom: 1px solid #e5e5e0; min-height: 56px; }
.month-row:last-child { border-bottom: none; }
.month-label { display: flex; align-items: center; justify-content: center; font-family: 'Fraunces', serif; font-weight: 600; font-size: 13px; letter-spacing: 0.08em; color: #555; border-right: 1px solid #e5e5e0; background: #f7f7f3; }
.day-cell { position: relative; border-right: 1px solid #f0f0eb; padding: 2px; min-height: 56px; cursor: pointer; transition: background 0.1s; }
.day-cell.readonly { cursor: default; }
.day-cell:last-child { border-right: none; }
.day-cell:not(.readonly):hover { background: #fafaf7; }
.day-cell.invalid { background: repeating-linear-gradient(45deg, #f5f5f0, #f5f5f0 4px, #fafaf7 4px, #fafaf7 8px); cursor: not-allowed; }
.day-number { position: absolute; top: 3px; left: 4px; font-size: 9px; font-weight: 600; color: #999; letter-spacing: 0.02em; }
.entry-pill { position: absolute; top: 16px; left: 2px; right: 2px; padding: 3px 5px; border-radius: 3px; font-size: 9px; font-weight: 600; line-height: 1.15; cursor: grab; overflow: hidden; word-break: break-word; z-index: 2; }
.entry-pill:active { cursor: grabbing; }
.entry-pill.continuation { border-radius: 0; padding-left: 2px; }
.entry-pill.start { border-top-right-radius: 0; border-bottom-right-radius: 0; }
.entry-pill.end { border-top-left-radius: 0; border-bottom-left-radius: 0; }
.legend { margin-top: 32px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; }
.legend-category { display: flex; flex-direction: column; gap: 8px; }
.legend-header { display: flex; align-items: center; gap: 8px; }
.legend-swatch { width: 18px; height: 18px; border-radius: 3px; flex-shrink: 0; }
.legend-name, .legend-name-static { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 700; background: transparent; border: none; padding: 0; color: #0a0a0a; width: 100%; }
.legend-name:focus { outline: 1px dashed #d4d4d0; outline-offset: 2px; }
.legend-desc, .legend-desc-static { font-size: 11px; color: #555; line-height: 1.4; background: transparent; border: none; padding: 0; resize: vertical; font-family: inherit; width: 100%; min-height: 50px; }
.legend-desc:focus { outline: 1px dashed #d4d4d0; outline-offset: 2px; }
.legend-items, .legend-items-static { font-size: 11px; color: #1e40af; line-height: 1.5; background: transparent; border: none; padding: 0; resize: vertical; font-family: inherit; width: 100%; min-height: 80px; white-space: pre-wrap; }
.legend-items:focus { outline: 1px dashed #d4d4d0; outline-offset: 2px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(10, 10, 10, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
.modal { background: white; border-radius: 8px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e5e5e0; }
.modal-header h2 { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 700; margin: 0; }
.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #555; }
.field input, .field select { padding: 8px 10px; border: 1px solid #d4d4d0; border-radius: 5px; font-size: 14px; font-family: inherit; }
.field input:focus, .field select:focus { outline: none; border-color: #0a0a0a; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-footer { padding: 14px 20px; display: flex; justify-content: space-between; gap: 8px; border-top: 1px solid #e5e5e0; background: #fafaf7; }
.modal-footer .right { display: flex; gap: 8px; }
.btn { padding: 8px 14px; border: 1px solid #d4d4d0; border-radius: 5px; background: white; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; gap: 6px; }
.btn:hover { background: #f0f0eb; }
.btn-primary { background: #0a0a0a; color: white; border-color: #0a0a0a; }
.btn-primary:hover { background: #333; }
.btn-danger { color: #b91c1c; border-color: #fca5a5; }
.btn-danger:hover { background: #fef2f2; }
.icon-btn { background: transparent; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: #555; }
.icon-btn:hover { background: #f0f0eb; color: #0a0a0a; }
@media print {
  @page { size: tabloid landscape; margin: 0.4in; }
  .toolbar { display: none !important; }
  .planner-root { background: white; }
  .printable { padding: 0; }
  .calendar-grid { border-color: #999; }
  .day-cell { border-right-color: #ddd; }
  .month-row { border-bottom-color: #ccc; }
  .entry-pill { font-size: 8px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .legend-swatch { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

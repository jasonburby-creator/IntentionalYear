'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { Plus, Download, Printer, Trash2, X, ChevronLeft, ChevronRight, Settings, Share2, LogOut, Link as LinkIcon, Check, Grid3x3, List, Info, Edit3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { type Planner, type Category, type Entry, MONTHS, MONTHS_FULL, daysInMonth, isCoreCategory } from '@/lib/types';

type Props = {
  planner: Planner;
  categories: Category[];
  entries: Entry[];
  availableYears: number[];
  userEmail: string;
  readOnly: boolean;
};

type MobileView = 'grid' | 'list';

// Adjust this to control print row height
const ROW_HEIGHT_PRINT = 45;

const QUARTER_STYLES_PRINT = [
  { bg: '#f5edda', border: '#d4b87a', text: '#7a5c1e', dot: '#b88a3f', rowBg: 'rgba(184,138,63,0.10)' },
  { bg: '#e8f0e2', border: '#8ab07a', text: '#2a5c1e', dot: '#5b7a3a', rowBg: 'rgba(91,122,58,0.10)' },
  { bg: '#e2ecf5', border: '#7aaad4', text: '#1e3a5c', dot: '#3d6b87', rowBg: 'rgba(61,107,135,0.10)' },
  { bg: '#f5e8e2', border: '#d4907a', text: '#5c2a1e', dot: '#c2553c', rowBg: 'rgba(160,100,80,0.10)' },
];

function openPrintWindow(planner: Planner, categories: Category[], entries: Entry[]) {
  const MONTHS_P = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const ROW_H = ROW_HEIGHT_PRINT;
  const LABEL_W = 44;

  // Parse quarter habits
  const habitsCategory = categories.find(c => c.name.toLowerCase().includes('habit'));
  const quarterHabits: Record<number, string> = {};
  (habitsCategory?.items || []).filter(Boolean).forEach(item => {
    const match = item.match(/^Q([1-4])\s*[-—–]+\s*(.+)$/i);
    if (match) quarterHabits[parseInt(match[1])] = match[2].trim();
  });

  // Build calendar HTML
  let calendarRows = '';
  MONTHS_P.forEach((m, mi) => {
    const maxDay = new Date(planner.year, mi + 1, 0).getDate();
    const q = Math.floor(mi / 3);
    const qs = QUARTER_STYLES_PRINT[q];
    const qNum = q + 1;

    if (mi % 3 === 0) {
      const habit = quarterHabits[qNum] || 'TBD';
      calendarRows += `<div style="display:flex;align-items:center;gap:7px;height:16px;padding:0 8px;background:${qs.bg};border-top:1px solid ${qs.border};border-bottom:1px solid ${qs.border};">
        <div style="width:5px;height:5px;border-radius:50%;background:${qs.dot};flex-shrink:0;"></div>
        <div style="font-size:7.5px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${qs.text};">Q${qNum} HABIT — ${habit}</div>
      </div>`;
    }

    // Month row
    const monthEntries = entries.filter(e => e.month === mi);
    const placed: {row: number; start: number; end: number}[] = [];
    const entryRows = monthEntries.map(entry => {
      let row = 0;
      while (placed.some(p => p.row === row && !(entry.end_day < p.start || entry.start_day > p.end))) row++;
      placed.push({row, start: entry.start_day, end: entry.end_day});
      return row;
    });

    let dayCells = `<div style="width:${LABEL_W}px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:10px;font-weight:600;letter-spacing:0.1em;color:#4a4238;background:#ede5d2;border-right:1px solid #c9bfa8;">${m}</div>`;
    for (let di = 0; di < 31; di++) {
      const day = di + 1;
      const valid = day <= maxDay;
      const borderR = di < 30 ? 'border-right:1px solid rgba(201,191,168,0.4);' : '';
      dayCells += `<div style="flex:1;position:relative;${borderR}${!valid ? 'background:repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(201,191,168,0.15) 4px,rgba(201,191,168,0.15) 5px);' : ''}">
        ${valid ? `<span style="position:absolute;top:2px;left:3px;font-size:7px;font-weight:600;color:#7a7064;">${day}</span>` : ''}
      </div>`;
    }

    let entryBars = '';
    monthEntries.forEach((entry, idx) => {
      const cat = categories.find(c => c.id === entry.category_id);
      const row = entryRows[idx];
      const leftPct = ((entry.start_day - 1) / 31 * 100).toFixed(3);
      const widthPct = ((entry.end_day - entry.start_day + 1) / 31 * 100).toFixed(3);
      const topPx = 13 + row * 14;
      entryBars += `<div style="position:absolute;left:calc(${LABEL_W}px + ${leftPct}% - ${LABEL_W * parseFloat(leftPct) / 100}px + 1px);width:calc(${widthPct}% * (100% - ${LABEL_W}px) / 100% - 2px);width:calc(${entry.end_day - entry.start_day + 1} / 31 * (100% - ${LABEL_W}px) - 2px);left:calc(${LABEL_W}px + ${entry.start_day - 1} / 31 * (100% - ${LABEL_W}px) + 1px);top:${topPx}px;height:13px;line-height:13px;background:${cat?.color || '#6b6258'};color:${cat?.text_color || '#fff'};border-radius:2px;font-size:8px;font-weight:600;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:0 3px;text-align:center;">${entry.label}</div>`;
    });

    calendarRows += `<div style="display:flex;height:${ROW_H}px;border-bottom:${mi < 11 ? '1px solid #ddd' : 'none'};position:relative;background:${qs.rowBg};">
      ${dayCells}
      ${entryBars}
    </div>`;
  });

  // Legend
  let legendCols = '';
  categories.forEach(cat => {
    const items = (cat.items || []).filter(Boolean);
    legendCols += `<div>
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;padding-bottom:3px;border-bottom:1px solid #e0d7c0;">
        <div style="width:9px;height:9px;background:${cat.color};border-radius:2px;flex-shrink:0;"></div>
        <span style="font-family:'Fraunces',serif;font-weight:700;font-size:10px;color:#2a2620;">${cat.name}</span>
      </div>
      <div style="font-size:7.5px;color:#8a3a2a;line-height:1.4;">
        ${items.map(it => `<div>${it}</div>`).join('')}
      </div>
    </div>`;
  });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${planner.owner_name}'s ${planner.title} · ${planner.year}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: 17in 11in; margin: 0.35in; }
  body { font-family: 'Inter', sans-serif; color: #2a2620; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style>
</head>
<body>
  <!-- Header -->
  <div style="text-align:center;padding-bottom:6px;margin-bottom:6px;border-bottom:1px solid #c9bfa8;">
    <div style="font-family:'Crimson Pro',serif;font-weight:600;font-size:26px;letter-spacing:-0.005em;line-height:1.2;">
      ${planner.owner_name}'s ${planner.title} · ${planner.year}
      ${planner.mantra ? `<span style="color:#c9bfa8;font-weight:300;margin:0 10px;">—</span><span style="font-style:italic;font-weight:400;color:#4a4238;">"${planner.mantra}"</span>` : ''}
    </div>
  </div>

  <!-- Calendar -->
  <div style="border:1px solid #999;margin-bottom:8px;">
    ${calendarRows}
  </div>

  <!-- Legend -->
  <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;padding-top:6px;border-top:1px solid #c9bfa8;">
    ${legendCols}
  </div>

  <script>
    // Wait for fonts then print
    document.fonts.ready.then(() => {
      setTimeout(() => { window.print(); window.close(); }, 400);
    });
  </script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=1600,height=900');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

export default function PlannerApp({ planner: initialPlanner, categories: initialCategories, entries: initialEntries, userEmail, readOnly }: Props) {
  const router = useRouter();
  const [planner, setPlanner] = useState(initialPlanner);
  const [categories, setCategories] = useState(initialCategories);
  const [entries, setEntries] = useState(initialEntries);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [addingFor, setAddingFor] = useState<{ month: number; day: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showHeaderEdit, setShowHeaderEdit] = useState(false);
  const [draggedEntry, setDraggedEntry] = useState<Entry | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('grid');
  const debouncers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('mobileView') : null;
    if (saved === 'grid' || saved === 'list') setMobileView(saved);
  }, []);

  // Auto-resize all legend textareas whenever categories change
  useEffect(() => {
    const textareas = document.querySelectorAll<HTMLTextAreaElement>('.legend-desc, .legend-items');
    textareas.forEach(ta => {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    });
  }, [categories]);

  function setMobileViewPersisted(v: MobileView) {
    setMobileView(v);
    try { window.localStorage.setItem('mobileView', v); } catch {}
  }

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

  // Add entry — handles cross-month splits automatically
  async function addEntry(data: { label: string; category_id: string | null; start_month: number; start_day: number; end_month: number; end_day: number }) {
    const chunks: { month: number; start_day: number; end_day: number }[] = [];
    if (data.start_month === data.end_month) {
      chunks.push({ month: data.start_month, start_day: data.start_day, end_day: data.end_day });
    } else {
      // First chunk: start_month from start_day to end of month
      chunks.push({ month: data.start_month, start_day: data.start_day, end_day: daysInMonth(planner.year, data.start_month) });
      // Middle chunks: full months
      for (let m = data.start_month + 1; m < data.end_month; m++) {
        chunks.push({ month: m, start_day: 1, end_day: daysInMonth(planner.year, m) });
      }
      // Last chunk: end_month from day 1 to end_day
      chunks.push({ month: data.end_month, start_day: 1, end_day: data.end_day });
    }

    const created: Entry[] = [];
    for (const chunk of chunks) {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planner_id: planner.id,
          category_id: data.category_id,
          label: data.label,
          ...chunk,
        }),
      });
      if (res.ok) created.push(await res.json());
    }
    if (created.length) setEntries(prev => [...prev, ...created]);
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

  // Delete all chunks of a multi-month entry (by matching label + category)
  async function deleteEntryGroup(entry: Entry) {
    const matches = entries.filter(e =>
      e.label === entry.label &&
      e.category_id === entry.category_id
    );
    setEntries(prev => prev.filter(e => !matches.some(m => m.id === e.id)));
    await Promise.all(matches.map(m => fetch(`/api/entries/${m.id}`, { method: 'DELETE' })));
  }

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
        color: '#6b6258',
        text_color: '#ffffff',
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

  function getEntriesForMonth(month: number) {
    return entries.filter(e => e.month === month);
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
            <button onClick={() => switchYear(-1)} aria-label="Previous year"><ChevronLeft size={16} /></button>
            <div className="year-display">{planner.year}</div>
            <button onClick={() => switchYear(1)} aria-label="Next year"><ChevronRight size={16} /></button>
          </div>
        )}
        {readOnly && (
          <div className="readonly-badge">Shared view · {planner.year}</div>
        )}
        {!readOnly && <button className="tb-btn" onClick={() => setShowSettings(true)}><Settings size={14} /> <span className="btn-text">Settings</span></button>}
        {!readOnly && <button className="tb-btn" onClick={() => setShowShare(true)}><Share2 size={14} /> <span className="btn-text">Share</span></button>}
        <button className="tb-btn" onClick={() => openPrintWindow(planner, categories, entries)}><Printer size={14} /> <span className="btn-text">Print</span></button>

        <div className="mobile-toggle">
          <button className={mobileView === 'grid' ? 'active' : ''} onClick={() => setMobileViewPersisted('grid')} aria-label="Grid view" title="Year grid"><Grid3x3 size={14} /></button>
          <button className={mobileView === 'list' ? 'active' : ''} onClick={() => setMobileViewPersisted('list')} aria-label="List view" title="Month list"><List size={14} /></button>
        </div>

        {!readOnly && (
          <NextLink href="/about" className="tb-btn about-link" title="About this tool">
            <Info size={14} /> <span className="btn-text">About</span>
          </NextLink>
        )}
        {!readOnly && (
          <button className="tb-btn" onClick={signOut} title={userEmail}>
            <LogOut size={14} /> <span className="btn-text">Sign out</span>
          </button>
        )}
      </div>

      <div className="printable">
        <header className="planner-header">
          <div className="title-line">
            <h1 className="title-display">
              <span className="title-text">{planner.owner_name}&apos;s {planner.title} · {planner.year}</span>
              {planner.mantra ? (
                <>
                  <span className="title-mantra-sep"> — </span>
                  <span className="title-mantra">&ldquo;{planner.mantra}&rdquo;</span>
                </>
              ) : !readOnly && (
                <>
                  <span className="title-mantra-sep"> — </span>
                  <span className="title-mantra-placeholder">add a mantra</span>
                </>
              )}
            </h1>
            {!readOnly && (
              <button
                className="header-edit-btn"
                onClick={() => setShowHeaderEdit(true)}
                title="Edit name, title & mantra"
              >
                <Edit3 size={12} />
                <span className="btn-text">Edit</span>
              </button>
            )}
          </div>
        </header>

        <div className={`grid-wrap ${mobileView === 'list' ? 'mobile-hide' : ''}`}>
          <div className="calendar-grid">
            {(() => {
              const today = new Date();
              const todayYear = today.getFullYear();
              const todayMonth = today.getMonth();
              const todayDay = today.getDate();
              const isCurrentYear = planner.year === todayYear;

              // Parse quarter habits from the Habits category items
              // Expected format: "Q1 — Daily Sun Salutations" or "Q1 - NSNG"
              const habitsCategory = categories.find(c =>
                c.name === 'Habits' ||
                c.name.toLowerCase().includes('habit')
              );
              const habitItems = habitsCategory?.items || [];
              const quarterHabits: Record<number, string> = {};
              habitItems.filter(Boolean).forEach(item => {
                const match = item.match(/^Q([1-4])\s*[-—–]+\s*(.+)$/i);
                if (match) quarterHabits[parseInt(match[1])] = match[2].trim();
              });

              const rows: React.ReactNode[] = [];

              MONTHS.forEach((m, mi) => {
                const maxDay = daysInMonth(planner.year, mi);
                const quarter = Math.floor(mi / 3);
                const quarterNum = quarter + 1;
                const monthEntries = getEntriesForMonth(mi);

                // Insert quarter divider at the start of each quarter
                if (mi % 3 === 0) {
                  const habitLabel = quarterHabits[quarterNum] || 'TBD';
                  const qStyles = [
                    { bg: 'var(--q-div-bg-1)', border: 'var(--q-div-border-1)', text: 'var(--q-div-text-1)', dot: 'var(--q-div-dot-1)' },
                    { bg: 'var(--q-div-bg-2)', border: 'var(--q-div-border-2)', text: 'var(--q-div-text-2)', dot: 'var(--q-div-dot-2)' },
                    { bg: 'var(--q-div-bg-3)', border: 'var(--q-div-border-3)', text: 'var(--q-div-text-3)', dot: 'var(--q-div-dot-3)' },
                    { bg: 'var(--q-div-bg-4)', border: 'var(--q-div-border-4)', text: 'var(--q-div-text-4)', dot: 'var(--q-div-dot-4)' },
                  ][quarter];

                  rows.push(
                    <div key={`qdiv-${mi}`}
                      className="quarter-divider"
                      style={{
                        background: qStyles.bg,
                        borderColor: qStyles.border,
                        color: qStyles.text,
                      }}
                    >
                      <div className="quarter-divider-dot" style={{ background: qStyles.dot }} />
                      <div className="quarter-divider-label" style={{ color: qStyles.text }}>
                        Q{quarterNum} Habit — {habitLabel}
                      </div>
                    </div>
                  );
                }

                rows.push(
                  <div className={`month-row q${quarter}`} key={mi}>
                    <div className="month-label">{m}</div>
                    {Array.from({ length: 31 }, (_, di) => {
                      const day = di + 1;
                      const valid = day <= maxDay;
                      const isToday = !readOnly && isCurrentYear && mi === todayMonth && day === todayDay;
                      return (
                        <div
                          key={di}
                          className={[
                            'day-cell',
                            !valid ? 'invalid' : '',
                            readOnly ? 'readonly' : '',
                            isToday ? 'today' : '',
                          ].filter(Boolean).join(' ')}
                          onClick={() => !readOnly && valid && setAddingFor({ month: mi, day })}
                          onDragOver={e => { if (valid && !readOnly) e.preventDefault(); }}
                          onDrop={e => { e.preventDefault(); if (valid && !readOnly) handleDrop(mi, day); }}
                        >
                          {valid && (
                            <div className={`day-number${isToday ? ' today-num' : ''}`}>{day}</div>
                          )}
                        </div>
                      );
                    })}

                    {/* Entries with collision detection + can-wrap logic */}
                    {(() => {
                      const placed: { row: number; start: number; end: number }[] = [];
                      return monthEntries.map((entry) => {
                        let row = 0;
                        while (placed.some(p => p.row === row && !(entry.end_day < p.start || entry.start_day > p.end))) {
                          row++;
                        }
                        placed.push({ row, start: entry.start_day, end: entry.end_day });
                        const cat = categories.find(c => c.id === entry.category_id) || null;
                        const span = entry.end_day - entry.start_day + 1;
                        // Can wrap if: 1-2 day span AND nothing else on row 0 overlapping it
                        const hasOverlapOnSameRows = placed.filter(p => p.row === row).length > 1;
                        const canWrap = span <= 2 && row === 0 && !hasOverlapOnSameRows;
                        return (
                          <EntryBar
                            key={entry.id}
                            entry={entry}
                            category={cat}
                            row={row}
                            canWrap={canWrap}
                            readOnly={readOnly}
                            onDragStart={() => setDraggedEntry(entry)}
                            onClick={() => !readOnly && setEditingEntry(entry)}
                          />
                        );
                      });
                    })()}
                  </div>
                );
              });

              return rows;
            })()}
          </div>
          <div className="scroll-hint">← swipe to see the whole year →</div>
        </div>

        <div className={`month-list ${mobileView === 'grid' ? 'mobile-hide' : ''}`}>
          {MONTHS.map((m, mi) => {
            const maxDay = daysInMonth(planner.year, mi);
            const quarter = Math.floor(mi / 3);
            return (
              <section className={`month-section q${quarter}`} key={mi}>
                <div className="month-section-header">
                  <span className="month-full">{MONTHS_FULL[mi]}</span>
                  <span className="month-meta">Q{quarter + 1}</span>
                </div>
                <div className="day-list">
                  {Array.from({ length: maxDay }, (_, di) => {
                    const day = di + 1;
                    const dayEntries = getEntriesForDay(mi, day);
                    return (
                      <div key={di} className="day-row" onClick={() => !readOnly && setAddingFor({ month: mi, day })}>
                        <div className="day-row-num">{day}</div>
                        <div className="day-row-entries">
                          {dayEntries.length === 0 ? (
                            !readOnly && <div className="day-row-empty">+ add</div>
                          ) : (
                            dayEntries.map(entry => {
                              const cat = categories.find(c => c.id === entry.category_id) || null;
                              const isStart = day === entry.start_day;
                              return (
                                <div
                                  key={entry.id}
                                  className="row-pill"
                                  style={{ background: cat?.color || '#6b6258', color: cat?.text_color || '#ffffff' }}
                                  onClick={e => { e.stopPropagation(); if (!readOnly) setEditingEntry(entry); }}
                                >
                                  {entry.label}
                                  {!isStart && <span className="row-pill-cont"> (cont.)</span>}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="legend">
          <div className="legend-rule" />
          <div className="legend-title-bar">
            <span className="legend-title">The Key</span>
            <span className="legend-sub">categories &amp; intentions</span>
          </div>
          <div className="legend-grid">
            {categories.map(cat => {
              const locked = isCoreCategory(cat);
              const lockTooltip = 'Core framework category — name and description are locked. You can change the color and add items.';
              return (
                <div className="legend-category" key={cat.id}>
                  <div className="legend-header">
                    <div className="legend-swatch" style={{ background: cat.color }} />
                    {readOnly ? (
                      <div className="legend-name-static">{cat.name}</div>
                    ) : locked ? (
                      <div className="legend-name-static legend-name-locked" title={lockTooltip}>
                        {cat.name}
                        <span className="lock-mark" aria-label="locked">◆</span>
                      </div>
                    ) : (
                      <input className="legend-name" value={cat.name} onChange={e => updateCategory(cat.id, { name: e.target.value })} />
                    )}
                  </div>
                  {/* description (screen-only) */}
                  {readOnly ? (
                    <div className="legend-desc-static screen-only">{cat.description}</div>
                  ) : locked ? (
                    <div className="legend-desc-static screen-only" title={lockTooltip}>{cat.description}</div>
                  ) : (
                    <textarea className="legend-desc screen-only" value={cat.description} onChange={e => updateCategory(cat.id, { description: e.target.value })} />
                  )}
                  {/* items (always shown) */}
                  {readOnly ? (
                    <div className="legend-items-static">
                      {(cat.items || []).filter(Boolean).map((it, i) => <div key={i}>• {it}</div>)}
                    </div>
                  ) : (
                    <>
                      <textarea className="legend-items" placeholder="Items, one per line…" value={(cat.items || []).join('\n')} onChange={e => updateCategory(cat.id, { items: e.target.value.split('\n') })} onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }} />
                      {cat.name.toLowerCase().includes('habit') && (
                        <div className="legend-hint">Start each line with Q1 -, Q2 -, Q3 -, Q4 - to show habits on the calendar above.</div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <footer className="planner-footer">
          <span className="footer-mark">◆ {planner.year} ◆</span>
        </footer>
      </div>


      {addingFor && !readOnly && (
        <EntryModal
          mode="add"
          year={planner.year}
          initial={{ month: addingFor.month, start_day: addingFor.day, end_day: addingFor.day, category_id: categories[0]?.id || null, label: '' }}
          categories={categories}
          entries={entries}
          onSaveNew={(data) => { addEntry(data); setAddingFor(null); }}
          onClose={() => setAddingFor(null)}
        />
      )}

      {editingEntry && !readOnly && (
        <EntryModal
          mode="edit"
          year={planner.year}
          initial={editingEntry}
          categories={categories}
          entries={entries}
          onSaveExisting={(patch) => { updateEntry(editingEntry.id, patch); setEditingEntry(null); }}
          onDelete={() => { deleteEntryGroup(editingEntry); setEditingEntry(null); }}
          onClose={() => setEditingEntry(null)}
        />
      )}

      {showSettings && !readOnly && (
        <CategoriesModal
          categories={categories}
          onUpdate={updateCategory}
          onAdd={addCategory}
          onDelete={deleteCategory}
          onExport={exportJSON}
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

      {showHeaderEdit && !readOnly && (
        <HeaderEditModal
          planner={planner}
          onSave={(patch) => { updatePlannerField(patch); setShowHeaderEdit(false); }}
          onClose={() => setShowHeaderEdit(false)}
        />
      )}
    </div>
  );
}

// ---- Entry bar — single row position, centered text, spans across days ----
function EntryBar({ entry, category, row, canWrap, readOnly, onDragStart, onClick }: {
  entry: Entry;
  category: Category | null;
  row: number;
  canWrap: boolean;
  readOnly: boolean;
  onDragStart: () => void;
  onClick: () => void;
}) {
  // Calculate left/width as % of the 31-day grid area
  const cellsPerDay = `calc((100% - var(--month-label-w)) / 31)`;
  const left = `calc(var(--month-label-w) + ${entry.start_day - 1} * ${cellsPerDay} + 2px)`;
  const width = `calc(${entry.end_day - entry.start_day + 1} * ${cellsPerDay} - 4px)`;
  const top = `calc(var(--cell-top-padding) + ${row} * var(--pill-stack))`;

  return (
    <div
      className={`entry-bar${canWrap ? ' can-wrap' : ''}`}
      style={{
        position: 'absolute',
        left, width, top,
        background: category?.color || '#6b6258',
        color: category?.text_color || '#ffffff',
      }}
      draggable={!readOnly}
      onDragStart={e => { e.stopPropagation(); onDragStart(); }}
      onClick={e => { e.stopPropagation(); onClick(); }}
      title={entry.label}
    >
      <span className="entry-bar-label">{entry.label}</span>
    </div>
  );
}

// ---- Entry add/edit modal with start month + end month ----
function EntryModal({ mode, year, initial, categories, entries, onSaveNew, onSaveExisting, onDelete, onClose }: {
  mode: 'add' | 'edit';
  year: number;
  initial: { label: string; category_id: string | null; month?: number; start_day: number; end_day: number };
  categories: Category[];
  entries: Entry[];
  onSaveNew?: (data: { label: string; category_id: string | null; start_month: number; start_day: number; end_month: number; end_day: number }) => void;
  onSaveExisting?: (patch: Partial<Entry>) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(initial.label || '');
  const [categoryId, setCategoryId] = useState<string | null>(initial.category_id);
  const [startMonth, setStartMonth] = useState(initial.month ?? 0);
  const [startDay, setStartDay] = useState(initial.start_day);
  const [endMonth, setEndMonth] = useState(initial.month ?? 0);
  const [endDay, setEndDay] = useState(initial.end_day || initial.start_day);

  const startMaxDay = daysInMonth(year, startMonth);
  const endMaxDay = daysInMonth(year, endMonth);

  function handleSave() {
    if (!label.trim()) return;
    if (mode === 'add' && onSaveNew) {
      // Validate: start must be before or equal to end
      const startTotal = startMonth * 100 + startDay;
      const endTotal = endMonth * 100 + endDay;
      if (startTotal > endTotal) {
        alert('End date must be on or after start date');
        return;
      }
      onSaveNew({
        label: label.trim(),
        category_id: categoryId,
        start_month: startMonth,
        start_day: startDay,
        end_month: endMonth,
        end_day: endDay,
      });
    } else if (mode === 'edit' && onSaveExisting) {
      // Edit only updates this single chunk
      onSaveExisting({
        label: label.trim(),
        category_id: categoryId,
        month: startMonth,
        start_day: Math.min(startDay, endDay),
        end_day: Math.max(startDay, endDay),
      });
    }
  }

  const isCrossMonth = startMonth !== endMonth;

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

          <div className="field-row">
            <div className="field">
              <label>Start month</label>
              <select value={startMonth} onChange={e => {
                const m = parseInt(e.target.value);
                setStartMonth(m);
                const md = daysInMonth(year, m);
                if (startDay > md) setStartDay(md);
                // Sync end month if we're moving start past end
                if (mode === 'add' && m > endMonth) { setEndMonth(m); setEndDay(startDay); }
              }}>
                {MONTHS_FULL.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Start day</label>
              <input type="number" min={1} max={startMaxDay} value={startDay} onChange={e => setStartDay(parseInt(e.target.value) || 1)} />
            </div>
          </div>

          {mode === 'add' && (
            <div className="field-row">
              <div className="field">
                <label>End month</label>
                <select value={endMonth} onChange={e => {
                  const m = parseInt(e.target.value);
                  setEndMonth(m);
                  const md = daysInMonth(year, m);
                  if (endDay > md) setEndDay(md);
                }}>
                  {MONTHS_FULL.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
              <div className="field">
                <label>End day</label>
                <input type="number" min={1} max={endMaxDay} value={endDay} onChange={e => setEndDay(parseInt(e.target.value) || 1)} />
              </div>
            </div>
          )}

          {mode === 'edit' && (
            <div className="field">
              <label>End day (in {MONTHS_FULL[startMonth]})</label>
              <input type="number" min={1} max={startMaxDay} value={endDay} onChange={e => setEndDay(parseInt(e.target.value) || 1)} />
              <div className="field-note">Editing only changes this month&apos;s portion of the entry.</div>
            </div>
          )}

          {mode === 'add' && isCrossMonth && (
            <div className="cross-month-note">
              <strong>Cross-month entry:</strong> This will create chunks in {MONTHS_FULL[startMonth]} through {MONTHS_FULL[endMonth]}, linked as one event.
            </div>
          )}
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

// ---- Header edit modal ----
function HeaderEditModal({ planner, onSave, onClose }: {
  planner: Planner;
  onSave: (patch: Partial<Planner>) => void;
  onClose: () => void;
}) {
  const [ownerName, setOwnerName] = useState(planner.owner_name);
  const [title, setTitle] = useState(planner.title);
  const [mantra, setMantra] = useState(planner.mantra || '');

  function handleSave() {
    onSave({ owner_name: ownerName.trim(), title: title.trim(), mantra: mantra.trim() });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit header</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Your name</label>
            <input autoFocus value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="e.g. Jason" />
          </div>
          <div className="field">
            <label>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Intentional Year" />
          </div>
          <div className="field">
            <label>Mantra / guiding quote</label>
            <input value={mantra} onChange={e => setMantra(e.target.value)} placeholder="A guiding word or quote for the year…" maxLength={140} onKeyDown={e => e.key === 'Enter' && handleSave()} />
            <div className="field-note">Optional. Shown alongside the title in italic.</div>
          </div>
        </div>
        <div className="modal-footer">
          <div />
          <div className="right">
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoriesModal({ categories, onUpdate, onAdd, onDelete, onExport, onClose }: {
  categories: Category[]; onUpdate: (id: string, patch: Partial<Category>) => void;
  onAdd: () => void; onDelete: (id: string) => void; onExport: () => void; onClose: () => void;
}) {
  const lockTooltip = 'Core framework category — name is locked. You can change the color and items.';
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className="settings-section-title">Categories</div>
          <div className="modal-note">
            <strong>Misogi, Explore 6x, and Habits</strong> are core framework categories — their names are locked, but you can still change colors and items. The other three are yours to rename, recolor, or remove.
          </div>
          {categories.map((cat) => {
            const locked = isCoreCategory(cat);
            return (
              <div key={cat.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto', gap: 8, alignItems: 'center' }}>
                <div className="legend-swatch" style={{ background: cat.color, width: 24, height: 24 }} />
                {locked ? (
                  <div title={lockTooltip} style={{ padding: '6px 8px', color: '#4a4238', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {cat.name}
                    <span style={{ fontSize: 9, color: '#8a3a2a', letterSpacing: '0.1em' }}>◆ CORE</span>
                  </div>
                ) : (
                  <input value={cat.name} onChange={e => onUpdate(cat.id, { name: e.target.value })} style={{ padding: '6px 8px', border: '1px solid #c9bfa8', borderRadius: 3, background: 'white' }} />
                )}
                <input type="color" value={cat.color} onChange={e => onUpdate(cat.id, { color: e.target.value })} style={{ width: 36, height: 32, border: '1px solid #c9bfa8', borderRadius: 3, padding: 2 }} title="Fill" />
                <input type="color" value={cat.text_color} onChange={e => onUpdate(cat.id, { text_color: e.target.value })} style={{ width: 36, height: 32, border: '1px solid #c9bfa8', borderRadius: 3, padding: 2 }} title="Text" />
                {locked ? (
                  <div title={lockTooltip} style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9bfa8' }}>—</div>
                ) : (
                  <button className="icon-btn" onClick={() => onDelete(cat.id)} title="Delete"><Trash2 size={16} /></button>
                )}
              </div>
            );
          })}
          <button className="btn" onClick={onAdd}><Plus size={14} /> Add category</button>

          <div className="settings-divider" />
          <div className="settings-section-title">Data</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <button className="btn" onClick={onExport}><Download size={14} /> Export as JSON</button>
            <div style={{ fontSize: 11, color: '#7a7064', lineHeight: 1.5, paddingTop: 2 }}>
              Download a backup of your planner — all entries, categories, and settings — as a JSON file.
            </div>
          </div>
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
          <p style={{ fontSize: 13, color: '#5e5446', margin: 0 }}>A share link lets anyone view your planner read-only.</p>
          {token ? (
            <>
              <div className="field">
                <label>Share URL</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input readOnly value={shareUrl} style={{ flex: 1 }} onFocus={e => e.target.select()} />
                  <button className="btn" onClick={copy}>{copied ? <><Check size={14} /> Copied</> : <><LinkIcon size={14} /> Copy</>}</button>
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

// ── Standalone print-only view ──────────────────────────────────────────────
// Renders independently of the screen layout so min-height:100vh can't
// push content to page 2. Hidden on screen via CSS, shown only in @media print.
function PrintView({ planner, categories, entries, rowHeightPx }: {
  planner: Planner;
  categories: Category[];
  entries: Entry[];
  rowHeightPx: number;
}) {
  const habitsCategory = categories.find(c => c.name.toLowerCase().includes('habit'));
  const habitItems = habitsCategory?.items || [];
  const quarterHabits: Record<number, string> = {};
  habitItems.filter(Boolean).forEach(item => {
    const match = item.match(/^Q([1-4])\s*[-—–]+\s*(.+)$/i);
    if (match) quarterHabits[parseInt(match[1])] = match[2].trim();
  });

  const qStyles = [
    { bg: '#f5edda', border: '#d4b87a', text: '#7a5c1e', dot: '#b88a3f' },
    { bg: '#e8f0e2', border: '#8ab07a', text: '#2a5c1e', dot: '#5b7a3a' },
    { bg: '#e2ecf5', border: '#7aaad4', text: '#1e3a5c', dot: '#3d6b87' },
    { bg: '#f5e8e2', border: '#d4907a', text: '#5c2a1e', dot: '#c2553c' },
  ];

  const quarterTints = [
    'rgba(184,138,63,0.10)',
    'rgba(91,122,58,0.10)',
    'rgba(61,107,135,0.10)',
    'rgba(160,100,80,0.10)',
  ];

  return (
    <div className="print-view">
      {/* Title */}
      <div className="pv-header">
        <div className="pv-title">{planner.owner_name}&apos;s {planner.title} · {planner.year}</div>
        {planner.mantra && <div className="pv-mantra">&ldquo;{planner.mantra}&rdquo;</div>}
      </div>

      {/* Calendar */}
      <div className="pv-calendar">
        {MONTHS.map((m, mi) => {
          const maxDay = daysInMonth(planner.year, mi);
          const q = Math.floor(mi / 3);
          const qNum = q + 1;
          const monthEntries = entries.filter(e => e.month === mi);

          // Collision detection
          const placed: { row: number; start: number; end: number }[] = [];
          const entryRows = monthEntries.map(entry => {
            let row = 0;
            while (placed.some(p => p.row === row && !(entry.end_day < p.start || entry.start_day > p.end))) row++;
            placed.push({ row, start: entry.start_day, end: entry.end_day });
            return row;
          });

          return (
            <React.Fragment key={mi}>
              {mi % 3 === 0 && (
                <div className="pv-qdiv" style={{ background: qStyles[q].bg, borderColor: qStyles[q].border }}>
                  <div className="pv-qdiv-dot" style={{ background: qStyles[q].dot }} />
                  <div className="pv-qdiv-label" style={{ color: qStyles[q].text }}>
                    Q{qNum} Habit — {quarterHabits[qNum] || 'TBD'}
                  </div>
                </div>
              )}
              <div className="pv-month" style={{ height: rowHeightPx, background: quarterTints[q] }}>
                <div className="pv-month-label">{m}</div>
                {Array.from({ length: 31 }).map((_, di) => {
                  const day = di + 1;
                  const valid = day <= maxDay;
                  return (
                    <div key={di} className={`pv-day${valid ? '' : ' pv-invalid'}`}>
                      {valid && <span className="pv-daynum">{day}</span>}
                    </div>
                  );
                })}
                {monthEntries.map((entry, idx) => {
                  const cat = categories.find(c => c.id === entry.category_id);
                  const row = entryRows[idx];
                  return (
                    <div key={entry.id} className="pv-entry" style={{
                      left: `calc(44px + ${entry.start_day - 1} * ((100% - 44px) / 31) + 1px)`,
                      width: `calc(${entry.end_day - entry.start_day + 1} * ((100% - 44px) / 31) - 2px)`,
                      top: 13 + row * 14,
                      background: cat?.color || '#6b6258',
                      color: cat?.text_color || '#fff',
                    }}>
                      {entry.label}
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pv-legend">
        {categories.map(cat => (
          <div key={cat.id} className="pv-cat">
            <div className="pv-cat-header">
              <div className="pv-cat-swatch" style={{ background: cat.color }} />
              <div className="pv-cat-name">{cat.name}</div>
            </div>
            <div className="pv-cat-items">
              {(cat.items || []).filter(Boolean).map((it, i) => <div key={i}>{it}</div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = `
:root {
  --paper: #f5efe1;
  --paper-deep: #ede5d2;
  --paper-soft: #fbf7ec;
  --ink: #2a2620;
  --ink-soft: #4a4238;
  --ink-mute: #7a7064;
  --rule: #c9bfa8;
  --rule-soft: #e0d7c0;
  --accent: #8a3a2a;
  --today: #c2553c;
  /* Quarter tints — all equally visible */
  --q-tint-1: rgba(184, 138, 63, 0.10);
  --q-tint-2: rgba(91, 122, 58, 0.10);
  --q-tint-3: rgba(61, 107, 135, 0.10);
  --q-tint-4: rgba(160, 100, 80, 0.10);
  /* Quarter divider accent colors */
  --q-div-bg-1: #f5edda; --q-div-border-1: #d4b87a; --q-div-text-1: #7a5c1e; --q-div-dot-1: #b88a3f;
  --q-div-bg-2: #e8f0e2; --q-div-border-2: #8ab07a; --q-div-text-2: #2a5c1e; --q-div-dot-2: #5b7a3a;
  --q-div-bg-3: #e2ecf5; --q-div-border-3: #7aaad4; --q-div-text-3: #1e3a5c; --q-div-dot-3: #3d6b87;
  --q-div-bg-4: #f5e8e2; --q-div-border-4: #d4907a; --q-div-text-4: #5c2a1e; --q-div-dot-4: #c2553c;
  --month-label-w: 56px;
  --cell-top-padding: 16px;
  --pill-stack: 16px;
  --row-height: 64px;
}

.planner-root {
  font-family: 'Inter', -apple-system, sans-serif;
  background:
    radial-gradient(at 20% 10%, rgba(255,250,235,0.6), transparent 50%),
    radial-gradient(at 85% 90%, rgba(220,205,170,0.3), transparent 60%),
    var(--paper);
  background-attachment: fixed;
  min-height: 100vh;
  color: var(--ink);
}

.planner-root::before {
  content: '';
  position: fixed; inset: 0;
  pointer-events: none; z-index: 0; opacity: 0.4;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.08 0 0 0 0 0.06 0 0 0 0.18 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.toolbar {
  position: sticky; top: 0; z-index: 50;
  background: rgba(245, 239, 225, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--rule);
  padding: 10px 20px;
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}

.tb-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 12px;
  background: rgba(255,255,255,0.5);
  border: 1px solid var(--rule);
  border-radius: 4px;
  font-size: 12px; font-weight: 500; letter-spacing: 0.02em;
  color: var(--ink); cursor: pointer; transition: all 0.15s;
  font-family: inherit;
  text-decoration: none;
}
.tb-btn:hover { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.about-link { margin-left: auto; }

.year-control {
  display: inline-flex; align-items: center; gap: 2px;
  background: rgba(255,255,255,0.5);
  border: 1px solid var(--rule); border-radius: 4px; padding: 2px;
}
.year-control button { padding: 4px 6px; background: transparent; border: none; cursor: pointer; color: var(--ink-soft); border-radius: 3px; }
.year-control button:hover { background: var(--ink); color: var(--paper); }
.year-control .year-display { font-family: 'Fraunces', serif; font-weight: 700; font-size: 14px; padding: 0 10px; min-width: 50px; text-align: center; letter-spacing: 0.02em; }

.readonly-badge { font-size: 12px; color: var(--ink-mute); font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }

.mobile-toggle { display: none; background: rgba(255,255,255,0.5); border: 1px solid var(--rule); border-radius: 4px; padding: 2px; gap: 2px; }
.mobile-toggle button { padding: 5px 8px; background: transparent; border: none; border-radius: 3px; cursor: pointer; color: var(--ink-mute); display: inline-flex; align-items: center; }
.mobile-toggle button.active { background: var(--ink); color: var(--paper); }

.printable { position: relative; z-index: 1; padding: 24px 32px 60px; max-width: 1600px; margin: 0 auto; }

/* ---- Header ---- */
.planner-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--rule);
}

.title-line {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.title-display {
  font-family: 'Crimson Pro', serif;
  font-weight: 600;
  font-size: clamp(22px, 2.6vw, 28px);
  line-height: 1.25;
  letter-spacing: -0.005em;
  margin: 0;
  color: var(--ink);
  font-style: normal;
}

.title-text { color: var(--ink); }
.title-mantra-sep { color: var(--rule); font-weight: 400; padding: 0 6px; }
.title-mantra { font-family: 'Crimson Pro', serif; font-style: italic; font-weight: 400; color: var(--ink-soft); }
.title-mantra-placeholder { font-family: 'Crimson Pro', serif; font-style: italic; font-weight: 400; color: var(--ink-mute); opacity: 0.5; }

.header-edit-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 10px;
  background: transparent;
  border: 1px solid var(--rule);
  border-radius: 3px;
  font-size: 11px; font-weight: 500;
  color: var(--ink-mute);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.header-edit-btn:hover { background: var(--ink); color: var(--paper); border-color: var(--ink); }

/* ---- Calendar grid ---- */
.grid-wrap { position: relative; }

.calendar-grid {
  border: 1px solid var(--rule);
  background: var(--paper-soft);
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 8px 24px -16px rgba(60,40,20,0.18);
}

.month-row {
  display: grid;
  grid-template-columns: var(--month-label-w) repeat(31, minmax(0, 1fr));
  border-bottom: 1px solid var(--rule-soft);
  min-height: var(--row-height);
  position: relative;
}
.month-row:last-child { border-bottom: none; }
.month-row.q0 { background: var(--q-tint-1); }
.month-row.q1 { background: var(--q-tint-2); }
.month-row.q2 { background: var(--q-tint-3); }
.month-row.q3 { background: var(--q-tint-4); }

.month-label {
  display: flex; align-items: center; justify-content: center;
  font-family: 'Fraunces', serif; font-weight: 600; font-size: 12px;
  letter-spacing: 0.14em; color: var(--ink-soft);
  border-right: 1px solid var(--rule);
  background: var(--paper-deep);
  position: sticky; left: 0; z-index: 3;
}

.day-cell {
  position: relative; border-right: 1px solid rgba(201, 191, 168, 0.4);
  padding: 2px; min-height: var(--row-height); cursor: pointer; transition: background 0.1s;
}
.day-cell.readonly { cursor: default; }
.day-cell:last-child { border-right: none; }
.day-cell:not(.readonly):hover { background: rgba(255,255,255,0.5); }
.day-cell.today { box-shadow: inset 0 0 0 2px var(--today); }
.day-number.today-num { color: var(--today); font-weight: 700; }
.day-cell.invalid {
  background: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(201,191,168,0.15) 4px, rgba(201,191,168,0.15) 5px), var(--paper-deep);
  cursor: not-allowed;
}

.day-number { position: absolute; top: 3px; left: 4px; font-size: 9px; font-weight: 600; color: var(--ink-mute); letter-spacing: 0.02em; font-variant-numeric: tabular-nums; pointer-events: none; }

/* ---- Entry bars (stretched & centered) ---- */
.entry-bar {
  position: absolute;
  height: 14px;
  padding: 0 5px;
  border-radius: 2px;
  font-size: 9px;
  font-weight: 600;
  line-height: 14px;
  cursor: grab;
  overflow: hidden;
  z-index: 2;
  letter-spacing: 0.01em;
  box-shadow: 0 1px 0 rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}
.entry-bar:active { cursor: grabbing; }
.entry-bar-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
}
/* Multi-line wrapping for short single/two-day entries with no overlap */
.entry-bar.can-wrap {
  height: auto;
  min-height: 14px;
  max-height: 42px;
  line-height: 1.15;
  padding: 3px 5px;
  align-items: flex-start;
}
.entry-bar.can-wrap .entry-bar-label {
  white-space: normal;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-align: center;
}

.scroll-hint { display: none; text-align: center; font-size: 10px; color: var(--ink-mute); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 10px; font-weight: 500; }

/* ---- Mobile month-list view ---- */
.month-list { display: none; }
.month-section { margin-bottom: 24px; border: 1px solid var(--rule); border-radius: 3px; overflow: hidden; background: var(--paper-soft); }
.month-section.q0 { background: linear-gradient(to bottom, var(--q-tint-1), var(--paper-soft)); }
.month-section.q1 { background: linear-gradient(to bottom, var(--q-tint-2), var(--paper-soft)); }
.month-section.q2 { background: linear-gradient(to bottom, var(--q-tint-3), var(--paper-soft)); }
.month-section.q3 { background: linear-gradient(to bottom, var(--q-tint-4), var(--paper-soft)); }
.month-section-header { display: flex; justify-content: space-between; align-items: baseline; padding: 14px 16px; border-bottom: 1px solid var(--rule-soft); background: var(--paper-deep); }
.month-full { font-family: 'Fraunces', serif; font-weight: 700; font-size: 22px; letter-spacing: -0.01em; color: var(--ink); }
.month-meta { font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-mute); }
.day-list { padding: 4px 0; }
.day-row { display: grid; grid-template-columns: 44px 1fr; gap: 8px; padding: 8px 16px; border-bottom: 1px solid rgba(201,191,168,0.3); cursor: pointer; min-height: 38px; align-items: center; }
.day-row:last-child { border-bottom: none; }
.day-row:active { background: rgba(255,255,255,0.5); }
.day-row-num { font-family: 'Fraunces', serif; font-weight: 600; font-size: 14px; color: var(--ink-mute); font-variant-numeric: tabular-nums; text-align: right; padding-right: 4px; border-right: 1px solid var(--rule-soft); }
.day-row-entries { display: flex; flex-wrap: wrap; gap: 4px; }
.day-row-empty { font-size: 11px; color: var(--ink-mute); opacity: 0.5; font-style: italic; }
.row-pill { font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 3px; letter-spacing: 0.01em; }
.row-pill-cont { opacity: 0.7; font-weight: 400; font-style: italic; }

/* ---- Quarter habit dividers ---- */
.quarter-divider {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 18px;
  padding: 0 8px 0 10px;
  border-top: 1px solid;
  border-bottom: 1px solid;
}
.quarter-divider-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.quarter-divider-label {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

/* ---- Legend ---- */
.legend { margin-top: 36px; }
.legend-rule { height: 1px; background: var(--ink-soft); margin-bottom: 20px; position: relative; }
.legend-rule::before { content: '◆'; position: absolute; top: -7px; font-size: 10px; color: var(--ink-soft); background: var(--paper); padding: 0 6px; left: 50%; transform: translateX(-50%); }

.legend-title-bar { display: flex; flex-direction: column; align-items: center; margin-bottom: 24px; gap: 2px; }
.legend-title { font-family: 'Fraunces', serif; font-weight: 700; font-size: 22px; letter-spacing: -0.01em; color: var(--ink); }
.legend-sub { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-mute); font-weight: 500; }

.legend-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 24px; }
.legend-category { display: flex; flex-direction: column; gap: 8px; }
.legend-header { display: flex; align-items: center; gap: 8px; }
.legend-swatch { width: 16px; height: 16px; border-radius: 2px; flex-shrink: 0; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); }

.legend-name, .legend-name-static { font-family: 'Fraunces', serif; font-size: 16px; font-weight: 700; background: transparent; border: none; padding: 0; color: var(--ink); width: 100%; letter-spacing: -0.005em; }
.legend-name-locked { display: flex; align-items: center; gap: 6px; cursor: help; }
.lock-mark { font-size: 8px; color: var(--accent); letter-spacing: 0.1em; font-weight: 600; opacity: 0.7; }
.legend-name:focus { outline: 1px dashed var(--rule); outline-offset: 2px; }

.legend-desc, .legend-desc-static { font-size: 11px; color: var(--ink-soft); line-height: 1.5; background: transparent; border: none; padding: 0; resize: none; font-family: inherit; width: 100%; min-height: 0; overflow: hidden; }
.legend-desc:focus { outline: 1px dashed var(--rule); outline-offset: 2px; }

.legend-items, .legend-items-static { font-size: 11px; color: var(--accent); line-height: 1.55; background: transparent; border: none; padding: 0; resize: none; font-family: inherit; width: 100%; min-height: 0; overflow: hidden; white-space: pre-wrap; font-weight: 500; }
.legend-items:focus { outline: 1px dashed var(--rule); outline-offset: 2px; }
.legend-hint { font-size: 10px; color: var(--ink-mute); font-style: italic; line-height: 1.4; margin-top: 4px; }

.planner-footer { margin-top: 56px; text-align: center; border-top: 1px solid var(--rule); padding-top: 20px; }
.footer-mark { font-family: 'Fraunces', serif; font-size: 12px; letter-spacing: 0.4em; color: var(--ink-mute); font-weight: 600; }

/* ---- Modals ---- */
.modal-overlay { position: fixed; inset: 0; background: rgba(42, 38, 32, 0.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
.modal { background: var(--paper-soft); border-radius: 4px; width: 100%; max-width: 460px; box-shadow: 0 24px 60px rgba(42,38,32,0.4); overflow: hidden; border: 1px solid var(--rule); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--rule); background: var(--paper-deep); }
.modal-header h2 { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 700; margin: 0; color: var(--ink); }
.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.modal-note { font-size: 12px; line-height: 1.5; color: var(--ink-soft); background: rgba(255,255,255,0.5); border-left: 2px solid var(--accent); padding: 10px 12px; border-radius: 0 3px 3px 0; margin-bottom: 4px; }
.modal-note strong { color: var(--ink); font-weight: 600; }
.settings-section-title { font-family: 'Fraunces', serif; font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 4px; letter-spacing: -0.005em; text-transform: uppercase; letter-spacing: 0.05em; }
.settings-divider { height: 1px; background: var(--rule); margin: 8px 0 4px; }
.cross-month-note { font-size: 12px; line-height: 1.4; color: var(--ink-soft); background: rgba(184, 138, 63, 0.1); border-left: 2px solid #b88a3f; padding: 8px 10px; border-radius: 0 3px 3px 0; }
.cross-month-note strong { color: var(--ink); font-weight: 600; }

.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-mute); }
.field input, .field select { padding: 8px 10px; border: 1px solid var(--rule); border-radius: 3px; font-size: 14px; font-family: inherit; background: white; color: var(--ink); }
.field input:focus, .field select:focus { outline: none; border-color: var(--ink); }
.field-note { font-size: 11px; color: var(--ink-mute); margin-top: 2px; font-style: italic; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.modal-footer { padding: 14px 20px; display: flex; justify-content: space-between; gap: 8px; border-top: 1px solid var(--rule); background: var(--paper-deep); }
.modal-footer .right { display: flex; gap: 8px; }

.btn { padding: 8px 14px; border: 1px solid var(--rule); border-radius: 3px; background: white; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; gap: 6px; color: var(--ink); }
.btn:hover { background: var(--paper-deep); }
.btn-primary { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.btn-primary:hover { background: var(--ink-soft); }
.btn-danger { color: var(--accent); border-color: rgba(138,58,42,0.3); }
.btn-danger:hover { background: rgba(138,58,42,0.08); }

.icon-btn { background: transparent; border: none; cursor: pointer; padding: 4px; border-radius: 3px; color: var(--ink-soft); }
.icon-btn:hover { background: var(--paper-deep); color: var(--ink); }

/* ---- Responsive ---- */
.mobile-hide { display: none; }

@media (min-width: 901px) {
  .month-list { display: none !important; }
  .grid-wrap { display: block !important; }
  .mobile-toggle { display: none; }
}

@media (max-width: 900px) {
  .printable { padding: 24px 16px 40px; }
  .mobile-toggle { display: inline-flex; }
  .btn-text { display: none; }
  .about-link { margin-left: auto; }

  .title-display {
    font-size: 18px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .title-mantra, .title-mantra-sep, .title-mantra-placeholder {
    display: block;
    width: 100%;
    text-align: center;
    margin-top: 4px;
    font-size: 14px;
  }
  .title-mantra-sep { display: none; }

  .grid-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 0 -16px; padding: 0 16px; }
  .calendar-grid { min-width: 1100px; }
  .scroll-hint { display: block; }

  .month-list:not(.mobile-hide) { display: block; }
  .grid-wrap.mobile-hide { display: none; }

  .legend-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
}

@media (max-width: 500px) {
  .legend-grid { grid-template-columns: 1fr; }
  .toolbar { padding: 8px 12px; gap: 6px; }
  .tb-btn { padding: 6px 8px; }
}

/* ── Print-view: hidden on screen ── */
/* print handled via openPrintWindow() */
`;

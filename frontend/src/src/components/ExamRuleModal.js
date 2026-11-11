import { useState, useEffect, useRef } from 'react';
import { X, JournalText, TypeH2, TypeBold, TypeItalic, ListUl, ListOl, Link45deg } from 'react-bootstrap-icons';
import { RuleMarkdown } from './examRule';

// Lets the instructor/TA write the exam rules in markdown, with a live preview of what students see
function ExamRuleModal({ show, value, onSave, onClose, note }) {
  const [draft, setDraft] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (show) setDraft(value || '');
  }, [show, value]);

  if (!show) return null;

  // Apply a toolbar edit, then restore focus and selection to [selStart, selEnd]
  const apply = (next, selStart, selEnd) => {
    setDraft(next);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  };

  // Surround the selection, e.g. **bold**
  const wrap = (before, after, placeholder) => {
    const el = inputRef.current;
    const { selectionStart: s, selectionEnd: e } = el;
    const text = draft.slice(s, e) || placeholder;
    apply(draft.slice(0, s) + before + text + after + draft.slice(e), s + before.length, s + before.length + text.length);
  };

  // Prefix every selected line, e.g. "- " or "1. "
  const prefixLines = (prefix) => {
    const el = inputRef.current;
    const start = draft.lastIndexOf('\n', el.selectionStart - 1) + 1;
    let end = draft.indexOf('\n', el.selectionEnd);
    if (end === -1) end = draft.length;
    const lines = draft.slice(start, end).split('\n').map((line, i) => prefix(i) + line).join('\n');
    apply(draft.slice(0, start) + lines + draft.slice(end), start + lines.length, start + lines.length);
  };

  const tools = [
    { icon: <TypeH2 size={18} />, title: 'Heading', run: () => prefixLines(() => '## ') },
    { icon: <TypeBold size={18} />, title: 'Bold', run: () => wrap('**', '**', 'bold text') },
    { icon: <TypeItalic size={18} />, title: 'Italic', run: () => wrap('_', '_', 'italic text') },
    { icon: <ListUl size={18} />, title: 'Bullet list', run: () => prefixLines(() => '- ') },
    { icon: <ListOl size={18} />, title: 'Numbered list', run: () => prefixLines((i) => `${i + 1}. `) },
    { icon: <Link45deg size={18} />, title: 'Link', run: () => wrap('[', '](https://)', 'link text') },
  ];

  const hasRule = draft.trim() !== '';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', width: '1200px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 'bold', color: '#334155' }}>
            <JournalText size={22} /> Exam rules
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={28} />
          </button>
        </div>
        <div style={{ color: '#64748b', marginBottom: '1rem' }}>
          Before checking in, students must read these rules, tick to acknowledge, and type their name. If you change the rules, students acknowledge again. Leave empty to skip this step.
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <div style={{ color: '#475569', fontWeight: '600', marginBottom: '8px' }}>Markdown</div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
              {tools.map((t) => (
                <button key={t.title} type="button" title={t.title} aria-label={t.title} onClick={t.run} className="btn btn-sm btn-outline-secondary">
                  {t.icon}
                </button>
              ))}
            </div>
            <textarea
              ref={inputRef}
              className="form-control"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={'## Exam rules\n1. No phones or smartwatches.\n2. No talking during the exam.'}
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', height: '50vh', resize: 'none' }}
            />
          </div>
          <div className="col-md-6">
            <div style={{ color: '#475569', fontWeight: '600', marginBottom: '8px' }}>What students will see</div>
            {hasRule ? (
              <RuleMarkdown text={draft} style={{ height: 'calc(50vh + 37px)' }} />
            ) : (
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1rem', color: '#94a3b8', textAlign: 'center', height: 'calc(50vh + 37px)' }}>No exam rules. Students go straight to check-in.</div>
            )}
          </div>
        </div>

        {note && <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '10px' }}>{note}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
          <button type="button" onClick={onClose} style={{ padding: '6px 20px', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '30px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
          <button type="button" onClick={() => onSave(draft.trim())} style={{ padding: '6px 20px', backgroundColor: '#e25595', border: 'none', color: 'white', borderRadius: '30px', fontWeight: '600', cursor: 'pointer' }}>Save rules</button>
        </div>
      </div>
    </div>
  );
}

export default ExamRuleModal;

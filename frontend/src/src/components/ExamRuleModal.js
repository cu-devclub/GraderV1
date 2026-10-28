import { useState, useEffect, useRef } from 'react';
import { X, JournalText } from 'react-bootstrap-icons';
import { ruleLines, renderRuleText, ruleBoxStyle } from './examRule';

// Lets the instructor/TA write the exam rules and preview them the way students will see them
function ExamRuleModal({ show, value, onSave, onClose, note }) {
  const [draft, setDraft] = useState(value || '');
  const previewRef = useRef(null);

  useEffect(() => {
    if (show) setDraft(value || '');
  }, [show, value]);

  useEffect(() => {
    if (previewRef.current) renderRuleText(previewRef.current, ruleLines(draft));
  }, [draft, show]);

  if (!show) return null;

  const hasRule = ruleLines(draft).length > 0;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', width: '800px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 'bold', color: '#334155' }}>
            <JournalText size={22} /> Exam rules
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={28} />
          </button>
        </div>
        <div style={{ color: '#64748b', marginBottom: '1rem' }}>
          Before checking in, students must type these rules exactly. Each student only does this once per exam. Leave empty to skip this step.
        </div>

        <textarea
          className="form-control"
          rows={6}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={'e.g.\nNo phones or smartwatches.\nNo talking during the exam.'}
          style={{ fontFamily: ruleBoxStyle.fontFamily, marginBottom: '1.25rem' }}
        />

        <div style={{ color: '#475569', fontWeight: '600', marginBottom: '8px' }}>What students will see</div>
        {hasRule ? (
          <div ref={previewRef} style={ruleBoxStyle} />
        ) : (
          <div style={{ ...ruleBoxStyle, color: '#94a3b8', textAlign: 'center' }}>No exam rules. Students go straight to check-in.</div>
        )}

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

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const boxStyle = {
  textAlign: 'left',
  border: '1px solid #cbd5e1',
  borderRadius: '12px',
  padding: '1rem 1.25rem',
  backgroundColor: '#f8fafc',
  color: '#1e293b',
  fontSize: '1rem',
  overflowY: 'auto',
  wordBreak: 'break-word',
};

// Exam rules rendered from markdown (raw HTML in the text is not rendered)
export function RuleMarkdown({ text, style }) {
  return (
    <div style={{ ...boxStyle, ...style }}>
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

// Same rule as the server: case-insensitive, repeated spaces count as one
const normalizeName = (name) => (name || '').trim().replace(/\s+/g, ' ').toLowerCase();

function RuleAckForm({ rule, name, submit, onDone }) {
  const [checked, setChecked] = useState(false);
  const [typed, setTyped] = useState('');
  const [wrong, setWrong] = useState(false);
  const [shake, setShake] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleType = (e) => {
    setTyped(e.target.value);
    setWrong(false);
    setError('');
  };

  // red border + shake, kept until the student edits the name
  const reject = (msg) => {
    setWrong(true);
    setShake((n) => n + 1);
    setError(msg);
  };

  const handleSubmit = async () => {
    if (normalizeName(typed) !== normalizeName(name)) {
      reject('The name does not match. Please check it and try again.');
      return;
    }
    setBusy(true);
    let result;
    try {
      result = await submit(typed);
    } catch (e) {
      result = { success: false, msg: 'Failed to connect to server.' };
    }
    if (result && result.success) {
      onDone();
      return;
    }
    setBusy(false);
    reject((result && result.msg) || 'Please try again.');
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <RuleMarkdown text={rule} style={{ maxHeight: '45vh' }} />
      <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '1rem', cursor: 'pointer', color: '#334155' }}>
        <input type="checkbox" className="form-check-input" checked={checked} onChange={(e) => setChecked(e.target.checked)} style={{ marginTop: '4px', flexShrink: 0 }} />
        I have read and understood the exam rules, and I will follow them.
      </label>
      <div style={{ marginTop: '1rem', color: '#334155' }}>Type your full name to confirm</div>
      <style>{'@keyframes rule-name-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}'}</style>
      <input
        key={shake}
        type="text"
        className={`form-control mt-2 ${wrong ? 'is-invalid' : ''}`}
        style={shake ? { animation: 'rule-name-shake 0.4s' } : undefined}
        autoFocus={shake > 0}
        value={typed}
        onChange={handleType}
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        autoComplete="off"
        spellCheck="false"
      />
      {error && <div style={{ color: '#dc2626', marginTop: '8px', fontSize: '0.9rem' }}>{error}</div>}
      <button type="button" className="btn btn-primary w-100 py-2 mt-3" disabled={!checked || !typed.trim() || busy} onClick={handleSubmit}>
        {busy && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />}
        {busy ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  );
}

// Dialog that cannot be closed until the student ticks the box, types their name and submits.
// submit(name) must resolve to { success, msg }; the returned promise resolves after a successful submit.
export const showExamRuleAck = (rule, name, submit) => new Promise((resolve) => {
  withReactContent(Swal).fire({
    title: 'Exam rules',
    html: <RuleAckForm rule={rule} name={name} submit={submit} onDone={() => { Swal.close(); resolve(); }} />,
    width: '800px',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showCloseButton: false,
    showConfirmButton: false,
    showCancelButton: false,
  });
});

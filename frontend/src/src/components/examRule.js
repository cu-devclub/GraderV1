import Swal from 'sweetalert2'

// Rule lines as students see them; each line break is typed as a single space
export const ruleLines = (text) => (text || '')
  .split('\n')
  .map((line) => line.trim().replace(/\s+/g, ' '))
  .filter((line) => line !== '');

const COLOR_PENDING = '#94a3b8';
const COLOR_CORRECT = '#1e293b';
const COLOR_WRONG = '#dc2626';

// Fills `box` with one span per character of the rule and returns the spans in typing order
export const renderRuleText = (box, lines) => {
  box.innerHTML = '';
  const spans = [];
  lines.forEach((line, li) => {
    const lineEl = document.createElement('div');
    for (const ch of line) {
      const span = document.createElement('span');
      span.textContent = ch;
      span.style.color = COLOR_PENDING;
      lineEl.appendChild(span);
      spans.push(span);
    }
    if (li < lines.length - 1) {
      // line break, typed as a space
      const span = document.createElement('span');
      span.textContent = ' ';
      lineEl.appendChild(span);
      spans.push(span);
    }
    box.appendChild(lineEl);
  });
  return spans;
};

export const ruleBoxStyle = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: '1.05rem',
  lineHeight: '1.9',
  textAlign: 'left',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  border: '1px solid #cbd5e1',
  borderRadius: '12px',
  padding: '1.25rem 1.5rem',
  backgroundColor: '#f8fafc',
  maxHeight: '50vh',
  overflowY: 'auto',
};

const cssText = (style) => Object.entries(style)
  .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v}`)
  .join(';');

// Dialog that cannot be closed until the student types the rule exactly and submits.
// submit(text) must resolve to { success, msg }; the returned promise resolves after a successful submit.
export const showExamRuleTyping = (rule, submit) => new Promise((resolve) => {
  const lines = ruleLines(rule);
  const target = lines.join(' ');

  Swal.fire({
    title: 'Exam rules',
    html: `
      <div style="text-align:left;color:#475569;margin-bottom:12px;">
        Type the rules below exactly as shown to confirm you have read and will follow them.
      </div>
      <div style="position:relative;">
        <div id="swal-rule-text" style="${cssText({ ...ruleBoxStyle, cursor: 'text' })}"></div>
        <textarea id="swal-rule-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;resize:none;border:none;cursor:text;"></textarea>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:0.9rem;">
        <span id="swal-rule-error" style="color:${COLOR_WRONG};"></span>
        <span id="swal-rule-progress" style="color:#64748b;">0 / ${target.length}</span>
      </div>
      <button type="button" id="swal-rule-submit" class="btn btn-primary w-100 py-2 mt-3" disabled>Submit</button>
    `,
    width: '800px',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showCloseButton: false,
    showConfirmButton: false,
    showCancelButton: false,
    didOpen: () => {
      const box = document.getElementById('swal-rule-text');
      const input = document.getElementById('swal-rule-input');
      const progress = document.getElementById('swal-rule-progress');
      const error = document.getElementById('swal-rule-error');
      const submitBtn = document.getElementById('swal-rule-submit');
      const spans = renderRuleText(box, lines);
      input.maxLength = target.length;

      const paint = () => {
        // Enter counts as the space at a line break
        if (input.value.includes('\n')) input.value = input.value.replace(/\n/g, ' ');
        const typed = input.value;
        spans.forEach((span, i) => {
          span.style.borderLeft = i === typed.length ? `2px solid ${COLOR_CORRECT}` : '';
          span.style.backgroundColor = '';
          if (i >= typed.length) {
            span.style.color = COLOR_PENDING;
          } else if (typed[i] === target[i]) {
            span.style.color = COLOR_CORRECT;
          } else {
            span.style.color = COLOR_WRONG;
            span.style.backgroundColor = '#fee2e2';
          }
        });
        spans[Math.min(typed.length, spans.length - 1)]?.scrollIntoView({ block: 'nearest' });
        progress.textContent = `${typed.length} / ${target.length}`;
        error.textContent = '';
        submitBtn.disabled = typed !== target;
      };

      input.addEventListener('input', paint);
      // typing it is the point, so no pasting or dropping text
      input.addEventListener('paste', (e) => e.preventDefault());
      input.addEventListener('drop', (e) => e.preventDefault());
      paint();
      setTimeout(() => input.focus(), 100);

      submitBtn.onclick = async () => {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style="width: 16px; height: 16px; border-width: 2px;"></span>
          Submitting...
        `;
        let result;
        try {
          result = await submit(input.value);
        } catch (e) {
          result = { success: false, msg: 'Failed to connect to server.' };
        }
        if (result && result.success) {
          Swal.close();
          resolve();
          return;
        }
        submitBtn.textContent = 'Submit';
        submitBtn.disabled = input.value !== target;
        error.textContent = (result && result.msg) || 'Please try again.';
      };
    },
  });
});

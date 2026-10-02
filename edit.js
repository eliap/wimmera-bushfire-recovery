/* Text polishing and comments for one section page. Requires store.js. */
(function(){
  'use strict';
  var sec = document.body.getAttribute('data-sec');
  if (!sec || !window.GStore) return;

  var TYPES = [
    ['image', 'Image here'],
    ['text',  'Rewrite this'],
    ['move',  'Move this'],
    ['add',   'Add something after this'],
    ['cut',   'Cut this'],
    ['check', 'Check this / needs a source'],
    ['other', 'Other note']
  ];
  var SEL = '.section > p, .section > h4, .section > ul > li, .section > ol > li, ' +
            '.section > .protocol, .section > .case, .section > .wefound, .section > .rule, ' +
            '.section > .needs, .section > .ph, .section > .scroller, .section > .demo > .case, .section .sec-head h1, .parthead .lede';

  var data = window.GStore.get(sec);
  var blocks = [], byKey = {};
  Array.prototype.forEach.call(document.querySelectorAll(SEL), function(el, i){
    var key = sec + ':' + i;
    el.setAttribute('data-edit', key);
    var b = { key: key, el: el, orig: el.innerHTML.trim(),
              txt: (el.textContent || '').trim().slice(0, 80) };
    blocks.push(b); byKey[key] = b;
  });
  /* Figures: comment on the whole figure, edit only its caption.
     Keyed by figure id so adding them does not shift the paragraph keys above. */
  Array.prototype.forEach.call(document.querySelectorAll('.section figure.fig[id]'), function(fig){
    var fkey = sec + ':' + fig.id;
    fig.setAttribute('data-edit', fkey);
    var alt = (fig.querySelector('img') || {}).alt || '';
    var fb = { key: fkey, el: fig, orig: fig.innerHTML.trim(), noEdit: true,
               txt: ('[Image] ' + (alt || (fig.textContent || '').trim())).slice(0, 80) };
    blocks.push(fb); byKey[fkey] = fb;
    var cap = fig.querySelector('figcaption');
    if (!cap) return;
    var ckey = fkey + ':caption';
    cap.setAttribute('data-edit', ckey);
    var cb = { key: ckey, el: cap, orig: cap.innerHTML.trim(),
               txt: ('[Caption] ' + (cap.textContent || '').trim()).slice(0, 80) };
    blocks.push(cb); byKey[ckey] = cb;
  });

  /* Portal boxes: each label and paragraph is its own block.
     Keyed by box number so adding them does not shift the paragraph keys above. */
  Array.prototype.forEach.call(document.querySelectorAll('.section .portal'), function(box, pi){
    Array.prototype.forEach.call(box.querySelectorAll(':scope > .lbl, :scope > p:not(.portalgo)'), function(el, j){
      var key = sec + ':portal' + pi + ':' + j;
      el.setAttribute('data-edit', key);
      var b = { key: key, el: el, orig: el.innerHTML.trim(),
                txt: ('[Portal box] ' + (el.textContent || '').trim()).slice(0, 80) };
      blocks.push(b); byKey[key] = b;
    });
  });

  function save(){ window.GStore.set(sec, data); paint(); }

  /* ---------- apply stored edits ---------- */
  var stale = 0;
  blocks.forEach(function(b){
    var e = data.edits[b.key];
    if (!e) return;
    if (e.orig === b.orig) { b.el.innerHTML = e.html; }
    else { e.drifted = true; stale++; }
  });

  /* ---------- painting ---------- */
  function typeLabel(t){
    for (var i = 0; i < TYPES.length; i++) if (TYPES[i][0] === t) return TYPES[i][1];
    return 'Note';
  }
  function paint(){
    blocks.forEach(function(b){
      var card = b.el.nextElementSibling;
      if (card && card.classList && card.classList.contains('notecard')) card.remove();
      b.el.classList.remove('edited', 'stale', 'hasnote');

      var e = data.edits[b.key];
      if (e) b.el.classList.add(e.drifted ? 'stale' : 'edited');

      var n = data.notes[b.key];
      if (!n) return;
      b.el.classList.add('hasnote');
      var c = document.createElement('div');
      c.className = 'notecard';
      c.innerHTML = '<span class="t"></span><p></p>' +
        (mode === 'note' ? '<button type="button" class="edit">Edit</button>' +
                           '<button type="button" class="del">Delete</button>' : '');
      c.querySelector('.t').textContent = typeLabel(n.type);
      c.querySelector('p').textContent = n.text || '';
      if (n.orig && b.txt && n.orig !== b.txt)
        c.insertAdjacentHTML('beforeend',
          '<span class="stalenote">The text here changed after this note was written</span>');
      c.addEventListener('click', function(ev){
        if (ev.target.classList.contains('del')) { delete data.notes[b.key]; save(); }
        if (ev.target.classList.contains('edit')) popup(b);
      });
      b.el.parentNode.insertBefore(c, b.el.nextSibling);
    });
    var ec = Object.keys(data.edits).length, nc = Object.keys(data.notes).length;
    badge('editcount', ec); badge('notecount', nc);
    var t = document.getElementById('savedstate');
    if (t) t.textContent = (ec || nc)
      ? (ec + (ec === 1 ? ' edit' : ' edits') + ', ' + nc + (nc === 1 ? ' comment' : ' comments') + ' on this page')
      : '';
  }
  function badge(id, n){
    var b = document.getElementById(id);
    if (!b) return;
    b.textContent = n ? String(n) : ''; b.hidden = !n;
  }

  /* ---------- comment popup ---------- */
  var pop = null;
  function closePop(){ if (pop) { pop.remove(); pop = null; } }
  function popup(b){
    closePop();
    var n = data.notes[b.key] || { type: 'other', text: '' };
    pop = document.createElement('div');
    pop.className = 'notepop';
    pop.innerHTML = '<label>What needs to change here?</label><select>' +
      TYPES.map(function(t){
        return '<option value="' + t[0] + '"' + (t[0] === n.type ? ' selected' : '') + '>' + t[1] + '</option>';
      }).join('') +
      '</select><textarea rows="3" placeholder="e.g. photo of a burnt trunk with epicormic shoots"></textarea>' +
      '<div class="row"><button type="button" class="save">Save comment</button>' +
      '<button type="button" class="cancel">Cancel</button></div>';
    pop.querySelector('textarea').value = n.text || '';
    b.el.parentNode.insertBefore(pop, b.el.nextSibling);
    pop.querySelector('textarea').focus();
    pop.addEventListener('click', function(ev){
      if (ev.target.classList.contains('cancel')) closePop();
      if (ev.target.classList.contains('save')) {
        var t = pop.querySelector('textarea').value.trim();
        if (t) data.notes[b.key] = { type: pop.querySelector('select').value, text: t,
                                    orig: b.txt, at: new Date().toISOString() };
        else delete data.notes[b.key];
        closePop(); save();
      }
    });
  }

  /* ---------- text editing ---------- */
  var timer = null;
  function capture(b){
    var now = b.el.innerHTML.trim();
    if (now === b.orig) { delete data.edits[b.key]; }
    else {
      data.edits[b.key] = { html: now, orig: b.orig, txt: b.txt,
                            at: new Date().toISOString() };
    }
    save();
  }
  function revert(b){
    b.el.innerHTML = b.orig;
    delete data.edits[b.key];
    save();
  }

  /* ---------- modes ---------- */
  var mode = null;   // null | 'text' | 'note'
  function setMode(m){
    mode = (mode === m) ? null : m;
    closePop();
    document.body.classList.toggle('editing',    mode === 'text');
    document.body.classList.toggle('commenting', mode === 'note');
    blocks.forEach(function(b){
      if (b.noEdit) return;
      b.el.contentEditable = (mode === 'text') ? 'true' : 'false';
      if (mode === 'text') b.el.setAttribute('spellcheck', 'true');
    });
    var eb = document.getElementById('editbtn'), nb = document.getElementById('notebtn');
    if (eb) eb.setAttribute('aria-pressed', mode === 'text' ? 'true' : 'false');
    if (nb) nb.setAttribute('aria-pressed', mode === 'note' ? 'true' : 'false');
    var hint = document.getElementById('modehint');
    if (hint) {
      hint.textContent = mode === 'text'
        ? 'Click into any paragraph and rewrite it. Saved as you type.'
        : (mode === 'note' ? 'Click any paragraph to leave a comment instead of changing it.' : '');
      hint.hidden = !mode;
    }
    paint();
  }

  document.addEventListener('click', function(ev){
    if (mode !== 'note') return;
    if (ev.target.closest('.notepop') || ev.target.closest('.notecard')) return;
    var el = ev.target.closest('[data-edit]');
    if (el) { ev.preventDefault(); popup(byKey[el.getAttribute('data-edit')]); }
  });

  var main = document.querySelector('main');
  if (main) {
    main.addEventListener('input', function(ev){
      if (mode !== 'text') return;
      var el = ev.target.closest && ev.target.closest('[data-edit]');
      if (!el) return;
      var b = byKey[el.getAttribute('data-edit')];
      clearTimeout(timer);
      timer = setTimeout(function(){ capture(b); }, 700);
    });
    main.addEventListener('blur', function(ev){
      if (mode !== 'text') return;
      var el = ev.target.closest && ev.target.closest('[data-edit]');
      if (el) { clearTimeout(timer); capture(byKey[el.getAttribute('data-edit')]); }
    }, true);
    /* keep pasted text plain */
    main.addEventListener('paste', function(ev){
      if (mode !== 'text') return;
      if (!ev.target.closest || !ev.target.closest('[data-edit]')) return;
      ev.preventDefault();
      var t = (ev.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, t);
    });
    /* alt-click a changed block to put it back */
    main.addEventListener('click', function(ev){
      if (mode !== 'text' || !ev.altKey) return;
      var el = ev.target.closest && ev.target.closest('[data-edit].edited, [data-edit].stale');
      if (el) { ev.preventDefault(); revert(byKey[el.getAttribute('data-edit')]); }
    });
  }

  var eb = document.getElementById('editbtn'), nb = document.getElementById('notebtn');
  if (eb) { eb.hidden = false; eb.addEventListener('click', function(){ setMode('text'); }); }
  if (nb) { nb.hidden = false; nb.addEventListener('click', function(){ setMode('note'); }); }

  if (stale) {
    var w = document.createElement('div');
    w.className = 'driftwarn';
    w.textContent = stale + (stale === 1 ? ' edit on this page was' : ' edits on this page were') +
      ' written against wording that has since changed, so it has not been reapplied. ' +
      'The marks are orange rather than blue — your wording is still in the export.';
    var m = document.querySelector('.section');
    if (m) m.insertBefore(w, m.firstChild);
  }

  paint();
})();

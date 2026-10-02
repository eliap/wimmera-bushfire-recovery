/* Notes page: everything you have changed or flagged, plus export/import. */
(function(){
  'use strict';
  var LABEL = { image:'Image here', text:'Rewrite this', move:'Move this',
                add:'Add something after this', cut:'Cut this',
                check:'Check this / needs a source', other:'Other note' };
  var wrap = document.getElementById('notelist');
  if (!wrap || !window.GStore) return;
  var esc = function(s){
    return String(s || '').replace(/[&<>]/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c];
    });
  };
  var strip = function(h){
    var d = document.createElement('div'); d.innerHTML = h || '';
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  };

  function render(){
    var secs = window.GStore.sections(), rows = [];
    secs.forEach(function(s){
      var d = window.GStore.get(s);
      Object.keys(d.edits).forEach(function(k){
        var e = d.edits[k];
        rows.push({ num:s, kind:'edit', was:strip(e.orig), now:strip(e.html), at:e.at });
      });
      Object.keys(d.notes).forEach(function(k){
        var n = d.notes[k];
        rows.push({ num:s, kind:'note', type:n.type, text:n.text, on:n.orig, at:n.at });
      });
    });
    rows.sort(function(a, b){
      var x = a.num.split('.').map(Number), y = b.num.split('.').map(Number);
      return (x[0]-y[0]) || (x[1]-y[1]) || (a.kind === b.kind ? 0 : a.kind === 'edit' ? -1 : 1);
    });

    var c = window.GStore.count();
    var pill = document.getElementById('ncount');
    if (pill) pill.textContent = String(c.edits + c.notes);

    if (!rows.length) {
      wrap.innerHTML = '<p class="muted">Nothing yet. Open any section, press ' +
        '<b>Edit text</b> to rewrite a paragraph, or <b>Comment</b> to flag one without changing it. ' +
        'Everything you do shows up here.</p>';
      return;
    }
    wrap.innerHTML =
      '<p class="muted">' + c.edits + (c.edits === 1 ? ' rewrite' : ' rewrites') + ' and ' +
      c.notes + (c.notes === 1 ? ' comment' : ' comments') +
      ', held in this browser only. Export when you want them applied to the master.</p>' +
      '<ol class="notelist">' + rows.map(function(r){
        if (r.kind === 'edit') {
          return '<li><span class="n">' + r.num + '</span>' +
            '<span class="tag t-edit">Rewritten</span>' +
            '<p class="was">' + esc(r.was) + '</p>' +
            '<p class="now">' + esc(r.now) + '</p></li>';
        }
        return '<li><span class="n">' + r.num + '</span>' +
          '<span class="tag t-' + r.type + '">' + (LABEL[r.type] || 'Note') + '</span>' +
          '<p>' + esc(r.text) + '</p>' +
          (r.on ? '<em>on: &ldquo;' + esc(r.on) + '&hellip;&rdquo;</em>' : '') + '</li>';
      }).join('') + '</ol>';
  }

  var tools = document.getElementById('edittools');
  if (tools) {
    tools.innerHTML =
      '<button type="button" id="send">Send my edits to Claude</button>' +
      '<button type="button" id="exp">Export my edits</button>' +
      '<label class="imp">Load an export file<input type="file" id="impf" accept="application/json,.json"></label>' +
      '<span id="expmsg" class="muted"></span>';
    var msg = document.getElementById('expmsg');
    document.getElementById('exp').addEventListener('click', function(){
      var c = window.GStore.count();
      if (!c.edits && !c.notes) { msg.textContent = 'Nothing to export yet.'; return; }
      Promise.resolve(window.GStore.download()).then(function(name){
        msg.textContent = name ? 'Saved ' + name + '. Put it in the fire project folder and tell Claude.' : 'Export cancelled.';
      });
    });
    document.getElementById('send').addEventListener('click', function(){
      var c = window.GStore.count();
      if (!c.edits && !c.notes) { msg.textContent = 'Nothing to send yet.'; return; }
      msg.textContent = 'Sending\u2026';
      window.GStore.sendAll().then(function(n){
        msg.textContent = n < 0
          ? 'Sending only works when the guide is open in claude.ai. Use Export instead.'
          : 'Sent ' + n + (n === 1 ? ' section' : ' sections') + '. Tell Claude in the chat and it will pick them up.';
      });
    });
    document.getElementById('impf').addEventListener('change', function(ev){
      var f = ev.target.files && ev.target.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function(){
        try {
          var n = window.GStore.importAll(JSON.parse(r.result));
          msg.textContent = 'Loaded edits for ' + n + (n === 1 ? ' section.' : ' sections.');
          render();
        } catch (e) { msg.textContent = 'That file could not be read.'; }
      };
      r.readAsText(f);
    });
  }
  render();
})();

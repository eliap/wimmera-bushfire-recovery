/* Local edit store. Works from file:// or any static host.
   Everything lives in this browser only until you export it. */
(function(){
  'use strict';
  var NS = 'bafg1:';
  var mode = 'memory', mem = {};
  try {
    window.localStorage.setItem(NS + '__t', '1');
    window.localStorage.removeItem(NS + '__t');
    mode = 'local';
  } catch (e) { mode = 'memory'; }

  /* Edits and comments Claude has already written into the guide itself.
     They are cleared from this browser when a page loads, so they don't
     show twice. Add each new batch's timestamps here when applying it. */
  var APPLIED = {};
  ["2026-09-28T02:54:01.598Z", "2026-09-28T03:02:34.844Z", "2026-09-28T02:54:02.426Z", "2026-09-28T02:54:29.588Z", "2026-09-28T02:55:04.872Z", "2026-09-28T02:55:28.364Z", "2026-09-28T02:55:34.933Z", "2026-09-28T02:55:51.237Z", "2026-09-28T03:02:26.184Z", "2026-09-28T02:59:09.150Z", "2026-09-28T02:59:48.572Z", "2026-09-28T03:00:31.326Z", "2026-09-28T03:01:23.312Z", "2026-09-28T02:57:44.866Z", "2026-09-28T03:17:32.334Z", "2026-09-28T03:16:34.863Z", "2026-09-28T03:17:11.041Z", "2026-09-28T03:17:28.160Z", "2026-09-28T03:33:26.782Z", "2026-09-28T03:34:19.530Z", "2026-09-28T03:56:10.219Z", "2026-09-28T05:13:07.156Z", "2026-09-28T05:12:25.249Z", "2026-09-28T07:20:20.688Z", "2026-09-28T07:21:04.566Z", "2026-09-28T07:21:26.074Z", "2026-09-28T07:21:47.511Z", "2026-09-28T07:37:35.989Z", "2026-09-28T07:35:59.657Z", "2026-09-28T07:37:11.057Z", "2026-09-28T07:37:09.291Z", "2026-09-28T07:38:55.469Z", "2026-09-28T07:23:17.165Z", "2026-09-28T07:23:23.547Z", "2026-09-28T07:23:45.325Z", "2026-09-28T07:28:01.142Z", "2026-09-28T07:40:51.202Z", "2026-09-28T07:41:58.337Z", "2026-09-28T07:49:50.921Z", "2026-09-28T07:50:04.033Z", "2026-09-28T07:50:48.518Z", "2026-09-28T07:51:37.585Z", "2026-09-28T07:49:36.896Z", "2026-09-28T07:50:33.195Z", "2026-09-28T07:26:14.335Z", "2026-09-28T07:26:47.800Z", "2026-09-28T07:27:37.832Z", "2026-09-28T07:27:43.003Z", "2026-09-28T07:25:25.535Z", "2026-09-28T07:26:01.625Z"].forEach(function(t){ APPLIED[t] = 1; });
  function prune(d){
    var changed = false;
    ['edits', 'notes'].forEach(function(k){
      var o = d[k] || {};
      Object.keys(o).forEach(function(key){
        if (o[key] && APPLIED[o[key].at]) { delete o[key]; changed = true; }
      });
    });
    return changed;
  }

  function read(sec){
    if (mode !== 'local') return mem[sec] || {};
    var d = {};
    try { var r = window.localStorage.getItem(NS + sec); d = r ? JSON.parse(r) : {}; }
    catch (e) { return {}; }
    if (prune(d)) write(sec, d);
    return d;
  }
  /* When the guide is open inside claude.ai, also copy each section's edits
     to the artifact's own database so Claude can read them. Elsewhere
     (GitHub Pages, file://) there is no database and this does nothing. */
  var dbp = null, timers = {};
  function getDb(){
    if (!dbp) {
      dbp = (window.claude && typeof window.claude.use === 'function')
        ? Promise.resolve(window.claude.use('db')).catch(function(){ return null; })
        : Promise.resolve(null);
      dbp.then(function(db){ if (!db) dbp = null; });
    }
    return dbp;
  }
  function push(sec, obj){
    return getDb().then(function(db){
      if (!db) return false;
      return db.doc('edits/' + sec).set({ sec: sec, data: JSON.stringify(obj || {}),
                                          savedAt: new Date().toISOString() })
        .then(function(){ return true; }, function(){ return false; });
    });
  }
  function queuePush(sec, obj){
    clearTimeout(timers[sec]);
    timers[sec] = setTimeout(function(){ push(sec, obj); }, 1500);
  }

  function write(sec, obj){
    queuePush(sec, obj);
    if (mode === 'local') {
      try { window.localStorage.setItem(NS + sec, JSON.stringify(obj)); return true; }
      catch (e) { mode = 'memory'; }
    }
    mem[sec] = obj;
    return mode === 'local';
  }

  var API = {
    mode: function(){ return mode; },
    get: function(sec){
      var d = read(sec);
      if (!d.edits) d.edits = {};
      if (!d.notes) d.notes = {};
      return d;
    },
    set: function(sec, obj){ return write(sec, obj); },
    sections: function(){
      if (mode !== 'local') return Object.keys(mem);
      var out = [];
      try {
        for (var i = 0; i < window.localStorage.length; i++) {
          var k = window.localStorage.key(i);
          if (k && k.indexOf(NS) === 0 && k.indexOf('__t') < 0) out.push(k.slice(NS.length));
        }
      } catch (e) {}
      return out.sort(function(a,b){
        var x = a.split('.').map(Number), y = b.split('.').map(Number);
        return (x[0]-y[0]) || (x[1]-y[1]);
      });
    },
    count: function(){
      var e = 0, n = 0;
      API.sections().forEach(function(s){
        var d = API.get(s);
        e += Object.keys(d.edits || {}).length;
        n += Object.keys(d.notes || {}).length;
      });
      return { edits: e, notes: n };
    },
    exportAll: function(){
      var out = { format: 'bush-after-fire-guide/edits', version: 1,
                  savedAt: new Date().toISOString(), sections: {} };
      API.sections().forEach(function(s){
        var d = API.get(s);
        if (Object.keys(d.edits).length || Object.keys(d.notes).length) out.sections[s] = d;
      });
      return out;
    },
    importAll: function(obj){
      if (!obj || !obj.sections) return 0;
      var n = 0;
      Object.keys(obj.sections).forEach(function(s){ API.set(s, obj.sections[s]); n++; });
      return n;
    },
    /* Copy every section's edits and comments to the database. Resolves the
       number of sections sent, or -1 when there is no database here. */
    sendAll: function(){
      return getDb().then(function(db){
        if (!db) return -1;
        var secs = API.sections().filter(function(s){
          var d = API.get(s);
          return Object.keys(d.edits).length || Object.keys(d.notes).length;
        });
        var chain = Promise.resolve(0);
        secs.forEach(function(s){
          chain = chain.then(function(n){ return push(s, API.get(s)).then(function(ok){ return n + (ok ? 1 : 0); }); });
        });
        return chain;
      });
    },
    download: function(){
      var data = API.exportAll();
      var name = 'guide-edits-' + new Date().toISOString().slice(0,10) + '.json';
      var text = JSON.stringify(data, null, 2);
      /* Inside claude.ai, downloads go through the viewer's own save prompt. */
      if (window.claude && typeof window.claude.use === 'function') {
        return Promise.resolve(window.claude.use('downloads')).then(function(dl){
          if (!dl) return plain();
          return dl.save({ filename: name, data: text }).then(function(){ return name; },
            function(err){ return err && err.code === 'declined' ? null : plain(); });
        }, plain);
      }
      return Promise.resolve(plain());
      function plain(){
      var blob = new Blob([text], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 2000);
      return name;
      }
    }
  };
  window.GStore = API;

  /* Tell the user plainly if nothing can be saved. */
  if (mode === 'memory') {
    document.addEventListener('DOMContentLoaded', function(){
      var b = document.createElement('div');
      b.className = 'storewarn';
      b.textContent = 'This browser is not letting the page save anything. Edits will be lost when you close the tab — export before you leave, or try a normal (not private) window.';
      document.body.insertBefore(b, document.body.firstChild);
    });
  }
})();

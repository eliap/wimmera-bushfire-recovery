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
  ["2026-10-03T04:01:18.623Z", "2026-10-03T04:00:41.423Z", "2026-10-03T04:27:05.180Z", "2026-10-03T04:56:36.791Z", "2026-10-03T03:40:57.840Z", "2026-10-03T03:40:59.187Z", "2026-10-03T03:41:06.349Z", "2026-10-03T03:42:05.649Z", "2026-10-03T03:44:12.803Z", "2026-10-03T03:45:34.873Z", "2026-10-03T03:46:59.506Z", "2026-10-03T03:47:31.413Z", "2026-10-03T03:43:49.977Z", "2026-10-03T03:48:13.221Z", "2026-10-03T03:52:40.052Z", "2026-10-03T03:53:31.813Z", "2026-10-03T03:57:00.918Z", "2026-10-03T03:57:17.950Z", "2026-10-03T03:59:34.797Z", "2026-10-03T03:54:26.643Z", "2026-10-03T03:55:19.251Z", "2026-10-03T03:57:57.200Z", "2026-10-03T03:58:38.255Z", "2026-10-03T03:59:19.791Z", "2026-10-03T03:59:48.803Z", "2026-10-03T03:59:59.427Z", "2026-10-02T05:22:38.360Z", "2026-10-02T05:23:36.652Z", "2026-10-02T05:24:05.941Z", "2026-10-02T05:26:54.529Z", "2026-10-02T05:28:01.290Z", "2026-10-02T05:27:55.704Z", "2026-10-02T05:30:01.794Z", "2026-10-02T05:25:59.122Z", "2026-10-02T05:28:15.368Z", "2026-10-02T03:56:34.489Z", "2026-10-02T03:49:39.670Z", "2026-10-02T03:49:42.602Z", "2026-10-02T03:47:09.377Z", "2026-10-02T03:50:18.855Z", "2026-10-02T01:20:38.859Z", "2026-10-02T02:35:20.900Z", "2026-10-02T02:36:57.342Z", "2026-10-02T02:39:07.649Z", "2026-10-02T02:40:04.685Z", "2026-10-02T02:41:13.765Z", "2026-10-02T02:41:48.531Z", "2026-10-02T02:40:43.867Z", "2026-10-02T02:44:18.725Z", "2026-10-02T02:57:56.959Z", "2026-10-02T02:50:54.762Z", "2026-10-02T02:50:55.880Z", "2026-10-02T02:50:56.739Z", "2026-10-02T02:50:57.646Z", "2026-10-02T02:51:00.291Z", "2026-10-02T02:59:29.512Z", "2026-10-02T02:47:43.632Z", "2026-10-02T02:49:45.203Z", "2026-10-02T02:59:50.007Z", "2026-10-02T03:08:47.414Z", "2026-10-02T03:03:46.827Z", "2026-10-02T03:03:49.378Z", "2026-10-02T03:03:52.022Z", "2026-10-02T03:03:53.762Z", "2026-10-02T03:03:57.907Z", "2026-10-02T03:01:55.525Z", "2026-10-02T03:02:23.815Z", "2026-10-02T03:02:32.487Z", "2026-10-02T03:03:30.175Z", "2026-10-02T03:21:13.614Z", "2026-10-02T03:11:27.914Z", "2026-10-02T03:11:56.651Z", "2026-10-02T03:23:26.294Z", "2026-10-02T03:14:01.320Z", "2026-10-02T03:15:58.168Z", "2026-10-02T03:23:37.735Z", "2026-10-02T03:16:35.532Z", "2026-10-02T03:17:22.404Z", "2026-10-02T03:17:50.932Z", "2026-10-02T03:20:01.380Z", "2026-10-02T03:20:21.209Z", "2026-10-02T03:24:26.270Z", "2026-10-02T03:25:43.215Z", "2026-10-02T03:27:16.533Z", "2026-10-02T03:27:12.277Z", "2026-10-02T03:27:13.124Z", "2026-10-02T03:27:13.815Z", "2026-10-02T03:27:14.795Z", "2026-10-02T03:27:19.100Z", "2026-10-02T03:16:24.165Z", "2026-10-02T03:20:43.082Z", "2026-10-02T03:24:08.506Z", "2026-10-02T03:26:26.020Z", "2026-10-02T03:26:46.183Z", "2026-10-02T03:27:22.738Z", "2026-10-02T03:28:24.982Z", "2026-10-02T03:29:16.985Z", "2026-10-02T03:29:34.127Z", "2026-10-02T03:31:58.955Z", "2026-10-02T03:32:04.177Z", "2026-10-02T03:34:12.838Z", "2026-10-02T03:34:07.260Z", "2026-10-02T03:36:05.544Z", "2026-10-02T03:34:58.012Z", "2026-10-02T01:19:46.628Z", "2026-10-02T01:20:57.501Z", "2026-10-02T01:23:49.967Z", "2026-10-02T01:24:03.429Z", "2026-10-02T01:31:52.136Z", "2026-10-02T01:31:43.922Z", "2026-10-02T01:31:44.619Z", "2026-09-28T02:54:01.598Z", "2026-09-28T03:02:34.844Z", "2026-09-28T02:54:02.426Z", "2026-09-28T02:54:29.588Z", "2026-09-28T02:55:04.872Z", "2026-09-28T02:55:28.364Z", "2026-09-28T02:55:34.933Z", "2026-09-28T02:55:51.237Z", "2026-09-28T03:02:26.184Z", "2026-09-28T02:59:09.150Z", "2026-09-28T02:59:48.572Z", "2026-09-28T03:00:31.326Z", "2026-09-28T03:01:23.312Z", "2026-09-28T02:57:44.866Z", "2026-09-28T03:17:32.334Z", "2026-09-28T03:16:34.863Z", "2026-09-28T03:17:11.041Z", "2026-09-28T03:17:28.160Z", "2026-09-28T03:33:26.782Z", "2026-09-28T03:34:19.530Z", "2026-09-28T03:56:10.219Z", "2026-09-28T05:13:07.156Z", "2026-09-28T05:12:25.249Z", "2026-09-28T07:20:20.688Z", "2026-09-28T07:21:04.566Z", "2026-09-28T07:21:26.074Z", "2026-09-28T07:21:47.511Z", "2026-09-28T07:37:35.989Z", "2026-09-28T07:35:59.657Z", "2026-09-28T07:37:11.057Z", "2026-09-28T07:37:09.291Z", "2026-09-28T07:38:55.469Z", "2026-09-28T07:23:17.165Z", "2026-09-28T07:23:23.547Z", "2026-09-28T07:23:45.325Z", "2026-09-28T07:28:01.142Z", "2026-09-28T07:40:51.202Z", "2026-09-28T07:41:58.337Z", "2026-09-28T07:49:50.921Z", "2026-09-28T07:50:04.033Z", "2026-09-28T07:50:48.518Z", "2026-09-28T07:51:37.585Z", "2026-09-28T07:49:36.896Z", "2026-09-28T07:50:33.195Z", "2026-09-28T07:26:14.335Z", "2026-09-28T07:26:47.800Z", "2026-09-28T07:27:37.832Z", "2026-09-28T07:27:43.003Z", "2026-09-28T07:25:25.535Z", "2026-09-28T07:26:01.625Z"].forEach(function(t){ APPLIED[t] = 1; });
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

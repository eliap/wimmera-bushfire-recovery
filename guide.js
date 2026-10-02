/* Light / dark mode. Shares its saved choice ("bfp:theme") with the lookup tool. */
(function(){
  var root=document.documentElement, btn=document.getElementById('themebtn');
  var sun='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
  var moon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  function isDark(){ return root.getAttribute('data-theme')==='dark'; }
  function apply(dark){ if(dark) root.setAttribute('data-theme','dark'); else root.removeAttribute('data-theme'); paint(); }
  function paint(){ if(!btn) return; var d=isDark(); btn.setAttribute('aria-pressed',String(d)); btn.innerHTML=(d?sun:moon)+'<span>'+(d?'Light mode':'Dark mode')+'</span>'; }
  if(btn) btn.addEventListener('click',function(){
    var d=!isDark(); apply(d);
    try{ localStorage.setItem('bfp:theme', d?'dark':'light'); }catch(e){}
  });
  /* another open tab (the guide or the lookup tool) changed the mode */
  window.addEventListener('storage',function(e){ if(e.key==='bfp:theme') apply(e.newValue==='dark'); });
  paint();
})();

(function(){
  'use strict';
  var t=document.getElementById('railtoggle'), rail=document.getElementById('rail');
  if(t&&rail) t.addEventListener('click',function(){
    var open=rail.classList.toggle('open');
    t.setAttribute('aria-expanded',open?'true':'false');
  });
  var q=document.getElementById('q'), box=document.getElementById('results'), idx=null;
  if(!q||!box) return;
  function load(){
    if(idx) return Promise.resolve(idx);
    if (window.SEARCH_INDEX) { idx = window.SEARCH_INDEX; return Promise.resolve(idx); }
    return fetch('search.json').then(function(r){return r.json();})
      .then(function(d){ idx = d; return d; })
      .catch(function(){ idx = []; return idx; });
  }
  function esc(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function render(list,term){
    if(!list.length){ box.innerHTML='<div class="none">Nothing found for &ldquo;'+esc(term)+'&rdquo;</div>'; box.hidden=false; return; }
    box.innerHTML=list.slice(0,8).map(function(r){
      var i=r.x.indexOf(term), snip='';
      if(i>-1){ var s=Math.max(0,i-45); snip=(s?'&hellip;':'')+esc(r.x.slice(s,i+term.length+65))+'&hellip;'; }
      return '<a href="'+r.f+'"><b><span class="n">'+r.n+'</span>'+esc(r.t)+'</b>'+snip+'</a>';
    }).join('');
    box.hidden=false;
  }
  var timer;
  q.addEventListener('input',function(){
    clearTimeout(timer);
    var term=q.value.trim().toLowerCase();
    if(term.length<2){ box.hidden=true; return; }
    timer=setTimeout(function(){
      load().then(function(d){
        render(d.filter(function(r){return r.t.toLowerCase().indexOf(term)>-1||r.x.indexOf(term)>-1;})
                .sort(function(a,b){
                  var at=a.t.toLowerCase().indexOf(term)>-1?0:1, bt=b.t.toLowerCase().indexOf(term)>-1?0:1;
                  return at-bt;
                }), term);
      }).catch(function(){ box.innerHTML='<div class="none">Search needs the site to be served over the web.</div>'; box.hidden=false; });
    },120);
  });
  q.addEventListener('focus',load);
  document.addEventListener('click',function(e){
    if(!box.hidden && !box.contains(e.target) && e.target!==q) box.hidden=true;
  });
  q.addEventListener('keydown',function(e){ if(e.key==='Escape'){ box.hidden=true; q.blur(); } });
})();

/* Portal links open in a new tab on the public site. Inside the claude.ai
   preview a new tab can't show a page from this guide, so there they open in place. */
(function(){
  var inPreview = typeof window.claude !== 'undefined' ||
    /claude\.ai|claudeusercontent/.test(location.hostname + ' ' + document.referrer);
  if (!inPreview) return;
  Array.prototype.forEach.call(document.querySelectorAll('a[href="block-fire-profile.html"][target]'), function(a){
    a.removeAttribute('target');
  });
})();

/* Always open a page at the top (unless the link points at a spot on the page).
   Some viewers, including the claude.ai preview, otherwise keep the old scroll position. */
(function(){
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  function toTop(){ if (!location.hash) window.scrollTo(0, 0); }
  toTop();
  window.addEventListener('DOMContentLoaded', toTop);
  window.addEventListener('load', function(){ toTop(); setTimeout(toTop, 50); });
  window.addEventListener('pageshow', function(ev){ if (ev.persisted) toTop(); });
})();

/* Click-through figures (figure.fig.slides): show one image at a time with previous / next and a button per image. */
(function(){
  Array.prototype.forEach.call(document.querySelectorAll('figure.fig.slides'), function(fig){
    var items = fig.querySelectorAll('.fi');
    if (items.length < 2) return;
    /* load every image up front so clicking through doesn't wait on the next one */
    Array.prototype.forEach.call(fig.querySelectorAll('img'), function(im){ im.loading = 'eager'; var pre = new Image(); pre.src = im.currentSrc || im.src; });
    var i = 0, nav = document.createElement('div');
    nav.className = 'slidenav';
    var prev = document.createElement('button'); prev.type = 'button'; prev.className = 'step'; prev.textContent = '‹'; prev.setAttribute('aria-label', 'Previous image');
    var next = document.createElement('button'); next.type = 'button'; next.className = 'step'; next.textContent = '›'; next.setAttribute('aria-label', 'Next image');
    nav.appendChild(prev);
    var dots = Array.prototype.map.call(items, function(fi, k){
      var lab = fi.querySelector('.lab'), b = document.createElement('button');
      b.type = 'button'; b.textContent = lab ? lab.textContent : String(k + 1);
      b.addEventListener('click', function(){ show(k); });
      nav.appendChild(b); return b;
    });
    nav.appendChild(next);
    function show(k){
      i = (k + items.length) % items.length;
      Array.prototype.forEach.call(items, function(fi, n){ fi.classList.toggle('on', n === i); });
      dots.forEach(function(d, n){ d.setAttribute('aria-current', n === i ? 'true' : 'false'); });
    }
    prev.addEventListener('click', function(){ show(i - 1); });
    next.addEventListener('click', function(){ show(i + 1); });
    Array.prototype.forEach.call(items, function(fi){ var img = fi.querySelector('img'); if (img) img.addEventListener('click', function(){ show(i + 1); }); });
    fig.querySelector('.fimgs').insertAdjacentElement('afterend', nav);
    show(0);
  });
})();

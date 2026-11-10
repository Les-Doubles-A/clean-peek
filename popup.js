import { cleanUrl, baseDomain, trackerInfo, isTrackingCookie, cookieUrl } from './shared.js';

const $ = (s) => document.querySelector(s);

// Création DOM sûre (les noms de cookies et domaines ne sont jamais interprétés comme du HTML)
function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  e.append(...kids);
  return e;
}

let tab, pageHost;

async function init() {
  [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  document.querySelectorAll('nav button').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('nav button').forEach((x) => x.classList.toggle('active', x === b));
      document.querySelectorAll('main section').forEach((s) => (s.hidden = s.id !== b.dataset.tab));
    })
  );

  const { enabled = true } = await chrome.storage.local.get('enabled');
  $('#auto').checked = enabled;
  $('#auto').addEventListener('change', (e) => chrome.storage.local.set({ enabled: e.target.checked }));

  if (!tab?.url || !/^https?:/.test(tab.url)) {
    ['#url', '#cookies', '#trackers'].forEach((s) => $(s).replaceChildren(h('div', { class: 'empty' }, 'Page non analysable.')));
    return;
  }
  pageHost = new URL(tab.url).hostname;
  renderUrl();
  renderCookies();
  renderTrackers();
}

function renderUrl() {
  const { url, removed } = cleanUrl(tab.url);
  const copy = h('button', { class: 'btn primary', onclick: async () => {
    await navigator.clipboard.writeText(url);
    copy.textContent = 'Copié ✓';
  } }, 'Copier l\'URL propre');
  const apply = h('button', { class: 'btn', onclick: () => chrome.tabs.update(tab.id, { url }) }, 'Recharger sans tracking');

  $('#url').replaceChildren(
    h('div', { class: 'label' }, 'URL actuelle'),
    h('div', { class: 'url-box' }, tab.url),
    h('div', { class: 'label' }, removed ? `URL nettoyée (${removed} paramètre${removed > 1 ? 's' : ''} retiré${removed > 1 ? 's' : ''})` : 'Aucun paramètre de tracking'),
    h('div', { class: 'url-box' }, url),
    h('div', { class: 'toolbar' }, copy, removed ? apply : h('span'))
  );
}

async function renderCookies() {
  const root = $('#cookies');
  const cookies = await chrome.cookies.getAll({ url: tab.url });
  cookies.sort((a, b) => isTrackingCookie(b.name) - isTrackingCookie(a.name) || a.name.localeCompare(b.name));

  const trackingCount = cookies.filter((c) => isTrackingCookie(c.name)).length;
  const purge = h('button', { class: 'btn danger', onclick: async () => {
    await purgeTrackingCookies();
    renderCookies(); renderTrackers();
  } }, 'Supprimer les cookies de suivi');

  root.replaceChildren(
    h('div', { class: 'toolbar' }, h('span', { class: 'meta' }, `${cookies.length} cookie(s) · ${trackingCount} de suivi probable`), purge)
  );
  if (!cookies.length) root.append(h('div', { class: 'empty' }, 'Aucun cookie pour cette page.'));

  for (const c of cookies) {
    const exp = c.session ? 'Session' : new Date(c.expirationDate * 1000).toLocaleDateString('fr-FR');
    const flags = [c.secure && 'Secure', c.httpOnly && 'HttpOnly', c.sameSite && c.sameSite !== 'unspecified' && `SameSite=${c.sameSite}`].filter(Boolean).join(' · ');
    root.append(
      h('div', { class: 'row' },
        h('div', {},
          h('div', { class: 'name' }, isTrackingCookie(c.name) ? h('span', { class: 'tag bad' }, 'suivi') : '', c.name),
          h('div', { class: 'meta' }, `${c.domain} · expire : ${exp}`),
          h('div', { class: 'meta' }, flags)
        ),
        h('button', { class: 'x', title: 'Supprimer', onclick: async () => {
          await chrome.cookies.remove({ url: cookieUrl(c), name: c.name, storeId: c.storeId });
          renderCookies();
        } }, '✕')
      )
    );
  }
}

async function getTrackerData() {
  const key = 't' + tab.id;
  return (await chrome.storage.session.get(key))[key] || { hosts: {} };
}

async function renderTrackers() {
  const root = $('#trackers');
  const { hosts } = await getTrackerData();
  const entries = Object.entries(hosts).map(([host, n]) => ({ host, n, cat: trackerInfo(host) }));
  entries.sort((a, b) => (!!b.cat - !!a.cat) || b.n - a.n);

  const known = entries.filter((e) => e.cat).length;
  root.replaceChildren(
    h('div', { class: 'toolbar' }, h('span', { class: 'meta' }, `${entries.length} domaine(s) tiers · ${known} traqueur(s) connu(s)`))
  );
  if (!entries.length) {
    root.append(h('div', { class: 'empty' }, 'Aucune requête tierce détectée. Recharge la page si l\'extension vient d\'être installée.'));
    return;
  }
  for (const e of entries) {
    root.append(
      h('div', { class: 'row' },
        h('div', {}, h('div', { class: 'name' }, e.host), h('div', { class: 'meta' }, `${e.n} requête(s)`)),
        e.cat ? h('span', { class: 'tag bad' }, e.cat) : h('span', { class: 'tag' }, 'tiers')
      )
    );
  }
}

// Supprime les cookies de suivi du site et tous les cookies des traqueurs connus détectés sur la page
async function purgeTrackingCookies() {
  const own = await chrome.cookies.getAll({ url: tab.url });
  const toRemove = own.filter((c) => isTrackingCookie(c.name));

  const { hosts = {} } = await getTrackerData();
  const domains = new Set(Object.keys(hosts).filter((x) => trackerInfo(x)).map(baseDomain));
  for (const d of domains) toRemove.push(...(await chrome.cookies.getAll({ domain: d })));

  await Promise.all(toRemove.map((c) => chrome.cookies.remove({ url: cookieUrl(c), name: c.name, storeId: c.storeId })));
}

init();

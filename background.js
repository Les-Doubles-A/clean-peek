import { TRACKING_PARAMS, cleanUrl, baseDomain, trackerInfo } from './shared.js';

const CHUNK = 6; // petits regex : la limite de Chrome est de 2 Ko compilés par règle

async function applyRule(enabled) {
  const esc = (p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rules = [];
  if (enabled) {
    for (let i = 0; i < TRACKING_PARAMS.length; i += CHUNK) {
      const group = TRACKING_PARAMS.slice(i, i + CHUNK).map(esc);
      rules.push({
        id: rules.length + 1,
        priority: 1,
        // Chaque règle retire TOUS les paramètres ; le regex ne sert qu'à éviter une boucle de redirection
        action: { type: 'redirect', redirect: { transform: { queryTransform: { removeParams: TRACKING_PARAMS } } } },
        condition: { regexFilter: '[?&](?:' + group.join('|') + ')=', resourceTypes: ['main_frame'] }
      });
    }
  }
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((r) => r.id),
    addRules: rules
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  const { enabled = true } = await chrome.storage.local.get('enabled');
  await chrome.storage.local.set({ enabled });
  await applyRule(enabled);
  chrome.action.setBadgeBackgroundColor({ color: '#d93025' });
  chrome.contextMenus.create({ id: 'copy-clean', title: 'Copier le lien nettoyé', contexts: ['link'] });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.enabled) applyRule(changes.enabled.newValue);
});

// Menu contextuel : copie du lien nettoyé
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'copy-clean' || !info.linkUrl || !tab) return;
  let text = info.linkUrl;
  try { text = cleanUrl(info.linkUrl).url; } catch {}
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (t) => navigator.clipboard.writeText(t),
    args: [text]
  });
});

// Détection des requêtes tierces, par onglet (stockage session : le worker peut s'endormir)
let chain = Promise.resolve();

chrome.webRequest.onBeforeRequest.addListener(
  (d) => {
    if (d.tabId < 0) return;
    chain = chain.then(() => record(d)).catch(() => {});
  },
  { urls: ['<all_urls>'] }
);

async function record(d) {
  const key = 't' + d.tabId;
  let data = (await chrome.storage.session.get(key))[key] || { page: '', hosts: {} };
  const host = new URL(d.url).hostname;

  if (d.type === 'main_frame') {
    data = { page: host, hosts: {} };
  } else {
    if (!data.page) {
      try { data.page = new URL(d.documentUrl || d.initiator).hostname; } catch {}
    }
    if (!data.page || baseDomain(host) === baseDomain(data.page)) return;
    data.hosts[host] = (data.hosts[host] || 0) + 1;
  }

  await chrome.storage.session.set({ [key]: data });
  const known = Object.keys(data.hosts).filter((h) => trackerInfo(h)).length;
  chrome.action.setBadgeText({ tabId: d.tabId, text: known ? String(known) : '' }).catch(() => {});
}

chrome.tabs.onRemoved.addListener((id) => chrome.storage.session.remove('t' + id));

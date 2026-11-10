// Paramètres d'URL de tracking (noms exacts)
export const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'utm_name',
  'fbclid', 'gclid', 'gclsrc', 'dclid', 'gbraid', 'wbraid', 'msclkid', 'twclid', 'ttclid',
  'li_fat_id', 'mc_eid', 'mc_cid', 'igshid', 'yclid', '_hsenc', '_hsmi', 'mkt_tok',
  'ref_src', 'vero_id', 'oly_enc_id', 'source'
];

// Domaines de traqueurs connus -> catégorie
export const TRACKER_DOMAINS = {
  'google-analytics.com': 'Analytics', 'googletagmanager.com': 'Analytics',
  'analytics.google.com': 'Analytics', 'hotjar.com': 'Analytics', 'clarity.ms': 'Analytics',
  'segment.io': 'Analytics', 'segment.com': 'Analytics', 'mixpanel.com': 'Analytics',
  'amplitude.com': 'Analytics', 'matomo.cloud': 'Analytics', 'plausible.io': 'Analytics',
  'fullstory.com': 'Analytics', 'newrelic.com': 'Analytics', 'sentry.io': 'Analytics',
  'doubleclick.net': 'Publicité', 'googlesyndication.com': 'Publicité',
  'googleadservices.com': 'Publicité', 'adnxs.com': 'Publicité', 'criteo.com': 'Publicité',
  'criteo.net': 'Publicité', 'taboola.com': 'Publicité', 'outbrain.com': 'Publicité',
  'amazon-adsystem.com': 'Publicité', 'rubiconproject.com': 'Publicité',
  'pubmatic.com': 'Publicité', 'openx.net': 'Publicité', 'adsrvr.org': 'Publicité',
  'bing.com': 'Publicité', 'scorecardresearch.com': 'Mesure d\'audience',
  'facebook.net': 'Réseaux sociaux', 'facebook.com': 'Réseaux sociaux',
  'connect.facebook.net': 'Réseaux sociaux', 'twitter.com': 'Réseaux sociaux',
  'ads-twitter.com': 'Réseaux sociaux', 'linkedin.com': 'Réseaux sociaux',
  'licdn.com': 'Réseaux sociaux', 'tiktok.com': 'Réseaux sociaux',
  'snapchat.com': 'Réseaux sociaux', 'pinterest.com': 'Réseaux sociaux',
  'hubspot.com': 'Marketing', 'hs-analytics.net': 'Marketing', 'marketo.net': 'Marketing',
  'optimizely.com': 'Marketing', 'branch.io': 'Marketing'
};

export function isTrackingParam(name) {
  return name.startsWith('utm_') || TRACKING_PARAMS.includes(name);
}

export function cleanUrl(input) {
  const url = new URL(input);
  let removed = 0;
  for (const key of [...url.searchParams.keys()]) {
    if (isTrackingParam(key)) { url.searchParams.delete(key); removed++; }
  }
  return { url: url.toString(), removed };
}

// Domaine de base approximatif (sans liste des suffixes publics)
export function baseDomain(host) {
  const p = host.split('.');
  if (p.length <= 2) return host;
  const sld = ['co', 'com', 'org', 'net', 'gov', 'ac'];
  if (p[p.length - 1].length === 2 && sld.includes(p[p.length - 2])) return p.slice(-3).join('.');
  return p.slice(-2).join('.');
}

export function trackerInfo(host) {
  for (const [d, cat] of Object.entries(TRACKER_DOMAINS)) {
    if (host === d || host.endsWith('.' + d)) return cat;
  }
  return null;
}

const COOKIE_RE = /^(_ga|_gid|_gat|_gcl_|_fbp|_fbc|_hj|__utm|_pk_|ajs_|amplitude|mp_|_clck|_clsk|IDE$|fr$|MUID|_uet|_tt_|_scid|__hs|_dc_gtm|NID$)/i;
export const isTrackingCookie = (name) => COOKIE_RE.test(name);

export function cookieUrl(c) {
  return (c.secure ? 'https://' : 'http://') + c.domain.replace(/^\./, '') + c.path;
}

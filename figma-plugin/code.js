// ============================================================
// PEREZOSO — Figma Screen Generator
// Generates 4 main screens: Login, Dashboard, Subscriptions, Form
// ============================================================

figma.showUI(__html__, { width: 260, height: 280 });

// ── DESIGN TOKENS ────────────────────────────────────────────
const C = {
  bg:           { r: 0.969, g: 0.973, b: 0.980 }, // #F7F8FA
  white:        { r: 1,     g: 1,     b: 1     },
  border:       { r: 0.910, g: 0.918, b: 0.929 }, // #E8EAED
  accent:       { r: 0.388, g: 0.400, b: 0.945 }, // #6366F1
  accentLight:  { r: 0.933, g: 0.945, b: 1.000 }, // #EEF2FF
  accentDark:   { r: 0.263, g: 0.220, b: 0.792 }, // #4338CA
  textPrimary:  { r: 0.051, g: 0.059, b: 0.071 }, // #0D0F12
  textSecond:   { r: 0.361, g: 0.388, b: 0.439 }, // #5C6370
  textMuted:    { r: 0.608, g: 0.639, b: 0.686 }, // #9BA3AF
  success:      { r: 0.063, g: 0.725, b: 0.506 }, // #10B981
  warning:      { r: 0.961, g: 0.620, b: 0.043 }, // #F59E0B
  danger:       { r: 0.937, g: 0.267, b: 0.267 }, // #EF4444
  indigo50:     { r: 0.933, g: 0.945, b: 1.000 },
  violet100:    { r: 0.929, g: 0.910, b: 0.996 },
  emerald50:    { r: 0.925, g: 0.984, b: 0.961 },
  emerald700:   { r: 0.051, g: 0.600, b: 0.412 },
  amber50:      { r: 1.000, g: 0.976, b: 0.933 },
  amber700:     { r: 0.718, g: 0.451, b: 0.000 },
  blue50:       { r: 0.937, g: 0.965, b: 1.000 },
  blue700:      { r: 0.027, g: 0.388, b: 0.804 },
  gray100:      { r: 0.949, g: 0.953, b: 0.957 },
  red50:        { r: 1.000, g: 0.941, b: 0.941 },
  red700:       { r: 0.749, g: 0.071, b: 0.071 },
};

// ── HELPERS ──────────────────────────────────────────────────

function rgb(c) { return { type: 'SOLID', color: c }; }
function rgba(c, a) { return { type: 'SOLID', color: c, opacity: a }; }

async function loadFonts() {
  await Promise.all([
    figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
    figma.loadFontAsync({ family: 'Inter', style: 'Medium' }),
    figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' }),
    figma.loadFontAsync({ family: 'Inter', style: 'Bold' }),
    figma.loadFontAsync({ family: 'Inter', style: 'Extra Bold' }),
  ]);
}

function frame(name, w, h) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(w, h);
  f.fills = [rgb(C.white)];
  f.cornerRadius = 0;
  return f;
}

function rect(name, w, h, color, radius = 0) {
  const r = figma.createRectangle();
  r.name = name;
  r.resize(w, h);
  r.fills = [rgb(color)];
  r.cornerRadius = radius;
  return r;
}

function text(content, size, weight, color, opts = {}) {
  const t = figma.createText();
  t.characters = String(content);
  t.fontSize = size;
  t.fills = [rgb(color)];
  const styles = { Regular: 'Regular', Medium: 'Medium', SemiBold: 'Semi Bold', Bold: 'Bold', ExtraBold: 'Extra Bold' };
  t.fontName = { family: 'Inter', style: styles[weight] || 'Regular' };
  if (opts.width) { t.textAutoResize = 'HEIGHT'; t.resize(opts.width, 20); }
  if (opts.align) t.textAlignHorizontal = opts.align;
  if (opts.lineHeight) t.lineHeight = { unit: 'PIXELS', value: opts.lineHeight };
  if (opts.letterSpacing) t.letterSpacing = { unit: 'PERCENT', value: opts.letterSpacing };
  return t;
}

function pill(label, bg, fg, radius = 999) {
  const g = figma.createFrame();
  g.name = 'Badge/' + label;
  g.layoutMode = 'HORIZONTAL';
  g.paddingLeft = g.paddingRight = 8;
  g.paddingTop = g.paddingBottom = 3;
  g.cornerRadius = radius;
  g.fills = [rgb(bg)];
  g.primaryAxisSizingMode = 'AUTO';
  g.counterAxisSizingMode = 'AUTO';
  const t2 = text(label, 10, 'Medium', fg);
  g.appendChild(t2);
  return g;
}

function card(name, w, h) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(w, h);
  f.fills = [rgb(C.white)];
  f.cornerRadius = 20;
  f.strokes = [rgba(C.border, 0.8)];
  f.strokeWeight = 1;
  f.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.05 },
    offset: { x: 0, y: 2 },
    radius: 12, spread: 0, visible: true, blendMode: 'NORMAL',
  }];
  return f;
}

function avatar(initials, bgColor, size = 40) {
  const g = figma.createFrame();
  g.name = 'Avatar/' + initials;
  g.resize(size, size);
  g.fills = [rgb(bgColor)];
  g.cornerRadius = size * 0.28;
  const t2 = text(initials, size * 0.3, 'Bold', C.white);
  t2.x = size / 2 - (initials.length > 1 ? size * 0.17 : size * 0.09);
  t2.y = size / 2 - size * 0.17;
  g.appendChild(t2);
  return g;
}

function statusBadge(status) {
  const map = {
    Active:    { bg: C.emerald50, fg: C.emerald700 },
    Trial:     { bg: C.blue50,    fg: C.blue700    },
    Paused:    { bg: C.amber50,   fg: C.amber700   },
    Cancelled: { bg: C.gray100,   fg: C.textMuted  },
  };
  const s = map[status] || map['Active'];
  return pill(status, s.bg, s.fg);
}

function divider(w) {
  const r = figma.createRectangle();
  r.name = 'Divider';
  r.resize(w, 1);
  r.fills = [rgb(C.border)];
  r.opacity = 0.5;
  return r;
}

// ── SCREEN: MOBILE SHELL ────────────────────────────────────

function mobileShell(name) {
  const shell = figma.createFrame();
  shell.name = name;
  shell.resize(390, 844);
  shell.fills = [rgb(C.bg)];
  shell.clipsContent = true;

  // Status bar area
  const sb = rect('StatusBar', 390, 44, C.bg);
  sb.x = 0; sb.y = 0;
  shell.appendChild(sb);

  return shell;
}

// ── SCREEN 1: LOGIN ─────────────────────────────────────────

function buildLogin() {
  const s = mobileShell('📱 Login');

  // Background gradient hint
  const grad = rect('GradientHint', 390, 300, C.indigo50);
  grad.x = 0; grad.y = 0; grad.opacity = 0.5;
  s.appendChild(grad);

  // Logo
  const logoBox = rect('LogoBox', 56, 56, C.accent, 16);
  logoBox.x = 167; logoBox.y = 180;
  s.appendChild(logoBox);

  const logoText = text('P', 26, 'ExtraBold', C.white);
  logoText.x = 180; logoText.y = 193;
  s.appendChild(logoText);

  // Brand name
  const brand = text('Perezoso', 22, 'Bold', C.textPrimary, { align: 'CENTER', width: 390 });
  brand.x = 0; brand.y = 250;
  s.appendChild(brand);

  const tagline = text('Your subscriptions, under control', 13, 'Regular', C.textMuted, { align: 'CENTER', width: 390 });
  tagline.x = 0; tagline.y = 278;
  s.appendChild(tagline);

  // Card
  const loginCard = card('LoginCard', 342, 152);
  loginCard.x = 24; loginCard.y = 330;
  s.appendChild(loginCard);

  const cardTitle = text('Sign in', 15, 'SemiBold', C.textPrimary);
  cardTitle.x = 24; cardTitle.y = 24;
  loginCard.appendChild(cardTitle);

  const cardSub = text('Continue with your Google account to get started.', 12, 'Regular', C.textMuted, { width: 295, lineHeight: 18 });
  cardSub.x = 24; cardSub.y = 46;
  loginCard.appendChild(cardSub);

  // Google button
  const gBtn = figma.createFrame();
  gBtn.name = 'GoogleButton';
  gBtn.resize(294, 44);
  gBtn.x = 24; gBtn.y = 90;
  gBtn.fills = [rgb(C.white)];
  gBtn.cornerRadius = 12;
  gBtn.strokes = [rgb(C.border)];
  gBtn.strokeWeight = 1;
  gBtn.effects = [{ type: 'DROP_SHADOW', color: { r:0,g:0,b:0,a:0.04 }, offset:{x:0,y:1}, radius:3, spread:0, visible:true, blendMode:'NORMAL' }];
  loginCard.appendChild(gBtn);

  const gLabel = text('Continue with Google', 13, 'Medium', C.textPrimary);
  gLabel.x = 68; gLabel.y = 13;
  gBtn.appendChild(gLabel);

  // Google G placeholder
  const gIcon = rect('G-icon', 20, 20, C.gray100, 4);
  gIcon.x = 16; gIcon.y = 12;
  gBtn.appendChild(gIcon);
  const gIconText = text('G', 11, 'Bold', C.accent);
  gIconText.x = 21; gIconText.y = 14;
  gBtn.appendChild(gIconText);

  return s;
}

// ── SCREEN 2: DASHBOARD ─────────────────────────────────────

function buildDashboard() {
  const s = mobileShell('📊 Dashboard');

  let y = 60;

  // Header
  const headerTitle = text('Dashboard', 22, 'Bold', C.textPrimary);
  headerTitle.x = 20; headerTitle.y = y;
  s.appendChild(headerTitle);

  const headerSub = text('Your subscription overview', 13, 'Regular', C.textMuted);
  headerSub.x = 20; headerSub.y = y + 30;
  s.appendChild(headerSub);

  // Add button
  const addBtn = rect('AddButton', 68, 34, C.accent, 12);
  addBtn.x = 302; addBtn.y = y + 4;
  s.appendChild(addBtn);
  const addLabel = text('+ Add', 12, 'SemiBold', C.white);
  addLabel.x = 316; addLabel.y = y + 11;
  s.appendChild(addLabel);

  y += 76;

  // Stat cards row
  const statData = [
    { label: 'Monthly', value: '€67.94', sub: 'What you spend / mo', accent: true },
    { label: 'Yearly',  value: '€815',   sub: 'Projected annual',   accent: false },
  ];

  statData.forEach((st, i) => {
    const sc = figma.createFrame();
    sc.name = 'StatCard/' + st.label;
    sc.resize(173, 88);
    sc.x = 20 + i * 181; sc.y = y;
    sc.cornerRadius = 20;
    sc.fills = [rgb(st.accent ? C.accent : C.white)];
    sc.strokes = st.accent ? [] : [rgba(C.border, 0.6)];
    sc.strokeWeight = 1;
    if (!st.accent) sc.effects = [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.04}, offset:{x:0,y:2}, radius:10, spread:0, visible:true, blendMode:'NORMAL' }];

    const lbl = text(st.label, 10, 'Medium', st.accent ? {r:0.8,g:0.82,b:1} : C.textMuted);
    lbl.x = 14; lbl.y = 16;
    sc.appendChild(lbl);

    const val = text(st.value, 20, 'Bold', st.accent ? C.white : C.textPrimary);
    val.x = 14; val.y = 34;
    sc.appendChild(val);

    const sub2 = text(st.sub, 10, 'Regular', st.accent ? {r:0.8,g:0.82,b:1} : C.textMuted, { width: 145 });
    sub2.x = 14; sub2.y = 62;
    sc.appendChild(sub2);

    s.appendChild(sc);
  });

  y += 104;

  // Insights row
  const insightData = [
    { icon: '📺', label: 'Top category', value: 'Streaming', sub: '€19.73 / mo', color: C.red50 },
    { icon: '⚡', label: 'Highest cost', value: 'Notion',    sub: '€16.00 / mo', color: C.indigo50 },
  ];

  insightData.forEach((ins, i) => {
    const ic = figma.createFrame();
    ic.name = 'InsightCard/' + ins.label;
    ic.resize(173, 72);
    ic.x = 20 + i * 181; ic.y = y;
    ic.cornerRadius = 16;
    ic.fills = [rgb(C.white)];
    ic.strokes = [rgba(C.border, 0.6)];
    ic.strokeWeight = 1;

    const iconBox = rect('IconBox', 32, 32, ins.color, 10);
    iconBox.x = 12; iconBox.y = 20;
    ic.appendChild(iconBox);

    const iconEmoji = text(ins.icon, 14, 'Regular', C.textPrimary);
    iconEmoji.x = 18; iconEmoji.y = 24;
    ic.appendChild(iconEmoji);

    const lbl2 = text(ins.label, 10, 'Medium', C.textMuted);
    lbl2.x = 52; lbl2.y = 14;
    ic.appendChild(lbl2);

    const val2 = text(ins.value, 12, 'SemiBold', C.textPrimary);
    val2.x = 52; val2.y = 30;
    ic.appendChild(val2);

    const sub3 = text(ins.sub, 10, 'Regular', C.textMuted);
    sub3.x = 52; sub3.y = 46;
    ic.appendChild(sub3);

    s.appendChild(ic);
  });

  y += 88;

  // Upcoming renewals card
  const renewCard = card('UpcomingRenewals', 350, 208);
  renewCard.x = 20; renewCard.y = y;
  s.appendChild(renewCard);

  const rTitle = text('Upcoming renewals', 13, 'SemiBold', C.textPrimary);
  rTitle.x = 16; rTitle.y = 16;
  renewCard.appendChild(rTitle);
  const rSub2 = text('Next 30 days · 4 renewals', 11, 'Regular', C.textMuted);
  rSub2.x = 16; rSub2.y = 34;
  renewCard.appendChild(rSub2);

  const renewals = [
    { name: 'GitHub',  sub: 'Tomorrow', color: {r:0.15,g:0.15,b:0.15}, amount: '€4.00' },
    { name: 'Notion',  sub: 'In 3 days', color: C.accent,               amount: '€16.00' },
    { name: 'iCloud+', sub: 'In 7 days', color: {r:0.06,g:0.55,b:0.92}, amount: '€2.99' },
    { name: 'Netflix', sub: 'In 5 days', color: {r:0.9,g:0.1,b:0.1},   amount: '€6.00' },
  ];

  renewals.forEach((r, i) => {
    const row = figma.createFrame();
    row.name = 'Renewal/' + r.name;
    row.resize(318, 36);
    row.x = 16; row.y = 56 + i * 37;
    row.fills = [];

    const av = avatar(r.name.slice(0, 2).toUpperCase(), r.color, 32);
    av.x = 0; av.y = 2;
    row.appendChild(av);

    const rName = text(r.name, 12, 'Medium', C.textPrimary);
    rName.x = 40; rName.y = 4;
    row.appendChild(rName);

    const rSub3 = text(r.sub, 10, 'Regular', C.textMuted);
    rSub3.x = 40; rSub3.y = 19;
    row.appendChild(rSub3);

    const rAmt = text(r.amount, 12, 'SemiBold', C.textPrimary);
    rAmt.x = 270; rAmt.y = 4;
    row.appendChild(rAmt);

    const rMo = text('/ mo', 10, 'Regular', C.textMuted);
    rMo.x = 284; rMo.y = 19;
    row.appendChild(rMo);

    renewCard.appendChild(row);
  });

  y += 224;

  // Bottom nav
  const nav = rect('BottomNav', 390, 80, C.white);
  nav.x = 0; nav.y = 764;
  nav.strokes = [rgb(C.border)];
  nav.strokeWeight = 1;
  s.appendChild(nav);

  const navItems = [
    { icon: '▦', label: 'Dashboard', active: true,  x: 78 },
    { icon: '⊞', label: 'Subscriptions', active: false, x: 234 },
  ];
  navItems.forEach(ni => {
    const dot = text(ni.icon, 18, ni.active ? 'Bold' : 'Regular', ni.active ? C.accent : C.textMuted);
    dot.x = ni.x; dot.y = 774;
    s.appendChild(dot);
    const nl = text(ni.label, 9, 'Medium', ni.active ? C.accent : C.textMuted);
    nl.x = ni.x - 8; nl.y = 798;
    s.appendChild(nl);
  });

  return s;
}

// ── SCREEN 3: SUBSCRIPTIONS LIST ────────────────────────────

function buildSubscriptionsList() {
  const s = mobileShell('📋 Subscriptions');

  let y = 60;

  // Header
  const title = text('Subscriptions', 22, 'Bold', C.textPrimary);
  title.x = 20; title.y = y;
  s.appendChild(title);

  const sub = text('14 total · €67.94 / mo', 13, 'Regular', C.textMuted);
  sub.x = 20; sub.y = y + 30;
  s.appendChild(sub);

  const addBtn2 = rect('AddButton', 68, 34, C.accent, 12);
  addBtn2.x = 302; addBtn2.y = y + 4;
  s.appendChild(addBtn2);
  const addLbl2 = text('+ Add', 12, 'SemiBold', C.white);
  addLbl2.x = 316; addLbl2.y = y + 11;
  s.appendChild(addLbl2);

  y += 72;

  // Filter pills
  const filters = ['All', 'Active', 'Trial', 'Paused', 'Cancelled'];
  let fx = 20;
  filters.forEach((f, i) => {
    const fp = figma.createFrame();
    fp.name = 'Filter/' + f;
    fp.layoutMode = 'HORIZONTAL';
    fp.paddingLeft = fp.paddingRight = 12;
    fp.paddingTop = fp.paddingBottom = 6;
    fp.cornerRadius = 12;
    fp.primaryAxisSizingMode = 'AUTO';
    fp.counterAxisSizingMode = 'AUTO';
    fp.fills = [rgb(i === 0 ? C.accent : C.white)];
    fp.strokes = i === 0 ? [] : [rgb(C.border)];
    fp.strokeWeight = 1;
    fp.x = fx; fp.y = y;
    const ft = text(f, 11, 'Medium', i === 0 ? C.white : C.textSecond);
    fp.appendChild(ft);
    s.appendChild(fp);
    fx += (f.length * 7) + 28;
  });

  y += 46;

  // Subscription cards
  const subs = [
    { name: 'Netflix',      cat: '📺 Streaming',    amount: '€6.00',  status: 'Active',    color: {r:0.9,g:0.1,b:0.1},  shared: true  },
    { name: 'Spotify',      cat: '🎵 Music',         amount: '€9.99',  status: 'Active',    color: {r:0.11,g:0.73,b:0.33},shared: false },
    { name: 'Notion',       cat: '⚡ Productivity',  amount: '€16.00', status: 'Active',    color: C.accent,              shared: false },
    { name: 'ChatGPT Plus', cat: '🤖 AI',            amount: '€20.00', status: 'Active',    color: {r:0.07,g:0.73,b:0.61},shared: false },
    { name: 'Figma',        cat: '⚡ Productivity',  amount: '€15.00', status: 'Trial',     color: C.accent,              shared: false },
    { name: 'Xbox GP',      cat: '🎮 Gaming',        amount: '€14.99', status: 'Paused',    color: {r:0.07,g:0.53,b:0.07},shared: false },
  ];

  subs.forEach((sub2) => {
    const sc2 = card('SubCard/' + sub2.name, 350, 68);
    sc2.x = 20; sc2.y = y;

    const av2 = avatar(sub2.name.slice(0,2).toUpperCase(), sub2.color, 40);
    av2.x = 12; av2.y = 14;
    sc2.appendChild(av2);

    const sName = text(sub2.name, 13, 'SemiBold', C.textPrimary);
    sName.x = 62; sName.y = 10;
    sc2.appendChild(sName);

    const sCat = text(sub2.cat + (sub2.shared ? ' · 👥 3' : ''), 11, 'Regular', C.textMuted);
    sCat.x = 62; sCat.y = 28;
    sc2.appendChild(sCat);

    const badge = statusBadge(sub2.status);
    badge.x = 62; badge.y = 46;
    sc2.appendChild(badge);

    const sAmt = text(sub2.amount, 14, 'Bold', C.textPrimary);
    sAmt.x = 290; sAmt.y = 14;
    sc2.appendChild(sAmt);

    const sMo = text('/ mo', 10, 'Regular', C.textMuted);
    sMo.x = 298; sMo.y = 32;
    sc2.appendChild(sMo);

    if (sub2.shared) {
      const share = text('my share', 9, 'Medium', C.accent);
      share.x = 292; share.y = 48;
      sc2.appendChild(share);
    }

    s.appendChild(sc2);
    y += 80;
  });

  // Bottom nav
  const nav2 = rect('BottomNav', 390, 80, C.white);
  nav2.x = 0; nav2.y = 764;
  nav2.strokes = [rgb(C.border)];
  nav2.strokeWeight = 1;
  s.appendChild(nav2);

  const navItems2 = [
    { icon: '▦', label: 'Dashboard',     active: false, x: 78  },
    { icon: '⊞', label: 'Subscriptions', active: true,  x: 234 },
  ];
  navItems2.forEach(ni => {
    const dot = text(ni.icon, 18, ni.active ? 'Bold' : 'Regular', ni.active ? C.accent : C.textMuted);
    dot.x = ni.x; dot.y = 774;
    s.appendChild(dot);
    const nl = text(ni.label, 9, 'Medium', ni.active ? C.accent : C.textMuted);
    nl.x = ni.x - 8; nl.y = 798;
    s.appendChild(nl);
  });

  return s;
}

// ── SCREEN 4: ADD SUBSCRIPTION FORM ─────────────────────────

function buildForm() {
  const s = mobileShell('➕ Add Subscription');

  let y = 60;

  // Header
  const backBtn = text('← Back', 13, 'Medium', C.textSecond);
  backBtn.x = 20; backBtn.y = y;
  s.appendChild(backBtn);

  y += 36;

  const title = text('Add subscription', 20, 'Bold', C.textPrimary);
  title.x = 20; title.y = y;
  s.appendChild(title);

  const sub = text('Track a new recurring expense', 12, 'Regular', C.textMuted);
  sub.x = 20; sub.y = y + 28;
  s.appendChild(sub);

  y += 64;

  // Form card
  const formCard = card('FormCard', 350, 630);
  formCard.x = 20; formCard.y = y;
  s.appendChild(formCard);

  // Preview strip
  const preview = rect('Preview', 310, 60, C.gray100, 14);
  preview.x = 20; preview.y = 16;
  formCard.appendChild(preview);

  const prevAv = avatar('NF', {r:0.9,g:0.1,b:0.1}, 40);
  prevAv.x = 10; prevAv.y = 10;
  preview.appendChild(prevAv);

  const prevName = text('Netflix', 14, 'SemiBold', C.textPrimary);
  prevName.x = 56; prevName.y = 10;
  preview.appendChild(prevName);

  const prevSub2 = text('EUR 17.99 / Monthly', 11, 'Regular', C.textMuted);
  prevSub2.x = 56; prevSub2.y = 30;
  preview.appendChild(prevSub2);

  // Section: Basic info
  let fy = 96;

  const secLabel = (label, yy) => {
    const sl = text(label, 9, 'SemiBold', C.textMuted, { letterSpacing: 8 });
    sl.x = 20; sl.y = yy;
    formCard.appendChild(sl);
  };

  const inputField = (label, value, yy, w = 310) => {
    const lbl = text(label, 10, 'Medium', C.textSecond);
    lbl.x = 20; lbl.y = yy;
    formCard.appendChild(lbl);

    const inp = rect('Input/' + label, w, 40, C.white, 12);
    inp.x = 20; inp.y = yy + 16;
    inp.strokes = [rgb(C.border)];
    inp.strokeWeight = 1;
    formCard.appendChild(inp);

    const val = text(value, 12, 'Regular', C.textPrimary);
    val.x = 32; val.y = yy + 28;
    formCard.appendChild(val);
  };

  secLabel('BASIC INFO', fy);
  fy += 18;
  inputField('Name *', 'Netflix', fy);
  fy += 66;

  // Category grid (3 pills)
  const catLabel = text('Category', 10, 'Medium', C.textSecond);
  catLabel.x = 20; catLabel.y = fy;
  formCard.appendChild(catLabel);
  fy += 18;

  const cats = ['📺 Streaming', '🎵 Music', '⚡ Productivity', '☁️ Cloud', '🤖 AI', '🏃 Health'];
  let cx = 20; let catRow = fy;
  cats.forEach((c, i) => {
    const cp = figma.createFrame();
    cp.name = 'Cat/' + c;
    cp.layoutMode = 'HORIZONTAL';
    cp.paddingLeft = cp.paddingRight = 10;
    cp.paddingTop = cp.paddingBottom = 6;
    cp.cornerRadius = 10;
    cp.primaryAxisSizingMode = 'AUTO';
    cp.counterAxisSizingMode = 'AUTO';
    const isActive = i === 0;
    cp.fills = [rgb(isActive ? C.indigo50 : C.white)];
    cp.strokes = [rgb(isActive ? C.accent : C.border)];
    cp.strokeWeight = 1;
    cp.x = cx; cp.y = catRow;
    const ct = text(c, 10, 'Medium', isActive ? C.accent : C.textSecond);
    cp.appendChild(ct);
    formCard.appendChild(cp);
    cx += c.length * 7 + 22;
    if (cx > 280 && i === 2) { cx = 20; catRow += 34; }
  });
  fy = catRow + 36;

  // Pricing section
  secLabel('PRICING', fy);
  fy += 18;

  // Two columns
  const amtInp = rect('Input/Amount', 150, 40, C.white, 12);
  amtInp.x = 20; amtInp.y = fy + 16;
  amtInp.strokes = [rgb(C.border)]; amtInp.strokeWeight = 1;
  formCard.appendChild(amtInp);
  const amtLbl = text('Amount *', 10, 'Medium', C.textSecond);
  amtLbl.x = 20; amtLbl.y = fy;
  formCard.appendChild(amtLbl);
  const amtVal = text('17.99', 12, 'Regular', C.textPrimary);
  amtVal.x = 32; amtVal.y = fy + 28;
  formCard.appendChild(amtVal);

  const curInp = rect('Input/Currency', 150, 40, C.white, 12);
  curInp.x = 180; curInp.y = fy + 16;
  curInp.strokes = [rgb(C.border)]; curInp.strokeWeight = 1;
  formCard.appendChild(curInp);
  const curLbl = text('Currency', 10, 'Medium', C.textSecond);
  curLbl.x = 180; curLbl.y = fy;
  formCard.appendChild(curLbl);
  const curVal = text('EUR — €', 12, 'Regular', C.textPrimary);
  curVal.x = 192; curVal.y = fy + 28;
  formCard.appendChild(curVal);

  fy += 66;
  inputField('Billing period', 'Monthly', fy);
  fy += 66;

  // Submit button
  const submitBtn = rect('SubmitButton', 310, 44, C.accent, 14);
  submitBtn.x = 20; submitBtn.y = fy;
  formCard.appendChild(submitBtn);
  const submitLbl = text('Add subscription', 13, 'SemiBold', C.white);
  submitLbl.x = 96; submitLbl.y = fy + 14;
  formCard.appendChild(submitLbl);

  return s;
}

// ── MAIN ─────────────────────────────────────────────────────

figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'generate') return;

  try {
    await loadFonts();

    // Group all screens in a section
    const screens = [
      buildLogin(),
      buildDashboard(),
      buildSubscriptionsList(),
      buildForm(),
    ];

    // Layout screens side by side with 80px gap
    const GAP = 80;
    let xOffset = 0;
    screens.forEach(sc => {
      sc.x = xOffset;
      sc.y = 0;
      figma.currentPage.appendChild(sc);
      xOffset += sc.width + GAP;
    });

    // Zoom to fit
    figma.viewport.scrollAndZoomIntoView(screens);

    figma.ui.postMessage({ type: 'done', count: screens.length });

  } catch (err) {
    figma.ui.postMessage({ type: 'error', message: err.message });
  }
};

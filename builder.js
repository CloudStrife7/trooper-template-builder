// ============================================================
// Trooper Template Builder — Core Engine
// ============================================================

// --- Costume Presets ---
const COSTUME_PRESETS = {
  "boba-fett": {
    name: "Boba Fett (Re-Armored)", detachment: "Bounty Hunters Guild", prefix: "BH", icon: "rocket_launch",
    primary: "#4C6043", secondary: "#6D0827", tertiary: "#F59E01",
    paintCodes: { primary: "BLK 6530", secondary: "BLK 3062", tertiary: "BLK 1045" },
    paintNames: { primary: "Storm", secondary: "Cardinal", tertiary: "Melon" }
  },
  "stormtrooper": {
    name: "Stormtrooper (ANH)", detachment: "Stormtrooper", prefix: "TK", icon: "shield",
    primary: "#B0B0B0", secondary: "#1A1A1A", tertiary: "#4A90D9",
    paintCodes: null,
    paintNames: { primary: "Imperial White", secondary: "Joint Black", tertiary: "Corps Blue" }
  },
  "darth-vader": {
    name: "Darth Vader", detachment: "Sith Lord", prefix: "DV", icon: "psychology",
    primary: "#1A1A2E", secondary: "#8B0000", tertiary: "#C0C0C0",
    paintCodes: null,
    paintNames: { primary: "Obsidian", secondary: "Sith Red", tertiary: "Imperial Chrome" }
  },
  "shoretrooper": {
    name: "Shoretrooper", detachment: "Stormtrooper", prefix: "TK", icon: "beach_access",
    primary: "#C4956A", secondary: "#3D5A3E", tertiary: "#8B7355",
    paintCodes: null,
    paintNames: { primary: "Scarif Sand", secondary: "Trooper Olive", tertiary: "Dune" }
  },
  "scout-trooper": {
    name: "Scout Trooper", detachment: "Stormtrooper", prefix: "BK", icon: "two_wheeler",
    primary: "#D0D0D0", secondary: "#2C2C2C", tertiary: "#6B8E23",
    paintCodes: null,
    paintNames: { primary: "Shell White", secondary: "Visor Black", tertiary: "Endor" }
  },
  "tie-pilot": {
    name: "TIE Pilot", detachment: "Starfighter", prefix: "TP", icon: "flight",
    primary: "#1C1C1C", secondary: "#4169E1", tertiary: "#808080",
    paintCodes: null,
    paintNames: { primary: "Void Black", secondary: "Imperial Navy", tertiary: "Hull Gray" }
  },
  "royal-guard": {
    name: "Emperor's Royal Guard", detachment: "Imperial Officer", prefix: "RG", icon: "security",
    primary: "#8B0000", secondary: "#2C0000", tertiary: "#DAA520",
    paintCodes: null,
    paintNames: { primary: "Royal Crimson", secondary: "Shadow Maroon", tertiary: "Imperial Gold" }
  },
  "death-trooper": {
    name: "Death Trooper", detachment: "Stormtrooper", prefix: "DT", icon: "skull",
    primary: "#0D0D0D", secondary: "#1A472A", tertiary: "#2F4F2F",
    paintCodes: null,
    paintNames: { primary: "Death Black", secondary: "Specter Green", tertiary: "Shadow Green" }
  },
  "shadow-trooper": {
    name: "Shadow Stormtrooper", detachment: "Stormtrooper", prefix: "SH", icon: "visibility_off",
    primary: "#1A1A1A", secondary: "#333333", tertiary: "#505050",
    paintCodes: null,
    paintNames: { primary: "Shadow Black", secondary: "Stealth Gray", tertiary: "Phantom" }
  },
  "mandalorian": {
    name: "The Mandalorian", detachment: "Bounty Hunters Guild", prefix: "MN", icon: "shield",
    primary: "#6B7B8D", secondary: "#4A3728", tertiary: "#8B7D6B",
    paintCodes: null,
    paintNames: { primary: "Beskar", secondary: "Mudhorn Brown", tertiary: "Dune Sand" }
  },
  "clone-501st": {
    name: "Clone Trooper (501st)", detachment: "Clone Trooper", prefix: "CT", icon: "groups",
    primary: "#D0D0D0", secondary: "#1E3A5F", tertiary: "#2C5F8A",
    paintCodes: null,
    paintNames: { primary: "Clone White", secondary: "501st Blue", tertiary: "Torrent" }
  },
  "tusken-raider": {
    name: "Tusken Raider", detachment: "Bounty Hunters Guild", prefix: "TS", icon: "landscape",
    primary: "#8B7355", secondary: "#5C4033", tertiary: "#C4A882",
    paintCodes: null,
    paintNames: { primary: "Dune", secondary: "Bantha Hide", tertiary: "Tatooine Sand" }
  }
};

// --- Color Utilities ---
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => Math.round(Math.min(255, Math.max(0, x))).toString(16).padStart(2, '0')).join('');
}

function lightenColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount
  );
}

function deriveOnSurfaceVariant(primaryHex) {
  // Create a light, desaturated tint of the primary color
  return lightenColor(primaryHex, 0.65);
}

function deriveSurfaceTint(primaryHex) {
  return primaryHex;
}

// --- Builder State ---
const builderState = {
  costume: null,
  primary: '', secondary: '', tertiary: '',
  paintNames: { primary: '', secondary: '', tertiary: '' },
  paintCodes: null,
  siteName: '', designation: '', characterFirstName: '', characterLastName: '',
  garrison: '', detachment: '', squad: '', rank: '',
  bio: '', troopsCompleted: '', yearsActive: '', sector: '',
  includeTour: true, includeArmory: true,
  images: { hero: null, profile: null, feature1: null, feature2: null, feature3: null }
};

// --- Step Navigation ---
let currentStep = 1;

function showStep(step) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('step-' + i);
    if (el) el.classList.toggle('hidden', i !== step);
  }
  // Update step indicators
  document.querySelectorAll('[data-step-indicator]').forEach(el => {
    const s = parseInt(el.dataset.stepIndicator);
    el.classList.toggle('bg-tertiary', s <= step);
    el.classList.toggle('text-black', s <= step);
    el.classList.toggle('bg-surface-container-high', s > step);
    el.classList.toggle('text-outline', s > step);
  });
  // Update step connector lines
  document.querySelectorAll('[data-step-line]').forEach(el => {
    const s = parseInt(el.dataset.stepLine);
    el.classList.toggle('bg-tertiary', s < step);
    el.classList.toggle('bg-surface-container-high', s >= step);
  });
  currentStep = step;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep() {
  if (currentStep === 1) collectStep1();
  if (currentStep === 2) collectStep2();
  if (currentStep === 3) collectStep3();
  if (currentStep < 4) showStep(currentStep + 1);
  if (currentStep === 4) generatePreview();
}

function prevStep() {
  if (currentStep > 1) showStep(currentStep - 1);
}

// --- Step 1: Costume Selection ---
function renderCostumeGrid() {
  const grid = document.getElementById('costume-grid');
  if (!grid) return;
  grid.innerHTML = '';

  Object.entries(COSTUME_PRESETS).forEach(([key, preset]) => {
    const card = document.createElement('div');
    card.className = 'costume-card cursor-pointer border border-outline-variant/30 hover:border-on-surface/50 transition-all p-5 rounded-lg group';
    card.dataset.costume = key;
    card.innerHTML = `
      <div class="flex items-center gap-3 mb-3">
        <span class="material-symbols-outlined text-2xl text-outline group-hover:text-on-surface transition-colors">${preset.icon}</span>
        <div>
          <div class="font-headline font-bold text-sm uppercase tracking-tight">${preset.name}</div>
          <div class="font-label text-[10px] text-outline uppercase tracking-widest">${preset.detachment}</div>
        </div>
      </div>
      <div class="flex gap-2">
        <div class="w-10 h-10 rounded" style="background:${preset.primary};" title="${preset.paintNames.primary}"></div>
        <div class="w-10 h-10 rounded" style="background:${preset.secondary};" title="${preset.paintNames.secondary}"></div>
        <div class="w-10 h-10 rounded" style="background:${preset.tertiary};" title="${preset.paintNames.tertiary}"></div>
      </div>
      <div class="font-label text-[10px] text-outline mt-2 tracking-wider">${preset.prefix}-XXXX</div>
    `;
    card.onclick = () => selectCostume(key);
    grid.appendChild(card);
  });

  // Custom option
  const customCard = document.createElement('div');
  customCard.className = 'costume-card cursor-pointer border border-dashed border-outline-variant/50 hover:border-on-surface/50 transition-all p-5 rounded-lg group';
  customCard.dataset.costume = 'custom';
  customCard.innerHTML = `
    <div class="flex items-center gap-3 mb-3">
      <span class="material-symbols-outlined text-2xl text-outline group-hover:text-on-surface transition-colors">palette</span>
      <div>
        <div class="font-headline font-bold text-sm uppercase tracking-tight">Custom Colors</div>
        <div class="font-label text-[10px] text-outline uppercase tracking-widest">Pick Your Own</div>
      </div>
    </div>
    <div class="flex gap-2 items-center">
      <input type="color" id="custom-primary" value="#4C6043" class="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" title="Primary">
      <input type="color" id="custom-secondary" value="#6D0827" class="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" title="Secondary">
      <input type="color" id="custom-tertiary" value="#F59E01" class="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" title="Tertiary">
    </div>
    <div class="font-label text-[10px] text-outline mt-2 tracking-wider">YOUR PALETTE</div>
  `;
  customCard.onclick = (e) => {
    if (e.target.tagName === 'INPUT') return; // Don't trigger on color picker clicks
    selectCostume('custom');
  };
  // Also select when color pickers change
  ['custom-primary', 'custom-secondary', 'custom-tertiary'].forEach(id => {
    customCard.querySelector('#' + id).addEventListener('input', () => selectCostume('custom'));
  });
  grid.appendChild(customCard);
}

function selectCostume(key) {
  // Remove previous selection
  document.querySelectorAll('.costume-card').forEach(c => {
    c.classList.remove('border-tertiary', 'border-2');
    c.classList.add('border-outline-variant/30');
  });
  // Highlight selected
  const card = document.querySelector(`[data-costume="${key}"]`);
  if (card) {
    card.classList.add('border-tertiary', 'border-2');
    card.classList.remove('border-outline-variant/30');
  }

  if (key === 'custom') {
    builderState.costume = 'custom';
    builderState.primary = document.getElementById('custom-primary').value;
    builderState.secondary = document.getElementById('custom-secondary').value;
    builderState.tertiary = document.getElementById('custom-tertiary').value;
    builderState.paintNames = { primary: 'Primary', secondary: 'Secondary', tertiary: 'Accent' };
    builderState.paintCodes = null;
  } else {
    const preset = COSTUME_PRESETS[key];
    builderState.costume = key;
    builderState.primary = preset.primary;
    builderState.secondary = preset.secondary;
    builderState.tertiary = preset.tertiary;
    builderState.paintNames = { ...preset.paintNames };
    builderState.paintCodes = preset.paintCodes ? { ...preset.paintCodes } : null;
    // Pre-fill detachment and prefix in form if empty
    const detachInput = document.getElementById('input-detachment');
    if (detachInput && !detachInput.value) {
      detachInput.placeholder = preset.detachment;
    }
    // Pre-fill prefix in designation
    const desigInput = document.getElementById('input-designation');
    if (desigInput && !desigInput.value) {
      desigInput.placeholder = preset.prefix + '-XXXX';
    }
  }

  // Update builder page accent colors live
  updateBuilderTheme();
}

function updateBuilderTheme() {
  const root = document.documentElement;
  root.style.setProperty('--builder-primary', builderState.primary);
  root.style.setProperty('--builder-secondary', builderState.secondary);
  root.style.setProperty('--builder-tertiary', builderState.tertiary);
  // Update the accent swatch preview in header
  const preview = document.getElementById('color-preview');
  if (preview) {
    preview.innerHTML = `
      <div class="w-6 h-6 rounded-sm" style="background:${builderState.primary}"></div>
      <div class="w-6 h-6 rounded-sm" style="background:${builderState.secondary}"></div>
      <div class="w-6 h-6 rounded-sm" style="background:${builderState.tertiary}"></div>
    `;
  }
}

function collectStep1() {
  if (!builderState.costume) {
    selectCostume('stormtrooper');
  }
}

// --- Step 2: Identity ---
function collectStep2() {
  builderState.siteName = document.getElementById('input-sitename')?.value || 'Trooper Station';
  builderState.designation = document.getElementById('input-designation')?.value || 'TK-0000';
  builderState.characterFirstName = document.getElementById('input-firstname')?.value || 'TROOPER';
  builderState.characterLastName = document.getElementById('input-lastname')?.value || 'STATION';
  builderState.garrison = document.getElementById('input-garrison')?.value || 'Unknown';
  builderState.detachment = document.getElementById('input-detachment')?.value || 'My Detachment';
  builderState.squad = document.getElementById('input-squad')?.value || '';
  builderState.rank = document.getElementById('input-rank')?.value || 'Trooper';
  builderState.bio = document.getElementById('input-bio')?.value || 'A proud member of the 501st Legion.';
  builderState.troopsCompleted = document.getElementById('input-troops')?.value || '0';
  builderState.yearsActive = document.getElementById('input-years')?.value || '1';
  builderState.sector = document.getElementById('input-sector')?.value || '--';
  builderState.includeTour = document.getElementById('toggle-tour')?.checked ?? true;
  builderState.includeArmory = document.getElementById('toggle-armory')?.checked ?? true;
}

// --- Step 3: Images ---
function setupImageSlots() {
  ['hero', 'profile', 'feature1', 'feature2', 'feature3'].forEach(slot => {
    const dropZone = document.getElementById('drop-' + slot);
    const urlInput = document.getElementById('url-' + slot);
    if (!dropZone) return;

    // Drag and drop
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('border-tertiary'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('border-tertiary'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('border-tertiary');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) handleImageFile(slot, file);
    });

    // Click to upload
    dropZone.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => { if (input.files[0]) handleImageFile(slot, input.files[0]); };
      input.click();
    });

    // URL input
    if (urlInput) {
      urlInput.addEventListener('change', () => {
        const url = urlInput.value.trim();
        if (url) {
          builderState.images[slot] = { type: 'url', url };
          showImagePreview(slot, url);
        }
      });
    }
  });
}

function handleImageFile(slot, file) {
  // Resize and convert to base64
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      const MAX_W = 1920;
      if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      builderState.images[slot] = { type: 'file', dataUrl, filename: slot + '.jpg' };
      showImagePreview(slot, dataUrl);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function showImagePreview(slot, src) {
  const dropZone = document.getElementById('drop-' + slot);
  if (!dropZone) return;
  dropZone.innerHTML = `
    <img src="${src}" class="w-full h-full object-cover rounded" alt="Preview"/>
    <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded">
      <span class="font-label text-xs text-white uppercase tracking-wider">Click to Replace</span>
    </div>
  `;
  dropZone.classList.add('relative');
}

function collectStep3() {
  // Images already collected via event handlers
}

// --- Image URL resolver for templates ---
function getImageSrc(slot, forZip) {
  const img = builderState.images[slot];
  if (!img) {
    // For ZIP, reference the placeholder that will be generated
    return forZip ? ('public/images/' + slot + '.jpg') : '';
  }
  if (img.type === 'url') return img.url;
  if (img.type === 'file') {
    return forZip ? ('public/images/' + img.filename) : img.dataUrl;
  }
  return forZip ? ('public/images/' + slot + '.jpg') : '';
}

// --- Template Color Config ---
function buildTailwindColors() {
  const p = builderState.primary;
  const s = builderState.secondary;
  const t = builderState.tertiary;
  const osv = deriveOnSurfaceVariant(p);
  return {
    "primary": p,
    "on-primary": "#ffffff",
    "primary-container": p,
    "secondary": s,
    "on-secondary": "#ffffff",
    "secondary-container": s,
    "tertiary": t,
    "on-tertiary": "#131411",
    "tertiary-container": t,
    "background": "#131411",
    "surface": "#131411",
    "surface-dim": "#131411",
    "surface-bright": "#393939",
    "surface-tint": p,
    "surface-container-lowest": "#0d0f0c",
    "surface-container-low": "#1b1c19",
    "surface-container": "#201f1f",
    "surface-container-high": "#1b1c19",
    "surface-container-highest": "#353534",
    "surface-variant": "#353534",
    "on-surface": "#e4e2de",
    "on-surface-variant": osv,
    "on-background": "#e4e2de",
    "outline": "#8e9288",
    "outline-variant": "#444840",
    "inverse-on-surface": "#313030",
    "inverse-surface": "#e4e2de",
    "inverse-primary": p,
    "error": "#ffb4ab",
    "on-error": "#690005",
    "error-container": "#93000a",
    "on-error-container": "#ffdad6",
    "storm": p,
    "melon": t,
    "cardinal": s
  };
}

// --- Shared HTML Fragments ---
function headFragment(title, description, forZip) {
  const colors = buildTailwindColors();
  return `<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${escHtml(title)}</title>
<meta name="description" content="${escHtml(description)}"/>
<meta property="og:title" content="${escHtml(title)}"/>
<meta property="og:description" content="${escHtml(description)}"/>
<meta property="og:type" content="website"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&amp;family=Inter:wght@400;500;600&amp;family=Space+Grotesk:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 2)},
      fontFamily: {
        "headline": ["Plus Jakarta Sans"],
        "body": ["Inter"],
        "label": ["Space Grotesk"]
      },
      borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem"},
    },
  },
}
<\/script>`;
}

function styleFragment(heroImg, forZip) {
  const src = heroImg || 'public/images/hero-bg.jpg';
  return `<style>
.material-symbols-outlined { font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24; }
body { background-color: #131411; color: #e4e2de; font-family: 'Inter', sans-serif; }
.bg-fett-mesh {
  background-image: linear-gradient(to bottom, rgba(19, 20, 17, 0.8), rgba(19, 20, 17, 1)), url('${src}');
  background-size: cover; background-position: center;
}
.vertical-text { writing-mode: vertical-rl; text-orientation: mixed; }
@keyframes slideInFromRight { from { transform: translateX(30%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slideInFromLeft { from { transform: translateX(-30%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slideOutToLeft { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-30%); opacity: 0; } }
@keyframes slideOutToRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(30%); opacity: 0; } }
</style>`;
}

function navFragment(activePage, forZip) {
  const s = builderState;
  const osv = deriveOnSurfaceVariant(s.primary);
  const pages = [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'About' },
  ];
  if (s.includeTour) pages.push({ href: 'tour.html', label: 'Tour of Duty' });
  if (s.includeArmory) pages.push({ href: 'armory.html', label: 'Armory' });

  const desktopLinks = pages.map(p =>
    p.href === activePage
      ? `<a class="text-sm text-[${s.tertiary}] border-b-2 border-[${s.tertiary}] pb-1" href="${p.href}">${p.label}</a>`
      : `<a class="text-sm text-[${osv}]/60 hover:text-[${osv}] transition-colors" href="${p.href}">${p.label}</a>`
  ).join('\n');

  const iconMap = { 'index.html': 'home', 'about.html': 'person', 'tour.html': 'military_tech', 'armory.html': 'shield' };
  const mobileLinks = pages.map(p => {
    const icon = iconMap[p.href] || 'circle';
    const isActive = p.href === activePage;
    const color = isActive ? s.tertiary : osv;
    const fill = isActive ? " style=\"font-variation-settings: 'FILL' 1;\"" : '';
    const opacity = isActive ? '' : '/60';
    return `<a href="${p.href}"><span class="material-symbols-outlined text-[${color}]${opacity}"${fill}>${icon}</span></a>`;
  }).join('\n');

  return {
    topNav: `<nav class="bg-[#131411] fixed top-0 left-0 right-0 z-50">
<div class="flex justify-between items-center w-full px-6 h-16 max-w-none">
<div class="text-xl font-black text-[${osv}] tracking-widest font-headline uppercase">${escHtml(s.siteName)}</div>
<div class="hidden md:flex gap-8 items-center font-['Plus_Jakarta_Sans'] tracking-tighter uppercase font-bold">
${desktopLinks}
</div>
<div class="flex gap-4 items-center">
<button class="text-[${osv}] hover:bg-[${s.primary}]/20 transition-all duration-300 p-2 rounded-sm scale-95 active:opacity-80">
<span class="material-symbols-outlined">settings</span>
</button>
<button class="text-[${osv}] hover:bg-[${s.primary}]/20 transition-all duration-300 p-2 rounded-sm scale-95 active:opacity-80">
<span class="material-symbols-outlined">person</span>
</button>
</div>
</div>
<div class="bg-[#1b1c19] h-[1px] w-full"></div>
</nav>`,
    bottomNav: `<div class="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-outline-variant z-50 px-6 py-3 flex justify-around items-center">
${mobileLinks}
</div>`,
    footer: `<footer class="bg-[#0d0f0c] w-full py-8 border-t border-[${s.secondary}]/30 mt-auto">
<div class="flex flex-col items-center gap-4 px-8 w-full">
<div class="font-['Plus_Jakarta_Sans'] text-[10px] tracking-[0.2em] uppercase text-[${osv}]">${escHtml(s.siteName)} // ${escHtml(s.designation)}</div>
<div class="flex gap-8 font-['Plus_Jakarta_Sans'] text-[10px] tracking-[0.2em] uppercase">
<a class="text-[${osv}]/40 hover:text-[${s.secondary}] transition-all" href="#">Terms of Engagement</a>
<a class="text-[${osv}]/40 hover:text-[${s.secondary}] transition-all" href="#">Privacy Protocol</a>
<a class="text-[${s.tertiary}] hover:text-[${s.secondary}] transition-all" href="#">System Status</a>
</div>
<a class="text-[${osv}]/30 hover:text-[${osv}]/60 transition-all font-['Plus_Jakarta_Sans'] text-[9px] tracking-[0.2em] uppercase mt-2 flex items-center gap-1.5" href="https://github.com/CloudStrife7/trooper-template-builder" target="_blank" rel="noopener">
<svg class="w-3 h-3 fill-current" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
Built with Trooper Template Builder
</a>
</div>
</footer>`
  };
}

// --- Page Generators ---

function generateIndex(forZip) {
  const s = builderState;
  const osv = deriveOnSurfaceVariant(s.primary);
  const heroSrc = getImageSrc('hero', forZip);
  const nav = navFragment('index.html', forZip);

  return `${headFragment(s.siteName + ' // ' + s.designation, 'The official trooping log of ' + s.designation + '.', forZip)}
${styleFragment(heroSrc, forZip)}
</head>
<body class="bg-background text-on-background font-body selection:bg-storm selection:text-white min-h-screen flex flex-col">
${nav.topNav}
<main class="flex-grow pt-16">
<!-- Hero Section -->
<section class="relative min-h-[870px] flex items-center px-8 md:px-16 overflow-hidden">
<div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
<div id="hero-overlay" class="absolute inset-0 bg-cover bg-center opacity-[0.18]" style="background-image: url('${heroSrc}'); mask-image: radial-gradient(circle at center, black 30%, transparent 80%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 80%);"></div>
</div>
<div class="absolute inset-0 z-0 bg-fett-mesh opacity-50"></div>
<div class="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
<div class="flex-1 space-y-6">
<div class="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-sm border-l-4 border-tertiary">
<span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">verified</span>
<span class="font-label text-xs uppercase tracking-[0.2em] font-bold">501st Approved Member</span>
</div>
<h1 class="font-headline text-7xl md:text-9xl font-extrabold tracking-tighter leading-none text-on-background uppercase">
${escHtml(s.characterFirstName)} <br/> <span class="text-primary">${escHtml(s.characterLastName)}</span>
</h1>
<p class="font-body text-xl text-on-surface-variant max-w-lg leading-relaxed">
${escHtml(s.bio)}
</p>
<div class="flex flex-wrap gap-4 pt-4">
<a href="about.html" class="bg-tertiary text-black px-8 py-4 rounded-lg font-headline font-bold uppercase tracking-wider flex items-center gap-3 hover:opacity-90 transition-all group">
Access Log
<span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
</a>
${s.includeArmory ? `<a href="armory.html" class="border border-secondary/50 hover:border-secondary hover:text-secondary transition-all px-8 py-4 rounded-lg font-headline font-bold uppercase tracking-wider text-on-surface">
View Arsenal
</a>` : ''}
</div>
</div>
<!-- Status Module -->
<div class="w-full md:w-80 space-y-4">
<div class="bg-[#1b1c19] p-6 rounded-xl border-l-2 border-secondary shadow-2xl backdrop-blur-md bg-opacity-80">
<div class="flex justify-between items-start mb-6">
<span class="font-label text-[10px] text-tertiary uppercase tracking-[0.3em]">Operational Status</span>
<span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
</div>
<div class="space-y-4">
<div class="flex justify-between text-xs border-b border-outline-variant pb-2">
<span class="text-outline uppercase">ID#</span>
<span class="text-on-surface font-bold">${escHtml(s.designation)}</span>
</div>
<div class="flex justify-between text-xs border-b border-outline-variant pb-2">
<span class="text-outline uppercase">Troops Completed</span>
<span class="text-on-surface font-bold">${escHtml(s.troopsCompleted)}</span>
</div>
<div class="flex justify-between text-xs border-b border-outline-variant pb-2">
<span class="text-outline uppercase">Years Active</span>
<span class="text-on-surface font-bold">${escHtml(s.yearsActive)}</span>
</div>
<div class="flex justify-between text-xs border-b border-outline-variant pb-2">
<span class="text-outline uppercase">Rank</span>
<span class="text-on-surface font-bold">${escHtml(s.rank)}</span>
</div>
${s.squad ? `<div class="flex justify-between text-xs border-b border-outline-variant pb-2">
<span class="text-outline uppercase">Squad</span>
<span class="text-on-surface font-bold">${escHtml(s.squad)}</span>
</div>` : ''}
<div class="flex justify-between text-xs border-b border-outline-variant pb-2">
<span class="text-outline uppercase">Garrison</span>
<span class="text-on-surface font-bold">${escHtml(s.garrison)}</span>
</div>
<div class="flex justify-between text-xs">
<span class="text-outline uppercase">Costume</span>
<span class="text-on-surface font-bold">${escHtml(getCostumeName())}</span>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- Activity Section -->
<section class="px-8 md:px-16 py-20 max-w-7xl mx-auto">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
<div class="space-y-2">
<h2 class="font-headline text-4xl font-bold uppercase tracking-tight">Recent Activity</h2>
<p class="font-label text-xs text-outline tracking-widest uppercase">Encryption Level: Sigma-9</p>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<div class="md:col-span-2 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between min-h-[320px] relative overflow-hidden group">
<div class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
<span class="material-symbols-outlined text-9xl">military_tech</span>
</div>
<div class="z-10">
<div class="bg-tertiary text-black inline-block px-3 py-1 rounded-sm text-[10px] uppercase font-bold tracking-widest mb-6">Featured Troop</div>
<h3 class="font-headline text-3xl font-bold mb-4">First Deployment</h3>
<p class="text-on-surface-variant max-w-md">Your first troop awaits! Edit this section with details about your most memorable deployment.</p>
</div>
<div class="z-10 flex items-center gap-4 text-xs font-label text-outline uppercase tracking-widest">
<span>${escHtml(s.sector)} Sector</span>
<span>&bull;</span>
<span>Ready</span>
</div>
</div>
<div class="bg-[#1b1c19] rounded-xl p-6 flex flex-col gap-4 border-t border-primary hover:bg-surface-bright transition-colors">
<div class="text-primary"><span class="material-symbols-outlined text-4xl">build</span></div>
<h4 class="font-headline text-lg font-bold uppercase">Gear Check</h4>
<p class="text-sm text-on-surface-variant">Equipment inspection complete. All systems operational and ready for deployment.</p>
<div class="mt-auto font-label text-[10px] text-outline uppercase tracking-widest">Status: Ready</div>
</div>
<div class="bg-[#1b1c19] rounded-xl p-6 flex flex-col gap-4 border-t border-secondary hover:bg-surface-bright transition-colors">
<div class="text-secondary"><span class="material-symbols-outlined text-4xl">groups</span></div>
<h4 class="font-headline text-lg font-bold uppercase">Garrison Briefing</h4>
<p class="text-sm text-on-surface-variant">Coordinating logistics for upcoming deployments across the sector.</p>
<div class="mt-auto font-label text-[10px] text-outline uppercase tracking-widest">Scheduled</div>
</div>
<div class="bg-surface-container-low rounded-xl p-6 flex flex-col justify-center items-center text-center gap-2 border-b-4 border-primary">
<span class="font-headline text-4xl font-extrabold text-primary">501ST</span>
<span class="font-label text-[10px] uppercase tracking-[0.4em] text-outline">Vader's Fist</span>
</div>
</div>
</section>
</main>
${nav.footer}
${nav.bottomNav}
<script src="swipe-nav.js"><\/script>
</body></html>`;
}

function generateAbout(forZip) {
  const s = builderState;
  const osv = deriveOnSurfaceVariant(s.primary);
  const profileSrc = getImageSrc('profile', forZip);
  const nav = navFragment('about.html', forZip);

  return `${headFragment('About | ' + s.siteName, 'Meet ' + s.designation + ', a 501st Legion member.', forZip)}
${styleFragment(getImageSrc('hero', forZip), forZip)}
</head>
<body class="flex min-h-screen bg-background">
<div class="flex-1 flex flex-col">
${nav.topNav.replace('fixed top-0 left-0 right-0', 'sticky top-0')}
<main class="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:py-20">
<div class="mb-20">
<span class="font-label text-xs tracking-[0.3em] text-primary uppercase mb-4 block">Personnel File</span>
<h1 class="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter uppercase leading-none">
About <span class="text-outline">Me</span>
</h1>
<div class="mt-4 bg-surface-container-low/80 backdrop-blur-sm p-4 rounded-sm border-l-2 border-tertiary w-fit">
<div class="font-label text-[10px] text-outline uppercase tracking-widest mb-1">Designation</div>
<div class="font-headline font-bold text-xl text-on-surface">${escHtml(s.designation)}</div>
</div>
</div>
<!-- Profile Section -->
<section class="mb-24">
<div class="flex flex-col lg:flex-row gap-12">
<div class="lg:w-1/3">
<div class="bg-[#1b1c19] rounded-sm overflow-hidden border border-outline-variant/20">
<div class="aspect-square bg-[#131411] relative overflow-hidden">
<img alt="Costume Photo" class="w-full h-full object-cover opacity-80" src="${profileSrc}"/>
<div class="absolute inset-0 bg-gradient-to-t from-[#1b1c19] to-transparent"></div>
</div>
<div class="p-6 space-y-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sm text-tertiary" style="font-variation-settings: 'FILL' 1;">verified</span>
<span class="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary font-bold">501st Approved Member</span>
</div>
<div class="space-y-3">
<div class="flex justify-between text-xs border-b border-outline-variant/30 pb-2">
<span class="text-outline uppercase font-label tracking-widest">ID#</span>
<span class="text-on-surface font-bold">${escHtml(s.designation)}</span>
</div>
<div class="flex justify-between text-xs border-b border-outline-variant/30 pb-2">
<span class="text-outline uppercase font-label tracking-widest">Legion</span>
<span class="text-on-surface font-bold">501st</span>
</div>
<div class="flex justify-between text-xs border-b border-outline-variant/30 pb-2">
<span class="text-outline uppercase font-label tracking-widest">Detachment</span>
<span class="text-on-surface font-bold">${escHtml(s.detachment)}</span>
</div>
<div class="flex justify-between text-xs border-b border-outline-variant/30 pb-2">
<span class="text-outline uppercase font-label tracking-widest">Garrison</span>
<span class="text-on-surface font-bold">${escHtml(s.garrison)}</span>
</div>
<div class="flex justify-between text-xs">
<span class="text-outline uppercase font-label tracking-widest">Costume</span>
<span class="text-on-surface font-bold">${escHtml(getCostumeName())}</span>
</div>
</div>
</div>
</div>
</div>
<!-- Bio Content -->
<div class="lg:w-2/3 space-y-12">
<div class="relative pl-8 border-l-2 border-secondary">
<h3 class="font-headline text-2xl font-bold mb-4 uppercase tracking-wider">Background</h3>
<p class="font-body text-on-surface-variant leading-relaxed">${escHtml(s.bio)}</p>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<div class="bg-[#1b1c19] p-6 rounded-sm border-t border-primary">
<span class="material-symbols-outlined text-3xl text-primary mb-4">military_tech</span>
<h4 class="font-headline text-lg font-bold uppercase mb-2">501st Legion</h4>
<p class="text-sm text-on-surface-variant leading-relaxed">The world's premier Star Wars costuming organization. Vader's Fist. Bad guys doing good.</p>
</div>
<div class="bg-[#1b1c19] p-6 rounded-sm border-t border-secondary">
<span class="material-symbols-outlined text-3xl text-secondary mb-4">shield</span>
<h4 class="font-headline text-lg font-bold uppercase mb-2">${escHtml(s.rank)}</h4>
<p class="text-sm text-on-surface-variant leading-relaxed">${escHtml(s.detachment)} within the ${escHtml(s.garrison)} Garrison.</p>
</div>
<div class="bg-[#1b1c19] p-6 rounded-sm border-t border-tertiary">
<span class="material-symbols-outlined text-3xl text-tertiary mb-4">target</span>
<h4 class="font-headline text-lg font-bold uppercase mb-2">${escHtml(s.detachment)}</h4>
<p class="text-sm text-on-surface-variant leading-relaxed">Representing the finest in the 501st Legion's ranks.</p>
</div>
</div>
<!-- Stats Grid -->
<div class="grid grid-cols-3 gap-1 bg-[#131411] border border-outline-variant/20 overflow-hidden rounded-sm">
<div class="bg-[#1b1c19] p-6 text-center">
<div class="font-headline text-3xl font-extrabold text-tertiary">${escHtml(s.troopsCompleted)}</div>
<div class="font-label text-[10px] text-outline uppercase tracking-widest mt-1">Troops Completed</div>
</div>
<div class="bg-[#1b1c19] p-6 text-center">
<div class="font-headline text-3xl font-extrabold text-primary">${escHtml(s.yearsActive)}</div>
<div class="font-label text-[10px] text-outline uppercase tracking-widest mt-1">Years of Service</div>
</div>
<div class="bg-[#1b1c19] p-6 text-center">
<div class="font-headline text-3xl font-extrabold text-secondary">${escHtml(s.sector)}</div>
<div class="font-label text-[10px] text-outline uppercase tracking-widest mt-1">Home Sector</div>
</div>
</div>
<div class="flex flex-wrap gap-4">
${s.includeTour ? `<a href="tour.html" class="inline-flex items-center gap-2 px-6 py-3 border border-outline-variant/50 text-on-surface font-headline font-bold text-sm rounded-sm hover:border-tertiary hover:text-tertiary transition-all">
View Tour of Duty
<span class="material-symbols-outlined text-sm">arrow_forward</span>
</a>` : ''}
</div>
</div>
</div>
</section>
</main>
${nav.footer}
</div>
${nav.bottomNav}
<script src="swipe-nav.js"><\/script>
</body></html>`;
}

function generateTour(forZip) {
  const s = builderState;
  const osv = deriveOnSurfaceVariant(s.primary);
  const feat1 = getImageSrc('feature1', forZip);
  const feat2 = getImageSrc('feature2', forZip);
  const nav = navFragment('tour.html', forZip);

  return `${headFragment('Tour of Duty | ' + s.siteName, 'Tour of Duty for ' + s.designation + '.', forZip)}
${styleFragment(getImageSrc('hero', forZip), forZip)}
</head>
<body class="flex min-h-screen bg-background">
<div class="flex-1 flex flex-col">
${nav.topNav.replace('fixed top-0 left-0 right-0', 'sticky top-0')}
<main class="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:py-20">
<!-- Header -->
<section class="mb-20">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<span class="font-label text-xs tracking-[0.3em] text-primary uppercase mb-4 block">Deployment Records</span>
<h1 class="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter uppercase leading-none">
Tour <span class="text-outline">of</span> Duty
</h1>
</div>
<div class="bg-surface-container-low p-4 rounded-sm border-l-2 border-tertiary">
<div class="font-label text-[10px] text-outline uppercase tracking-widest mb-1">Status Report</div>
<div class="font-headline font-bold text-xl text-on-surface">0 MISSIONS LOGGED</div>
</div>
</div>
</section>
<!-- Timeline -->
<section class="relative">
<div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-outline-variant transform md:-translate-x-1/2"></div>
<div class="space-y-24 relative">
<!-- Next Deployment -->
<div class="relative flex flex-col md:flex-row items-start md:items-center">
<div class="md:w-1/2 md:pr-12 md:text-right mb-4 md:mb-0">
<div class="font-label text-xs text-secondary tracking-widest font-bold mb-1">NEXT DEPLOYMENT</div>
<h3 class="font-headline text-2xl font-bold uppercase leading-tight">Your Next Mission</h3>
<p class="font-body text-outline text-sm mt-1">Location TBD</p>
</div>
<div class="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-secondary border-4 border-background transform -translate-x-1/2 z-[1]"></div>
<div class="md:w-1/2 md:pl-12 pl-12">
<div class="font-label text-sm text-on-surface tracking-tighter uppercase">Date TBD</div>
<div class="mt-2 inline-flex items-center gap-2 bg-[${s.secondary}]/10 text-secondary px-3 py-1 rounded-sm border border-secondary/30">
<span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
<span class="font-label text-[10px] uppercase font-bold tracking-widest">Awaiting Deployment</span>
</div>
</div>
</div>
<!-- Placeholder Mission 1 -->
<!-- To add a new mission, copy this block and update the details -->
<div class="relative flex flex-col md:flex-row items-start md:items-center opacity-60 hover:opacity-100 transition-all duration-500 p-4 -m-4 rounded-lg">
<div class="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-outline-variant border-2 border-background transform -translate-x-1/2 z-[1]"></div>
<div class="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1 pl-12 md:pl-0">
<div class="font-label text-sm text-outline tracking-tighter uppercase">Your First Troop Date</div>
<div class="mt-2 inline-flex items-center gap-2 bg-outline-variant/30 px-3 py-1 rounded-sm border border-outline-variant/30">
<span class="material-symbols-outlined text-[12px] text-primary">check_circle</span>
<span class="font-label text-[10px] uppercase font-bold tracking-widest">Mission Complete</span>
</div>
</div>
<div class="md:w-1/2 md:pl-12 mb-4 md:mb-0 order-1 md:order-2 pl-12">
<div class="font-label text-xs text-outline tracking-widest font-bold mb-1">DEBRIEF COMPLETE</div>
<h3 class="font-headline text-2xl font-bold uppercase leading-tight">Your First Troop</h3>
<p class="font-body text-outline text-sm mt-1">Edit this with your event details</p>
</div>
</div>
</div>
</section>
</main>
${nav.footer}
</div>
${nav.bottomNav}
<script src="swipe-nav.js"><\/script>
</body></html>`;
}

function generateArmory(forZip) {
  const s = builderState;
  const osv = deriveOnSurfaceVariant(s.primary);
  const feat1 = getImageSrc('feature1', forZip);
  const feat2 = getImageSrc('feature2', forZip);
  const feat3 = getImageSrc('feature3', forZip);
  const nav = navFragment('armory.html', forZip);
  const pn = s.paintNames;
  const pc = s.paintCodes;

  return `${headFragment('The Armory | ' + s.siteName, 'The Armory — build details for ' + s.designation + '.', forZip)}
${styleFragment(getImageSrc('hero', forZip), forZip)}
</head>
<body class="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary">
${nav.topNav}
<div class="bg-[#1b1c19] h-[1px] w-full fixed top-16 z-50"></div>
<main class="pt-24 pb-12 px-6 md:px-12 lg:px-24">
<!-- Hero -->
<section class="mb-24 relative">
<div class="flex flex-col md:flex-row gap-12 items-end">
<div class="w-full md:w-2/3">
<span class="font-label text-xs tracking-[0.3em] text-primary uppercase mb-4 block">Protocol Designation: ${escHtml(s.designation)}</span>
<h1 class="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none mb-8">THE <span class="text-outline">ARMORY</span>.</h1>
<p class="font-body text-lg text-on-surface-variant max-w-xl leading-relaxed">
Your build story goes here. Describe your costume build journey, materials used, and what makes your kit special.
</p>
</div>
<div class="w-full md:w-1/3 flex justify-end">
<div class="bg-surface-container-low p-4 rounded-sm border-l-2 border-tertiary">
<span class="font-label text-[10px] text-outline uppercase tracking-widest block mb-1">System Status</span>
<div class="font-headline font-bold text-xl text-on-surface">Armor Integrity: 100%</div>
</div>
</div>
</div>
</section>
<!-- The Build -->
<section class="mb-32">
<div class="flex items-center gap-4 mb-12">
<h2 class="font-headline text-3xl font-bold uppercase tracking-tight">The Build</h2>
<div class="h-[2px] flex-grow bg-surface-container-high"></div>
</div>
<div class="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
<div class="md:col-span-8 bg-surface-container-lowest overflow-hidden relative group">
<img alt="Build photo" class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" loading="lazy" src="${feat1}"/>
<div class="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80"></div>
<div class="absolute bottom-8 left-8">
<h3 class="font-headline text-2xl font-bold mb-2">Your Build</h3>
<p class="font-body text-sm text-on-surface-variant max-w-md">Describe your build process, techniques, and materials here.</p>
</div>
</div>
<div class="md:col-span-4 grid grid-rows-2 gap-6">
<div class="bg-surface-container-high p-8 flex flex-col justify-between border-t border-primary/20">
<span class="material-symbols-outlined text-tertiary text-4xl">construction</span>
<div>
<h4 class="font-headline font-bold mb-2">Materials</h4>
<ul class="font-label text-[10px] space-y-2 uppercase tracking-widest text-on-surface-variant">
<li>&bull; Your material 1</li>
<li>&bull; Your material 2</li>
<li>&bull; Your material 3</li>
</ul>
</div>
</div>
<div class="bg-surface-container-lowest overflow-hidden relative border-b border-tertiary/20">
<img alt="Detail photo" class="w-full h-full object-cover opacity-40" loading="lazy" src="${feat2}"/>
<div class="absolute inset-0 flex items-center justify-center">
<div class="text-center">
<span class="font-label text-[10px] tracking-[0.4em] uppercase text-tertiary">Precision Fit</span>
<div class="text-4xl font-headline font-black mt-2">1:1 SCALE</div>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- The Kit -->
<section class="mb-24">
<div class="flex items-center gap-4 mb-12">
<h2 class="font-headline text-3xl font-bold uppercase tracking-tight">The Kit</h2>
<div class="h-[2px] flex-grow bg-surface-container-high"></div>
</div>
<div class="relative rounded-xl overflow-hidden py-20 px-8 md:px-16">
<div class="absolute inset-0 z-0">
<img alt="Kit overview" class="w-full h-full object-cover opacity-20" loading="lazy" src="${feat3}"/>
</div>
<div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
<div class="backdrop-blur-xl bg-surface-container-high/40 p-8 rounded-lg border border-outline-variant/20 hover:border-primary/40 transition-colors">
<div class="w-12 h-12 bg-primary/20 flex items-center justify-center rounded mb-6">
<span class="material-symbols-outlined text-primary">bolt</span>
</div>
<h4 class="font-headline font-extrabold text-xl mb-3">Primary Weapon</h4>
<p class="text-sm text-on-surface-variant leading-relaxed">Describe your primary weapon or accessory here.</p>
</div>
<div class="backdrop-blur-xl bg-surface-container-high/40 p-8 rounded-lg border border-outline-variant/20 hover:border-secondary/40 transition-colors">
<div class="w-12 h-12 bg-secondary/20 flex items-center justify-center rounded mb-6">
<span class="material-symbols-outlined text-secondary">rocket_launch</span>
</div>
<h4 class="font-headline font-extrabold text-xl mb-3">Secondary Gear</h4>
<p class="text-sm text-on-surface-variant leading-relaxed">Describe your secondary equipment here.</p>
</div>
<div class="backdrop-blur-xl bg-surface-container-high/40 p-8 rounded-lg border border-outline-variant/20 hover:border-tertiary/40 transition-colors">
<div class="w-12 h-12 bg-tertiary/20 flex items-center justify-center rounded mb-6">
<span class="material-symbols-outlined text-tertiary">settings_input_antenna</span>
</div>
<h4 class="font-headline font-extrabold text-xl mb-3">Accessories</h4>
<p class="text-sm text-on-surface-variant leading-relaxed">Describe additional kit items here.</p>
</div>
</div>
<!-- Armor Palette -->
<div class="relative z-10 mt-12">
<div class="flex items-center gap-4 mb-8">
<span class="font-label text-[10px] text-outline uppercase tracking-[0.3em]">Armor Palette</span>
<div class="h-[1px] flex-grow bg-outline-variant/40"></div>
${pc ? `<span class="font-label text-[10px] text-outline uppercase tracking-widest">Paint Reference</span>` : ''}
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<div class="group overflow-hidden border border-outline-variant/20 hover:border-[${s.primary}]/60 transition-colors">
<div class="h-32 w-full" style="background-color: ${s.primary};"></div>
<div class="bg-surface-container-high/60 backdrop-blur-xl p-5">
<div class="flex items-start justify-between mb-2">
<h5 class="font-headline font-extrabold text-lg uppercase tracking-tight">${escHtml(pn.primary)}</h5>
${pc ? `<span class="font-label text-[10px] text-outline uppercase tracking-widest border border-outline-variant/40 px-2 py-0.5">${escHtml(pc.primary)}</span>` : ''}
</div>
<div class="font-label text-sm text-[${s.primary}] tracking-widest mb-2">${s.primary}</div>
<p class="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Primary Armor</p>
</div>
</div>
<div class="group overflow-hidden border border-outline-variant/20 hover:border-[${s.secondary}]/60 transition-colors">
<div class="h-32 w-full" style="background-color: ${s.secondary};"></div>
<div class="bg-surface-container-high/60 backdrop-blur-xl p-5">
<div class="flex items-start justify-between mb-2">
<h5 class="font-headline font-extrabold text-lg uppercase tracking-tight">${escHtml(pn.secondary)}</h5>
${pc ? `<span class="font-label text-[10px] text-outline uppercase tracking-widest border border-outline-variant/40 px-2 py-0.5">${escHtml(pc.secondary)}</span>` : ''}
</div>
<div class="font-label text-sm text-[${s.secondary}] tracking-widest mb-2">${s.secondary}</div>
<p class="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Secondary Accent</p>
</div>
</div>
<div class="group overflow-hidden border border-outline-variant/20 hover:border-[${s.tertiary}]/60 transition-colors">
<div class="h-32 w-full" style="background-color: ${s.tertiary};"></div>
<div class="bg-surface-container-high/60 backdrop-blur-xl p-5">
<div class="flex items-start justify-between mb-2">
<h5 class="font-headline font-extrabold text-lg uppercase tracking-tight">${escHtml(pn.tertiary)}</h5>
${pc ? `<span class="font-label text-[10px] text-outline uppercase tracking-widest border border-outline-variant/40 px-2 py-0.5">${escHtml(pc.tertiary)}</span>` : ''}
</div>
<div class="font-label text-sm text-[${s.tertiary}] tracking-widest mb-2">${s.tertiary}</div>
<p class="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Tertiary Highlight</p>
</div>
</div>
</div>
</div>
</div>
</section>
</main>
${nav.footer}
${nav.bottomNav}
<script src="swipe-nav.js"><\/script>
</body></html>`;
}

function generateSwipeNav(forZip) {
  const pages = ['index.html', 'about.html'];
  if (builderState.includeTour) pages.push('tour.html');
  if (builderState.includeArmory) pages.push('armory.html');

  return `(function () {
  var pages = ${JSON.stringify(pages)};
  var path = window.location.pathname;
  var currentFile = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  var currentIndex = pages.indexOf(currentFile);
  if (currentIndex === -1) currentIndex = 0;

  var direction = sessionStorage.getItem('swipe-direction');
  if (direction) {
    sessionStorage.removeItem('swipe-direction');
    var pageContent = document.querySelector('main') || document.body;
    pageContent.style.animation = direction === 'forward'
      ? 'slideInFromRight 0.3s ease-out both'
      : 'slideInFromLeft 0.3s ease-out both';
  }

  var touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0, swiping = false;

  document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    swiping = true;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    if (!swiping) return;
    swiping = false;
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    var diffX = touchEndX - touchStartX;
    var diffY = touchEndY - touchStartY;
    if (Math.abs(diffX) < 60 || Math.abs(diffY) > Math.abs(diffX) * 0.7) return;
    if (window.innerWidth >= 768) return;
    var targetIndex, animDirection;
    if (diffX < 0) { targetIndex = currentIndex + 1; animDirection = 'forward'; }
    else { targetIndex = currentIndex - 1; animDirection = 'backward'; }
    if (targetIndex < 0 || targetIndex >= pages.length) return;
    sessionStorage.setItem('swipe-direction', animDirection);
    var pageContent = document.querySelector('main') || document.body;
    var animName = animDirection === 'forward' ? 'slideOutToLeft' : 'slideOutToRight';
    pageContent.style.animation = animName + ' 0.25s ease-in both';
    setTimeout(function () { window.location.href = pages[targetIndex]; }, 200);
  }, { passive: true });
})();`;
}

// --- Utility ---
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getCostumeName() {
  if (builderState.costume && builderState.costume !== 'custom' && COSTUME_PRESETS[builderState.costume]) {
    return COSTUME_PRESETS[builderState.costume].name;
  }
  return builderState.characterFirstName + ' ' + builderState.characterLastName;
}

// --- Preview ---
function generatePreview() {
  collectStep2();
  const iframe = document.getElementById('preview-frame');
  if (!iframe) return;
  const html = generateIndex(false);
  iframe.srcdoc = injectPreviewScript(html);
  // Show loading
  const loader = document.getElementById('preview-loader');
  if (loader) loader.classList.remove('hidden');
  iframe.onload = () => { if (loader) loader.classList.add('hidden'); };
  // Hide/show tour and armory tabs based on toggles
  const tourTab = document.getElementById('tab-tour');
  const armoryTab = document.getElementById('tab-armory');
  if (tourTab) tourTab.classList.toggle('hidden', !builderState.includeTour);
  if (armoryTab) armoryTab.classList.toggle('hidden', !builderState.includeArmory);
}

// Script injected into preview HTML to intercept nav clicks
const PREVIEW_NAV_SCRIPT = `<script>
document.addEventListener('click', function(e) {
  var link = e.target.closest('a[href]');
  if (!link) return;
  var href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
  e.preventDefault();
  var pageMap = {'index.html':'index','about.html':'about','tour.html':'tour','armory.html':'armory'};
  var page = pageMap[href];
  if (page && parent && parent.previewPage) parent.previewPage(page);
});
<\/script>`;

function injectPreviewScript(html) {
  return html.replace('</body>', PREVIEW_NAV_SCRIPT + '</body>');
}

function previewPage(page) {
  const iframe = document.getElementById('preview-frame');
  if (!iframe) return;
  let html;
  switch (page) {
    case 'index': html = generateIndex(false); break;
    case 'about': html = generateAbout(false); break;
    case 'tour': html = generateTour(false); break;
    case 'armory': html = generateArmory(false); break;
    default: html = generateIndex(false);
  }
  iframe.srcdoc = injectPreviewScript(html);
  // Update active tab
  document.querySelectorAll('[data-preview-tab]').forEach(tab => {
    tab.classList.toggle('bg-tertiary', tab.dataset.previewTab === page);
    tab.classList.toggle('text-black', tab.dataset.previewTab === page);
    tab.classList.toggle('bg-surface-container-high', tab.dataset.previewTab !== page);
    tab.classList.toggle('text-outline', tab.dataset.previewTab !== page);
  });
}

// --- ZIP Download ---
async function downloadSite() {
  collectStep2();
  // Load JSZip dynamically if not already loaded
  if (typeof JSZip === 'undefined') {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const btn = document.getElementById('download-btn');
  if (btn) { btn.textContent = 'Generating...'; btn.disabled = true; }

  try {
    const zip = new JSZip();
    zip.file('index.html', generateIndex(true));
    zip.file('about.html', generateAbout(true));
    if (builderState.includeTour) zip.file('tour.html', generateTour(true));
    if (builderState.includeArmory) zip.file('armory.html', generateArmory(true));
    zip.file('swipe-nav.js', generateSwipeNav(true));

    // Add images
    const imgFolder = zip.folder('public').folder('images');
    for (const [slot, imgData] of Object.entries(builderState.images)) {
      if (imgData && imgData.type === 'file') {
        const base64 = imgData.dataUrl.split(',')[1];
        imgFolder.file(imgData.filename, base64, { base64: true });
      }
    }

    // Generate dark placeholders for any missing images
    const allSlots = ['hero', 'profile', 'feature1', 'feature2', 'feature3'];
    for (const slot of allSlots) {
      if (!builderState.images[slot]) {
        const c = document.createElement('canvas');
        c.width = slot === 'hero' ? 1920 : 800;
        c.height = slot === 'hero' ? 1080 : 800;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#131411';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = builderState.primary;
        ctx.globalAlpha = 0.15;
        ctx.fillRect(0, 0, c.width, c.height);
        const placeholder = c.toDataURL('image/jpeg', 0.85).split(',')[1];
        imgFolder.file(slot + '.jpg', placeholder, { base64: true });
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (builderState.designation || 'trooper') + '-site.zip';
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('ZIP generation failed:', err);
    alert('Error generating site. Check console for details.');
  }

  if (btn) { btn.textContent = 'Download Site'; btn.disabled = false; }
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  renderCostumeGrid();
  setupImageSlots();
  showStep(1);
});

"""Pakker malte farge-/høydeatlas. Krever Pillow og numpy, bare ved endring av bildesettet.

python tools/prepare_textures.py <mappe med ground.png, buildings.png, dungeon.png,
map.png, banners.png, parchment.png>. Ferdige filer legges i assets/tex/.
"""
from pathlib import Path
import json
import sys

import numpy as np
from PIL import Image, ImageFilter

OUT = Path(__file__).resolve().parents[1] / 'assets' / 'tex'
RAW = OUT / 'raw'
SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else RAW
OUT.mkdir(parents=True, exist_ok=True)
RAW.mkdir(exist_ok=True)
SIZE = 512


def source_image(name):
    p = SOURCE / (name + '.png')
    return Image.open(p if p.exists() else SOURCE / (name + '.jpg'))


def periodic(a):
    """Periodisk-pluss-glatt dekomponering: fjern sprang ved motsatte kanter."""
    a = np.asarray(a, dtype=float)
    if a.ndim == 3:
        return np.stack([periodic(a[:, :, c]) for c in range(a.shape[2])], axis=2)
    h, w = a.shape
    b = np.zeros_like(a)
    b[0] += a[-1] - a[0]
    b[-1] += a[0] - a[-1]
    b[:, 0] += a[:, -1] - a[:, 0]
    b[:, -1] += a[:, 0] - a[:, -1]
    den = 2 * np.cos(2 * np.pi * np.arange(h)[:, None] / h) + 2 * np.cos(2 * np.pi * np.arange(w)[None, :] / w) - 4
    den[0, 0] = 1
    smooth = np.fft.fft2(b) / den
    smooth[0, 0] = 0
    return a - np.fft.ifft2(smooth).real


def cell(img, cols, col, row):
    w, h = img.size
    box = (round(col * w / cols), round(row * h / 4), round((col + 1) * w / cols), round((row + 1) * h / 4))
    return img.crop(box).resize((SIZE, SIZE), Image.Resampling.LANCZOS)


def normal(height, strength):
    # Bilde-y peker ned. OpenGL-normalkartets grønne kanal peker opp langs UV-v.
    dx = (np.roll(height, -1, axis=1) - np.roll(height, 1, axis=1)) * strength
    dy = (np.roll(height, -1, axis=0) - np.roll(height, 1, axis=0)) * strength
    n = np.stack([-dx, dy, np.ones_like(dx)], axis=2)
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    return Image.fromarray(np.uint8(np.clip((n * 0.5 + 0.5) * 255, 0, 255)))


report = {}
atlas = {}
specs = {
    'ground': (4, ['gress', 'skogbunn', 'jord', 'brostein', 'heller', 'planker', 'klippe', 'teltduk']),
    'buildings': (4, ['bindingsverk', 'steinvegg', 'bymur', 'takstein', 'spon', 'halm', 'skifer', 'kobber']),
    'dungeon': (3, ['kloakk_gulv', 'dverg_gulv', 'rev_gulv', 'kloakk_vegg', 'dverg_vegg', 'rev_vegg']),
}
brightness = {
    'gress': 128, 'skogbunn': 120, 'jord': 136, 'brostein': 140,
    'heller': 156, 'planker': 128, 'klippe': 142, 'teltduk': 207,
    'steinvegg': 178, 'bymur': 143, 'takstein': 118, 'spon': 125,
    'halm': 145, 'skifer': 132, 'kobber': 139,
    'kloakk_gulv': 130, 'dverg_gulv': 141, 'rev_gulv': 122,
    'kloakk_vegg': 126, 'dverg_vegg': 138, 'rev_vegg': 114,
}
for source, (cols, names) in specs.items():
    img = source_image(source).convert('RGB')
    # Kildene er arbeidsatlas, ikke teksturer som lastes i spillet.
    if SOURCE.resolve() != RAW.resolve():
        img.save(RAW / (source + '.jpg'), quality=92, optimize=True)
    for i, name in enumerate(names):
        row = (i // cols) * 2
        c = np.asarray(cell(img, cols, i % cols, row), dtype=float)
        # Høyden kommer fra den egne høyderaden, aldri fra fargekartet.
        hi = cell(img, cols, i % cols, row + 1).convert('L').filter(ImageFilter.GaussianBlur(2.0))
        h = np.asarray(hi, dtype=float) / 255
        atlas[name] = (periodic(c), periodic(h))

# Bindingsverket har faste UV-felt. Sett de malte materialene inn i samme
# oppsett som timber() i towntex.js, så stolper og sokkel treffer geometrien.
y, x = np.mgrid[0:SIZE, 0:SIZE]
u, v = (x + 0.5) / SIZE, 1 - (y + 0.5) / SIZE
wood, wh = atlas['planker']
wall, sh = atlas['steinvegg']
plaster = np.array([214, 205, 185])[None, None, :] + (wall - wall.mean(axis=(0, 1))) * 0.22
post = np.minimum.reduce([u, np.abs(u - 0.5), 1 - u]) < 0.032
t = (v - 0.545) / 0.385
brace_u = np.where(u < 0.5, 0.035 + t * 0.43, 0.965 - t * 0.43)
brace = (v > 0.545) & (v < 0.93) & (np.abs(u - brace_u) < 0.022)
beam = post | (v < 0.13) | (v > 0.935) | (np.abs(v - 0.52) < 0.024) | brace
timber_c = np.where(beam[:, :, None], wood * 0.62, plaster)
timber_h = np.where(beam, 0.78 + wh * 0.08, 0.38 + sh * 0.03)
plinth = v < 0.085
timber_c[plinth] = wall[y[plinth] * 8 % SIZE, x[plinth]] * 0.78
timber_h[plinth] = sh[y[plinth] * 8 % SIZE, x[plinth]] * 0.3 + 0.36
# La sokkel og overbånd dele en smal kant. Resten av UV-feltene beholdes.
for a in [timber_c, timber_h]:
    edge = (a[0].copy() + a[-1].copy()) / 2
    for k in range(12):
        f = 0.5 + 0.5 * np.cos(np.pi * k / 12)
        a[k] = a[k] * (1 - f) + edge * f
        a[-1 - k] = a[-1 - k] * (1 - f) + edge * f
atlas['bindingsverk'] = (timber_c, timber_h)

for name, (c, h) in atlas.items():
    if name in brightness:
        c *= brightness[name] / c.mean()
    ci = Image.fromarray(np.uint8(np.clip(c, 0, 255)))
    ci.save(OUT / (name + '_c.jpg'), quality=76, subsampling=2, optimize=True)
    hi = Image.fromarray(np.uint8(np.clip(h * 255, 0, 255)))
    hi.save(RAW / (name + '_h.png'), optimize=True)
    strength = 1.5 if name in ['gress', 'skogbunn', 'teltduk'] else 3.0
    # Paletten bevarer de svake normalene uten JPEG-støy eller stort PNG-budsjett.
    normal(h, strength).quantize(colors=24, dither=Image.Dither.NONE).save(OUT / (name + '_n.png'), optimize=True)
    report[name] = {'size': SIZE, 'meanRGB': [round(float(t), 1) for t in c.mean(axis=(0, 1))], 'height': name + '_h.png'}

paper = source_image('parchment').convert('RGB').resize((SIZE, SIZE), Image.Resampling.LANCZOS)
c = periodic(paper)
c *= 217 / c.mean()
Image.fromarray(np.uint8(np.clip(c, 0, 255))).save(OUT / 'pergament_c.jpg', quality=80, optimize=True)
if SOURCE.resolve() != RAW.resolve():
    paper.save(RAW / 'parchment.jpg', quality=92, optimize=True)
world = source_image('map').convert('RGB')
if SOURCE.resolve() != RAW.resolve():
    world.save(RAW / 'map.jpg', quality=92, optimize=True)
world.resize((1600, 1152), Image.Resampling.LANCZOS).save(OUT / 'edelfara_kart_c.jpg', quality=80, optimize=True)
flags = Image.open(SOURCE / 'banners.png').convert('RGBA')
flags.save(RAW / 'banners.png', optimize=True)
w, ht = flags.size
for i, name in enumerate(['edelfara', 'eke', 'ridderskors', 'lekh']):
    f = flags.crop((round(i * w / 4), round(ht * 0.018), round((i + 1) * w / 4), ht))
    f = f.resize((256, 512), Image.Resampling.LANCZOS)
    # Fjern bare lav alfa fra bakgrunnsutskjæringen, behold revne kanter.
    rgba = np.array(f)
    rgba[rgba[:, :, 3] < 96, 3] = 0
    Image.fromarray(rgba).quantize(colors=96, dither=Image.Dither.NONE).save(OUT / ('fane_' + name + '.png'), optimize=True)

size = sum(p.stat().st_size for p in OUT.iterdir() if p.suffix in ['.jpg', '.png'])
assert size < 4_000_000, f'Teksturene tar {size} byte'
report['runtimeBytes'] = size
(RAW / 'manifest.json').write_text(json.dumps(report, indent=2) + '\n')
print(f'{len(atlas)} materialpar og 6 grafikkbilder, {size / 1024:.0f} KiB')

import sys
import numpy as np
import trimesh
from PIL import Image

src, tex, dst = sys.argv[1], sys.argv[2], sys.argv[3]
mesh = trimesh.load(src, process=False, force='mesh')
print("verts", len(mesh.vertices), "faces", len(mesh.faces), "visual", type(mesh.visual).__name__)
b = mesh.bounds
# feet on y=0, centered in x/z
off = np.array([-(b[0][0] + b[1][0]) / 2, -b[0][1], -(b[0][2] + b[1][2]) / 2])
mesh.apply_translation(off)
print("bounds", mesh.bounds.tolist())
img = Image.open(tex)
mat = trimesh.visual.material.PBRMaterial(baseColorTexture=img, metallicFactor=0.0, roughnessFactor=0.85, name="duck")
uv = mesh.visual.uv
mesh.visual = trimesh.visual.TextureVisuals(uv=uv, material=mat)
vn = np.asarray(mesh.vertex_normals).copy()
print("normals", vn.shape)
mesh.export(dst, include_normals=True)
print("wrote", dst)

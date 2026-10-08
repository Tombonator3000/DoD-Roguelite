"""Pack an OBJ (with uv + normals) into a compact binary blob for the game.

Layout (little endian):
  magic 'DUCK' | u32 vcount | u32 icount | f32 bbox min xyz | f32 bbox max xyz
  u16 pos[vcount*3] (quantized to bbox) | i8 nrm[vcount*3] | u16 uv[vcount*2] (0..1, OBJ convention)
  pad to 2 | u16 idx[icount]
"""
import sys, struct
import numpy as np
import trimesh

src, dst = sys.argv[1], sys.argv[2]
mesh = trimesh.load(src, process=False, force='mesh')
v = np.asarray(mesh.vertices, dtype=np.float64)
b0 = v.min(0)
off = np.array([-(v[:, 0].min() + v[:, 0].max()) / 2, -b0[1], -(v[:, 2].min() + v[:, 2].max()) / 2])
v = v + off
n = np.asarray(mesh.vertex_normals, dtype=np.float64)
n = n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-9)
uv = np.asarray(mesh.visual.uv, dtype=np.float64)
f = np.asarray(mesh.faces, dtype=np.int64).reshape(-1)
assert len(v) < 65536
mn, mx = v.min(0), v.max(0)
q = np.round((v - mn) / (mx - mn) * 65535).astype('<u2')
nq = np.clip(np.round(n * 127), -127, 127).astype('i1')
uvq = np.round(np.clip(uv, 0, 1) * 65535).astype('<u2')
out = bytearray()
out += b'DUCK' + struct.pack('<II', len(v), len(f)) + struct.pack('<6f', *mn, *mx)
out += q.tobytes() + nq.tobytes()
if len(out) % 2:
    out += b'\0'
out += uvq.tobytes()
out += f.astype('<u2').tobytes()
open(dst, 'wb').write(out)
print('verts', len(v), 'tris', len(f) // 3, 'bytes', len(out), 'bbox', mn.round(3).tolist(), mx.round(3).tolist())

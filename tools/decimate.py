import sys, time
import pymeshlab as ml

src, dst, target = sys.argv[1], sys.argv[2], int(sys.argv[3])
t = time.time()
ms = ml.MeshSet()
ms.load_new_mesh(src)
m = ms.current_mesh()
print("loaded", m.vertex_number(), m.face_number(), "wedge_tc", m.has_wedge_tex_coord(), "vert_tc", m.has_vertex_tex_coord(), round(time.time() - t, 1), "s")
if m.has_vertex_tex_coord() and not m.has_wedge_tex_coord():
    ms.compute_texcoord_transfer_vertex_to_wedge()
ms.meshing_remove_duplicate_faces()
ms.meshing_merge_close_vertices(threshold=ml.PercentageValue(0.01))
m = ms.current_mesh()
print("after merge", m.vertex_number(), m.face_number())
# step down gradually for quality
for f in [300000, 100000, target]:
    if ms.current_mesh().face_number() <= f:
        continue
    ms.meshing_decimation_quadric_edge_collapse_with_texture(
        targetfacenum=f, qualitythr=0.5, extratcoordw=1.0,
        preserveboundary=True, boundaryweight=1.0, optimalplacement=True,
        preservenormal=True, planarquadric=True)
    m = ms.current_mesh()
    print("decimated", m.vertex_number(), m.face_number(), round(time.time() - t, 1), "s")
ms.compute_normal_per_vertex(weightmode=2)
ms.save_current_mesh(dst, save_wedge_texcoord=True, save_vertex_normal=True)
print("bbox min", ms.current_mesh().bounding_box().min(), "max", ms.current_mesh().bounding_box().max())
print("done", round(time.time() - t, 1), "s")

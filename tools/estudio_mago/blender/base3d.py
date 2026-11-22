"""Base comum: ajudantes, materiais e estúdio 3D do Podcast do Mago (exec por cada personagem)."""
import bpy, math, sys, os
from mathutils import Vector, Euler
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '/tmp/mago3d.blend'; STILL = argv[1] if len(argv) > 1 else None
bpy.ops.wm.read_factory_settings(use_empty=True)
S = bpy.context.scene

# ---------------------------------------------------------------- helpers
def mat(name, col, rough=0.6, emit=None, strength=0.0, metal=0.0, sss=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if sss: b.inputs['Subsurface Weight'].default_value = sss; b.inputs['Subsurface Radius'].default_value = (1.0, 0.35, 0.2)
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = strength
    return m
def put(obj, m, smooth=True, sub=0):
    obj.data.materials.append(m)
    if smooth: bpy.ops.object.shade_smooth()
    if sub: obj.modifiers.new('sub', 'SUBSURF').levels = sub; obj.modifiers['sub'].render_levels = sub
    return obj
def sphere(name, loc, scale, m, seg=32, sub=1):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, location=loc); o = bpy.context.object; o.name = name; o.scale = scale
    return put(o, m, True, sub)
def cyl(name, loc, r, depth, m, rot=(0, 0, 0), verts=32, r2=None, sub=0):
    if r2 is None: bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    else: bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r2, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; return put(o, m, True, sub)
def limb(name, p1, p2, r1, r2, m, sub=1):
    a, b = Vector(p1), Vector(p2); d = b - a
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=r1, radius2=r2, depth=d.length, location=(a + b) / 2)
    o = bpy.context.object; o.name = name; o.rotation_mode = 'QUATERNION'; o.rotation_quaternion = d.to_track_quat('Z', 'Y'); return put(o, m, True, sub)
def torus(name, loc, R, r, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot, major_segments=48, minor_segments=12)
    o = bpy.context.object; o.name = name; return put(o, m, True, 0)

# ---------------------------------------------------------------- materials
SKIN = mat('pele', (0.93, 0.62, 0.50), 0.55, sss=0.15); NOSE = mat('nariz', (0.95, 0.50, 0.45), 0.45, sss=0.2)
ROBE = mat('manto', (0.16, 0.04, 0.36), 0.8); GOLD = mat('ouro', (1.0, 0.72, 0.18), 0.3, metal=0.9)
HAT = mat('chapeu', (0.19, 0.05, 0.42), 0.75); BEARD = mat('barba', (0.95, 0.94, 0.92), 0.7)
EYEW = mat('olho', (0.97, 0.97, 0.97), 0.15); IRIS = mat('iris', (0.15, 0.45, 0.85), 0.2); PUP = mat('pupila', (0.01, 0.01, 0.02), 0.1)
MOUTH = mat('boca', (0.25, 0.04, 0.06), 0.6); WOOD = mat('madeira', (0.20, 0.09, 0.035), 0.45); WALL = mat('parede', (0.035, 0.02, 0.06), 0.9)
METAL = mat('metal', (0.08, 0.08, 0.09), 0.35, metal=0.8); MUG = mat('caneca', (0.85, 0.20, 0.30), 0.35)
NEON_P = mat('neon_rosa', (1, 0.2, 0.7), 0.4, emit=(1, 0.2, 0.75), strength=12); NEON_C = mat('neon_ciano', (0.2, 0.9, 1), 0.4, emit=(0.2, 0.9, 1), strength=12)


def armature(bones):
    global ARM
    bpy.ops.object.armature_add(location=(0, 0, 0)); ARM = bpy.context.object; ARM.name = 'Rig'
    bpy.ops.object.mode_set(mode='EDIT'); eb = ARM.data.edit_bones; eb.remove(eb[0])
    for n, h, t, p in bones:
        b = eb.new(n); b.head = h; b.tail = t
        if p: b.parent = eb[p]
    bpy.ops.object.mode_set(mode='OBJECT'); return ARM
def bind(o, b):
    mw = o.matrix_world.copy(); o.parent = ARM; o.parent_type = 'BONE'; o.parent_bone = b; o.matrix_world = mw

def studio():
    # ---------------------------------------------------------------- studio
    bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 0, 0)); put(bpy.context.object, WOOD, False)
    bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 1.6, 3), rotation=(math.pi / 2, 0, 0)); put(bpy.context.object, WALL, False)
    for i in range(-3, 4):                                                                # acoustic foam blocks on the wall
        for j in range(5):
            bpy.ops.mesh.primitive_cube_add(size=0.34, location=(i * 0.4 + (0.2 if j % 2 else 0), 1.55, 1.0 + j * 0.4)); c = bpy.context.object
            c.scale = (1, 0.25, 1); put(c, WALL, False)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.9, 0.92)); desk = bpy.context.object; desk.scale = (2.6, 0.9, 0.08); put(desk, WOOD, False)
    bpy.ops.object.modifier_add(type='BEVEL'); desk.modifiers['Bevel'].width = 0.03
    cyl('mic_base', (0.75, -1.05, 0.98), 0.09, 0.03, METAL); limb('mic_haste', (0.75, -1.05, 0.98), (0.6, -0.95, 1.35), 0.014, 0.014, METAL, 0)
    limb('mic', (0.6, -0.95, 1.30), (0.5, -0.82, 1.50), 0.06, 0.06, METAL); sphere('mic_cabeca', (0.5, -0.82, 1.50), (0.065, 0.065, 0.065), METAL, 24, 1)
    cyl('caneca', (-0.75, -1.05, 1.03), 0.07, 0.15, MUG); torus('alca', (-0.83, -1.05, 1.03), 0.04, 0.012, MUG, rot=(math.pi / 2, 0, 0))
    for k, (x, col) in enumerate([(-1.3, NEON_P), (-1.05, NEON_C), (1.1, NEON_P), (1.35, NEON_C)]):   # glowing potions on shelves
        cyl(f'pocao_{k}', (x, 1.2, 1.9 + (k % 2) * 0.05), 0.06, 0.2, col, sub=1)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-1.2, 1.25, 1.78)); sh = bpy.context.object; sh.scale = (0.7, 0.18, 0.03); put(sh, WOOD, False)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.2, 1.25, 1.78)); sh = bpy.context.object; sh.scale = (0.7, 0.18, 0.03); put(sh, WOOD, False)
    bpy.ops.object.text_add(location=(-0.95, 1.45, 3.45), rotation=(math.pi / 2, 0, 0)); tx = bpy.context.object; tx.data.body = 'PODCAST'; tx.data.size = 0.42; tx.data.extrude = 0.02; tx.data.materials.append(NEON_P)
    bpy.ops.object.text_add(location=(-0.82, 1.45, 3.0), rotation=(math.pi / 2, 0, 0)); tx = bpy.context.object; tx.data.body = 'DO MAGO'; tx.data.size = 0.36; tx.data.extrude = 0.02; tx.data.materials.append(NEON_C)

    # ---------------------------------------------------------------- lights & camera & render
    def light(kind, loc, energy, col, size=1.0, rot=(0, 0, 0)):
        bpy.ops.object.light_add(type=kind, location=loc, rotation=rot); l = bpy.context.object; l.data.energy = energy; l.data.color = col
        if kind == 'AREA': l.data.size = size
        return l
    light('AREA', (1.6, -2.4, 3.2), 230, (1.0, 0.85, 0.7), 2.0, (math.radians(55), 0, math.radians(35)))       # warm key
    light('AREA', (-2.2, -1.5, 2.4), 60, (0.55, 0.45, 1.0), 2.5, (math.radians(65), 0, math.radians(-55)))   # cool fill
    light('AREA', (0.6, 1.2, 3.0), 300, (1.0, 0.3, 0.8), 1.5, (math.radians(-140), 0, 0))                    # pink rim (neon)
    light('POINT', (-1.2, 1.0, 2.0), 60, (0.3, 0.9, 1.0))
    bpy.ops.object.camera_add(location=(0, -4.6, 1.95), rotation=(math.radians(88), 0, 0)); CAM = bpy.context.object; CAM.name = 'Camera'
    CAM.data.lens = 50; CAM.data.dof.use_dof = True; CAM.data.dof.focus_distance = 4.1; CAM.data.dof.aperture_fstop = 2.8; S.camera = CAM
    W = S.world or bpy.data.worlds.new('w'); S.world = W; W.use_nodes = True; W.node_tree.nodes['Background'].inputs[0].default_value = (0.02, 0.01, 0.04, 1)
    S.render.engine = 'BLENDER_EEVEE'; e = S.eevee; e.use_bloom = True; e.bloom_intensity = 0.06; e.use_gtao = True; e.gtao_distance = 0.4
    e.use_soft_shadows = True; e.taa_render_samples = 32; e.use_ssr = True
    S.view_settings.view_transform = 'Filmic'; S.view_settings.look = 'High Contrast'
    S.render.resolution_x = 1080; S.render.resolution_y = 1352; S.render.fps = 24

def finish():
    bpy.ops.wm.save_as_mainfile(filepath=OUT)
    if STILL:
        S.render.resolution_percentage = 50; S.render.filepath = STILL; bpy.ops.render.render(write_still=True)
    print('OK', OUT)

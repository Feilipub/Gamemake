"""Constrói o MAGO 3D (estilizado, tipo animação) + estúdio do podcast, com esqueleto para animação.
uso: blender -b --python mago3d.py -- saida.blend [still.png]"""
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

# ---------------------------------------------------------------- armature (bones the animation drives)
bpy.ops.object.armature_add(location=(0, 0, 0)); ARM = bpy.context.object; ARM.name = 'Rig'
bpy.ops.object.mode_set(mode='EDIT'); eb = ARM.data.edit_bones; eb.remove(eb[0])
def bone(n, h, t, parent=None):
    b = eb.new(n); b.head = h; b.tail = t
    if parent: b.parent = eb[parent]
    return b
bone('root', (0, 0, 0), (0, 0, 0.3)); bone('spine', (0, 0, 0.75), (0, 0, 1.25), 'root'); bone('chest', (0, 0, 1.25), (0, 0, 1.55), 'spine')
bone('neck', (0, 0, 1.55), (0, 0, 1.7), 'chest'); bone('head', (0, 0, 1.7), (0, 0, 2.2), 'neck'); bone('jaw', (0, -0.05, 1.86), (0, -0.30, 1.80), 'head')
bone('hat', (0, 0, 2.25), (0, 0, 2.6), 'head'); bone('hat_tip', (0, 0.05, 2.6), (0, 0.25, 3.0), 'hat')
bone('lid_L', (0.13, -0.33, 2.03), (0.13, -0.40, 2.03), 'head'); bone('lid_R', (-0.13, -0.33, 2.03), (-0.13, -0.40, 2.03), 'head')
bone('brow_L', (0.14, -0.33, 2.13), (0.14, -0.40, 2.13), 'head'); bone('brow_R', (-0.14, -0.33, 2.13), (-0.14, -0.40, 2.13), 'head')
for s, x in (('L', 1), ('R', -1)):
    bone(f'upper_{s}', (0.40 * x, 0, 1.47), (0.56 * x, -0.14, 1.13), 'chest'); bone(f'fore_{s}', (0.56 * x, -0.14, 1.13), (0.32 * x, -0.56, 1.04), f'upper_{s}')
    bone(f'hand_{s}', (0.32 * x, -0.56, 1.04), (0.24 * x, -0.72, 1.02), f'fore_{s}')
bpy.ops.object.mode_set(mode='OBJECT')
def bind(o, b):
    mw = o.matrix_world.copy(); o.parent = ARM; o.parent_type = 'BONE'; o.parent_bone = b; o.matrix_world = mw

# ---------------------------------------------------------------- body: bell-shaped robe (lathe)
bpy.ops.mesh.primitive_circle_add(vertices=48, radius=1)
bpy.ops.object.delete()
verts = [(0.62, 0.55), (0.60, 0.8), (0.52, 1.1), (0.44, 1.35), (0.34, 1.52), (0.16, 1.62), (0.01, 1.64)]
me = bpy.data.meshes.new('perfil'); me.from_pydata([(r, 0, z) for r, z in verts], [(i, i + 1) for i in range(len(verts) - 1)], [])
robe = bpy.data.objects.new('manto', me); S.collection.objects.link(robe); bpy.context.view_layer.objects.active = robe; robe.select_set(True)
sc = robe.modifiers.new('lathe', 'SCREW'); sc.steps = 48; sc.render_steps = 48; sc.use_smooth_shade = True
bpy.ops.object.modifier_apply(modifier='lathe'); robe.scale = (1.0, 0.82, 1.0); put(robe, ROBE, True, 2)
torus('gola', (0, 0, 1.56), 0.24, 0.05, GOLD); bind(bpy.data.objects['gola'], 'chest'); bind(robe, 'spine')


# ---------------------------------------------------------------- head
head = sphere('cabeca', (0, 0, 1.98), (0.36, 0.33, 0.38), SKIN, 48, 1); bind(head, 'head')
nose = sphere('nariz', (0, -0.36, 1.97), (0.10, 0.10, 0.09), NOSE, 32, 1); bind(nose, 'head')
for x in (1, -1):
    e = sphere(f'orelha_{x}', (0.36 * x, 0.02, 1.98), (0.05, 0.10, 0.13), SKIN, 24, 1); bind(e, 'head')
    ew = sphere(f'olho_{x}', (0.13 * x, -0.27, 2.04), (0.085, 0.07, 0.09), EYEW, 32, 1); bind(ew, 'head')
    ir = sphere(f'iris_{x}', (0.13 * x, -0.335, 2.035), (0.045, 0.02, 0.05), IRIS, 24, 0); bind(ir, 'head')
    pu = sphere(f'pupila_{x}', (0.13 * x, -0.352, 2.035), (0.022, 0.01, 0.026), PUP, 16, 0); bind(pu, 'head')
    s = 'L' if x > 0 else 'R'
    lid = sphere(f'palpebra_{s}', (0.13 * x, -0.275, 2.045), (0.092, 0.08, 0.098), SKIN, 32, 1)    # upper lid shell
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='DESELECT'); bpy.ops.object.mode_set(mode='OBJECT')
    for v in lid.data.vertices:
        if v.co.z < 0.15: v.select = True
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.delete(type='VERT'); bpy.ops.object.mode_set(mode='OBJECT')
    bind(lid, f'lid_{s}')
    br = sphere(f'sobrancelha_{s}', (0.15 * x, -0.31, 2.15), (0.11, 0.05, 0.035), BEARD, 24, 1); br.rotation_euler = (0, -0.25 * x, 0); bind(br, f'brow_{s}')
mouth = sphere('boca', (0, -0.29, 1.84), (0.12, 0.06, 0.05), MOUTH, 24, 1); bind(mouth, 'head')

# beard: upper (moustache, follows head) + lower (chin beard, follows jaw) as soft sculpted blobs
mus = sphere('bigode', (0, -0.36, 1.89), (0.24, 0.07, 0.055), BEARD, 32, 2); mus.rotation_euler = (0.2, 0, 0); bind(mus, 'head')
beard = sphere('barba', (0, -0.22, 1.62), (0.30, 0.18, 0.34), BEARD, 40, 2); bind(beard, 'jaw')
bm = beard.modifiers.new('ondas', 'DISPLACE'); tex = bpy.data.textures.new('fios', 'CLOUDS'); tex.noise_scale = 0.05; bm.texture = tex; bm.strength = 0.03
tip = sphere('barba_ponta', (0, -0.24, 1.36), (0.16, 0.12, 0.16), BEARD, 32, 2); bind(tip, 'jaw')

# ---------------------------------------------------------------- hat: floppy cone + brim + golden band
brim = cyl('aba', (0, 0, 2.24), 0.62, 0.035, HAT, verts=64); bind(brim, 'hat')
band = torus('faixa_chapeu', (0, 0, 2.30), 0.36, 0.045, GOLD); bind(band, 'hat')
prof = [(0.38 * (1 - k / 14) ** 0.9 + 0.012, 1.15 * k / 14) for k in range(15)]
me = bpy.data.meshes.new('perfil_chapeu'); me.from_pydata([(r, 0, z) for r, z in prof], [(i, i + 1) for i in range(len(prof) - 1)], [])
cone = bpy.data.objects.new('cone', me); cone.location = (0, 0, 2.26); S.collection.objects.link(cone); bpy.context.view_layer.objects.active = cone
for o in bpy.context.selected_objects: o.select_set(False)
cone.select_set(True); sc2 = cone.modifiers.new('lathe', 'SCREW'); sc2.steps = 48; sc2.render_steps = 48; sc2.use_smooth_shade = True
bpy.ops.object.modifier_apply(modifier='lathe'); put(cone, HAT, True, 1)
bd = cone.modifiers.new('dobra', 'SIMPLE_DEFORM'); bd.deform_method = 'BEND'; bd.angle = math.radians(-75); bd.deform_axis = 'X'
cone.modifiers.move(cone.modifiers.find('dobra'), 0); bind(cone, 'hat')
star = sphere('estrela', (0.13, -0.33, 2.5), (0.045, 0.02, 0.045), GOLD, 12, 0); bind(star, 'hat')

# ---------------------------------------------------------------- arms: sleeves + mitten hands
for s, x in (('L', 1), ('R', -1)):
    sh_, el, wr = (0.40 * x, 0.0, 1.47), (0.56 * x, -0.14, 1.13), (0.32 * x, -0.56, 1.04)
    up = limb(f'manga_{s}', sh_, el, 0.13, 0.15, ROBE); bind(up, f'upper_{s}')
    sphere(f'cotovelo_{s}', el, (0.15, 0.15, 0.15), ROBE, 24, 1); bind(bpy.data.objects[f'cotovelo_{s}'], f'fore_{s}')
    fo = limb(f'antebraco_{s}', el, wr, 0.15, 0.17, ROBE); bind(fo, f'fore_{s}')
    cuff = torus(f'punho_{s}', (0.315 * x, -0.575, 1.037), 0.15, 0.022, GOLD, rot=(1.45, 0, 0.55 * x)); bind(cuff, f'fore_{s}')
    hd = sphere(f'mao_{s}', (0.27 * x, -0.66, 1.03), (0.10, 0.12, 0.075), SKIN, 24, 1); bind(hd, f'hand_{s}')
    th = sphere(f'polegar_{s}', (0.19 * x, -0.62, 1.06), (0.035, 0.06, 0.035), SKIN, 16, 1); th.rotation_euler = (0, 0, 0.5 * x); bind(th, f'hand_{s}')
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
bpy.ops.wm.save_as_mainfile(filepath=OUT)
if STILL:
    S.render.resolution_percentage = 50; S.render.filepath = STILL; bpy.ops.render.render(write_still=True)
print('OK', OUT)

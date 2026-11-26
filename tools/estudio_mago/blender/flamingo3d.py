"""FLÁVIO FLAMINGO 3D: pescoço em S, bico curvo com ponta preta, óculos escuros, camisa havaiana, crista, asas.
Mesmos nomes de ossos do Mago, então o mesmo animar.py move os dois. uso: blender -b --python flamingo3d.py -- saida.blend [still.png]"""
import os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'base3d.py')).read())
PINK = mat('rosa', (1.0, 0.36, 0.55), 0.55, sss=0.1); PINK2 = mat('rosa_escuro', (0.85, 0.18, 0.40), 0.6)
BEAKM = mat('bico', (1.0, 0.62, 0.55), 0.4); BEAKT = mat('bico_ponta', (0.03, 0.03, 0.04), 0.3)
GLASS = mat('oculos', (0.02, 0.02, 0.04), 0.08, metal=0.3); LENS = mat('lente', (0.25, 0.05, 0.35), 0.05, emit=(0.9, 0.1, 0.7), strength=0.6)
SHIRT = bpy.data.materials.new('camisa'); SHIRT.use_nodes = True; nt = SHIRT.node_tree; bsdf = nt.nodes['Principled BSDF']
vor = nt.nodes.new('ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 4.5; ramp = nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = (1.0, 0.85, 0.15, 1)
ramp.color_ramp.elements[1].position = 0.32; ramp.color_ramp.elements[1].color = (0.05, 0.6, 0.75, 1)
nt.links.new(vor.outputs['Distance'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], bsdf.inputs['Base Color']); bsdf.inputs['Roughness'].default_value = 0.7

HZ = 2.55                                                                               # head height
armature([('root', (0, 0, 0), (0, 0, 0.3), None), ('spine', (0, 0.1, 0.75), (0, 0.1, 1.2), 'root'), ('chest', (0, 0.1, 1.2), (0, 0.05, 1.5), 'spine'),
          ('neck', (0, 0.0, 1.5), (0, -0.05, 2.35), 'chest'), ('head', (0, -0.05, 2.35), (0, -0.05, 2.8), 'neck'), ('jaw', (0, -0.25, HZ - 0.06), (0, -0.6, HZ - 0.2), 'head'),
          ('hat', (0, 0.05, HZ + 0.2), (0, 0.1, HZ + 0.35), 'head'), ('hat_tip', (0, 0.1, HZ + 0.35), (0, 0.2, HZ + 0.55), 'hat'),
          ('lid_L', (0.11, -0.27, HZ + 0.06), (0.11, -0.35, HZ + 0.06), 'head'), ('lid_R', (-0.11, -0.27, HZ + 0.06), (-0.11, -0.35, HZ + 0.06), 'head'),
          ('brow_L', (0.12, -0.27, HZ + 0.15), (0.12, -0.35, HZ + 0.15), 'head'), ('brow_R', (-0.12, -0.27, HZ + 0.15), (-0.12, -0.35, HZ + 0.15), 'head'),
          ('upper_L', (0.40, 0.1, 1.40), (0.56, -0.05, 1.10), 'chest'), ('fore_L', (0.56, -0.05, 1.10), (0.32, -0.50, 1.04), 'upper_L'), ('hand_L', (0.32, -0.50, 1.04), (0.24, -0.65, 1.02), 'fore_L'),
          ('upper_R', (-0.40, 0.1, 1.40), (-0.56, -0.05, 1.10), 'chest'), ('fore_R', (-0.56, -0.05, 1.10), (-0.32, -0.50, 1.04), 'upper_R'), ('hand_R', (-0.32, -0.50, 1.04), (-0.24, -0.65, 1.02), 'fore_R')])
body = sphere('corpo', (0, 0.12, 1.08), (0.52, 0.46, 0.52), SHIRT, 48, 2); bind(body, 'spine')
col_ = torus('gola', (0, 0.05, 1.48), 0.16, 0.045, SHIRT); bind(col_, 'chest')
cu = bpy.data.curves.new('pescoco', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.085; cu.bevel_resolution = 6; sp = cu.splines.new('BEZIER')
P3 = [(0, 0.05, 1.42), (0, -0.16, 1.80), (0, 0.06, 2.12), (0, -0.04, 2.40)]; sp.bezier_points.add(len(P3) - 1)
for bp, c in zip(sp.bezier_points, P3): bp.co = c; bp.handle_left_type = bp.handle_right_type = 'AUTO'
neck = bpy.data.objects.new('pescoco', cu); S.collection.objects.link(neck); neck.data.materials.append(PINK); bind(neck, 'chest')
head = sphere('cabeca', (0, -0.05, HZ), (0.26, 0.25, 0.25), PINK, 48, 1); bind(head, 'head')
up = limb('bico_sup', (0, -0.22, HZ - 0.02), (0, -0.58, HZ - 0.20), 0.10, 0.045, BEAKM); bind(up, 'head')
bind(sphere('bico_ponta', (0, -0.57, HZ - 0.205), (0.048, 0.048, 0.05), BEAKT, 24, 1), 'head')
lo = limb('bico_inf', (0, -0.22, HZ - 0.10), (0, -0.52, HZ - 0.26), 0.07, 0.035, BEAKM); bind(lo, 'jaw')
bind(sphere('bico_inf_ponta', (0, -0.52, HZ - 0.265), (0.034, 0.034, 0.035), BEAKT, 16, 1), 'jaw')
bind(sphere('boca', (0, -0.24, HZ - 0.08), (0.08, 0.06, 0.035), MOUTH, 24, 1), 'head')
for x, s in ((1, 'L'), (-1, 'R')):                                                         # eyes behind glasses (glasses slide up when surprised: brow bones)
    bind(sphere(f'olho_{s}', (0.11 * x, -0.21, HZ + 0.06), (0.075, 0.06, 0.08), EYEW, 24, 1), 'head')
    bind(sphere(f'pupila_{s}', (0.11 * x, -0.27, HZ + 0.055), (0.03, 0.01, 0.035), PUP, 16, 0), 'head')
    lid = sphere(f'palpebra_{s}', (0.11 * x, -0.215, HZ + 0.065), (0.082, 0.07, 0.088), PINK, 24, 1)
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='DESELECT'); bpy.ops.object.mode_set(mode='OBJECT')
    for v in lid.data.vertices:
        if v.co.z < 0.15: v.select = True
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.delete(type='VERT'); bpy.ops.object.mode_set(mode='OBJECT'); bind(lid, f'lid_{s}')
    ln = sphere(f'lente_{s}', (0.12 * x, -0.29, HZ + 0.07), (0.10, 0.025, 0.075), LENS, 32, 1); bind(ln, f'brow_{s}')
    rim = torus(f'aro_{s}', (0.12 * x, -0.30, HZ + 0.07), 0.095, 0.014, GLASS, rot=(math.pi / 2, 0, 0)); rim.scale = (1, 1, 0.8); bind(rim, f'brow_{s}')
    bind(limb(f'haste_{s}', (0.21 * x, -0.27, HZ + 0.08), (0.25 * x, 0.02, HZ + 0.08), 0.012, 0.012, GLASS, 0), f'brow_{s}')
    bind(limb(f'asa_sup_{s}', (0.40 * x, 0.1, 1.40), (0.56 * x, -0.05, 1.10), 0.09, 0.10, PINK2), f'upper_{s}')
    bind(limb(f'asa_inf_{s}', (0.56 * x, -0.05, 1.10), (0.32 * x, -0.50, 1.04), 0.10, 0.05, PINK), f'fore_{s}')
    bind(sphere(f'pena_{s}', (0.28 * x, -0.58, 1.03), (0.05, 0.09, 0.03), PINK2, 16, 1), f'hand_{s}')
bind(limb('ponte', (0.03, -0.31, HZ + 0.07), (-0.03, -0.31, HZ + 0.07), 0.012, 0.012, GLASS, 0), 'brow_L')
for k, (dx, ang) in enumerate([(-0.06, -0.5), (0.0, -0.2), (0.06, 0.15)]):                  # crest feathers (secondary motion via hat bones)
    f = limb(f'crista_{k}', (dx, 0.0, HZ + 0.2), (dx * 1.6, 0.18 + 0.05 * k, HZ + 0.45 + 0.04 * (1 - abs(k - 1))), 0.04, 0.012, PINK2)
    bind(f, 'hat' if k != 1 else 'hat_tip')
bpy.data.objects['Rig'].rotation_euler = (0, 0, math.radians(-55))
bpy.data.objects['Rig']['jaw_k'] = 0.6
studio()
CA = bpy.data.objects['Camera']; CA.location = (0, -5.2, 2.15); CA.data.lens = 44; CA.rotation_euler = (math.radians(86), 0, 0)
finish()

"""Aplica os canais ao esqueleto do personagem (keyframe em TODOS os quadros) e renderiza.
uso: blender -b personagem.blend --python animar.py -- canais.json pasta_saida [pct] [f_ini f_fim]"""
import bpy, sys, json, math, os
argv = sys.argv[sys.argv.index('--') + 1:]
D = json.load(open(argv[0])); OUT = argv[1]; PCT = int(argv[2]) if len(argv) > 2 else 50
LIST = json.load(open(argv[3])) if len(argv) > 3 and argv[3].endswith('.json') else None
if LIST: fa, fb = 0, D['nf'] - 1
else: fa = int(argv[3]) if len(argv) > 3 else 0; fb = int(argv[4]) if len(argv) > 4 else D['nf'] - 1
S = bpy.context.scene; R = bpy.data.objects['Rig']; CAM = bpy.data.objects['Camera']; C = D['ch']; r = math.radians
S.render.resolution_percentage = PCT; S.eevee.taa_render_samples = 16; S.frame_start = fa; S.frame_end = fb; S.frame_step = int(argv[5]) if (len(argv) > 5 and not LIST) else 1; S.render.fps = D['fps']
P = R.pose.bones
for b in P: b.rotation_mode = 'XYZ'
cam0 = CAM.location.copy(); lens0 = CAM.data.lens
headz = (R.matrix_world @ R.data.bones['head'].head_local).z
KIND = {int(f): k for f, k in LIST} if LIST else {}
def shot_at(f):
    if f in KIND:
        f0 = f
        while f0 - 1 in KIND and KIND[f0 - 1] == KIND[f]: f0 -= 1
        return (f0 / D['fps'], KIND[f])
    t = f / D['fps']; cur = (0, 'medium')
    for s in D['shots']:
        if s[0] <= t: cur = s
    return cur
for f in range(fa, fb + 1):
    g = lambda k: C[k][min(f, D['nf'] - 1)]
    P['head'].rotation_euler = (r(g('head_x')), r(g('head_y')), r(g('head_z')))
    P['neck'].rotation_euler = (r(g('head_x') * 0.3), 0, r(g('head_z') * 0.3))
    P['spine'].rotation_euler = (r(g('spine_x')), r(g('head_y') * -0.15), 0)
    P['chest'].scale = (1 + g('breath'), 1 + g('breath'), 1 + g('breath') * 0.5)
    P['jaw'].rotation_euler = (r(g('jaw') * float(R.get('jaw_k', 1.0))), 0, 0)
    lid = 40 - 85 * g('lid'); P['lid_L'].rotation_euler = (r(lid), 0, 0); P['lid_R'].rotation_euler = (r(lid), 0, 0)
    for s in ('L', 'R'): P[f'brow_{s}'].location = (0, 0.035 * g('brow'), 0)
    P['hat_tip'].rotation_euler = (r(g('hat_tip') * 0.5), r(g('hat_tip')), 0); P['hat'].rotation_euler = (0, r(g('hat_tip') * 0.25), 0)
    P['upper_L'].rotation_euler = (r(g('uL_x')), 0, r(g('uL_z'))); P['fore_L'].rotation_euler = (r(g('fL_x')), 0, r(g('fL_z')))
    P['upper_R'].rotation_euler = (r(g('uR_x')), 0, r(g('uR_z'))); P['fore_R'].rotation_euler = (r(g('fR_x')), 0, r(g('fR_z')))
    for b in P: b.keyframe_insert('rotation_euler', frame=f); b.keyframe_insert('location', frame=f)
    P['chest'].keyframe_insert('scale', frame=f)
    ts, kind = shot_at(f); u = f / D['fps'] - ts                                          # camera: slow push, cut punch, handheld drift
    push = 0.06 * min(1, u / 5) + (0.05 * max(0, 1 - u / 0.3) if ts > 0 else 0)
    base_lens = lens0 * (1.6 if kind == 'close' else 1.0)
    CAM.data.lens = base_lens * (1 + push)
    CAM.location = (cam0.x + 0.012 * math.sin(f * 0.07) + 0.006 * math.sin(f * 0.19), cam0.y, (headz + 0.15 if kind == 'close' else cam0.z) + 0.008 * math.sin(f * 0.11 + 1))
    CAM.keyframe_insert('location', frame=f); CAM.data.keyframe_insert('lens', frame=f)
for fc in (R.animation_data.action.fcurves if R.animation_data else []):
    for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'
os.makedirs(OUT, exist_ok=True); S.render.filepath = os.path.join(OUT, 'f_'); S.render.image_settings.file_format = 'PNG'
if LIST:
    for f, k in LIST:
        o = os.path.join(OUT, f'f_{int(f):04d}.png')
        if os.path.exists(o): continue
        S.frame_set(int(f)); S.render.filepath = o; bpy.ops.render.render(write_still=True)
else: bpy.ops.render.render(animation=True)
print('RENDERIZADO', fa, fb)

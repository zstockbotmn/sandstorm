import bpy, math
arm = bpy.data.objects['caucasian_male_1']
for o in bpy.data.objects:
    if o.type == 'CAMERA': bpy.data.objects.remove(o)
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='POSE')
for pb in arm.pose.bones:
    for c in list(pb.constraints): pb.constraints.remove(c)   # IK + finger-curl drivers off; three.js does the arm IK
    pb.rotation_mode = 'XYZ'; pb.rotation_euler = (0, 0, 0); pb.location = (0, 0, 0)
# grip pose: curl fingers (wrap a pistol grip / handguard), thumb across
for pb in arm.pose.bones:
    n = pb.name
    if n.startswith('f_'): pb.rotation_euler = (math.radians(75 if n.endswith(('.01.L', '.01.R')) else 60), 0, 0)
    elif n.startswith('thumb.0'): pb.rotation_euler = (math.radians(25), 0, math.radians(-20 if n.endswith('.R') else 20))
img = bpy.data.images.load('/workspace/sandstorm/assets-src/arms/new_diff.png')
for m in bpy.data.materials:
    m.use_nodes = True; nt = m.node_tree; bsdf = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if not bsdf:
        out = next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'); bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled'); nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    if bsdf:
        tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img; nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
        bsdf.inputs['Roughness'].default_value = 0.7
act = bpy.data.actions.new('grip'); arm.animation_data_create(); arm.animation_data.action = act
for pb in arm.pose.bones:
    pb.keyframe_insert('rotation_euler', frame=1); pb.keyframe_insert('location', frame=1)
bpy.ops.object.mode_set(mode='OBJECT')
for a in list(bpy.data.actions):
    if a.name != 'grip': bpy.data.actions.remove(a)
bpy.ops.export_scene.gltf(filepath='/workspace/sandstorm/assets-src/arms/fps_arms.glb', export_format='GLB', export_animations=True, export_yup=True, export_apply=False, export_image_format='JPEG')
print('EXPORTED')

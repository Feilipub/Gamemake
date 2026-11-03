class_name Player
extends Node2D
## O vaqueiro: anda, corre, monta, marcha/trota/galopa e chama o gado no aboio.
## Valores de velocidade e fôlego vêm de game_tuning.json (player / mount).
## Direções: 0 frente (baixo), 1 costas (cima), 2 esquerda (espelho de 3), 3 direita.

signal aboio_called(at: Vector2)
signal mount_changed(mounted: bool)
signal message(text: String)

var mounted := false
var stamina := 100.0
var dir := 0
var controls_enabled := true

var _grid: CollisionGrid
var _cp: Dictionary
var _cm: Dictionary
var _horse: Horse
var _sprite: StripSprite
var _shadow: GroundShadow
var _speed := 0.0


## Injeta grade de colisão, parâmetros e o cavalo do jogador.
func setup(grid: CollisionGrid, tuning: Dictionary, horse: Horse) -> void:
	_grid = grid
	_cp = tuning.player
	_cm = tuning.mount
	_horse = horse
	stamina = float(_cm.stamina_max)
	_shadow = GroundShadow.new(Vector2(6, 2.4))
	add_child(_shadow)
	_sprite = StripSprite.new()
	var anims := {}
	for d in [0, 1, 3]:
		anims["idle_%d" % d] = ["player_idle_%d" % d, 3, true]
		anims["walk_%d" % d] = ["player_walk_%d" % d, 10, true]
		anims["run_%d" % d] = ["player_run_%d" % d, 13, true]
		anims["m_idle_%d" % d] = ["mounted_idle_%d" % d, 3, true]
		anims["m_walk_%d" % d] = ["mounted_walk_%d" % d, 8, true]
		anims["m_trot_%d" % d] = ["mounted_trot_%d" % d, 10, true]
		anims["m_gallop_%d" % d] = ["mounted_gallop_%d" % d, 13, true]
	_sprite.setup("player_default", anims)
	add_child(_sprite)
	_refresh_anim("idle")


## Velocidade real no último passo (px/s); o gado reage a ela.
func current_speed() -> float:
	return _speed


func _physics_process(dt: float) -> void:
	if _grid == null or dt <= 0.0:
		return
	var inp := Vector2.ZERO
	var run := false
	if controls_enabled:
		inp = Input.get_vector(&"move_left", &"move_right", &"move_up", &"move_down")
		run = Input.is_action_pressed(&"run")
	var mag := inp.length()
	var speed := 0.0
	var gait := "idle"
	if mounted:
		if mag > 0.05:
			if run and stamina > float(_cm.stamina_min_to_gallop):
				speed = float(_cm.gallop_speed)
				gait = "gallop"
			elif mag >= float(_cm.trot_stick_threshold) or run:
				speed = float(_cm.trot_speed)
				gait = "trot"
			else:
				speed = float(_cm.walk_speed)
				gait = "walk"
		if gait == "gallop":
			stamina = maxf(0.0, stamina - float(_cm.stamina_drain_per_sec) * dt)
		else:
			stamina = minf(float(_cm.stamina_max), stamina + float(_cm.stamina_regen_per_sec) * dt)
	elif mag > 0.05:
		speed = float(_cp.run_speed) if run else float(_cp.walk_speed)
		gait = "run" if run else "walk"

	var vel := inp.normalized() * speed if mag > 0.05 else Vector2.ZERO
	var half := _half(_cm if mounted else _cp)
	var np := _grid.move(position, vel * dt, half)
	_speed = (np - position).length() / dt
	position = np
	if mag > 0.05:
		if absf(inp.x) > absf(inp.y) * 0.9:
			dir = 3 if inp.x > 0.0 else 2
		else:
			dir = 0 if inp.y > 0.0 else 1
	if _speed < 1.0:
		gait = "idle"
	_refresh_anim(gait)

	if controls_enabled and Input.is_action_just_pressed(&"mount"):
		toggle_mount()
	if controls_enabled and Input.is_action_just_pressed(&"aboio"):
		aboio_called.emit(position)


## Monta se o cavalo estiver perto; senão assobia para ele vir. Montado: desmonta.
func toggle_mount() -> void:
	if _horse == null:
		return
	if mounted:
		mounted = false
		_horse.set_ridden(false, position, dir)
		var side := Vector2(-12, 4) if dir != 2 else Vector2(12, 4)
		position = _grid.move(position, side, _half(_cp))
		mount_changed.emit(false)
	elif position.distance_to(_horse.position) <= float(_cm.mount_distance):
		mounted = true
		position = _horse.position
		_horse.set_ridden(true, position, dir)
		mount_changed.emit(true)
	else:
		_horse.call_to(position)
		message.emit("Fiiiu! %s está vindo." % _horse.horse_name)
	_refresh_anim("idle")


## Estado para salvar.
func to_save() -> Dictionary:
	return {"x": position.x, "y": position.y, "dir": dir, "mounted": mounted, "stamina": stamina}


## Restaura de um save.
func from_save(d: Dictionary) -> void:
	position = Vector2(float(d.get("x", position.x)), float(d.get("y", position.y)))
	dir = int(d.get("dir", 0))
	stamina = float(d.get("stamina", stamina))
	if bool(d.get("mounted", false)) and _horse != null:
		mounted = true
		_horse.set_ridden(true, position, dir)


func _half(c: Dictionary) -> Vector2:
	var h: Array = c.half_size
	return Vector2(float(h[0]), float(h[1]))


func _refresh_anim(gait: String) -> void:
	if _sprite == null:
		return
	var d := 3 if dir == 2 else dir
	var flip := dir == 2
	var prefix := "m_" if mounted else ""
	if not mounted and gait in ["trot", "gallop"]:
		gait = "run"
	if mounted and gait == "run":
		gait = "trot"
	_sprite.show_anim(StringName("%s%s_%d" % [prefix, gait, d]), flip)
	_shadow.visible = not mounted

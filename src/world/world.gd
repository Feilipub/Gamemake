class_name World
extends Node2D
## Fazenda Boa Esperança e arredores: chão, cercas, árvores e prédios exportados do protótipo,
## com ordenação por profundidade (y-sort), vaqueiro, cavalo, rebanho, câmera e luz do dia.
## Recebe dados do GameData; não conhece a interface (comunica por sinais).

signal message(text: String)

var grid: CollisionGrid
var clock: GameClock
var player: Player
var horse: Horse
var cows: Array[Cow] = []
var gates: Array[Gate] = []
var owned_parcels: Dictionary = {}
var aboio_left := 0.0
var playing := false

var _tuning: Dictionary
var _camera: Camera2D
var _light: CanvasModulate
var _ysort: Node2D
var _buildings: Array = []  # [Sprite2D, textura dia, textura noite]
var _night_shown := false
var _map_px := Vector2.ZERO
var _touches: Dictionary = {}
var _pinch_d := 0.0
var _title_t := 0.0
var _ctx: Dictionary = {}
var _neighbors: Array[Vector2] = []


## Constrói o mundo a partir de GameData. Chame uma vez.
func build() -> void:
	var w: Dictionary = GameData.world
	_tuning = GameData.tuning
	grid = CollisionGrid.from_world(w)
	clock = GameClock.new(_tuning.time)
	var ts := float(w.tile_size)
	_map_px = Vector2(float(w.map_width) * ts, float(w.map_height) * ts)

	var ground := Sprite2D.new()
	ground.texture = GameData.tex("res://assets/art/world/ground_s0.png")
	ground.centered = false
	ground.z_index = -10
	add_child(ground)

	var shadows := _StaticShadows.new()
	shadows.z_index = -5
	add_child(shadows)

	_ysort = Node2D.new()
	_ysort.y_sort_enabled = true
	add_child(_ysort)
	for o: Dictionary in w.objects:
		var s := Sprite2D.new()
		s.texture = GameData.tex(o.t)
		s.centered = false
		s.position = Vector2(float(o.x), float(o.s))
		s.offset = Vector2(0, float(o.y) - float(o.s))
		_ysort.add_child(s)
		if o.k == "bld":
			_buildings.append([s, s.texture, GameData.tex(String(o.t).replace(".png", "_n.png"))])
		elif o.k == "tree":
			shadows.points.append(Vector2(float(o.px), float(o.py) - 2.0))

	for p: String in GameData.parcels.get("start_owned", []):
		owned_parcels[p] = true
	var areas: Dictionary = w.get("areas", {})
	for gd: Dictionary in w.get("gates", []):
		var g := Gate.new()
		var ak = gd.get("area")
		var label := String(areas[ak].n) if ak != null and areas.has(ak) else ""
		var parcel = gd.get("parcel")
		_ysort.add_child(g)
		g.setup(gd, grid, ts, parcel != null and not owned_parcels.has(parcel), label)
		gates.append(g)

	var spawn := Vector2(float(w.spawn.x), float(w.spawn.y))
	horse = Horse.new()
	horse.position = spawn + Vector2(24, 2)
	_ysort.add_child(horse)
	horse.setup(grid, _tuning.mount)

	player = Player.new()
	player.position = spawn
	_ysort.add_child(player)
	player.setup(grid, _tuning, horse)
	player.aboio_called.connect(_on_aboio)
	player.action_pressed.connect(interact)
	player.message.connect(func(t: String) -> void: message.emit(t))

	var i := 0
	for h: Dictionary in w.get("herd", []):
		var c := Cow.new()
		c.position = Vector2(float(h.x), float(h.y))
		_ysort.add_child(c)
		c.setup(grid, _tuning.cattle, String(h.get("sex", "F")), String(h.get("n", "")), 1000 + i)
		cows.append(c)
		i += 1

	_light = CanvasModulate.new()
	add_child(_light)
	_camera = Camera2D.new()
	_camera.limit_left = 0
	_camera.limit_top = 0
	_camera.limit_right = int(_map_px.x)
	_camera.limit_bottom = int(_map_px.y)
	var z := float(_tuning.camera.zoom)
	_camera.zoom = Vector2(z, z)
	_camera.position = spawn
	add_child(_camera)
	_camera.make_current()
	set_playing(false)


## Liga/desliga o controle do jogador (no título o mundo roda como fundo animado).
func set_playing(on: bool) -> void:
	playing = on
	player.visible = on
	player.controls_enabled = on
	if on:
		_camera.position = player.position
		_camera.reset_smoothing()


## Interação mais próxima do vaqueiro (por enquanto: porteiras). null se nada ao alcance.
func nearest_interactable() -> Gate:
	var best: Gate = null
	var bd := float(_tuning.interaction.radius)
	for g in gates:
		var d := g.center().distance_to(player.position)
		if d < bd:
			bd = d
			best = g
	return best


## Texto do botão Ação para a interação atual ("" se nada).
func interaction_label() -> String:
	if not playing:
		return ""
	var g := nearest_interactable()
	return g.action_label() if g != null else ""


## Faz a interação mais próxima (chamado pelo botão Ação).
func interact() -> void:
	if not playing:
		return
	var g := nearest_interactable()
	if g == null:
		return
	if g.state.locked:
		var info: Dictionary = GameData.parcels.get(g.parcel, {})
		message.emit("Porteira travada: %s ainda não é seu (R$ %s)." % [info.get("name", "esse terreno"), _money(int(info.get("price", 0)))])
		return
	if g.state.open and _body_in(g.rect().grow(float(_tuning.interaction.gate_body_margin))):
		message.emit("Tem bicho ou gente na porteira. Espere passar para fechar.")
		return
	g.toggle()


## Compra um terreno: destrava as porteiras dele.
func own_parcel(key: String) -> void:
	owned_parcels[key] = true
	for g in gates:
		if g.parcel == key:
			g.set_locked(false)


func _body_in(r: Rect2) -> bool:
	if r.has_point(player.position) or (horse.visible and r.has_point(horse.position)):
		return true
	for c in cows:
		if r.has_point(c.position):
			return true
	return false


static func _money(v: int) -> String:
	var s := str(v)
	var out := ""
	while s.length() > 3:
		out = "." + s.substr(s.length() - 3) + out
		s = s.substr(0, s.length() - 3)
	return s + out


## Estado salvo da partida.
func to_save() -> Dictionary:
	var herd := []
	for c in cows:
		herd.append({"x": c.position.x, "y": c.position.y})
	var gate_open := []
	for g in gates:
		gate_open.append(g.state.open)
	return {"v": 2, "day": clock.day, "minute": clock.minute, "player": player.to_save(),
		"horse": {"x": horse.position.x, "y": horse.position.y}, "herd": herd,
		"gates": gate_open, "parcels": owned_parcels.keys()}


## Restaura um save (campos ausentes ficam no padrão).
func from_save(d: Dictionary) -> void:
	if d.is_empty():
		return
	clock.day = int(d.get("day", 1))
	clock.minute = float(d.get("minute", clock.minute))
	var hp: Dictionary = d.get("horse", {})
	if not hp.is_empty():
		horse.position = Vector2(float(hp.x), float(hp.y))
	player.from_save(d.get("player", {}))
	for p: String in d.get("parcels", []):
		own_parcel(p)
	var go: Array = d.get("gates", [])
	for i in mini(go.size(), gates.size()):
		if bool(go[i]) != gates[i].state.open:
			gates[i].state.open = bool(go[i])
			gates[i].state.anim = 1.0 if gates[i].state.open else 0.0
	var herd: Array = d.get("herd", [])
	for i in mini(herd.size(), cows.size()):
		cows[i].position = Vector2(float(herd[i].x), float(herd[i].y))


func _physics_process(dt: float) -> void:
	if grid == null:
		return
	clock.advance(dt)
	_light.color = clock.light_color()
	var night := clock.is_night()
	if night != _night_shown:
		_night_shown = night
		for b in _buildings:
			b[0].texture = b[2] if night else b[1]
	aboio_left = maxf(0.0, aboio_left - dt)
	_ctx.player_pos = player.position if playing else Vector2(-9999, -9999)
	_ctx.player_speed = player.current_speed() if playing else 0.0
	_ctx.aboio_left = aboio_left
	var nr := float(_tuning.cattle.neighbor_radius)
	for c in cows:
		_neighbors.clear()
		for o in cows:
			if o != c and o.position.distance_to(c.position) < nr:
				_neighbors.append(o.position)
		_ctx.neighbors = _neighbors
		c.think(dt, _ctx)


func _process(dt: float) -> void:
	if _camera == null:
		return
	var target := player.position
	if not playing:
		_title_t += dt * float(_tuning.camera.title_pan_speed)
		var path := [Vector2(12, 30), Vector2(30, 46), Vector2(60, 44), Vector2(84, 44), Vector2(84, 30), Vector2(40, 26)]
		var seg := fposmod(_title_t / 240.0, float(path.size()))
		var a: Vector2 = path[int(seg)]
		var b: Vector2 = path[(int(seg) + 1) % path.size()]
		target = a.lerp(b, seg - floorf(seg)) * float(GameData.world.tile_size)
	var k := 1.0 - exp(-float(_tuning.camera.follow_speed) * dt)
	_camera.position = _camera.position.lerp(target, k)


func _unhandled_input(event: InputEvent) -> void:
	if not playing:
		return
	var cam: Dictionary = _tuning.camera
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			_zoom_by(float(cam.wheel_step))
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			_zoom_by(1.0 / float(cam.wheel_step))
	elif event.is_action_pressed(&"zoom_in"):
		_zoom_by(float(cam.wheel_step))
	elif event.is_action_pressed(&"zoom_out"):
		_zoom_by(1.0 / float(cam.wheel_step))
	elif event is InputEventScreenTouch:
		if event.pressed:
			_touches[event.index] = event.position
		else:
			_touches.erase(event.index)
		_pinch_d = 0.0
	elif event is InputEventScreenDrag and _touches.has(event.index):
		_touches[event.index] = event.position
		if _touches.size() == 2:
			var ps: Array = _touches.values()
			var d: float = (ps[0] as Vector2).distance_to(ps[1])
			if _pinch_d > 0.0:
				_zoom_by(d / _pinch_d)
			_pinch_d = d


func _zoom_by(f: float) -> void:
	var cam: Dictionary = _tuning.camera
	var z := clampf(_camera.zoom.x * f, float(cam.zoom_min), float(cam.zoom_max))
	_camera.zoom = Vector2(z, z)


func _on_aboio(_at: Vector2) -> void:
	aboio_left = float(_tuning.cattle.aboio_duration_sec)
	message.emit("Ê boi, ê boiada!… O gado vem atrás de você.")


## Sombras das árvores, desenhadas em uma única chamada sob os objetos.
class _StaticShadows extends Node2D:
	var points: Array[Vector2] = []

	func _draw() -> void:
		for p in points:
			draw_set_transform(p, 0.0, Vector2(1.0, 0.38))
			draw_circle(Vector2.ZERO, 16.0, Color(0.10, 0.06, 0.02, 0.22))
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

class_name Gate
extends Node2D
## Porteira do mapa: desenhada com os 4 quadros exportados do protótipo, abre e fecha com Ação
## e liga/desliga a colisão dos seus tiles na CollisionGrid. A regra fica em GateState.

signal toggled(gate: Gate, open: bool)

var gate_id := -1
var area_key := ""
var area_name := ""
var parcel := ""
var state: GateState
var tiles: Array[Vector2i] = []

var _grid: CollisionGrid
var _sprite: Sprite2D
var _fw := 0.0
var _fh := 0.0
var _last_blocking := true
var _ts := 16.0


## Monta a porteira a partir de uma entrada de `gates` do world_map.json.
func setup(def: Dictionary, grid: CollisionGrid, tile_size: float, locked: bool, area_label: String) -> void:
	_grid = grid
	_ts = tile_size
	gate_id = int(def.id)
	area_key = String(def.get("area", "")) if def.get("area") != null else ""
	parcel = String(def.get("parcel", "")) if def.get("parcel") != null else ""
	area_name = area_label
	for t: Array in def.tiles:
		tiles.append(Vector2i(int(t[0]), int(t[1])))
	state = GateState.new(bool(def.get("open", false)), locked)
	_fw = float(def.fw)
	_fh = float(def.fh)
	position = Vector2(float(def.x), float(def.s))
	_sprite = Sprite2D.new()
	_sprite.texture = GameData.tex(def.t)
	_sprite.centered = false
	_sprite.region_enabled = true
	_sprite.offset = Vector2(0, float(def.y) - float(def.s))
	add_child(_sprite)
	_apply(true)


## Centro da porteira em pixels de mundo (para achar a mais próxima).
func center() -> Vector2:
	var c := Vector2.ZERO
	for t in tiles:
		c += (Vector2(t) + Vector2(0.5, 0.5)) * _ts
	return c / maxf(1.0, tiles.size())


## Retângulo ocupado pelos tiles (para impedir fechar em cima de alguém).
func rect() -> Rect2:
	var r := Rect2(Vector2(tiles[0]) * _ts, Vector2(_ts, _ts))
	for t in tiles:
		r = r.merge(Rect2(Vector2(t) * _ts, Vector2(_ts, _ts)))
	return r


## Texto do botão de ação.
func action_label() -> String:
	if state.locked:
		return "Porteira travada"
	return ("Fechar" if state.open else "Abrir") + " porteira" + ((" · " + area_name) if area_name != "" else "")


## Abre/fecha. Devolve false se travada.
func toggle() -> bool:
	if not state.toggle():
		return false
	toggled.emit(self, state.open)
	return true


## Trava/destrava (compra de terreno).
func set_locked(on: bool) -> void:
	state.locked = on


func _process(dt: float) -> void:
	state.step(dt)
	_apply(false)


func _apply(force: bool) -> void:
	_sprite.region_rect = Rect2(state.frame(4) * _fw, 0, _fw, _fh)
	var b := state.is_blocking()
	if force or b != _last_blocking:
		_last_blocking = b
		for t in tiles:
			_grid.set_blocked(t.x, t.y, b)

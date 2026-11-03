class_name CollisionGrid
extends RefCounted
## Colisão por grade de tiles (a mesma regra do protótipo HTML): cada tile é livre ou bloqueado.
## Movimento resolvido eixo a eixo, então o corpo desliza ao longo de cercas e paredes.

var width: int
var height: int
var tile_size: float
var _blocked: PackedByteArray


## `blocked` tem width*height bytes (1 = bloqueado), em ordem de linhas.
func _init(blocked: PackedByteArray, w: int, h: int, ts: float) -> void:
	_blocked = blocked
	width = w
	height = h
	tile_size = ts


## Constrói a grade a partir do world_map.json (sólidos + água, que ainda não é atravessável).
static func from_world(world: Dictionary) -> CollisionGrid:
	var w := int(world.map_width)
	var h := int(world.map_height)
	var solid: Array = world.solid
	var water: Array = world.get("water", [])
	var b := PackedByteArray()
	b.resize(w * h)
	for i in w * h:
		var s := int(solid[i]) != 0
		var wa := i < water.size() and int(water[i]) != 0
		b[i] = 1 if (s or wa) else 0
	return CollisionGrid.new(b, w, h, float(world.tile_size))


## Liga/desliga o bloqueio de um tile (porteiras). Fora do mapa é ignorado.
func set_blocked(tx: int, ty: int, on: bool) -> void:
	if tx < 0 or ty < 0 or tx >= width or ty >= height:
		return
	_blocked[ty * width + tx] = 1 if on else 0


## Tile bloqueado? Fora do mapa conta como bloqueado.
func is_blocked_tile(tx: int, ty: int) -> bool:
	if tx < 0 or ty < 0 or tx >= width or ty >= height:
		return true
	return _blocked[ty * width + tx] != 0


## Uma caixa (centro `pos`, meia-largura `half`) encosta em algum tile bloqueado?
func box_hits(pos: Vector2, half: Vector2) -> bool:
	var tx0 := floori((pos.x - half.x) / tile_size)
	var tx1 := floori((pos.x + half.x - 0.001) / tile_size)
	var ty0 := floori((pos.y - half.y) / tile_size)
	var ty1 := floori((pos.y + half.y - 0.001) / tile_size)
	for ty in range(ty0, ty1 + 1):
		for tx in range(tx0, tx1 + 1):
			if is_blocked_tile(tx, ty):
				return true
	return false


## Move a caixa por `delta`, eixo X e depois Y; devolve a nova posição.
func move(pos: Vector2, delta: Vector2, half: Vector2) -> Vector2:
	var p := pos
	if delta.x != 0.0:
		var nx := Vector2(p.x + delta.x, p.y)
		if not box_hits(nx, half):
			p = nx
	if delta.y != 0.0:
		var ny := Vector2(p.x, p.y + delta.y)
		if not box_hits(ny, half):
			p = ny
	return p

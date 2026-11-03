class_name Trough
extends Node2D
## Cocho do mapa (água ou comida). Mostra 3 níveis (vazio, meio, cheio) com a arte do protótipo.
## Cochos de comida recebem forragem da roça e o gado come deles (ver World e HerdBrain FEED).

var kind := "racao"
var area_key := ""
var capacity := 100.0
var level := 0.0

var _sprite: Sprite2D
var _fw := 0.0
var _fh := 0.0
var _center := Vector2.ZERO


## Monta a partir de uma entrada de `troughs` do world_map.json.
func setup(def: Dictionary, tile_size: float, start_level: float) -> void:
	kind = String(def.k)
	area_key = String(def.a)
	capacity = float(def.cap)
	level = clampf(start_level, 0.0, capacity)
	_fw = float(def.fw)
	_fh = float(def.fh)
	position = Vector2(float(def.px), float(def.s))
	_center = Vector2((float(def.x) + float(def.w) * 0.5) * tile_size, (float(def.y) + 0.6) * tile_size)
	_sprite = Sprite2D.new()
	_sprite.texture = GameData.tex(def.t)
	_sprite.centered = false
	_sprite.region_enabled = true
	_sprite.offset = Vector2(0, float(def.py) - float(def.s))
	add_child(_sprite)
	_refresh()


## Ponto onde o animal come / o vaqueiro interage.
func center() -> Vector2:
	return _center


## Põe comida; devolve quanto coube.
func add(kg: float) -> float:
	var put := clampf(kg, 0.0, capacity - level)
	level += put
	_refresh()
	return put


## O animal come; devolve quanto comeu.
func eat(kg: float) -> float:
	var got := clampf(kg, 0.0, level)
	level -= got
	_refresh()
	return got


## Tem comida?
func has_food() -> bool:
	return kind == "racao" and level > 0.01


func _refresh() -> void:
	var f := 0
	if level >= capacity * 0.6:
		f = 2
	elif level > 0.01:
		f = 1
	_sprite.region_rect = Rect2(f * _fw, 0, _fw, _fh)

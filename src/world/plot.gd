class_name Plot
extends Node2D
## Leira da roça de forragem (2 tiles): duas plantas que crescem conforme o CropPlot.

var plot_id := -1
var logic: CropPlot
var crop_name := ""

var _sprites: Array[Sprite2D] = []
var _meta: Dictionary
var _center := Vector2.ZERO
var _shown := -2


## Monta a partir de uma entrada de `plots` do world_map.json.
func setup(def: Dictionary, crop_cfg: Dictionary, tile_size: float) -> void:
	plot_id = int(def.id)
	logic = CropPlot.new(String(def.crop), crop_cfg)
	crop_name = String(crop_cfg.get("name", def.crop))
	var x0 := float(def.x) * tile_size
	var y := (float(def.y) + 0.85) * tile_size
	position = Vector2(x0, y)
	_center = Vector2(x0 + float(def.w) * tile_size * 0.5, y - 4.0)
	_meta = GameData.strip("crop_" + String(def.crop))
	for i in int(def.w):
		var s := Sprite2D.new()
		s.texture = GameData.tex(_meta.file)
		s.centered = false
		s.region_enabled = true
		s.position = Vector2((i + 0.5) * tile_size, 0)
		s.offset = Vector2(-float(_meta.ox), -float(_meta.oy))
		s.flip_h = i % 2 == 1
		add_child(s)
		_sprites.append(s)


## Ponto de interação.
func center() -> Vector2:
	return _center


## Atualiza o desenho para o dia atual.
func refresh(day: int) -> void:
	var st := logic.stage(day)
	if st == _shown:
		return
	_shown = st
	for s in _sprites:
		s.visible = st >= 0
		if st >= 0:
			s.region_rect = Rect2(st * float(_meta.fw), 0, float(_meta.fw), float(_meta.fh))

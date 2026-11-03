class_name StripSprite
extends AnimatedSprite2D
## Sprite animado montado a partir das tiras exportadas do protótipo.
## Cada animação tem sua própria âncora (ponto do pé), então o offset é trocado junto
## com a animação; ao espelhar, a âncora é espelhada também.
##
## Exemplo:
##   var s := StripSprite.new()
##   s.setup("cow_F", {"walk_side": ["peduroF_walk_side", 8, true]})
##   s.show_anim(&"walk_side", velocity.x < 0)

var _meta: Dictionary = {}


## Monta os quadros. `anims`: nome -> [tira, fps, loop].
func setup(cache_key: String, anims: Dictionary) -> void:
	sprite_frames = GameData.build_frames(cache_key, anims)
	centered = false
	for a: String in anims:
		_meta[a] = GameData.strip(anims[a][0])


## Toca `anim` (sem reiniciar se já estiver tocando), espelhada se `flip`.
func show_anim(anim: StringName, flip: bool, speed: float = 1.0) -> void:
	if not sprite_frames.has_animation(anim):
		return
	if animation != anim or not is_playing():
		play(anim)
	flip_h = flip
	speed_scale = speed
	var m: Dictionary = _meta.get(String(anim), {})
	if not m.is_empty():
		var ox := float(m.ox)
		if flip:
			ox = float(m.fw) - ox
		offset = Vector2(-ox, -float(m.oy))

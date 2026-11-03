class_name Cow
extends Node2D
## Boi/vaca Pé-Duro. O comportamento vem do HerdBrain; aqui só aplicamos movimento,
## colisão e escolhemos a animação pela velocidade (parado, andando, trotando, correndo).

var cow_name := ""
var sex := "F"
var velocity := Vector2.ZERO
var brain: HerdBrain

var _grid: CollisionGrid
var _cfg: Dictionary
var _rng := RandomNumberGenerator.new()
var _sprite: StripSprite
var _view := "side"
var _flip := false


## Injeta grade, parâmetros (seção cattle) e identidade do animal.
func setup(grid: CollisionGrid, cattle_cfg: Dictionary, p_sex: String, p_name: String, seed_value: int) -> void:
	_grid = grid
	_cfg = cattle_cfg
	sex = "M" if p_sex == "M" else "F"
	cow_name = p_name
	_rng.seed = seed_value
	brain = HerdBrain.new(cattle_cfg)
	add_child(GroundShadow.new(Vector2(13, 3.4)))
	_sprite = StripSprite.new()
	var anims := {}
	var fps := {"idle": 2, "walk": 8, "trot": 10, "gallop": 12, "eat": 3, "lie": 1}
	for an: String in fps:
		for v in ["side", "front", "back"]:
			anims["%s_%s" % [an, v]] = ["peduro%s_%s_%s" % [sex, an, v], fps[an], true]
	_sprite.setup("cow_" + sex, anims)
	add_child(_sprite)
	_sprite.show_anim(&"idle_side", false)


## Um passo de IA + movimento. `ctx` é montado pelo mundo (ver HerdBrain.step).
func think(dt: float, ctx: Dictionary) -> void:
	var want := brain.step(dt, position, ctx, _rng)
	velocity = velocity.lerp(want, minf(1.0, dt * float(_cfg.get("steer_rate", 4.0))))
	var h: Array = _cfg.half_size
	var np := _grid.move(position, velocity * dt, Vector2(float(h[0]), float(h[1])))
	var real := (np - position) / maxf(dt, 0.0001)
	position = np
	_animate(real)


func _animate(v: Vector2) -> void:
	var spd := v.length()
	if spd > 2.0:
		if absf(v.x) >= absf(v.y) * 0.8:
			_view = "side"
			_flip = v.x < 0.0
		else:
			_view = "front" if v.y > 0.0 else "back"
	var an := "idle"
	if spd > float(_cfg.trot_speed) * 1.15:
		an = "gallop"
	elif spd > float(_cfg.walk_speed) * 1.3:
		an = "trot"
	elif spd > 2.0:
		an = "walk"
	elif brain.state == HerdBrain.State.GRAZE:
		an = "eat"
	_sprite.show_anim(StringName("%s_%s" % [an, _view]), _flip, clampf(spd / maxf(float(_cfg.walk_speed), 1.0), 0.6, 1.6) if an != "idle" and an != "eat" else 1.0)

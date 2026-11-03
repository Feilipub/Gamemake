class_name Horse
extends Node2D
## Cavalo do jogador quando não está montado: pasta parado, e vem ao assobio.
## Vistas: lateral (espelhada para a esquerda), frente e costas.

var horse_name := "Trovão"
var ridden := false

var _grid: CollisionGrid
var _cfg: Dictionary
var _sprite: StripSprite
var _shadow: GroundShadow
var _target := Vector2.INF
var _view := "side"
var _flip := false
var _eat_t := 0.0
var _eating := false
var _rng := RandomNumberGenerator.new()


## Injeta grade e parâmetros (seção mount do game_tuning.json).
func setup(grid: CollisionGrid, mount_cfg: Dictionary, seed_value: int = 7) -> void:
	_grid = grid
	_cfg = mount_cfg
	_rng.seed = seed_value
	_shadow = GroundShadow.new(Vector2(12, 3.2))
	add_child(_shadow)
	_sprite = StripSprite.new()
	var anims := {}
	var fps := {"idle": 3, "walk": 8, "trot": 10, "gallop": 13, "eat": 3}
	for an: String in fps:
		for v in ["side", "front", "back"]:
			anims["%s_%s" % [an, v]] = ["horse_%s_%s" % [an, v], fps[an], true]
	_sprite.setup("horse_main", anims)
	add_child(_sprite)
	_sprite.show_anim(&"idle_side", false)


## Assobio: anda até `p`.
func call_to(p: Vector2) -> void:
	_target = p


## Montado some (o jogador desenha o conjunto); desmontado reaparece em `at`.
func set_ridden(on: bool, at: Vector2, facing: int) -> void:
	ridden = on
	visible = not on
	_target = Vector2.INF
	position = at
	_flip = facing == 2
	_view = "front" if facing == 0 else "back" if facing == 1 else "side"


func _physics_process(dt: float) -> void:
	if ridden or _grid == null:
		return
	var vel := Vector2.ZERO
	if _target != Vector2.INF:
		var to := _target - position
		if to.length() > 18.0:
			vel = to.normalized() * float(_cfg.call_speed)
		else:
			_target = Vector2.INF
	var h: Array = _cfg.half_size
	position = _grid.move(position, vel * dt, Vector2(float(h[0]), float(h[1])))
	if vel.length() > 1.0:
		if absf(vel.x) >= absf(vel.y) * 0.8:
			_view = "side"
			_flip = vel.x < 0.0
		else:
			_view = "front" if vel.y > 0.0 else "back"
		_sprite.show_anim(StringName("walk_%s" % _view), _flip)
		return
	_eat_t -= dt
	if _eat_t <= 0.0:
		_eating = not _eating
		var r: Array = _cfg.get("idle_eat_cycle_sec", [3, 8])
		_eat_t = _rng.randf_range(float(r[0]), float(r[1]))
	_sprite.show_anim(StringName("%s_%s" % ["eat" if _eating else "idle", _view]), _flip)

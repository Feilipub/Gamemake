class_name HerdBrain
extends RefCounted
## IA de um animal do rebanho (Pé-Duro). Lógica pura: recebe o contexto e devolve a
## velocidade desejada, sem tocar em nós da cena, para poder ser testada isolada.
##
## Estados e transições (avaliados em ordem de prioridade a cada passo):
##   FOLLOW  aboio ativo e vaqueiro a menos de follow_radius e além de follow_stop_distance
##   CALM    aboio ativo e vaqueiro já perto (para e espera, sem fugir)
##   FLEE    sem aboio e vaqueiro dentro do raio de pressão (maior quanto mais rápido ele vem)
##           -> é assim que se "toca" o gado: a pressão do cavalo empurra o rebanho
##   FEED    há comida no cocho da área (ctx.food_pos): vai até o cocho e come parado
##   GRAZE / IDLE / WANDER  rotina livre, sorteada por graze_chance / idle_chance a cada
##           state_min_sec..state_max_sec; vaguear puxa levemente para o centro do grupo.
## Em todos os estados soma-se a separação dos vizinhos (não se empilham).
##
## Exemplo:
##   var brain := HerdBrain.new(GameData.tuning.cattle)
##   var vel := brain.step(delta, position, ctx, rng)

enum State { IDLE, GRAZE, WANDER, FOLLOW, CALM, FLEE, FEED }

var state: State = State.IDLE
var _cfg: Dictionary
var _timer := 0.0
var _wander_dir := Vector2.ZERO


func _init(cfg: Dictionary) -> void:
	_cfg = cfg


## Velocidade desejada (px/s).
## ctx: player_pos (Vector2), player_speed (float), aboio_left (float, s),
##      neighbors (Array[Vector2], posições dos outros animais),
##      food_pos (Vector2 opcional: cocho com comida na mesma área).
func step(dt: float, pos: Vector2, ctx: Dictionary, rng: RandomNumberGenerator) -> Vector2:
	var walk := float(_cfg.walk_speed)
	var to_p: Vector2 = ctx.player_pos - pos
	var d := to_p.length()
	var aboio := float(ctx.get("aboio_left", 0.0)) > 0.0
	var fast := clampf(float(ctx.get("player_speed", 0.0)) / float(_cfg.fast_speed_ref), 0.0, 1.0)
	var flee_r := lerpf(float(_cfg.flee_radius), float(_cfg.flee_radius_fast), fast)
	var vel := Vector2.ZERO
	var neighbors: Array = ctx.get("neighbors", [])

	if aboio and d < float(_cfg.follow_radius) and d > float(_cfg.follow_stop_distance):
		state = State.FOLLOW
		var spd := float(_cfg.trot_speed) if d > float(_cfg.follow_radius) * 0.5 else walk
		vel = to_p / d * spd
	elif aboio and d <= float(_cfg.follow_stop_distance):
		state = State.CALM
	elif d < flee_r and d > 0.001:
		state = State.FLEE
		var k := 1.0 - d / flee_r
		vel = -to_p / d * lerpf(walk, float(_cfg.flee_speed), k)
	elif ctx.get("food_pos") is Vector2:
		state = State.FEED
		var to_f: Vector2 = ctx.food_pos - pos
		var reach := float(_cfg.get("feed_reach", 12.0))
		if to_f.length() > reach:
			vel = to_f.normalized() * walk
	else:
		_timer -= dt
		if state == State.FEED:
			_timer = 0.0
		if state == State.FOLLOW or state == State.FLEE or state == State.CALM or _timer <= 0.0:
			_pick_routine(rng)
		if state == State.WANDER:
			vel = _wander_dir * walk * 0.6
			vel += _cohesion(pos, neighbors) * walk
	vel += _separation(pos, neighbors) * walk
	return vel


func _pick_routine(rng: RandomNumberGenerator) -> void:
	var r := rng.randf()
	var g := float(_cfg.graze_chance)
	if r < g:
		state = State.GRAZE
	elif r < g + float(_cfg.idle_chance):
		state = State.IDLE
	else:
		state = State.WANDER
		_wander_dir = Vector2.from_angle(rng.randf() * TAU)
	_timer = rng.randf_range(float(_cfg.state_min_sec), float(_cfg.state_max_sec))


func _separation(pos: Vector2, neighbors: Array) -> Vector2:
	var r := float(_cfg.separation_radius)
	var out := Vector2.ZERO
	for n: Vector2 in neighbors:
		var dv := pos - n
		var dist := dv.length()
		if dist > 0.001 and dist < r:
			out += dv / dist * (r - dist) / r
	return out * float(_cfg.separation_weight)


func _cohesion(pos: Vector2, neighbors: Array) -> Vector2:
	if neighbors.is_empty():
		return Vector2.ZERO
	var c := Vector2.ZERO
	for n: Vector2 in neighbors:
		c += n
	c /= neighbors.size()
	var to_c := c - pos
	if to_c.length() < float(_cfg.cohesion_radius):
		return Vector2.ZERO
	return to_c.normalized() * float(_cfg.cohesion_weight)

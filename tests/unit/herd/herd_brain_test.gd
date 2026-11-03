extends "res://tests/test_case.gd"
## Testes da IA de rebanho (src/gameplay/herd_brain.gd).

const CFG := {
	"walk_speed": 16, "trot_speed": 32, "flee_speed": 46, "flee_radius": 30, "flee_radius_fast": 58,
	"fast_speed_ref": 90, "follow_radius": 140, "follow_stop_distance": 30, "separation_radius": 20,
	"separation_weight": 1.3, "cohesion_radius": 70, "cohesion_weight": 0.35, "graze_chance": 0.5,
	"idle_chance": 0.25, "state_min_sec": 2.5, "state_max_sec": 7.0,
}


func _rng() -> RandomNumberGenerator:
	var r := RandomNumberGenerator.new()
	r.seed = 42
	return r


func test_close_rider_makes_cow_flee_away() -> void:
	var b := HerdBrain.new(CFG)
	var v := b.step(0.1, Vector2(100, 100), {"player_pos": Vector2(80, 100), "player_speed": 0.0}, _rng())
	assert_eq(b.state, HerdBrain.State.FLEE)
	assert_true(v.x > 0.0, "foge para o lado oposto ao vaqueiro (vx=%s)" % v.x)


func test_galloping_rider_pushes_from_farther() -> void:
	var b := HerdBrain.new(CFG)
	var ctx := {"player_pos": Vector2(50, 100), "player_speed": 0.0}
	b.step(0.1, Vector2(100, 100), ctx, _rng())
	assert_true(b.state != HerdBrain.State.FLEE, "a 50 px, parado, não assusta")
	ctx.player_speed = 100.0
	b.step(0.1, Vector2(100, 100), ctx, _rng())
	assert_eq(b.state, HerdBrain.State.FLEE, "a 50 px galopando, assusta")


func test_aboio_makes_cow_follow_rider() -> void:
	var b := HerdBrain.new(CFG)
	var v := b.step(0.1, Vector2(100, 100), {"player_pos": Vector2(200, 100), "aboio_left": 5.0}, _rng())
	assert_eq(b.state, HerdBrain.State.FOLLOW)
	assert_true(v.x > 0.0, "vai na direção do aboio")


func test_aboio_close_cow_waits_instead_of_fleeing() -> void:
	var b := HerdBrain.new(CFG)
	var v := b.step(0.1, Vector2(100, 100), {"player_pos": Vector2(110, 100), "aboio_left": 5.0}, _rng())
	assert_eq(b.state, HerdBrain.State.CALM)
	assert_near(v.length(), 0.0, 0.001)


func test_separation_pushes_overlapping_cows_apart() -> void:
	var b := HerdBrain.new(CFG)
	var ctx := {"player_pos": Vector2(1000, 1000), "neighbors": [Vector2(95, 100)]}
	b.state = HerdBrain.State.GRAZE
	b._timer = 10.0
	var v := b.step(0.1, Vector2(100, 100), ctx, _rng())
	assert_true(v.x > 0.0, "afasta do vizinho à esquerda (vx=%s)" % v.x)


func test_routine_is_deterministic_with_same_seed() -> void:
	var a := HerdBrain.new(CFG)
	var b := HerdBrain.new(CFG)
	var ctx := {"player_pos": Vector2(1000, 1000)}
	var va := a.step(0.1, Vector2.ZERO, ctx, _rng())
	var vb := b.step(0.1, Vector2.ZERO, ctx, _rng())
	assert_eq(a.state, b.state)
	assert_eq(va, vb)


func test_food_in_trough_draws_cow_and_it_stops_to_eat() -> void:
	var b := HerdBrain.new(CFG)
	var far := {"player_pos": Vector2(1000, 1000), "food_pos": Vector2(200, 100)}
	var v := b.step(0.1, Vector2(100, 100), far, _rng())
	assert_eq(b.state, HerdBrain.State.FEED)
	assert_true(v.x > 0.0, "anda até o cocho")
	var v2 := b.step(0.1, Vector2(195, 100), far, _rng())
	assert_eq(b.state, HerdBrain.State.FEED)
	assert_near(v2.length(), 0.0, 0.001, "parado comendo")


func test_rider_pressure_beats_feeding() -> void:
	var b := HerdBrain.new(CFG)
	var ctx := {"player_pos": Vector2(185, 100), "food_pos": Vector2(200, 100)}
	b.step(0.1, Vector2(195, 100), ctx, _rng())
	assert_eq(b.state, HerdBrain.State.FLEE, "o cavaleiro em cima espanta do cocho")

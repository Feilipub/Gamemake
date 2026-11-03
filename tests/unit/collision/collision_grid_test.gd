extends "res://tests/test_case.gd"
## Testes da colisão por grade (src/world/collision_grid.gd).


# Mapa 4x3 com uma parede vertical na coluna 2:
#   . . # .
#   . . # .
#   . . . .
func _grid() -> CollisionGrid:
	var b := PackedByteArray([0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0])
	return CollisionGrid.new(b, 4, 3, 16.0)


func test_move_into_wall_is_blocked() -> void:
	var g := _grid()
	var p := g.move(Vector2(24, 8), Vector2(10, 0), Vector2(3, 2))
	assert_true(p.x + 3.0 <= 32.0, "a caixa não pode entrar no tile da parede (x=%s)" % p.x)


func test_move_slides_along_wall() -> void:
	var g := _grid()
	var p := g.move(Vector2(24, 8), Vector2(10, 6), Vector2(3, 2))
	assert_eq(p.x, 24.0, "X bloqueado pela parede")
	assert_eq(p.y, 14.0, "Y continua livre (desliza)")


func test_outside_map_counts_as_blocked() -> void:
	var g := _grid()
	assert_true(g.is_blocked_tile(-1, 0))
	assert_true(g.is_blocked_tile(0, 3))
	assert_false(g.is_blocked_tile(0, 0))


func test_free_move_keeps_full_delta() -> void:
	var g := _grid()
	var p := g.move(Vector2(8, 40), Vector2(20, 0), Vector2(3, 2))
	assert_eq(p, Vector2(28, 40))


func test_from_world_merges_water_as_blocked() -> void:
	var w := {"map_width": 2, "map_height": 1, "tile_size": 16, "solid": [0, 0], "water": [0, 1]}
	var g := CollisionGrid.from_world(w)
	assert_false(g.is_blocked_tile(0, 0))
	assert_true(g.is_blocked_tile(1, 0), "água ainda não é atravessável")


func test_set_blocked_opens_and_closes_a_passage() -> void:
	var g := _grid()
	g.set_blocked(2, 0, false)
	var p := g.move(Vector2(24, 8), Vector2(20, 0), Vector2(3, 2))
	assert_eq(p.x, 44.0, "com o tile liberado, atravessa")
	g.set_blocked(2, 0, true)
	assert_true(g.is_blocked_tile(2, 0), "fechou de novo")
	g.set_blocked(99, 99, true)
	assert_true(g.is_blocked_tile(99, 99), "fora do mapa continua bloqueado e não quebra")

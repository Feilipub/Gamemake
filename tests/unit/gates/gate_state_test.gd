extends "res://tests/test_case.gd"
## Testes da porteira (src/gameplay/gate_state.gd).


func test_closed_gate_blocks_and_opens_after_animation() -> void:
	var g := GateState.new(false, false, 2.5)
	assert_true(g.is_blocking())
	assert_true(g.toggle())
	g.step(0.1)
	assert_true(g.is_blocking(), "ainda abrindo")
	g.step(0.5)
	assert_false(g.is_blocking(), "aberta deixa passar")
	assert_eq(g.frame(4), 3)


func test_locked_gate_refuses_to_open() -> void:
	var g := GateState.new(false, true)
	assert_false(g.toggle(), "terreno não comprado")
	g.step(1.0)
	assert_true(g.is_blocking())
	assert_eq(g.frame(4), 0)


func test_open_gate_closes_back() -> void:
	var g := GateState.new(true, false, 2.0)
	assert_false(g.is_blocking())
	g.toggle()
	g.step(1.0)
	assert_true(g.is_blocking())
	assert_eq(g.anim, 0.0)

extends "res://tests/test_case.gd"
## Testes da leira da roça (src/gameplay/crop_plot.gd).

const PALMA := {"grow_days": 6, "regrow_days": 4, "yield_kg": 40}


func test_plant_grows_through_stages_until_ready() -> void:
	var p := CropPlot.new("palma", PALMA)
	assert_eq(p.stage(1), -1, "vazia")
	assert_true(p.plant(1))
	assert_eq(p.stage(1), 0)
	assert_eq(p.stage(3), 1)
	assert_eq(p.stage(5), 2)
	assert_false(p.is_ready(6))
	assert_eq(p.days_left(6), 1)
	assert_true(p.is_ready(7))
	assert_eq(p.stage(7), 3)


func test_cannot_plant_twice_or_harvest_early() -> void:
	var p := CropPlot.new("palma", PALMA)
	p.plant(1)
	assert_false(p.plant(2), "já plantada")
	assert_eq(p.harvest(3), 0, "colher antes do tempo não dá nada")


func test_harvest_gives_yield_and_regrows() -> void:
	var p := CropPlot.new("palma", PALMA)
	p.plant(1)
	assert_eq(p.harvest(7), 40)
	assert_false(p.is_ready(7), "acabou de colher")
	assert_false(p.is_ready(10))
	assert_true(p.is_ready(11), "rebrota em 4 dias")
	assert_eq(p.harvest(11), 40)

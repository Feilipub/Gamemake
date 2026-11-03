extends "res://tests/test_case.gd"
## Testes do relógio do jogo (src/gameplay/game_clock.gd).


func test_advance_follows_day_length() -> void:
	var c := GameClock.new({"start_minute": 0, "day_length_sec": 1440})
	c.advance(60.0)
	assert_near(c.minute, 60.0, 0.001, "1 s real = 1 min de jogo")


func test_midnight_rolls_to_next_day() -> void:
	var c := GameClock.new({"start_minute": 1430, "day_length_sec": 1440})
	c.advance(20.0)
	assert_eq(c.day, 2)
	assert_near(c.minute, 10.0, 0.001)


func test_clock_text_formats_hours_and_minutes() -> void:
	var c := GameClock.new({"start_minute": 390, "day_length_sec": 300})
	assert_eq(c.clock_text(), "06:30")


func test_night_is_dark_and_noon_is_white() -> void:
	var c := GameClock.new({"start_minute": 22 * 60, "day_length_sec": 300})
	assert_true(c.is_night())
	assert_true(c.light_color().b > c.light_color().r, "noite azulada")
	c.minute = 12 * 60
	assert_false(c.is_night())
	assert_eq(c.light_color(), Color(1, 1, 1))

class_name GameClock
extends RefCounted
## Relógio do jogo: um dia inteiro dura day_length_sec segundos reais.
## Também calcula a cor da luz ambiente (amanhecer, dia, entardecer, noite).
##
## Exemplo:
##   var clock := GameClock.new(GameData.tuning.time)
##   clock.advance(delta)
##   $CanvasModulate.color = clock.light_color()

const MINUTES_PER_DAY := 1440.0

var day := 1
var minute := 0.0
var _min_per_sec := 1.0


func _init(cfg: Dictionary) -> void:
	minute = float(cfg.get("start_minute", 390))
	_min_per_sec = MINUTES_PER_DAY / maxf(1.0, float(cfg.get("day_length_sec", 300)))


## Avança o tempo; vira o dia à meia-noite.
func advance(dt: float) -> void:
	minute += dt * _min_per_sec
	while minute >= MINUTES_PER_DAY:
		minute -= MINUTES_PER_DAY
		day += 1


## "06:30"
func clock_text() -> String:
	var m := int(minute)
	return "%02d:%02d" % [m / 60, m % 60]


## É noite (19h às 5h)?
func is_night() -> bool:
	return minute >= 19.0 * 60.0 or minute < 5.0 * 60.0


## Cor multiplicada sobre o mundo (CanvasModulate) para o horário atual.
func light_color() -> Color:
	var night := Color(0.36, 0.40, 0.66)
	var dawn := Color(1.0, 0.80, 0.66)
	var day_c := Color(1.0, 1.0, 1.0)
	var dusk := Color(1.0, 0.72, 0.55)
	var h := minute / 60.0
	if h < 5.0 or h >= 20.5:
		return night
	if h < 6.5:
		return night.lerp(dawn, (h - 5.0) / 1.5)
	if h < 8.0:
		return dawn.lerp(day_c, (h - 6.5) / 1.5)
	if h < 17.0:
		return day_c
	if h < 18.5:
		return day_c.lerp(dusk, (h - 17.0) / 1.5)
	return dusk.lerp(night, (h - 18.5) / 2.0)

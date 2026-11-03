class_name VirtualStick
extends Control
## Joystick virtual para toque: traduz o arraste em Input.action_press nas ações de movimento,
## então o vaqueiro lê o toque e o teclado do mesmo jeito (Input.get_vector).

const MOVE := [&"move_right", &"move_left", &"move_down", &"move_up"]

var radius := 46.0
var _touch := -1
var _vec := Vector2.ZERO


func _ready() -> void:
	custom_minimum_size = Vector2(radius, radius) * 2.7
	size = custom_minimum_size
	mouse_filter = Control.MOUSE_FILTER_IGNORE


## O ponto `p` (coordenadas da tela) está sobre o joystick?
func covers(p: Vector2) -> bool:
	return get_global_rect().grow(8).has_point(p)


func _input(event: InputEvent) -> void:
	if not is_visible_in_tree():
		return
	if event is InputEventScreenTouch:
		if event.pressed and _touch == -1 and covers(event.position):
			_touch = event.index
			_update(event.position)
			get_viewport().set_input_as_handled()
		elif not event.pressed and event.index == _touch:
			_touch = -1
			_apply(Vector2.ZERO)
			get_viewport().set_input_as_handled()
	elif event is InputEventScreenDrag and event.index == _touch:
		_update(event.position)
		get_viewport().set_input_as_handled()


func _update(p: Vector2) -> void:
	var v := (p - get_global_rect().get_center()) / radius
	_apply(v.limit_length(1.0))


func _apply(v: Vector2) -> void:
	_vec = v
	var vals := [maxf(v.x, 0.0), maxf(-v.x, 0.0), maxf(v.y, 0.0), maxf(-v.y, 0.0)]
	for i in 4:
		if vals[i] > 0.02:
			Input.action_press(MOVE[i], vals[i])
		else:
			Input.action_release(MOVE[i])
	queue_redraw()


func _draw() -> void:
	var c := size / 2.0
	draw_circle(c, radius * 1.18, Color(0.10, 0.05, 0.02, 0.58))
	draw_arc(c, radius * 1.18, 0.0, TAU, 48, UiTheme.GOLD, 3.0)
	draw_arc(c, radius * 0.7, 0.0, TAU, 32, Color(UiTheme.GOLD, 0.3), 2.0)
	var k := c + _vec * radius
	draw_circle(k + Vector2(0, 4), radius * 0.44, Color(0, 0, 0, 0.45))
	draw_circle(k, radius * 0.44, Color("#d97724"))
	draw_circle(k - Vector2(5, 6), radius * 0.2, Color("#fbe9c2"))

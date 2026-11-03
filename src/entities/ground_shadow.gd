class_name GroundShadow
extends Node2D
## Sombra elíptica no chão, com núcleo mais escuro (mesmo visual do protótipo).

var radius := Vector2(6, 2.4)


func _init(r: Vector2 = Vector2(6, 2.4)) -> void:
	radius = r
	show_behind_parent = true


func _draw() -> void:
	_ellipse(radius + Vector2(1, 0.5), Color(0.12, 0.05, 0.02, 0.20))
	_ellipse(radius * 0.62, Color(0.12, 0.04, 0.02, 0.22))


func _ellipse(r: Vector2, c: Color) -> void:
	draw_set_transform(Vector2.ZERO, 0.0, Vector2(1.0, r.y / maxf(r.x, 0.1)))
	draw_circle(Vector2.ZERO, r.x, c)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

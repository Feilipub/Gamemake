class_name UiTheme
extends RefCounted
## Tema visual da interface: fonte Pixelify Sans, botões de couro/laranja e painéis de madeira,
## seguindo a identidade do protótipo HTML.

const GOLD := Color("#fbc653")
const INK := Color("#110905")
const PAPER := Color("#fce8c5")
const ORANGE := Color("#e89a3c")
const ORANGE_D := Color("#c0741c")
const WOOD := Color("#3a1f0e")


## Cria o Theme padrão da interface.
static func make() -> Theme:
	var t := Theme.new()
	var bold := load("res://assets/fonts/PixelifySans-Bold.ttf") as FontFile
	if bold != null:
		t.default_font = bold
	t.default_font_size = 16
	t.set_stylebox("normal", "Button", _box(ORANGE, INK, 3, Color("#ffd88a")))
	t.set_stylebox("hover", "Button", _box(Color("#f2ac52"), INK, 3, Color("#ffe6a8")))
	t.set_stylebox("pressed", "Button", _box(ORANGE_D, INK, 3, Color("#a85e18")))
	t.set_stylebox("focus", "Button", _box(Color(0, 0, 0, 0), GOLD, 2, Color(0, 0, 0, 0)))
	t.set_color("font_color", "Button", Color("#2b1608"))
	t.set_color("font_hover_color", "Button", Color("#2b1608"))
	t.set_color("font_pressed_color", "Button", Color("#2b1608"))
	t.set_color("font_color", "Label", PAPER)
	t.set_color("font_outline_color", "Label", INK)
	t.set_constant("outline_size", "Label", 4)
	t.set_stylebox("panel", "PanelContainer", _box(Color(WOOD, 0.88), INK, 3, Color("#7e4624")))
	t.set_stylebox("background", "ProgressBar", _box(Color("#2a160b"), INK, 2, Color(0, 0, 0, 0)))
	t.set_stylebox("fill", "ProgressBar", _box(Color("#e0a838"), Color(0, 0, 0, 0), 0, Color("#ffe08a")))
	return t


static func _box(bg: Color, border: Color, bw: int, top: Color) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = bg
	s.border_color = border
	s.set_border_width_all(bw)
	s.content_margin_left = 10
	s.content_margin_right = 10
	s.content_margin_top = 6
	s.content_margin_bottom = 6
	s.shadow_color = Color(0, 0, 0, 0.35)
	s.shadow_size = 2
	s.shadow_offset = Vector2(0, 3)
	if top.a > 0.0:
		s.expand_margin_top = 0
		s.border_blend = false
	return s

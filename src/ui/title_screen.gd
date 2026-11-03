class_name TitleScreen
extends CanvasLayer
## Abertura RF GAMES + tela de título sobre a fazenda viva ao fundo (como no protótipo).
## Emite new_game / continue_game; quem decide o que fazer é a cena principal.

signal new_game
signal continue_game

var _splash: ColorRect
var _menu: Control


## Monta a tela. `has_save` mostra o botão Continuar.
func setup(has_save: bool, skip_splash: bool = false) -> void:
	layer = 20
	var root := Control.new()
	root.theme = UiTheme.make()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(root)

	_menu = Control.new()
	_menu.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.add_child(_menu)
	var shade := ColorRect.new()
	shade.color = Color(0.08, 0.03, 0.01, 0.35)
	shade.set_anchors_preset(Control.PRESET_FULL_RECT)
	shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_menu.add_child(shade)

	var col := VBoxContainer.new()
	col.set_anchors_preset(Control.PRESET_FULL_RECT)
	col.alignment = BoxContainer.ALIGNMENT_CENTER
	col.add_theme_constant_override("separation", 6)
	_menu.add_child(col)
	col.add_child(_label("RF GAMES APRESENTA", 12, Color("#e8c890"), 3))
	col.add_child(_label("LIDA NO", 34, UiTheme.GOLD, 8))
	col.add_child(_label("SERTÃO", 52, UiTheme.GOLD, 10))
	col.add_child(_label("ITARANTIM · BAHIA", 13, UiTheme.PAPER, 3))
	var gap := Control.new()
	gap.custom_minimum_size = Vector2(0, 10)
	col.add_child(gap)
	var box := VBoxContainer.new()
	box.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	box.custom_minimum_size = Vector2(220, 0)
	box.add_theme_constant_override("separation", 7)
	col.add_child(box)
	if has_save:
		box.add_child(_button("Continuar", func() -> void: continue_game.emit()))
	box.add_child(_button("Novo Jogo", func() -> void: new_game.emit()))
	if not OS.has_feature("mobile"):
		box.add_child(_button("Sair", func() -> void: get_tree().quit()))

	_splash = ColorRect.new()
	_splash.color = Color.BLACK
	_splash.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.add_child(_splash)
	var sc := VBoxContainer.new()
	sc.set_anchors_preset(Control.PRESET_FULL_RECT)
	sc.alignment = BoxContainer.ALIGNMENT_CENTER
	_splash.add_child(sc)
	var rf := _label("RF GAMES", 40, UiTheme.GOLD, 8)
	var ap := _label("APRESENTA", 13, Color("#e8c890"), 3)
	sc.add_child(rf)
	sc.add_child(ap)
	if skip_splash:
		_splash.visible = false
		return
	rf.modulate.a = 0.0
	ap.modulate.a = 0.0
	var tw := create_tween()
	tw.tween_property(rf, "modulate:a", 1.0, 0.9)
	tw.tween_property(ap, "modulate:a", 1.0, 0.6)
	tw.tween_interval(1.2)
	tw.tween_property(_splash, "modulate:a", 0.0, 1.0)
	tw.tween_callback(func() -> void: _splash.visible = false)


## Esconde o título com um fade.
func close() -> void:
	var tw := create_tween()
	tw.tween_property(_menu, "modulate:a", 0.0, 0.5)
	tw.tween_callback(func() -> void: visible = false)


func _label(text: String, fs: int, color: Color, outline: int) -> Label:
	var l := Label.new()
	l.text = text
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.add_theme_font_size_override("font_size", fs)
	l.add_theme_color_override("font_color", color)
	l.add_theme_constant_override("outline_size", outline)
	l.add_theme_color_override("font_outline_color", Color("#371d10"))
	return l


func _button(text: String, cb: Callable) -> Button:
	var b := Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(220, 36)
	b.pressed.connect(cb)
	return b

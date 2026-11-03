class_name Hud
extends CanvasLayer
## Interface da gameplay: relógio, fôlego da montaria, mensagens, joystick e botões de toque.
## Só lê o mundo e escuta seus sinais; o mundo não conhece a interface.

var _world: World
var _clock_lbl: Label
var _stamina: ProgressBar
var _msg: Label
var _msg_t := 0.0
var _hint: Label
var _stick: VirtualStick
var _buttons: Array[TouchScreenButton] = []
var _root: Control


## Liga a interface ao mundo. `force_touch` mostra os controles de toque mesmo no PC.
func setup(world: World, force_touch: bool) -> void:
	_world = world
	layer = 10
	_root = Control.new()
	_root.theme = UiTheme.make()
	_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_root)

	var top := PanelContainer.new()
	top.position = Vector2(8, 8)
	_root.add_child(top)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 12)
	top.add_child(row)
	_clock_lbl = Label.new()
	_clock_lbl.add_theme_color_override("font_color", UiTheme.GOLD)
	row.add_child(_clock_lbl)
	_stamina = ProgressBar.new()
	_stamina.custom_minimum_size = Vector2(70, 12)
	_stamina.show_percentage = false
	_stamina.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	row.add_child(_stamina)

	_msg = Label.new()
	_msg.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_msg.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_msg.add_theme_font_size_override("font_size", 14)
	_msg.modulate.a = 0.0
	_root.add_child(_msg)

	_hint = Label.new()
	_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_hint.add_theme_font_size_override("font_size", 13)
	_hint.add_theme_color_override("font_color", UiTheme.GOLD)
	_root.add_child(_hint)

	var touch := force_touch or DisplayServer.is_touchscreen_available()
	_stick = VirtualStick.new()
	_stick.visible = touch
	_root.add_child(_stick)
	for spec in [["Correr", &"run"], ["Montar", &"mount"], ["Aboio", &"aboio"], ["Ação", &"action"]]:
		var b := _make_button(spec[0], spec[1])
		b.visible = touch
		add_child(b)
		_buttons.append(b)

	world.message.connect(show_message)
	world.player.mount_changed.connect(func(on: bool) -> void:
		show_message("Montado. Segure Correr para galopar." if on else "Desmontou."))
	get_viewport().size_changed.connect(_layout)
	_layout()


## Mostra uma mensagem por alguns segundos.
func show_message(text: String) -> void:
	_msg.text = text
	_msg_t = 3.5


func _process(dt: float) -> void:
	if _world == null:
		return
	_clock_lbl.text = "Dia %d  ·  %s" % [_world.clock.day, _world.clock.clock_text()]
	_stamina.visible = _world.player.mounted
	_stamina.max_value = float(GameData.tuning.mount.stamina_max)
	_stamina.value = _world.player.stamina
	_msg_t -= dt
	_msg.modulate.a = clampf(_msg_t * 2.0, 0.0, 1.0)
	var lbl := _world.interaction_label()
	_hint.text = ("[E] " if not _stick.visible else "") + lbl if lbl != "" else ""


func _layout() -> void:
	var vs := get_viewport().get_visible_rect().size
	_msg.position = Vector2(vs.x * 0.15, 46)
	_msg.size = Vector2(vs.x * 0.7, 40)
	_stick.position = Vector2(14, vs.y - _stick.size.y - 10)
	_hint.position = Vector2(vs.x * 0.2, vs.y - 34)
	_hint.size = Vector2(vs.x * 0.6, 24)
	var bw := 74.0
	var bh := 34.0
	for i in _buttons.size():
		_buttons[i].position = Vector2(vs.x - bw - 12, vs.y - (bh + 8) * (i + 1) - 6)


func _make_button(text: String, action: StringName) -> TouchScreenButton:
	var b := TouchScreenButton.new()
	b.action = action
	b.texture_normal = _btn_tex(Color("#b9622a"), Color("#e08a44"))
	b.texture_pressed = _btn_tex(Color("#8a4416"), Color("#b9622a"))
	b.passby_press = false
	var l := Label.new()
	l.text = text
	l.theme = UiTheme.make()
	l.add_theme_font_size_override("font_size", 14)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	l.size = Vector2(74, 34)
	b.add_child(l)
	return b


func _btn_tex(base: Color, light: Color) -> ImageTexture:
	var w := 74
	var h := 34
	var img := Image.create_empty(w, h, false, Image.FORMAT_RGBA8)
	img.fill(UiTheme.INK)
	img.fill_rect(Rect2i(3, 3, w - 6, h - 6), base)
	img.fill_rect(Rect2i(3, 3, w - 6, (h - 6) / 2), light)
	img.fill_rect(Rect2i(3, h - 6, w - 6, 3), base.darkened(0.3))
	return ImageTexture.create_from_image(img)

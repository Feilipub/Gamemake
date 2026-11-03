extends Node
## Cena principal: monta o mundo, a interface e o título, troca a música e cuida do salvamento.
##
## Argumentos de linha de comando (depois de `--`), usados para gerar evidências:
##   --scene=world      pula o título e entra no jogo
##   --minute=1260      horário inicial (minutos do dia)
##   --at=x,y           posição inicial do vaqueiro (pixels de mundo)
##   --day=8            dia do jogo
##   --forage=40        forragem guardada (kg)
##   --plant=palma      planta todas as leiras desse tipo no dia 1 (ou "all")
##   --zoom=1.5         zoom da câmera (fotos)
##   --mounted          começa montado
##   --touch            mostra os controles de toque no PC
##   --move=x,y         segura o movimento nessa direção (ex.: 1,0)
##   --move-for=1.5     solta o movimento depois de N segundos
##   --run              segura Correr
##   --aboio            chama o gado no início
##   --wait=3           segundos até a captura
##   --interact=0.5     aperta Ação depois de N segundos (ex.: abrir a porteira)
##   --move-after=1.2   só começa a andar depois de N segundos
##   --capture=caminho.png  salva a tela e fecha

const AUTOSAVE_SEC := 60.0

var world: World
var hud: Hud
var title: TitleScreen
var _args := {}
var _autosave := 0.0


func _ready() -> void:
	InputSetup.ensure_actions()
	_args = _parse_args()
	world = World.new()
	add_child(world)
	world.build()
	hud = Hud.new()
	add_child(hud)
	hud.setup(world, _args.has("touch"))
	hud.visible = false
	title = TitleScreen.new()
	add_child(title)
	title.setup(SaveService.has_save(), _args.has("scene") or _args.has("capture"))
	title.new_game.connect(_start.bind(false))
	title.continue_game.connect(_start.bind(true))
	Music.play("intro")
	get_tree().set_auto_accept_quit(false)
	if _args.get("scene", "") == "world":
		_start(false)
		_apply_debug_args()
	if _args.has("capture"):
		_capture.call_deferred()


func _start(cont: bool) -> void:
	if cont:
		world.from_save(SaveService.load_save())
	title.close()
	world.set_playing(true)
	hud.visible = true
	Music.play("game")
	if not cont:
		hud.show_message("Bem-vindo à Fazenda Boa Esperança! Chegue perto do cavalo e use Montar.")


func _process(dt: float) -> void:
	if not world.playing:
		return
	_autosave += dt
	if _autosave >= AUTOSAVE_SEC:
		_autosave = 0.0
		SaveService.save(world.to_save())


func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST or what == NOTIFICATION_APPLICATION_PAUSED:
		if world != null and world.playing:
			SaveService.save(world.to_save())
		if what == NOTIFICATION_WM_CLOSE_REQUEST:
			get_tree().quit()


func _apply_debug_args() -> void:
	if _args.has("at"):
		var q: PackedStringArray = String(_args.at).split(",")
		world.player.position = Vector2(float(q[0]), float(q[1]))
		world.horse.position = world.player.position + Vector2(20, 0)
		world.set_playing(true)
	if _args.has("zoom"):
		world.set_zoom(float(_args.zoom))
	if _args.has("plant"):
		for pl in world.plots:
			if _args.plant == "all" or pl.logic.crop == _args.plant:
				pl.logic.plant(1)
	if _args.has("day"):
		world.clock.day = int(_args.day)
	if _args.has("forage"):
		world.forage_kg = int(_args.forage)
	if _args.has("minute"):
		world.clock.minute = float(_args.minute)
	if _args.has("mounted"):
		world.horse.position = world.player.position
		world.player.toggle_mount()
	if _args.has("interact"):
		get_tree().create_timer(float(_args.interact)).timeout.connect(world.interact)
	if _args.has("move-after"):
		await get_tree().create_timer(float(_args["move-after"])).timeout
	if _args.has("move"):
		var p: PackedStringArray = String(_args.move).split(",")
		var v := Vector2(float(p[0]), float(p[1]))
		if v.x > 0.0: Input.action_press(&"move_right", v.x)
		if v.x < 0.0: Input.action_press(&"move_left", -v.x)
		if v.y > 0.0: Input.action_press(&"move_down", v.y)
		if v.y < 0.0: Input.action_press(&"move_up", -v.y)
	if _args.has("move-for"):
		get_tree().create_timer(float(_args["move-for"])).timeout.connect(func() -> void:
			for act: StringName in [&"move_left", &"move_right", &"move_up", &"move_down"]:
				Input.action_release(act))
	if _args.has("run"):
		Input.action_press(&"run")
	if _args.has("aboio"):
		world._on_aboio(world.player.position)


func _capture() -> void:
	await get_tree().create_timer(float(_args.get("wait", 2.5))).timeout
	await RenderingServer.frame_post_draw
	var img := get_viewport().get_texture().get_image()
	var path := String(_args.capture)
	DirAccess.make_dir_recursive_absolute(path.get_base_dir())
	img.save_png(path)
	print("captura salva: ", path)
	for c in world.cows:
		print("boi ", c.cow_name, " ", c.position, " estado ", HerdBrain.State.keys()[c.brain.state], " área ", world.area_at(c.position))
	print("vaqueiro em ", world.player.position, " · forragem ", world.forage_kg, " · cochos ", world.troughs.map(func(t: Trough) -> int: return roundi(t.level)))
	get_tree().quit()


func _parse_args() -> Dictionary:
	var out := {}
	for a in OS.get_cmdline_user_args():
		var s := a.trim_prefix("--")
		var i := s.find("=")
		if i < 0:
			out[s] = true
		else:
			out[s.substr(0, i)] = s.substr(i + 1)
	return out

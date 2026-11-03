extends Node
## Dados somente-leitura do jogo: mapa e arte exportados do protótipo HTML
## (assets/data/world_map.json, art_sprites.json) e os parâmetros ajustáveis (game_tuning.json).
## É um serviço de leitura; o estado da partida NÃO mora aqui.

var world: Dictionary = {}
var sprites: Dictionary = {}
var tuning: Dictionary = {}
var parcels: Dictionary = {}

var _tex_cache: Dictionary = {}
var _frames_cache: Dictionary = {}


func _ready() -> void:
	world = load_json("res://assets/data/world_map.json")
	sprites = load_json("res://assets/data/art_sprites.json")
	tuning = load_json("res://assets/data/game_tuning.json")
	parcels = load_json("res://assets/data/farm_parcels.json")


## Lê um arquivo JSON e devolve o dicionário (vazio em caso de erro).
static func load_json(path: String) -> Dictionary:
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		push_error("Não foi possível abrir %s" % path)
		return {}
	var data: Variant = JSON.parse_string(f.get_as_text())
	if data is Dictionary:
		return data
	push_error("JSON inválido em %s" % path)
	return {}


## Textura carregada uma única vez por caminho.
func tex(path: String) -> Texture2D:
	if not _tex_cache.has(path):
		_tex_cache[path] = load(path)
	return _tex_cache[path]


## Metadados de uma tira de animação (fw, fh, n, ox, oy, file).
func strip(name: String) -> Dictionary:
	return sprites.get(name, {})


## Constrói (e guarda em cache) um SpriteFrames a partir de tiras exportadas.
## `anims` mapeia nome da animação -> [nome_da_tira, fps, loop].
func build_frames(cache_key: String, anims: Dictionary) -> SpriteFrames:
	if _frames_cache.has(cache_key):
		return _frames_cache[cache_key]
	var sf := SpriteFrames.new()
	sf.remove_animation(&"default")
	for anim_name: String in anims:
		var spec: Array = anims[anim_name]
		var m := strip(spec[0])
		if m.is_empty():
			push_warning("Tira ausente: %s" % spec[0])
			continue
		sf.add_animation(anim_name)
		sf.set_animation_speed(anim_name, float(spec[1]))
		sf.set_animation_loop(anim_name, bool(spec[2]))
		var t := tex(m.file)
		for i in int(m.n):
			var at := AtlasTexture.new()
			at.atlas = t
			at.region = Rect2(i * float(m.fw), 0, float(m.fw), float(m.fh))
			sf.add_frame(anim_name, at)
	_frames_cache[cache_key] = sf
	return sf

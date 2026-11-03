extends Node
## Trilha sonora com os arquivos reais da RF Games (assets/audio/music/).
## INTRO: abertura e menu · CUTSCENE: história inicial · GAME1/GAME2: gameplay, alternadas.
## Troca com crossfade, sem corte; GAME1 e GAME2 se revezam antes de terminar.

const TRACKS := {
	"intro": "res://assets/audio/music/intro.mp3",
	"cutscene": "res://assets/audio/music/cutscene.mp3",
	"game1": "res://assets/audio/music/game1.mp3",
	"game2": "res://assets/audio/music/game2.mp3",
}
const SILENT_DB := -60.0

var _a: AudioStreamPlayer
var _b: AudioStreamPlayer
var _cur: AudioStreamPlayer
var _want := ""
var _game_idx := 0
var _cfg: Dictionary = {}


func _ready() -> void:
	_ensure_bus(&"Music")
	_ensure_bus(&"SFX")
	_a = _make_player()
	_b = _make_player()
	_cfg = GameData.tuning.get("music", {})
	set_bus_volume(&"Music", float(_cfg.get("music_volume", 0.8)))
	set_bus_volume(&"SFX", float(_cfg.get("sfx_volume", 0.9)))


## Pede uma trilha: "intro", "cutscene" ou "game" (alterna GAME1/GAME2).
func play(id: String) -> void:
	if id == _want:
		return
	_want = id
	_switch_to(_track_for(id))


## Volume linear (0..1) de um barramento ("Music" ou "SFX").
func set_bus_volume(bus: StringName, linear: float) -> void:
	var i := AudioServer.get_bus_index(bus)
	if i >= 0:
		AudioServer.set_bus_volume_db(i, linear_to_db(maxf(linear, 0.0001)))


func _process(_dt: float) -> void:
	if _want != "game" or _cur == null or not _cur.playing or _cur.stream == null:
		return
	var left := _cur.stream.get_length() - _cur.get_playback_position()
	if left < float(_cfg.get("crossfade_before_end_sec", 2.5)):
		_game_idx += 1
		_switch_to(_track_for("game"))


func _track_for(id: String) -> String:
	if id == "game":
		return "game1" if _game_idx % 2 == 0 else "game2"
	return id


func _switch_to(track: String) -> void:
	if not TRACKS.has(track):
		return
	var stream := load(TRACKS[track]) as AudioStream
	if stream == null:
		push_warning("Trilha ausente: %s" % TRACKS[track])
		return
	if stream is AudioStreamMP3:
		(stream as AudioStreamMP3).loop = _want != "game"
	var nxt := _b if _cur == _a else _a
	var old := _cur
	nxt.stream = stream
	nxt.volume_db = SILENT_DB
	nxt.play()
	create_tween().tween_property(nxt, "volume_db", 0.0, float(_cfg.get("fade_in_sec", 1.5)))
	if old != null and old.playing:
		var tw := create_tween()
		tw.tween_property(old, "volume_db", SILENT_DB, float(_cfg.get("fade_out_sec", 2.0)))
		tw.tween_callback(old.stop)
	_cur = nxt


func _make_player() -> AudioStreamPlayer:
	var p := AudioStreamPlayer.new()
	p.bus = &"Music"
	add_child(p)
	return p


func _ensure_bus(bus: StringName) -> void:
	if AudioServer.get_bus_index(bus) >= 0:
		return
	AudioServer.add_bus()
	var i := AudioServer.bus_count - 1
	AudioServer.set_bus_name(i, bus)
	AudioServer.set_bus_send(i, &"Master")

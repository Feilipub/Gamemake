extends "res://tests/test_case.gd"
## Integração: toda textura citada nos dados exportados precisa existir no projeto.
## Regressão: a pasta assets/art/world/obj/ caía na regra `[Oo]bj/` do .gitignore e sumia num
## clone limpo (CI), gerando um APK sem cercas, prédios e árvores.


const GameDataScript := preload("res://src/core/game_data.gd")


func _missing(paths: Array) -> Array:
	var out := []
	for p: String in paths:
		if not ResourceLoader.exists(p):
			out.append(p)
	return out


func test_every_world_texture_exists() -> void:
	var w := GameDataScript.load_json("res://assets/data/world_map.json")
	var paths := {}
	for o: Dictionary in w.get("objects", []):
		paths[o.t] = true
	for g: Dictionary in w.get("gates", []):
		paths[g.t] = true
	assert_true(paths.size() > 100, "o mapa deveria citar centenas de texturas (citou %d)" % paths.size())
	var miss := _missing(paths.keys())
	assert_eq(miss.size(), 0, "texturas ausentes: %s" % str(miss.slice(0, 5)))


func test_every_sprite_strip_exists() -> void:
	var s := GameDataScript.load_json("res://assets/data/art_sprites.json")
	var files := []
	for k: String in s:
		files.append(s[k].file)
	var miss := _missing(files)
	assert_eq(miss.size(), 0, "tiras ausentes: %s" % str(miss.slice(0, 5)))


func test_ground_textures_exist() -> void:
	assert_true(ResourceLoader.exists("res://assets/art/world/ground_s0.png"))
	assert_true(ResourceLoader.exists("res://assets/art/world/ground_s1.png"))

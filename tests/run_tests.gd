extends SceneTree
## Executor de testes headless:
##   godot --headless --path . -s res://tests/run_tests.gd
## Roda toda função test_* dos arquivos *_test.gd em tests/unit e tests/integration.
## Código de saída 0 = tudo passou, 1 = alguma falha.


func _init() -> void:
	var files: Array[String] = []
	for dir in ["res://tests/unit", "res://tests/integration"]:
		_collect(dir, files)
	var total := 0
	var failed := 0
	for path in files:
		var script := load(path) as GDScript
		if script == null or not script.can_instantiate():
			print("  FALHOU  ", path.get_file(), " :: não compila")
			failed += 1
			total += 1
			continue
		var suite: Object = script.new()
		for m in script.get_script_method_list():
			var name: String = m.name
			if not name.begins_with("test_"):
				continue
			total += 1
			var before: int = suite.failures.size()
			suite.begin(name)
			suite.call(name)
			if suite.failures.size() > before:
				failed += 1
				for f in suite.failures.slice(before):
					print("  FALHOU  ", path.get_file(), " :: ", f)
			else:
				print("  ok      ", path.get_file(), " :: ", name)
	print("\n%d testes, %d falhas" % [total, failed])
	quit(1 if failed > 0 else 0)


func _collect(dir: String, out: Array[String]) -> void:
	var da := DirAccess.open(dir)
	if da == null:
		return
	for f in da.get_files():
		if f.ends_with("_test.gd"):
			out.append(dir.path_join(f))
	for sub in da.get_directories():
		_collect(dir.path_join(sub), out)

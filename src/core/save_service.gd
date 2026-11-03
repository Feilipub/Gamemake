class_name SaveService
extends RefCounted
## Salvamento em user://lida_save.json, com cópia de segurança (.bak) gravada antes.

const PATH := "user://lida_save.json"
const BACKUP := "user://lida_save.bak"


## Existe partida salva?
static func has_save() -> bool:
	return FileAccess.file_exists(PATH) or FileAccess.file_exists(BACKUP)


## Grava o estado. Devolve true se deu certo.
static func save(data: Dictionary) -> bool:
	if FileAccess.file_exists(PATH):
		DirAccess.copy_absolute(ProjectSettings.globalize_path(PATH), ProjectSettings.globalize_path(BACKUP))
	var f := FileAccess.open(PATH, FileAccess.WRITE)
	if f == null:
		return false
	return f.store_string(JSON.stringify(data))


## Lê o estado (tenta a cópia de segurança se o principal estiver corrompido).
static func load_save() -> Dictionary:
	for p in [PATH, BACKUP]:
		if not FileAccess.file_exists(p):
			continue
		var f := FileAccess.open(p, FileAccess.READ)
		if f == null:
			continue
		var d: Variant = JSON.parse_string(f.get_as_text())
		if d is Dictionary:
			return d
	return {}

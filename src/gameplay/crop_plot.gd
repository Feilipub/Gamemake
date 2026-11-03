class_name CropPlot
extends RefCounted
## Uma leira da roça de forragem (lógica pura). Dados em assets/data/farm_crops.json.
##
## Estados: VAZIA (planted_day = -1) → CRESCENDO (estágios 0..2) → PRONTA (estágio 3).
## Transições:
##   plant(day): só se vazia.
##   harvest(day): só se pronta; devolve kg colhidos e volta para "crescendo" de modo que fique
##                 pronta de novo em regrow_days (planta perene: rebrota).
## Estágio: 0..3 pela fração de grow_days passada desde o plantio.
##
## Exemplo:
##   var p := CropPlot.new("palma", crops.palma)
##   p.plant(clock.day); ... if p.is_ready(clock.day): forage += p.harvest(clock.day)

var crop := ""
var planted_day := -1
var _cfg: Dictionary


func _init(crop_key: String, cfg: Dictionary) -> void:
	crop = crop_key
	_cfg = cfg


## A leira está vazia?
func is_empty() -> bool:
	return planted_day < 0


## Planta no dia `day`. Devolve false se já estava plantada.
func plant(day: int) -> bool:
	if not is_empty():
		return false
	planted_day = day
	return true


## Dias desde o plantio (ou desde o "plantio equivalente" depois da colheita).
func age(day: int) -> int:
	return -1 if is_empty() else maxi(0, day - planted_day)


## Estágio visual 0..3 (-1 se vazia).
func stage(day: int) -> int:
	if is_empty():
		return -1
	var g := maxi(1, int(_cfg.grow_days))
	return mini(3, int(floor(float(age(day)) / float(g) * 3.0)))


## Pronta para colher?
func is_ready(day: int) -> bool:
	return not is_empty() and age(day) >= int(_cfg.grow_days)


## Dias que faltam para ficar pronta (0 se pronta).
func days_left(day: int) -> int:
	return 0 if is_ready(day) or is_empty() else int(_cfg.grow_days) - age(day)


## Colhe: devolve kg (0 se não estava pronta) e deixa a planta rebrotando.
func harvest(day: int) -> int:
	if not is_ready(day):
		return 0
	planted_day = day - (int(_cfg.grow_days) - int(_cfg.regrow_days))
	return int(_cfg.yield_kg)


## Estado para salvar.
func to_save() -> Dictionary:
	return {"crop": crop, "planted_day": planted_day}

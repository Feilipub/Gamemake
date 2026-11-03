class_name GateState
extends RefCounted
## Estado de uma porteira (lógica pura, testável). Implementa design/level/fazenda_boa_esperanca.md §6.
##
## Estados: FECHADA (anim 0) ⇄ ABRINDO/FECHANDO ⇄ ABERTA (anim 1).
## Transições:
##   toggle(): se travada (terreno não comprado) → recusa; senão inverte o alvo.
##   step(dt): anim anda em direção ao alvo com velocidade `speed` (1/s).
## Bloqueio: a porteira bloqueia a passagem enquanto anim < BLOCK_BELOW (mesma regra do protótipo: 0,65).
##
## Exemplo:
##   var g := GateState.new(false, false, 2.5)
##   g.toggle(); g.step(0.5)
##   if not g.is_blocking(): ...

const BLOCK_BELOW := 0.65

var open := false
var locked := false
var anim := 0.0
var speed := 2.5


func _init(start_open: bool = false, start_locked: bool = false, anim_speed: float = 2.5) -> void:
	open = start_open
	locked = start_locked
	anim = 1.0 if start_open else 0.0
	speed = anim_speed


## Pede para abrir/fechar. Devolve false se a porteira está travada.
func toggle() -> bool:
	if locked:
		return false
	open = not open
	return true


## Avança a animação.
func step(dt: float) -> void:
	anim = move_toward(anim, 1.0 if open else 0.0, speed * dt)


## A porteira impede a passagem agora?
func is_blocking() -> bool:
	return anim < BLOCK_BELOW


## Quadro de animação (0 = fechada … frames-1 = aberta).
func frame(frames: int = 4) -> int:
	return clampi(roundi(anim * float(frames - 1)), 0, frames - 1)

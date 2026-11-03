class_name InputSetup
extends RefCounted
## Mapa de ações do jogo (teclado). O toque usa as mesmas ações via Input.action_press.

const ACTIONS := {
	&"move_left": [KEY_A, KEY_LEFT],
	&"move_right": [KEY_D, KEY_RIGHT],
	&"move_up": [KEY_W, KEY_UP],
	&"move_down": [KEY_S, KEY_DOWN],
	&"run": [KEY_SHIFT],
	&"mount": [KEY_R],
	&"aboio": [KEY_Q],
	&"action": [KEY_E, KEY_SPACE],
	&"zoom_in": [KEY_EQUAL, KEY_KP_ADD],
	&"zoom_out": [KEY_MINUS, KEY_KP_SUBTRACT],
	&"pause": [KEY_ESCAPE],
}


## Cria as ações que ainda não existem no InputMap.
static func ensure_actions() -> void:
	for action: StringName in ACTIONS:
		if InputMap.has_action(action):
			continue
		InputMap.add_action(action, 0.2)
		for key: int in ACTIONS[action]:
			var e := InputEventKey.new()
			e.physical_keycode = key
			InputMap.action_add_event(action, e)

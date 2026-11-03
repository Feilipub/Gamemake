extends RefCounted
## Base mínima para testes unitários (substituto provisório do gdUnit4 até rodar /test-setup).
## Segue as mesmas convenções: arquivos *_test.gd e funções test_[cenario]_[esperado].

var failures: Array[String] = []
var _current := ""


func begin(test_name: String) -> void:
	_current = test_name


func assert_true(cond: bool, msg: String = "") -> void:
	if not cond:
		failures.append("%s: esperado verdadeiro %s" % [_current, msg])


func assert_false(cond: bool, msg: String = "") -> void:
	if cond:
		failures.append("%s: esperado falso %s" % [_current, msg])


func assert_eq(actual: Variant, expected: Variant, msg: String = "") -> void:
	if actual != expected:
		failures.append("%s: esperado %s, veio %s %s" % [_current, str(expected), str(actual), msg])


func assert_near(actual: float, expected: float, tol: float, msg: String = "") -> void:
	if absf(actual - expected) > tol:
		failures.append("%s: esperado %.4f±%.4f, veio %.4f %s" % [_current, expected, tol, actual, msg])

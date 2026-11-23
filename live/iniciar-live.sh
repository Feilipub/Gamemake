#!/usr/bin/env bash
# Fazenda da Live — inicia o servidor-ponte (Mac/Linux)
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Instale o Node.js em https://nodejs.org e rode de novo."; exit 1; }
[ -d node_modules ] || { echo "Instalando (só na primeira vez)..."; npm install; }
read -r -p "Seu usuário do TikTok (sem @), ou deixe vazio para modo demonstração: " USUARIO
if [ -z "$USUARIO" ]; then node servidor.mjs --demo; else node servidor.mjs "$USUARIO"; fi

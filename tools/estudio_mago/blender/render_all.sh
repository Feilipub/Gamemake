#!/bin/bash
cd "$(dirname "$0")"
blender -b flamingo3d.blend --python animar.py -- $PWD/ch_Y.json $PWD/fr_corte6_gta6_flamingo 60 $PWD/plano_corte6_gta6_flamingo.json > r_Y.log 2>&1
echo FLAMINGO_DONE
blender -b mago3d.blend --python animar.py -- $PWD/ch_M.json $PWD/fr_corte6_gta6_mago 60 $PWD/plano_corte6_gta6_mago.json > r_M.log 2>&1
echo MAGO_DONE

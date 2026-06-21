FROM joaoaugustomv/api_base_ca_epi:2.0

COPY pesquisar_por_nome.py /fastapi/routers/pesquisar_por_nome.py

RUN python - <<'PY'
from pathlib import Path

main = Path('/fastapi/main.py')
texto = main.read_text(encoding='utf-8')

if 'pesquisar_por_nome' not in texto:
    texto = texto.replace(
        'from routers import certificadoApovacao',
        'from routers import certificadoApovacao\nfrom routers import pesquisar_por_nome'
    )
    texto = texto.replace(
        'app.include_router(certificadoApovacao.router)',
        'app.include_router(certificadoApovacao.router)\napp.include_router(pesquisar_por_nome.router)'
    )
    main.write_text(texto, encoding='utf-8')
PY

from fastapi import APIRouter

from Services.CAService import CAService

router = APIRouter(tags=['Certificado de Aprovação'])
caService = CAService()

LIMITE_RESULTADOS = 50


@router.get('/pesquisarPorNomeEquipamento/{nome}')
async def pesquisar_por_nome_equipamento(nome: str):
    termo = (nome or '').strip()

    if not termo:
        return []

    df = caService.baseDadosDF
    filtro = df['NomeEquipamento'].str.contains(termo, case=False, na=False, regex=False)
    resultados = df.loc[filtro].drop_duplicates('RegistroCA', keep='last')

    if resultados.empty:
        return []

    lista = []

    for _, linha in resultados.head(LIMITE_RESULTADOS).iterrows():
        lista.append({
            'caNumber': str(linha['RegistroCA']),
            'name': str(linha['NomeEquipamento'] or 'EPI Sem Nome')
        })

    return lista

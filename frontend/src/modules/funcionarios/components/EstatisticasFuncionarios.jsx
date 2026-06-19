/**
 * @param {{ total: number, admitidos: number, demitidosInativos: number }} props
 */
export function EstatisticasFuncionarios({ total, admitidos, demitidosInativos }) {
    return (
        <div className="estatisticas-funcionarios">
            <div className="estatisticas-funcionarios__item">
                <span className="estatisticas-funcionarios__rotulo">Total cadastrados</span>
                <strong className="estatisticas-funcionarios__valor">{total}</strong>
            </div>
            <div className="estatisticas-funcionarios__item">
                <span className="estatisticas-funcionarios__rotulo">Admitidos</span>
                <strong className="estatisticas-funcionarios__valor">{admitidos}</strong>
            </div>
            <div className="estatisticas-funcionarios__item">
                <span className="estatisticas-funcionarios__rotulo">Demitidos / inativos</span>
                <strong className="estatisticas-funcionarios__valor">{demitidosInativos}</strong>
            </div>
        </div>
    );
}

# Padrão DataTable (Chadcn/TanStack)

Use este padrão para grids com filtros por coluna, paginação e linhas clicáveis.

## Uso rápido

```jsx
import { DataTable } from './components/ui/data-table';

const columns = [
  { key: 'codigo', label: 'Código' },
  { key: 'descricao', label: 'Descrição', cell: (row) => <span className="text-graphite-500">{row.descricao}</span> },
  { key: 'status', label: 'Status', filterMode: 'select' },
  {
    key: 'total',
    label: 'Total',
    headerClassName: 'text-right',
    cellClassName: 'text-right',
  },
];

<DataTable
  columns={columns}
  data={rows}
  onRowClick={(row) => console.log(row)}
  emptyMessage="Nenhum resultado para os filtros selecionados."
/>;
```

## Campos do `columns`
- `key` (obrigatório): chave do dado.
- `label` (obrigatório): rótulo do cabeçalho.
- `cell` (opcional): render customizado da célula.
- `accessor` (opcional): valor usado para filtro quando a célula é custom.
- `filterMode` (opcional): `"select"` ou `"text"`.
- `headerClassName` / `cellClassName` (opcional): classes Tailwind.

## Props do `DataTable`
- `data`: array de linhas.
- `columns`: definição das colunas.
- `onRowClick`: callback de clique na linha.
- `getRowClassName`: classes dinâmicas por linha.
- `hidePagination`: remove paginação.
- `tableWrapperClassName`: classes no wrapper da tabela (ex: `max-h-56 overflow-y-auto`).
- `emptyMessage`: texto quando não há resultados.

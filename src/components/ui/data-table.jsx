import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from './Button';
import { Input } from './Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { ChevronLeftIcon, ChevronRightIcon, FunnelIcon } from '@heroicons/react/24/outline';

const ALL_VALUE = '__all__';

const defaultPageSizes = [8, 12, 20];

const resolveFilterMode = (column, uniqueCount) => {
  const mode = column.columnDef.meta?.filterMode;
  if (mode) return mode;
  if (column.id === 'status') return 'select';
  return uniqueCount > 0 && uniqueCount <= 6 ? 'select' : 'text';
};

const buildColumnDefs = (columns) =>
  columns.map((col) => ({
    id: col.key,
    accessorKey: col.accessor ? undefined : col.key,
    accessorFn: col.accessor || undefined,
    header: col.label,
    cell: col.cell
      ? ({ row }) => col.cell(row.original)
      : (info) => info.getValue(),
    enableColumnFilter: col.enableFilter !== false,
    meta: {
      label: col.label,
      filterMode: col.filterMode,
      headerClassName: col.headerClassName,
      cellClassName: col.cellClassName,
    },
  }));

const DataTableFilters = ({
  table,
  filterTitle = 'Filtros',
  filterContainerClassName = '',
  filterGridClassName = '',
  filterLabelClassName = '',
  filterInputClassName = '',
  filterSelectTriggerClassName = '',
}) => {
  const columns = table.getAllColumns().filter((column) => column.getCanFilter());

  if (!columns.length) return null;

  return (
    <div
      className={`mb-4 rounded-lg border border-graphite-200 bg-graphite-50/70 p-3 dark:border-graphite-700 dark:bg-graphite-900/55 ${filterContainerClassName}`.trim()}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-graphite-500 dark:text-graphite-300">
          <FunnelIcon className="h-3.5 w-3.5" />
          {filterTitle}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-graphite-300 bg-white text-graphite-700 hover:bg-graphite-100 dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-200 dark:hover:bg-graphite-800"
          onClick={() => table.resetColumnFilters()}
        >
          Limpar filtros
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 flex-1 ${filterGridClassName}`.trim()}>
        {columns.map((column) => {
          const uniqueValues = Array.from(column.getFacetedUniqueValues().keys()).filter(
            (value) => value !== undefined && value !== null && value !== ''
          );
          const mode = resolveFilterMode(column, uniqueValues.length);
          const value = column.getFilterValue() ?? '';
          const label = column.columnDef.meta?.label || column.id;

          return (
            <div key={column.id} className="space-y-1">
              <label
                className={`text-[11px] font-semibold uppercase tracking-[0.08em] text-graphite-500 dark:text-graphite-300 ${filterLabelClassName}`.trim()}
              >
                {label}
              </label>
              {mode === 'select' ? (
                <Select
                  value={value || ALL_VALUE}
                  onValueChange={(next) => column.setFilterValue(next === ALL_VALUE ? '' : next)}
                >
                  <SelectTrigger
                    className={`h-9 border-graphite-300 bg-white text-graphite-700 focus:ring-2 focus:ring-graphite-400 dark:border-graphite-600 dark:bg-graphite-900/80 dark:text-graphite-100 dark:focus:ring-graphite-600 ${filterSelectTriggerClassName}`.trim()}
                  >
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                    {uniqueValues.map((option) => (
                      <SelectItem key={`${column.id}-${option}`} value={String(option)}>
                        {String(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={value || ''}
                  onChange={(event) => column.setFilterValue(event.target.value)}
                  placeholder={`Filtrar ${label}`}
                  className={`h-9 border-graphite-300 bg-white text-sm text-graphite-700 placeholder:text-graphite-400 focus:ring-2 focus:ring-graphite-400 dark:border-graphite-600 dark:bg-graphite-900/80 dark:text-graphite-100 dark:placeholder:text-graphite-400 dark:focus:ring-graphite-600 ${filterInputClassName}`.trim()}
                />
              )}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};

const DataTablePagination = ({ table, pageSizes = defaultPageSizes }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-2 text-sm text-graphite-500 dark:text-graphite-300">
    <div className="flex items-center gap-2">
      <span>Linhas por página</span>
      <Select
        value={String(table.getState().pagination.pageSize)}
        onValueChange={(value) => table.setPageSize(Number(value))}
      >
        <SelectTrigger className="h-8 w-[90px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageSizes.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="flex items-center gap-4">
      <span>
        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

const DataTable = ({
  columns,
  data,
  emptyMessage = 'Nenhum resultado para os filtros selecionados.',
  onRowClick,
  getRowClassName,
  pageSize = defaultPageSizes[0],
  hidePagination = false,
  onFilteredRowCountChange,
  tableWrapperClassName = '',
  filterTitle = 'Filtros',
  filterContainerClassName = '',
  filterGridClassName = '',
  filterLabelClassName = '',
  filterInputClassName = '',
  filterSelectTriggerClassName = '',
}) => {
  const columnDefs = React.useMemo(() => buildColumnDefs(columns), [columns]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns: columnDefs,
    state: {
      columnFilters,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const rows = table.getRowModel().rows;

  React.useEffect(() => {
    if (onFilteredRowCountChange) {
      onFilteredRowCountChange(table.getFilteredRowModel().rows.length);
    }
  }, [onFilteredRowCountChange, table, columnFilters, pagination, data]);

  return (
    <div>
      <DataTableFilters
        table={table}
        filterTitle={filterTitle}
        filterContainerClassName={filterContainerClassName}
        filterGridClassName={filterGridClassName}
        filterLabelClassName={filterLabelClassName}
        filterInputClassName={filterInputClassName}
        filterSelectTriggerClassName={filterSelectTriggerClassName}
      />
      <div className={`border border-graphite-200 rounded-md overflow-hidden dark:border-graphite-700 dark:bg-graphite-900/35 ${tableWrapperClassName}`.trim()}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={header.column.columnDef.meta?.headerClassName}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={getRowClassName ? getRowClassName(row.original) : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={cell.column.columnDef.meta?.cellClassName}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-sm text-graphite-500 dark:text-graphite-300">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!hidePagination && <DataTablePagination table={table} />}
    </div>
  );
};

const DataTableExample = () => {
  const rows = [
    { codigo: 'PRD-001', descricao: 'Notebook Corporativo', status: 'Ativo', total: 'R$ 12.800,00' },
    { codigo: 'PRD-014', descricao: 'Monitor 24"', status: 'Ativo', total: 'R$ 1.560,00' },
    { codigo: 'PRD-021', descricao: 'Headset', status: 'Bloqueado', total: 'R$ 960,00' },
  ];
  const columns = [
    { key: 'codigo', label: 'Código' },
    {
      key: 'descricao',
      label: 'Descrição',
      cell: (row) => <span className="text-graphite-500">{row.descricao}</span>,
    },
    { key: 'status', label: 'Status', filterMode: 'select' },
    {
      key: 'total',
      label: 'Total',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
    },
  ];

  return <DataTable columns={columns} data={rows} hidePagination />;
};

export { DataTable, DataTableExample };

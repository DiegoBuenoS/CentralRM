import React from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar } from '../components/ui/calendar';
import {
  Bars3Icon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  DocumentTextIcon,
  PlayIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import { ptBR } from 'date-fns/locale';

const TIMESHEET_STORAGE_KEY = 'timesheet_entries_v1';
const TIMESHEET_ACTIVE_STORAGE_KEY = 'timesheet_active_v1';
const MAX_DAILY_MINUTES = 12 * 60;
const DEFAULT_START_TIME = '08:00';
const DEFAULT_END_TIME = '18:00';
const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, index) => {
  const totalMinutes = index * 15;
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
});

const PROJECTS = [
  {
    id: 'prj-obra-residencial',
    name: 'Obra Residencial - Bloco A',
    tasks: [
      { id: 'task-fundacao', name: 'Fundacao e Baldrame' },
      { id: 'task-alvenaria', name: 'Alvenaria de Vedacao' },
      { id: 'task-reboco', name: 'Reboco Interno e Externo' },
    ],
  },
  {
    id: 'prj-obra-comercial',
    name: 'Centro Comercial - Torre Norte',
    tasks: [
      { id: 'task-estrutura', name: 'Montagem de Estruturas Metalicas' },
      { id: 'task-concretagem', name: 'Concretagem de Lajes' },
      { id: 'task-instalacoes', name: 'Instalacoes Hidrossanitarias' },
    ],
  },
  {
    id: 'prj-infra-vias',
    name: 'Infraestrutura Viaria - Lote 03',
    tasks: [
      { id: 'task-terraplenagem', name: 'Terraplenagem e Compactacao' },
      { id: 'task-pavimentacao', name: 'Pavimentacao Asfaltica' },
      { id: 'task-sinalizacao', name: 'Sinalizacao e Drenagem' },
    ],
  },
];

const nowLocalDate = () => new Date().toISOString().slice(0, 10);

const readJsonStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const formatMinutes = (minutes) => {
  const total = Math.max(0, Number(minutes || 0));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}m`;
};

const toDateTime = (date, time) => {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeObservation = (value) => String(value || '').trim().slice(0, 400);

const buildMinutesByDate = (items) =>
  items.reduce((acc, item) => {
    const date = String(item?.date || '');
    const minutes = Math.max(0, Number(item?.minutes || 0));
    if (!date || minutes <= 0) return acc;
    acc.set(date, (acc.get(date) || 0) + minutes);
    return acc;
  }, new Map());

const buildDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];

  const dates = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const day = cursor.getDay();
    if (day === 0 || day === 6) {
      cursor.setDate(cursor.getDate() + 1);
      continue;
    }
    const yyyy = cursor.getFullYear();
    const mm = String(cursor.getMonth() + 1).padStart(2, '0');
    const dd = String(cursor.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

const formatDate = (date) => (date ? date.toLocaleDateString('pt-BR') : 'Selecione...');

const parseLocalDateFromInput = (value) => {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

const toInputDateValue = (date) => {
  if (!(date instanceof Date)) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatInputDateWithWeekday = (value) => {
  const parsed = parseLocalDateFromInput(value);
  if (!parsed) return value || '-';
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
    .format(parsed)
    .replace('.', '');
  const dayDate = new Intl.DateTimeFormat('pt-BR').format(parsed);
  return `${weekday} • ${dayDate}`;
};

const isWeekendDate = (date) => {
  const weekday = date.getDay();
  return weekday === 0 || weekday === 6;
};

const isWeekendInputDate = (value) => {
  const parsed = parseLocalDateFromInput(value);
  return parsed ? isWeekendDate(parsed) : false;
};

const clampDateValue = (value, minDate, maxDate) => {
  let next = value || '';
  if (!next) return '';
  if (minDate && next < minDate) next = minDate;
  if (maxDate && next > maxDate) next = maxDate;
  return next;
};

const shiftTime = (time, deltaMinutes) => {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return '';
  const [hh, mm] = time.split(':').map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return '';
  const base = hh * 60 + mm;
  const total = ((base + deltaMinutes) % (24 * 60) + (24 * 60)) % (24 * 60);
  const nextH = Math.floor(total / 60);
  const nextM = total % 60;
  return `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;
};

const timeToMinutes = (time) => {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [hh, mm] = time.split(':').map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh * 60 + mm;
};

const nextValidEndTime = (startTime) => {
  const startMinutes = timeToMinutes(startTime);
  if (startMinutes === null) return '';
  const candidate = TIME_OPTIONS.find((option) => {
    const optionMinutes = timeToMinutes(option);
    return optionMinutes !== null && optionMinutes > startMinutes;
  });
  return candidate || '';
};

const CLOSE_DAY_MINUTES = timeToMinutes(DEFAULT_END_TIME) || 18 * 60;
const IMPRODUCTIVE_NONE_VALUE = '__none__';
const IMPRODUCTIVE_REASONS = [
  'Quebra de maquina',
  'Mal Tempo',
  'Pedido nao entregue',
  'Problema com material',
  'Acidente de trabalho',
];

const findProject = (projectId) => PROJECTS.find((project) => project.id === projectId) || PROJECTS[0];

const getRowDurationMinutes = (row) => {
  const start = toDateTime(row?.date, row?.start);
  const end = toDateTime(row?.date, row?.end);
  if (!start || !end) return 0;
  const diff = Math.round((end.getTime() - start.getTime()) / 60000);
  return diff > 0 ? diff : 0;
};

const buildImproductiveInterval = (rowStart, rowEnd) => {
  const rowStartMinutes = timeToMinutes(rowStart);
  const rowEndMinutes = timeToMinutes(rowEnd);
  if (rowStartMinutes === null || rowEndMinutes === null || rowEndMinutes <= rowStartMinutes) {
    return {
      id: `improd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      start: '',
      end: '',
      reason: '',
    };
  }
  const nextEnd =
    TIME_OPTIONS.find((option) => {
      const optionMinutes = timeToMinutes(option);
      return optionMinutes !== null && optionMinutes > rowStartMinutes && optionMinutes <= rowEndMinutes;
    }) || rowEnd;

  return {
    id: `improd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    start: rowStart,
    end: nextEnd,
    reason: '',
  };
};

const getImproductiveIntervalsMinutes = (intervals) =>
  (Array.isArray(intervals) ? intervals : []).reduce((acc, interval) => {
    const startMinutes = timeToMinutes(interval?.start || '');
    const endMinutes = timeToMinutes(interval?.end || '');
    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) return acc;
    return acc + (endMinutes - startMinutes);
  }, 0);

const createMultiRow = () => {
  const initialProject = PROJECTS[0];
  return {
    id: `multi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    projectId: initialProject.id,
    taskId: initialProject.tasks[0]?.id || '',
    date: nowLocalDate(),
    start: DEFAULT_START_TIME,
    end: DEFAULT_END_TIME,
    observation: '',
  };
};

const createEntryRow = (date = nowLocalDate()) => ({
  id: `entry-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  date,
  start: DEFAULT_START_TIME,
  end: DEFAULT_END_TIME,
  improductiveIntervals: [],
  observation: '',
});

const modeLabel = (mode) => {
  if (mode === 'timer') return 'Timer';
  if (mode === 'multi-projeto') return 'Multi-projetos';
  return 'Manual';
};

const modeBadgeClass = (mode) => {
  if (mode === 'timer') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (mode === 'multi-projeto') return 'border-sky-200 bg-sky-50 text-sky-700';
  return 'border-indigo-200 bg-indigo-50 text-indigo-700';
};

const TimeSelect = ({ value, onChange, className = '', minTimeExclusive = '' }) => {
  const minMinutes = timeToMinutes(minTimeExclusive);
  const options =
    minMinutes === null
      ? TIME_OPTIONS
      : TIME_OPTIONS.filter((option) => {
          const optionMinutes = timeToMinutes(option);
          return optionMinutes !== null && optionMinutes > minMinutes;
        });
  const currentValue = value && options.includes(value) ? value : '__empty__';

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Select value={currentValue} onValueChange={(nextValue) => onChange(nextValue === '__empty__' ? '' : nextValue)}>
      <SelectTrigger className="h-10 min-w-[120px] border-slate-300 bg-white px-2.5 text-center text-[13px] font-mono tabular-nums transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01] dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-100 dark:focus:border-graphite-500">
        <SelectValue placeholder="--:--" />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value="__empty__">--:--</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  );
};

const DatePickerField = ({
  value,
  onChange,
  minDate = '',
  maxDate = '',
  disabled = false,
  disableWeekends = false,
  placeholder = 'Selecione a data',
  className = '',
}) => {
  const selectedDate = parseLocalDateFromInput(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={`h-10 w-full justify-start border-slate-300 bg-white px-2.5 text-left text-[13px] font-normal transition-transform duration-150 hover:bg-slate-50 focus:ring-0 focus:border-slate-500 focus:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-100 dark:hover:bg-graphite-900 ${className}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-500 dark:text-graphite-400" />
          <span className={selectedDate ? '' : 'text-slate-500 dark:text-graphite-400'}>
            {selectedDate ? formatInputDateWithWeekday(value) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-slate-200 p-0 dark:border-graphite-700" align="start">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selectedDate}
          onSelect={(date) => {
            const next = clampDateValue(toInputDateValue(date), minDate, maxDate);
            if (next) onChange(next);
          }}
          defaultMonth={selectedDate}
          disabled={(date) => {
            if (disableWeekends && isWeekendDate(date)) return true;
            if (minDate && date < parseLocalDateFromInput(minDate)) return true;
            if (maxDate && date > parseLocalDateFromInput(maxDate)) return true;
            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

const TimeSheetModule = () => {
  const todayDate = nowLocalDate();
  const [officeTab, setOfficeTab] = React.useState('inicio');
  const [showEntryForm, setShowEntryForm] = React.useState(false);
  const [showMultiProjectForm, setShowMultiProjectForm] = React.useState(false);

  const [projectId, setProjectId] = React.useState(PROJECTS[0].id);
  const [taskId, setTaskId] = React.useState(PROJECTS[0].tasks[0].id);
  const [entryRows, setEntryRows] = React.useState([createEntryRow(todayDate)]);
  const [rowMenuPanelById, setRowMenuPanelById] = React.useState({});
  const [rangeStartDate, setRangeStartDate] = React.useState(todayDate);
  const [rangeEndDate, setRangeEndDate] = React.useState(todayDate);

  const [activeTimer, setActiveTimer] = React.useState(null);
  const [entries, setEntries] = React.useState([]);
  const [feedback, setFeedback] = React.useState({ type: '', message: '' });

  const [multiRows, setMultiRows] = React.useState([createMultiRow()]);
  const [multiProjectFilter, setMultiProjectFilter] = React.useState('all');
  const [multiTaskFilter, setMultiTaskFilter] = React.useState('all');

  const selectedProject = React.useMemo(
    () => PROJECTS.find((project) => project.id === projectId) || PROJECTS[0],
    [projectId]
  );
  const tasks = selectedProject.tasks;
  const selectedTask = tasks.find((task) => task.id === taskId) || null;

  React.useEffect(() => {
    setTaskId(tasks[0]?.id || '');
  }, [projectId, tasks]);

  React.useEffect(() => {
    const storedEntries = readJsonStorage(TIMESHEET_STORAGE_KEY, []);
    const storedActive = readJsonStorage(TIMESHEET_ACTIVE_STORAGE_KEY, null);
    if (Array.isArray(storedEntries)) setEntries(storedEntries);
    if (storedActive && typeof storedActive === 'object') setActiveTimer(storedActive);
  }, []);

  React.useEffect(() => {
    localStorage.setItem(TIMESHEET_STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  React.useEffect(() => {
    if (activeTimer) {
      localStorage.setItem(TIMESHEET_ACTIVE_STORAGE_KEY, JSON.stringify(activeTimer));
      return;
    }
    localStorage.removeItem(TIMESHEET_ACTIVE_STORAGE_KEY);
  }, [activeTimer]);

  const applyRangeToEntryRows = React.useCallback((startDate, endDate) => {
    const rangeDates = buildDateRange(startDate, endDate);
    if (!rangeDates.length) {
      setEntryRows([createEntryRow(todayDate)]);
      return;
    }
    setEntryRows((prev) => {
      const firstStart = prev[0]?.start || '';
      const firstEnd = prev[0]?.end || '';
      const existingByDate = new Map(prev.map((row) => [row.date, row]));
      return rangeDates.map((date) => {
        const existing = existingByDate.get(date);
        if (existing) return { ...existing, date };
        return {
          ...createEntryRow(date),
          start: firstStart,
          end: firstEnd,
        };
      });
    });
  }, [todayDate]);

  const appendEntry = ({
    projectName,
    taskName,
    date,
    start,
    end,
    minutes,
    mode,
    productiveMinutes = minutes,
    improductiveMinutes = 0,
    improductiveReason = '',
    observation = '',
  }) => {
    const next = {
      id: `ts-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      projectName,
      taskName,
      date,
      start,
      end,
      minutes,
      mode,
      productiveMinutes: Math.max(0, Number(productiveMinutes || 0)),
      improductiveMinutes: Math.max(0, Number(improductiveMinutes || 0)),
      improductiveReason: String(improductiveReason || '').trim(),
      observation: normalizeObservation(observation),
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [next, ...prev]);
  };

  const handleManualEntry = () => {
    setFeedback({ type: '', message: '' });
    if (!projectId || !taskId) {
      setFeedback({ type: 'error', message: 'Selecione projeto e tarefa.' });
      return;
    }
    if (!entryRows.length) {
      setFeedback({ type: 'error', message: 'Adicione ao menos uma linha de apontamento.' });
      return;
    }
    const batchEntries = [];
    const now = new Date();
    const minutesByDate = buildMinutesByDate(entries);
    const closedDates = new Set(
      entries
        .filter((item) => (timeToMinutes(item?.end) || 0) >= CLOSE_DAY_MINUTES)
        .map((item) => item.date)
    );
    for (const row of entryRows) {
      if (!row.date || !row.start || !row.end) {
        setFeedback({ type: 'error', message: 'Preencha data, início e fim em todas as linhas.' });
        return;
      }
      if (isWeekendInputDate(row.date)) {
        setFeedback({ type: 'error', message: 'Nao e permitido apontamento em fim de semana.' });
        return;
      }
      const start = toDateTime(row.date, row.start);
      const end = toDateTime(row.date, row.end);
      if (!start || !end) {
        setFeedback({ type: 'error', message: 'Existe linha com data/horário inválido.' });
        return;
      }
      if (start > now || end > now) {
        setFeedback({ type: 'error', message: 'Nao e permitido apontar horario futuro.' });
        return;
      }
      const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      if (diffMinutes <= 0) {
        setFeedback({ type: 'error', message: 'O horário final deve ser maior que o inicial em todas as linhas.' });
        return;
      }
      const intervals = Array.isArray(row.improductiveIntervals) ? row.improductiveIntervals : [];
      const rowStartMinutes = timeToMinutes(row.start);
      const rowEndMinutes = timeToMinutes(row.end);
      if (rowStartMinutes === null || rowEndMinutes === null) {
        setFeedback({ type: 'error', message: 'Existe linha com horario invalido.' });
        return;
      }
      const parsedIntervals = [];
      for (const interval of intervals) {
        const intervalStart = timeToMinutes(interval?.start || '');
        const intervalEnd = timeToMinutes(interval?.end || '');
        if (intervalStart === null || intervalEnd === null || intervalEnd <= intervalStart) {
          setFeedback({ type: 'error', message: 'Em improdutividade, informe inicio/fim validos em todos os intervalos.' });
          return;
        }
        if (!String(interval?.reason || '').trim()) {
          setFeedback({ type: 'error', message: 'Selecione o motivo em todos os intervalos improdutivos.' });
          return;
        }
        if (intervalStart < rowStartMinutes || intervalEnd > rowEndMinutes) {
          setFeedback({ type: 'error', message: 'Intervalos improdutivos devem estar dentro do horario da linha.' });
          return;
        }
        parsedIntervals.push({ start: intervalStart, end: intervalEnd });
      }
      parsedIntervals.sort((a, b) => a.start - b.start);
      for (let i = 1; i < parsedIntervals.length; i += 1) {
        if (parsedIntervals[i].start < parsedIntervals[i - 1].end) {
          setFeedback({ type: 'error', message: 'Intervalos de improdutividade nao podem se sobrepor na mesma linha.' });
          return;
        }
      }
      const improductiveMinutes = parsedIntervals.reduce((acc, interval) => acc + (interval.end - interval.start), 0);
      if (improductiveMinutes > diffMinutes) {
        setFeedback({ type: 'error', message: 'Horas improdutivas nao podem exceder a duracao da linha.' });
        return;
      }
      const productiveMinutes = diffMinutes - improductiveMinutes;
      if (closedDates.has(row.date)) {
        setFeedback({
          type: 'error',
          message: `Nao e permitido novo apontamento na data ${row.date}, pois ja existe fechamento ate ${DEFAULT_END_TIME}.`,
        });
        return;
      }
      const nextDayTotal = (minutesByDate.get(row.date) || 0) + diffMinutes;
      if (nextDayTotal > MAX_DAILY_MINUTES) {
        setFeedback({ type: 'error', message: `Nao e permitido apontar mais de 12h no dia ${row.date}.` });
        return;
      }
      minutesByDate.set(row.date, nextDayTotal);
      if ((timeToMinutes(row.end) || 0) >= CLOSE_DAY_MINUTES) {
        closedDates.add(row.date);
      }
      batchEntries.push({
        id: `ts-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        projectName: selectedProject.name,
        taskName: selectedTask?.name || 'Tarefa',
        date: row.date,
        start: row.start,
        end: row.end,
        minutes: diffMinutes,
        productiveMinutes,
        improductiveMinutes,
        improductiveReason: intervals.map((item) => item.reason).filter(Boolean).join(', '),
        improductiveIntervals: intervals,
        mode: 'manual',
        observation: normalizeObservation(row.observation),
        createdAt: new Date().toISOString(),
      });
    }

    setEntries((prev) => [...batchEntries, ...prev]);
    setFeedback({ type: 'success', message: `${batchEntries.length} apontamento(s) manual(is) registrado(s).` });
    applyRangeToEntryRows(rangeStartDate, rangeEndDate);
    setShowEntryForm(false);
  };

  const handleStartTimer = () => {
    setFeedback({ type: '', message: '' });
    if (activeTimer) {
      setFeedback({ type: 'error', message: 'Ja existe um apontamento em andamento.' });
      return;
    }
    if (!projectId || !taskId) {
      setFeedback({ type: 'error', message: 'Selecione projeto e tarefa antes de iniciar.' });
      return;
    }
    const now = new Date();
    if (isWeekendDate(now)) {
      setFeedback({ type: 'error', message: 'Nao e permitido apontamento em fim de semana.' });
      return;
    }
    setActiveTimer({
      projectId,
      projectName: selectedProject.name,
      taskId,
      taskName: selectedTask?.name || 'Tarefa',
      startedAt: now.toISOString(),
      startedDate: now.toISOString().slice(0, 10),
      startedTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      observation: '',
    });
    setFeedback({ type: 'success', message: 'Apontamento iniciado.' });
  };

  const handleStopTimer = () => {
    setFeedback({ type: '', message: '' });
    if (!activeTimer) {
      setFeedback({ type: 'error', message: 'Nao ha apontamento ativo para encerrar.' });
      return;
    }

    const start = new Date(activeTimer.startedAt);
    const end = new Date();
    if (start > end) {
      setFeedback({ type: 'error', message: 'Nao e permitido apontar horario futuro.' });
      return;
    }
    const diffMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
    const minutesByDate = buildMinutesByDate(entries);
    const nextDayTotal = (minutesByDate.get(activeTimer.startedDate) || 0) + diffMinutes;
    if (nextDayTotal > MAX_DAILY_MINUTES) {
      setFeedback({
        type: 'error',
        message: `Nao e permitido apontar mais de 12h no dia ${activeTimer.startedDate}.`,
      });
      return;
    }
    const endTimeValue = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;

    appendEntry({
      projectName: activeTimer.projectName,
      taskName: activeTimer.taskName,
      date: activeTimer.startedDate,
      start: activeTimer.startedTime,
      end: endTimeValue,
      minutes: diffMinutes,
      productiveMinutes: diffMinutes,
      improductiveMinutes: 0,
      improductiveReason: '',
      mode: 'timer',
      observation: activeTimer.observation || '',
    });

    setActiveTimer(null);
    setFeedback({ type: 'success', message: 'Apontamento encerrado e salvo.' });
    setShowEntryForm(false);
  };

  const handleEntryRowChange = (rowId, field, value) => {
    if (field === 'date') return;
    setEntryRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const next = { ...row, [field]: value };
        if (field === 'start' && value) {
          const rowEndMinutes = timeToMinutes(row.end);
          const startMinutes = timeToMinutes(value);
          if (startMinutes !== null && (rowEndMinutes === null || rowEndMinutes <= startMinutes)) {
            next.end = nextValidEndTime(value);
          } else if (!row.end) {
            next.end = shiftTime(value, 60);
          }
        }
        if (field === 'start' || field === 'end') {
          const rowStartMinutes = timeToMinutes(next.start);
          const rowEndMinutes = timeToMinutes(next.end);
          next.improductiveIntervals = (Array.isArray(next.improductiveIntervals) ? next.improductiveIntervals : []).filter(
            (interval) => {
              const intervalStart = timeToMinutes(interval?.start || '');
              const intervalEnd = timeToMinutes(interval?.end || '');
              if (
                rowStartMinutes === null ||
                rowEndMinutes === null ||
                intervalStart === null ||
                intervalEnd === null
              ) {
                return false;
              }
              return (
                intervalStart >= rowStartMinutes &&
                intervalEnd <= rowEndMinutes &&
                intervalEnd > intervalStart
              );
            }
          );
        }
        return next;
      })
    );
  };

  const handleEntryRowMenuSelect = (rowId, panel) => {
    setRowMenuPanelById((prev) => ({ ...prev, [rowId]: panel }));
  };

  const handleAddImproductiveInterval = (rowId) => {
    setEntryRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const nextInterval = buildImproductiveInterval(row.start, row.end);
        return {
          ...row,
          improductiveIntervals: [...(Array.isArray(row.improductiveIntervals) ? row.improductiveIntervals : []), nextInterval],
        };
      })
    );
  };

  const handleImproductiveIntervalChange = (rowId, intervalId, field, value) => {
    setEntryRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const rowStartMinutes = timeToMinutes(row.start);
        const rowEndMinutes = timeToMinutes(row.end);
        const intervals = (Array.isArray(row.improductiveIntervals) ? row.improductiveIntervals : []).map((interval) => {
          if (interval.id !== intervalId) return interval;
          const nextInterval = { ...interval, [field]: value };
          if (field === 'start') {
            const startMinutes = timeToMinutes(nextInterval.start);
            const endMinutes = timeToMinutes(nextInterval.end);
            if (
              startMinutes !== null &&
              (endMinutes === null || endMinutes <= startMinutes) &&
              rowEndMinutes !== null
            ) {
              const nextEnd =
                TIME_OPTIONS.find((option) => {
                  const optionMinutes = timeToMinutes(option);
                  return optionMinutes !== null && optionMinutes > startMinutes && optionMinutes <= rowEndMinutes;
                }) || '';
              nextInterval.end = nextEnd;
            }
          }
          return nextInterval;
        });
        const normalizedIntervals = intervals.filter((interval) => {
          const intervalStart = timeToMinutes(interval?.start || '');
          const intervalEnd = timeToMinutes(interval?.end || '');
          if (
            rowStartMinutes === null ||
            rowEndMinutes === null ||
            intervalStart === null ||
            intervalEnd === null
          ) {
            return false;
          }
          return (
            intervalStart >= rowStartMinutes &&
            intervalEnd <= rowEndMinutes &&
            intervalEnd > intervalStart
          );
        });
        return {
          ...row,
          improductiveIntervals: normalizedIntervals,
        };
      })
    );
  };

  const handleRemoveImproductiveInterval = (rowId, intervalId) => {
    setEntryRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          improductiveIntervals: (Array.isArray(row.improductiveIntervals) ? row.improductiveIntervals : []).filter(
            (interval) => interval.id !== intervalId
          ),
        };
      })
    );
  };

  const handleClearEntryForm = () => {
    setRangeStartDate(todayDate);
    setRangeEndDate(todayDate);
    setEntryRows([createEntryRow(todayDate)]);
    setRowMenuPanelById({});
    setFeedback({ type: '', message: '' });
  };

  const handleRangeSelect = (range) => {
    const fromInput = clampDateValue(toInputDateValue(range?.from), '', todayDate);
    const toInput = clampDateValue(toInputDateValue(range?.to || range?.from), '', todayDate);
    if (!fromInput || !toInput) return;

    const nextStart = fromInput <= toInput ? fromInput : toInput;
    const nextEnd = fromInput <= toInput ? toInput : fromInput;

    setRangeStartDate(nextStart);
    setRangeEndDate(nextEnd);
    applyRangeToEntryRows(nextStart, nextEnd);
  };

  const handleMultiRowChange = (rowId, field, value) => {
    setMultiRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        if (field === 'projectId') {
          const nextProject = findProject(value);
          return {
            ...row,
            projectId: nextProject.id,
            taskId: nextProject.tasks[0]?.id || '',
          };
        }
        return {
          ...row,
          [field]: value,
        };
      })
    );
  };

  const handleAddMultiRow = () => {
    setMultiRows((prev) => [...prev, createMultiRow()]);
  };

  const handleRemoveMultiRow = (rowId) => {
    setMultiRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const handleClearMultiRows = () => {
    setMultiRows([createMultiRow()]);
    setFeedback({ type: '', message: '' });
  };

  const handleSaveMultiRows = () => {
    setFeedback({ type: '', message: '' });
    if (multiRows.length === 0) {
      setFeedback({ type: 'error', message: 'Adicione ao menos uma linha no grid.' });
      return;
    }

    const preparedEntries = [];
    const now = new Date();
    const minutesByDate = buildMinutesByDate(entries);
    const closedDates = new Set(
      entries
        .filter((item) => (timeToMinutes(item?.end) || 0) >= CLOSE_DAY_MINUTES)
        .map((item) => item.date)
    );
    for (const row of multiRows) {
      if (!row.projectId || !row.taskId || !row.date || !row.start || !row.end) {
        setFeedback({ type: 'error', message: 'Preencha todos os campos obrigatorios do grid.' });
        return;
      }
      if (isWeekendInputDate(row.date)) {
        setFeedback({ type: 'error', message: 'Nao e permitido apontamento em fim de semana.' });
        return;
      }

      const start = toDateTime(row.date, row.start);
      const end = toDateTime(row.date, row.end);
      if (!start || !end) {
        setFeedback({ type: 'error', message: 'Existe linha no grid com data/horario invalido.' });
        return;
      }
      if (start > now || end > now) {
        setFeedback({ type: 'error', message: 'Nao e permitido apontar horario futuro.' });
        return;
      }

      const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
      if (minutes <= 0) {
        setFeedback({ type: 'error', message: 'Horario final deve ser maior que o inicial em todas as linhas.' });
        return;
      }
      if (closedDates.has(row.date)) {
        setFeedback({
          type: 'error',
          message: `Nao e permitido novo apontamento na data ${row.date}, pois ja existe fechamento ate ${DEFAULT_END_TIME}.`,
        });
        return;
      }
      const nextDayTotal = (minutesByDate.get(row.date) || 0) + minutes;
      if (nextDayTotal > MAX_DAILY_MINUTES) {
        setFeedback({ type: 'error', message: `Nao e permitido apontar mais de 12h no dia ${row.date}.` });
        return;
      }
      minutesByDate.set(row.date, nextDayTotal);
      if ((timeToMinutes(row.end) || 0) >= CLOSE_DAY_MINUTES) {
        closedDates.add(row.date);
      }

      const project = findProject(row.projectId);
      const task = project.tasks.find((item) => item.id === row.taskId);
      preparedEntries.push({
        id: `ts-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        projectName: project.name,
        taskName: task?.name || 'Tarefa',
        date: row.date,
        start: row.start,
        end: row.end,
        minutes,
        productiveMinutes: minutes,
        improductiveMinutes: 0,
        improductiveReason: '',
        mode: 'multi-projeto',
        observation: normalizeObservation(row.observation),
        createdAt: new Date().toISOString(),
      });
    }

    setEntries((prev) => [...preparedEntries, ...prev]);
    setFeedback({ type: 'success', message: `${preparedEntries.length} apontamento(s) multi-projetos registrado(s).` });
    setMultiRows([createMultiRow()]);
    setShowMultiProjectForm(false);
  };

  const entryRowDurations = entryRows.map((row) => {
    const start = toDateTime(row.date, row.start);
    const end = toDateTime(row.date, row.end);
    if (!start || !end) return 0;
    return Math.round((end.getTime() - start.getTime()) / 60000);
  });
  const manualMinutesPreview = entryRowDurations.filter((minutes) => minutes > 0).reduce((acc, minutes) => acc + minutes, 0);
  const isManualReady = Boolean(
    projectId &&
    taskId &&
    entryRows.length > 0 &&
    entryRows.every((row, index) => row.date && row.start && row.end && entryRowDurations[index] > 0)
  );
  const canStartTimer = Boolean(!activeTimer && projectId && taskId);
  const canStopTimer = Boolean(activeTimer);
  const totalTrackedMinutes = entries.reduce((acc, entry) => acc + Number(entry.minutes || 0), 0);
  const showLauncherPanel = officeTab !== 'revisar';
  const showSheetPanel = officeTab !== 'lancar';
  const showMultiSection = showMultiProjectForm && officeTab !== 'revisar';
  const entryDateRange = {
    from: parseLocalDateFromInput(rangeStartDate),
    to: parseLocalDateFromInput(rangeEndDate),
  };
  const entryDateRangeLabel =
    entryDateRange.from && entryDateRange.to
      ? `${formatDate(entryDateRange.from)} - ${formatDate(entryDateRange.to)}`
      : entryDateRange.from
      ? `${formatDate(entryDateRange.from)} - Selecione o fim`
      : 'Selecione o período';

  const multiTaskOptions = React.useMemo(() => {
    if (multiProjectFilter === 'all') {
      return PROJECTS.flatMap((project) =>
        project.tasks.map((task) => ({
          value: `${project.id}:${task.id}`,
          label: `${task.name} (${project.name})`,
        }))
      );
    }

    const project = PROJECTS.find((item) => item.id === multiProjectFilter);
    if (!project) return [];

    return project.tasks.map((task) => ({
      value: `${project.id}:${task.id}`,
      label: task.name,
    }));
  }, [multiProjectFilter]);

  React.useEffect(() => {
    if (multiTaskFilter !== 'all' && !multiTaskOptions.some((option) => option.value === multiTaskFilter)) {
      setMultiTaskFilter('all');
    }
  }, [multiTaskFilter, multiTaskOptions]);

  const filteredRows = multiRows.filter((row) => {
    const projectMatch = multiProjectFilter === 'all' || row.projectId === multiProjectFilter;
    const taskMatch = multiTaskFilter === 'all' || `${row.projectId}:${row.taskId}` === multiTaskFilter;
    return projectMatch && taskMatch;
  });

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-graphite-700">
        <CardContent className="p-0">
          <div className="border-b border-blue-800 bg-gradient-to-r from-[#1f4f8b] via-[#255b9c] to-[#3069aa] px-5 py-3 text-white">
            <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100">Workspace</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Time Sheet RM</h2>
          </div>

          <div className="border-b border-slate-200 bg-white px-4 py-2 dark:border-graphite-700 dark:bg-graphite-950">
            <Tabs value={officeTab} onValueChange={setOfficeTab}>
              <TabsList className="h-9 rounded-md border-slate-300 bg-slate-100 dark:border-graphite-600 dark:bg-graphite-900">
                <TabsTrigger value="inicio" className="gap-1.5 text-xs">
                  <TableCellsIcon className="h-4 w-4" />
                  Inicio
                </TabsTrigger>
                <TabsTrigger value="lancar" className="gap-1.5 text-xs">
                  <ClipboardDocumentListIcon className="h-4 w-4" />
                  Lancar
                </TabsTrigger>
                <TabsTrigger value="revisar" className="gap-1.5 text-xs">
                  <DocumentTextIcon className="h-4 w-4" />
                  Revisar
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-[#f4f7fb] px-4 py-3 dark:bg-graphite-900/80">
            <Button size="sm" onClick={() => { setOfficeTab('lancar'); setShowEntryForm((prev) => !prev); }}>
              <PlayIcon className="h-4 w-4" />
              {showEntryForm ? 'Fechar apontamento' : 'Novo apontamento'}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { setOfficeTab('lancar'); setShowMultiProjectForm((prev) => !prev); }}>
              <Squares2X2Icon className="h-4 w-4" />
              {showMultiProjectForm ? 'Fechar multi-projetos' : 'Apontamento Multi-projetos'}
            </Button>
            <div className="h-6 w-px bg-slate-300 dark:bg-graphite-700" />
            <Button size="sm" variant="ghost" onClick={() => setOfficeTab('revisar')}>
              <DocumentTextIcon className="h-4 w-4" />
              Revisar planilha
            </Button>
            <Badge variant="secondary" className="border border-slate-300 bg-white text-slate-700 dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-100">
              Total: {formatMinutes(totalTrackedMinutes)}
            </Badge>
            {activeTimer ? (
              <Badge variant="secondary" className="border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
                Em andamento: {activeTimer.projectName} • {activeTimer.taskName} • {activeTimer.startedTime}
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className={`grid grid-cols-1 gap-5 ${showLauncherPanel && showSheetPanel ? 'xl:grid-cols-[360px_1fr]' : ''}`}>
        {showLauncherPanel ? (
        <Card className="border-slate-200 shadow-sm dark:border-graphite-700">
          <CardHeader className="border-b border-slate-200 pb-3 dark:border-graphite-700">
            <CardTitle className="text-base">Painel de Lancamento</CardTitle>
            <CardDescription>Preencha e registre horas em formato rapido.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-300">
              Clique em <span className="font-medium text-slate-800 dark:text-graphite-100">Novo apontamento</span> para abrir o card de lançamento.
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setShowEntryForm(true)}>Abrir lançamento</Button>
              <Button size="sm" variant="outline" onClick={() => setShowMultiProjectForm((prev) => !prev)}>
                {showMultiProjectForm ? 'Fechar multi-projetos' : 'Abrir multi-projetos'}
              </Button>
            </div>
          </CardContent>
        </Card>
        ) : null}

        <Dialog open={showEntryForm} onOpenChange={setShowEntryForm}>
          <DialogContent className="w-[96vw] max-w-7xl border-slate-300 bg-gradient-to-b from-white to-slate-50/70 dark:border-graphite-700 dark:from-graphite-950 dark:to-graphite-900">
            <DialogHeader>
              <DialogTitle>Novo apontamento</DialogTitle>
              <DialogDescription>Preencha projeto, tarefa, data e horário para registrar.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-graphite-700 dark:bg-graphite-900">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-slate-600 dark:text-graphite-300">
                    Selecione um periodo retroativo (dias uteis), sem datas futuras.
                  </span>
                </div>
                <div className="mt-3 space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-graphite-300">
                    Periodo
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full justify-start border-slate-300 bg-white px-3 text-left font-normal text-slate-900 hover:bg-slate-50 dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-100"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-500 dark:text-graphite-400" />
                        <span className={entryDateRange.from ? '' : 'text-slate-500 dark:text-graphite-400'}>
                          {entryDateRangeLabel}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto border-slate-200 p-0 dark:border-graphite-700" align="start">
                      <Calendar
                        mode="range"
                        locale={ptBR}
                        selected={entryDateRange}
                        onSelect={handleRangeSelect}
                        defaultMonth={entryDateRange.from}
                        numberOfMonths={2}
                        disabled={(date) =>
                          date > parseLocalDateFromInput(todayDate) || isWeekendDate(date)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-graphite-300">Projeto</label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger className="h-11 border-slate-300 bg-white px-3.5 text-[15px] transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01] dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-100 dark:focus:border-graphite-500">
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECTS.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-graphite-300">Tarefa</label>
                  <Select value={taskId} onValueChange={setTaskId}>
                    <SelectTrigger className="h-11 border-slate-300 bg-white px-3.5 text-[15px] transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01] dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-100 dark:focus:border-graphite-500">
                      <SelectValue placeholder="Selecione uma tarefa" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-graphite-300">Horas</label>
                <div className="rounded-md border border-slate-200 dark:border-graphite-700">
                  <div className="hidden grid-cols-[180px_120px_120px_120px_130px_110px_220px] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-graphite-300 md:grid">
                    <span className="text-center">Data</span>
                    <span className="text-center">Início</span>
                    <span className="text-center">Fim</span>
                    <span className="text-center">Produtivas</span>
                    <span className="text-center">Improdutivas</span>
                    <span className="text-center">Total</span>
                    <span className="text-center">Ações</span>
                  </div>
                  <div className="space-y-2 p-3">
                    {entryRows.map((row, index) => {
                      const duration = entryRowDurations[index] > 0 ? formatMinutes(entryRowDurations[index]) : '--';
                      const rowMenuPanel = rowMenuPanelById[row.id] || 'menu';
                      const rowImproductiveMinutes = getImproductiveIntervalsMinutes(row.improductiveIntervals);
                      const rowTotalMinutes = Math.max(0, entryRowDurations[index] || 0);
                      const rowProductiveMinutes = Math.max(0, rowTotalMinutes - rowImproductiveMinutes);
                      return (
                        <div key={row.id} className="grid grid-cols-1 items-center gap-2 md:grid-cols-[180px_120px_120px_120px_130px_110px_220px]">
                          <DatePickerField
                            value={row.date}
                            onChange={(nextValue) => handleEntryRowChange(row.id, 'date', nextValue)}
                            maxDate={todayDate}
                            disabled
                            disableWeekends
                            className="w-[180px]"
                          />
                          <TimeSelect
                            value={row.start}
                            onChange={(nextValue) => handleEntryRowChange(row.id, 'start', nextValue)}
                          />
                          <TimeSelect
                            value={row.end}
                            onChange={(nextValue) => handleEntryRowChange(row.id, 'end', nextValue)}
                            minTimeExclusive={row.start}
                          />
                          <div className="text-center text-sm font-semibold text-blue-700 dark:text-blue-300">
                            {rowTotalMinutes > 0 ? formatMinutes(rowProductiveMinutes) : '--'}
                          </div>
                          <div className="text-center text-sm font-semibold text-red-700 dark:text-red-300">
                            {rowTotalMinutes > 0 ? formatMinutes(rowImproductiveMinutes) : '--'}
                          </div>
                          <div className="text-center text-sm font-semibold text-slate-700 dark:text-graphite-100">{duration}</div>
                          <div className="flex items-center justify-center gap-1.5">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0"
                                  title="Observação da linha"
                                  onClick={() => handleEntryRowMenuSelect(row.id, 'menu')}
                                >
                                  <Bars3Icon className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-80 space-y-3 border-slate-200 p-3 dark:border-graphite-700"
                                align="start"
                              >
                                {rowMenuPanel === 'menu' ? (
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-graphite-300">
                                      Menu da linha
                                    </p>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="w-full justify-start border-slate-300 bg-white text-left text-xs dark:border-graphite-600 dark:bg-graphite-900"
                                      onClick={() => handleEntryRowMenuSelect(row.id, 'observation')}
                                    >
                                      Inserir Observação
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="w-full justify-start border-slate-300 bg-white text-left text-xs dark:border-graphite-600 dark:bg-graphite-900"
                                      onClick={() => handleEntryRowMenuSelect(row.id, 'improductive')}
                                    >
                                      Informar Horas improdutivas
                                    </Button>
                                  </div>
                                ) : null}

                                {rowMenuPanel === 'observation' ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-graphite-300">
                                        Observação da linha
                                      </label>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-[11px]"
                                        onClick={() => handleEntryRowMenuSelect(row.id, 'menu')}
                                      >
                                        Voltar
                                      </Button>
                                    </div>
                                    <Textarea
                                      value={row.observation || ''}
                                      onChange={(event) => handleEntryRowChange(row.id, 'observation', event.target.value)}
                                      className="min-h-[88px] border-slate-300 bg-white text-sm font-mono dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-100"
                                      maxLength={400}
                                    />
                                  </div>
                                ) : null}

                                {rowMenuPanel === 'improductive' ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-graphite-300">
                                        Horas improdutivas
                                      </label>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-[11px]"
                                        onClick={() => handleEntryRowMenuSelect(row.id, 'menu')}
                                      >
                                        Voltar
                                      </Button>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-graphite-400">
                                      Total improdutivo: {formatMinutes(rowImproductiveMinutes)}
                                    </p>
                                    {(Array.isArray(row.improductiveIntervals) ? row.improductiveIntervals : []).map((interval, intervalIndex) => {
                                      return (
                                        <div key={interval.id} className="rounded-md border border-slate-200 p-2 dark:border-graphite-700">
                                          <p className="mb-2 text-[11px] font-semibold text-slate-600 dark:text-graphite-300">
                                            Intervalo {intervalIndex + 1}
                                          </p>
                                          <div className="mb-2">
                                            <Select
                                              value={interval.reason || IMPRODUCTIVE_NONE_VALUE}
                                              onValueChange={(nextValue) =>
                                                handleImproductiveIntervalChange(
                                                  row.id,
                                                  interval.id,
                                                  'reason',
                                                  nextValue === IMPRODUCTIVE_NONE_VALUE ? '' : nextValue
                                                )
                                              }
                                            >
                                              <SelectTrigger className="h-9 border-slate-300 bg-white text-xs dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-100">
                                                <SelectValue placeholder="Motivo da improdutividade" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value={IMPRODUCTIVE_NONE_VALUE}>Selecione o motivo</SelectItem>
                                                {IMPRODUCTIVE_REASONS.map((reason) => (
                                                  <SelectItem key={reason} value={reason}>
                                                    {reason}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <TimeSelect
                                              value={interval.start}
                                              onChange={(nextValue) => handleImproductiveIntervalChange(row.id, interval.id, 'start', nextValue)}
                                              className="w-full"
                                              minTimeExclusive=""
                                            />
                                            <TimeSelect
                                              value={interval.end}
                                              onChange={(nextValue) => handleImproductiveIntervalChange(row.id, interval.id, 'end', nextValue)}
                                              className="w-full"
                                              minTimeExclusive={interval.start}
                                            />
                                          </div>
                                          <div className="mt-2 flex justify-end">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 px-2 text-[11px] text-red-700 dark:text-red-300"
                                              onClick={() => handleRemoveImproductiveInterval(row.id, interval.id)}
                                            >
                                              Remover
                                            </Button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="w-full border-slate-300 bg-white text-xs dark:border-graphite-600 dark:bg-graphite-900"
                                      onClick={() => handleAddImproductiveInterval(row.id)}
                                      disabled={!row.start || !row.end || entryRowDurations[index] <= 0}
                                    >
                                      Adicionar intervalo improdutivo
                                    </Button>
                                    <p className="text-[11px] text-slate-500 dark:text-graphite-400">
                                      Maximo desta linha: {duration}
                                    </p>
                                  </div>
                                ) : null}
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-start">
                  <p className="text-[11px] text-slate-500 dark:text-graphite-400">
                    Linhas refletidas automaticamente conforme o periodo selecionado.
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-graphite-400">
                  Dica: ao informar o início de uma linha, o fim sugere +1h automaticamente.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-graphite-300">
                Duração total prevista: <span className="font-semibold text-slate-800 dark:text-graphite-100">{manualMinutesPreview > 0 ? formatMinutes(manualMinutesPreview) : '--'}</span>
              </div>

              {feedback.message ? (
                <p
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    feedback.type === 'error'
                      ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/35 dark:text-red-300'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/35 dark:text-emerald-300'
                  }`}
                >
                  {feedback.message}
                </p>
              ) : null}
            </div>

            <DialogFooter>
              <div className="flex w-full flex-wrap items-center justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button variant="ghost" onClick={handleClearEntryForm}>
                  Limpar
                </Button>
                <Button variant="secondary" onClick={handleStartTimer} disabled={!canStartTimer}>
                  Iniciar
                </Button>
                <Button variant="outline" onClick={handleStopTimer} disabled={!canStopTimer}>
                  Encerrar
                </Button>
                <Button onClick={handleManualEntry} disabled={!isManualReady}>
                  Registrar apontamentos
                </Button>
              </div>
            </DialogFooter>

          </DialogContent>
        </Dialog>

        {showSheetPanel ? (
        <Card className="border-slate-200 shadow-sm dark:border-graphite-700">
          <CardHeader className="border-b border-slate-200 pb-3 dark:border-graphite-700">
            <CardTitle className="text-base">Planilha de Horas</CardTitle>
            <CardDescription>Visualizacao em grade para leitura e conferencia rapida.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {entries.length === 0 ? (
              <div className="p-6 text-sm text-slate-600 dark:text-graphite-300">Nenhum apontamento registrado.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[1260px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#f4f7fb] text-left text-slate-700 dark:border-graphite-700 dark:bg-graphite-900 dark:text-graphite-300">
                      <th className="px-3 py-2.5 font-semibold">Data</th>
                      <th className="px-3 py-2.5 font-semibold">Projeto</th>
                      <th className="px-3 py-2.5 font-semibold">Tarefa</th>
                      <th className="px-3 py-2.5 font-semibold">Inicio</th>
                      <th className="px-3 py-2.5 font-semibold">Fim</th>
                      <th className="px-3 py-2.5 font-semibold">Produtivas</th>
                      <th className="px-3 py-2.5 font-semibold">Improdutivas</th>
                      <th className="px-3 py-2.5 font-semibold">Total</th>
                      <th className="px-3 py-2.5 font-semibold">Observacao</th>
                      <th className="px-3 py-2.5 font-semibold">Modo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => {
                      const productiveMinutes = Math.max(
                        0,
                        Number(
                          entry.productiveMinutes !== undefined
                            ? entry.productiveMinutes
                            : Number(entry.minutes || 0) - Number(entry.improductiveMinutes || 0)
                        )
                      );
                      const improductiveMinutes = Math.max(0, Number(entry.improductiveMinutes || 0));
                      return (
                      <tr key={entry.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-graphite-800 dark:hover:bg-graphite-900/80">
                        <td className="px-3 py-2.5">{formatInputDateWithWeekday(entry.date)}</td>
                        <td className="px-3 py-2.5">{entry.projectName}</td>
                        <td className="px-3 py-2.5">{entry.taskName}</td>
                        <td className="px-3 py-2.5">{entry.start}</td>
                        <td className="px-3 py-2.5">{entry.end}</td>
                        <td className="px-3 py-2.5 font-semibold text-blue-700 dark:text-blue-300">{formatMinutes(productiveMinutes)}</td>
                        <td className="px-3 py-2.5 font-semibold text-red-700 dark:text-red-300">{formatMinutes(improductiveMinutes)}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-graphite-100">{formatMinutes(entry.minutes)}</td>
                        <td className="px-3 py-2.5">{entry.observation || '-'}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant="secondary" className={`border ${modeBadgeClass(entry.mode)}`}>
                            {modeLabel(entry.mode)}
                          </Badge>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        ) : null}
      </div>

      {showMultiSection ? (
        <Card className="border-slate-200 shadow-sm dark:border-graphite-700">
          <CardHeader className="border-b border-slate-200 pb-3 dark:border-graphite-700">
            <CardTitle className="text-base">Editor de Apontamento Multi-projetos</CardTitle>
            <CardDescription>Edite o grid e salve varios lancamentos de uma vez.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-graphite-300">Filtrar projeto</label>
                <Select value={multiProjectFilter} onValueChange={setMultiProjectFilter}>
                  <SelectTrigger className="h-11 border-slate-300 bg-white px-3.5 text-[15px] transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01] dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-100 dark:focus:border-graphite-500">
                    <SelectValue placeholder="Todos os projetos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os projetos</SelectItem>
                    {PROJECTS.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-graphite-300">Filtrar tarefa (opcional)</label>
                <Select
                  value={multiTaskFilter}
                  onValueChange={setMultiTaskFilter}
                >
                  <SelectTrigger className="h-11 border-slate-300 bg-white px-3.5 text-[15px] transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01] dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-100 dark:focus:border-graphite-500">
                    <SelectValue placeholder="Todas as tarefas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as tarefas</SelectItem>
                    {multiTaskOptions.map((taskOption) => (
                      <SelectItem key={taskOption.value} value={taskOption.value}>
                        {taskOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-graphite-700">
              <table className="min-w-[1200px] w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#f4f7fb] text-left text-slate-700 dark:border-graphite-700 dark:bg-graphite-900 dark:text-graphite-300">
                    <th className="px-3 py-2.5 font-semibold">Projeto</th>
                    <th className="px-3 py-2.5 font-semibold">Tarefa</th>
                    <th className="w-[155px] px-3 py-2.5 font-semibold">Data</th>
                    <th className="w-[130px] px-3 py-2.5 font-semibold">Inicio</th>
                    <th className="w-[130px] px-3 py-2.5 font-semibold">Fim</th>
                    <th className="px-3 py-2.5 font-semibold">Duracao</th>
                    <th className="px-3 py-2.5 font-semibold">Observacao</th>
                    <th className="px-3 py-2.5 font-semibold text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-4 text-center text-sm text-slate-600 dark:text-graphite-300">
                        Nenhuma linha para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => {
                      const rowProject = findProject(row.projectId);
                      const rowStart = toDateTime(row.date, row.start);
                      const rowEnd = toDateTime(row.date, row.end);
                      const rowMinutes =
                        rowStart && rowEnd ? Math.round((rowEnd.getTime() - rowStart.getTime()) / 60000) : 0;

                      return (
                        <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-graphite-800 dark:hover:bg-graphite-900/80">
                          <td className="px-3 py-2">
                            <Select
                              value={row.projectId}
                              onValueChange={(value) => handleMultiRowChange(row.id, 'projectId', value)}
                            >
                              <SelectTrigger className="h-10 border-slate-300 bg-white px-3 text-sm transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01] dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-100 dark:focus:border-graphite-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PROJECTS.map((project) => (
                                  <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-3 py-2">
                            <Select
                              value={row.taskId}
                              onValueChange={(value) => handleMultiRowChange(row.id, 'taskId', value)}
                            >
                              <SelectTrigger className="h-10 border-slate-300 bg-white px-3 text-sm transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01] dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-100 dark:focus:border-graphite-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {rowProject.tasks.map((task) => (
                                  <SelectItem key={task.id} value={task.id}>
                                    {task.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-3 py-2">
                            <DatePickerField
                              value={row.date}
                              onChange={(nextValue) => handleMultiRowChange(row.id, 'date', nextValue)}
                              maxDate={todayDate}
                              disableWeekends
                              className="max-w-[145px]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <TimeSelect
                              value={row.start}
                              onChange={(nextValue) => handleMultiRowChange(row.id, 'start', nextValue)}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <TimeSelect
                              value={row.end}
                              onChange={(nextValue) => handleMultiRowChange(row.id, 'end', nextValue)}
                              minTimeExclusive={row.start}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <span className={rowMinutes > 0 ? 'font-semibold text-slate-900 dark:text-graphite-100' : 'text-slate-400 dark:text-graphite-500'}>
                              {rowMinutes > 0 ? formatMinutes(rowMinutes) : '--'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={row.observation || ''}
                              onChange={(event) => handleMultiRowChange(row.id, 'observation', event.target.value)}
                              placeholder="Observacao"
                              className="h-10 min-w-[220px] border-slate-300 px-3 text-sm transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01] dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-100 dark:focus:border-graphite-500"
                              maxLength={400}
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveMultiRow(row.id)}>
                              Remover
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={handleAddMultiRow}>
                Adicionar linha
              </Button>
              <Button variant="ghost" onClick={handleClearMultiRows}>
                Limpar
              </Button>
              <Button onClick={handleSaveMultiRows}>Salvar grid</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default TimeSheetModule;

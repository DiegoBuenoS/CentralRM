import React from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
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
import {
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  PlayIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

const TIMESHEET_STORAGE_KEY = 'timesheet_entries_v1';
const TIMESHEET_ACTIVE_STORAGE_KEY = 'timesheet_active_v1';

const PROJECTS = [
  {
    id: 'prj-rm-core',
    name: 'Central RM Core',
    tasks: [
      { id: 'task-login', name: 'Melhorias de Login' },
      { id: 'task-dashboard', name: 'Ajustes de Dashboard' },
      { id: 'task-integracao', name: 'Integracao com API RM' },
    ],
  },
  {
    id: 'prj-mobile',
    name: 'App Mobile',
    tasks: [
      { id: 'task-ui-mobile', name: 'UI/UX Mobile' },
      { id: 'task-auth-mobile', name: 'Autenticacao Mobile' },
      { id: 'task-release-mobile', name: 'Build e Publicacao' },
    ],
  },
  {
    id: 'prj-sustentacao',
    name: 'Sustentacao',
    tasks: [
      { id: 'task-bugs', name: 'Correcao de Bugs' },
      { id: 'task-suporte', name: 'Suporte ao Usuario' },
      { id: 'task-refatoracao', name: 'Refatoracao Tecnica' },
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

const findProject = (projectId) => PROJECTS.find((project) => project.id === projectId) || PROJECTS[0];

const createMultiRow = () => {
  const initialProject = PROJECTS[0];
  return {
    id: `multi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    projectId: initialProject.id,
    taskId: initialProject.tasks[0]?.id || '',
    date: nowLocalDate(),
    start: '',
    end: '',
  };
};

const createEntryRow = () => ({
  id: `entry-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  date: nowLocalDate(),
  start: '',
  end: '',
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

const TimeSheetModule = () => {
  const [officeTab, setOfficeTab] = React.useState('inicio');
  const [showEntryForm, setShowEntryForm] = React.useState(false);
  const [showMultiProjectForm, setShowMultiProjectForm] = React.useState(false);

  const [projectId, setProjectId] = React.useState(PROJECTS[0].id);
  const [taskId, setTaskId] = React.useState(PROJECTS[0].tasks[0].id);
  const [entryRows, setEntryRows] = React.useState([createEntryRow()]);

  const [activeTimer, setActiveTimer] = React.useState(null);
  const [entries, setEntries] = React.useState([]);
  const [feedback, setFeedback] = React.useState({ type: '', message: '' });

  const [multiRows, setMultiRows] = React.useState([createMultiRow()]);
  const [multiProjectFilter, setMultiProjectFilter] = React.useState('all');
  const [multiTaskFilter, setMultiTaskFilter] = React.useState('');

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

  const appendEntry = ({ projectName, taskName, date, start, end, minutes, mode }) => {
    const next = {
      id: `ts-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      projectName,
      taskName,
      date,
      start,
      end,
      minutes,
      mode,
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
    for (const row of entryRows) {
      if (!row.date || !row.start || !row.end) {
        setFeedback({ type: 'error', message: 'Preencha data, início e fim em todas as linhas.' });
        return;
      }
      const start = toDateTime(row.date, row.start);
      const end = toDateTime(row.date, row.end);
      if (!start || !end) {
        setFeedback({ type: 'error', message: 'Existe linha com data/horário inválido.' });
        return;
      }
      const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      if (diffMinutes <= 0) {
        setFeedback({ type: 'error', message: 'O horário final deve ser maior que o inicial em todas as linhas.' });
        return;
      }
      batchEntries.push({
        id: `ts-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        projectName: selectedProject.name,
        taskName: selectedTask?.name || 'Tarefa',
        date: row.date,
        start: row.start,
        end: row.end,
        minutes: diffMinutes,
        mode: 'manual',
        createdAt: new Date().toISOString(),
      });
    }

    setEntries((prev) => [...batchEntries, ...prev]);
    setFeedback({ type: 'success', message: `${batchEntries.length} apontamento(s) manual(is) registrado(s).` });
    setEntryRows([createEntryRow()]);
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
    setActiveTimer({
      projectId,
      projectName: selectedProject.name,
      taskId,
      taskName: selectedTask?.name || 'Tarefa',
      startedAt: now.toISOString(),
      startedDate: now.toISOString().slice(0, 10),
      startedTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
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
    const diffMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
    const endTimeValue = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;

    appendEntry({
      projectName: activeTimer.projectName,
      taskName: activeTimer.taskName,
      date: activeTimer.startedDate,
      start: activeTimer.startedTime,
      end: endTimeValue,
      minutes: diffMinutes,
      mode: 'timer',
    });

    setActiveTimer(null);
    setFeedback({ type: 'success', message: 'Apontamento encerrado e salvo.' });
    setShowEntryForm(false);
  };

  const handleEntryRowChange = (rowId, field, value) => {
    setEntryRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const next = { ...row, [field]: value };
        if (field === 'start' && !row.end && value) {
          next.end = shiftTime(value, 60);
        }
        return next;
      })
    );
  };

  const handleAddEntryRow = () => {
    setEntryRows((prev) => [...prev, createEntryRow()]);
  };

  const handleRemoveEntryRow = (rowId) => {
    setEntryRows((prev) => (prev.length <= 1 ? prev : prev.filter((row) => row.id !== rowId)));
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

  const handleSaveMultiRows = () => {
    setFeedback({ type: '', message: '' });
    if (multiRows.length === 0) {
      setFeedback({ type: 'error', message: 'Adicione ao menos uma linha no grid.' });
      return;
    }

    const preparedEntries = [];
    for (const row of multiRows) {
      if (!row.projectId || !row.taskId || !row.date || !row.start || !row.end) {
        setFeedback({ type: 'error', message: 'Preencha todos os campos obrigatorios do grid.' });
        return;
      }

      const start = toDateTime(row.date, row.start);
      const end = toDateTime(row.date, row.end);
      if (!start || !end) {
        setFeedback({ type: 'error', message: 'Existe linha no grid com data/horario invalido.' });
        return;
      }

      const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
      if (minutes <= 0) {
        setFeedback({ type: 'error', message: 'Horario final deve ser maior que o inicial em todas as linhas.' });
        return;
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
        mode: 'multi-projeto',
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

  const normalizedTaskFilter = multiTaskFilter.trim().toLowerCase();
  const filteredRows = multiRows.filter((row) => {
    const project = findProject(row.projectId);
    const task = project.tasks.find((item) => item.id === row.taskId);
    const projectMatch = multiProjectFilter === 'all' || row.projectId === multiProjectFilter;
    const taskMatch =
      !normalizedTaskFilter ||
      task?.name?.toLowerCase().includes(normalizedTaskFilter) ||
      row.taskId.toLowerCase().includes(normalizedTaskFilter);
    return projectMatch && taskMatch;
  });

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-blue-800 bg-gradient-to-r from-[#1f4f8b] via-[#255b9c] to-[#3069aa] px-5 py-3 text-white">
            <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100">Workspace</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Time Sheet RM</h2>
          </div>

          <div className="border-b border-slate-200 bg-white px-4 py-2">
            <Tabs value={officeTab} onValueChange={setOfficeTab}>
              <TabsList className="h-9 rounded-md border-slate-300 bg-slate-100">
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

          <div className="flex flex-wrap items-center gap-2 bg-[#f4f7fb] px-4 py-3">
            <Button size="sm" onClick={() => { setOfficeTab('lancar'); setShowEntryForm((prev) => !prev); }}>
              <PlayIcon className="h-4 w-4" />
              {showEntryForm ? 'Fechar apontamento' : 'Novo apontamento'}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { setOfficeTab('lancar'); setShowMultiProjectForm((prev) => !prev); }}>
              <Squares2X2Icon className="h-4 w-4" />
              {showMultiProjectForm ? 'Fechar multi-projetos' : 'Apontamento Multi-projetos'}
            </Button>
            <div className="h-6 w-px bg-slate-300" />
            <Button size="sm" variant="ghost" onClick={() => setOfficeTab('revisar')}>
              <DocumentTextIcon className="h-4 w-4" />
              Revisar planilha
            </Button>
            <Badge variant="secondary" className="border border-slate-300 bg-white text-slate-700">
              Total: {formatMinutes(totalTrackedMinutes)}
            </Badge>
            {activeTimer ? (
              <Badge variant="secondary" className="border border-amber-200 bg-amber-50 text-amber-800">
                Em andamento: {activeTimer.projectName} • {activeTimer.taskName} • {activeTimer.startedTime}
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className={`grid grid-cols-1 gap-5 ${showLauncherPanel && showSheetPanel ? 'xl:grid-cols-[360px_1fr]' : ''}`}>
        {showLauncherPanel ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200 pb-3">
            <CardTitle className="text-base">Painel de Lancamento</CardTitle>
            <CardDescription>Preencha e registre horas em formato rapido.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Clique em <span className="font-medium text-slate-800">Novo apontamento</span> para abrir o card de lançamento.
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
          <DialogContent className="max-w-3xl border-slate-300 bg-gradient-to-b from-white to-slate-50/70">
            <DialogHeader>
              <DialogTitle>Novo apontamento</DialogTitle>
              <DialogDescription>Preencha projeto, tarefa, data e horário para registrar.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Projeto</label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger className="h-11 border-slate-300 bg-white px-3.5 text-[15px] transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01]">
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
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Tarefa</label>
                  <Select value={taskId} onValueChange={setTaskId}>
                    <SelectTrigger className="h-11 border-slate-300 bg-white px-3.5 text-[15px] transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01]">
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
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Linhas de apontamento</label>
                <div className="rounded-md border border-slate-200">
                  <div className="hidden grid-cols-[180px_120px_120px_110px_84px] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 md:grid">
                    <span>Data</span>
                    <span className="text-center">Início</span>
                    <span className="text-center">Fim</span>
                    <span className="text-right">Duração</span>
                    <span className="text-right">Ação</span>
                  </div>
                  <div className="space-y-2 p-3">
                    {entryRows.map((row, index) => {
                      const duration = entryRowDurations[index] > 0 ? formatMinutes(entryRowDurations[index]) : '--';
                      return (
                        <div key={row.id} className="grid grid-cols-1 items-center gap-2 md:grid-cols-[180px_120px_120px_110px_84px]">
                          <Input
                            type="date"
                            value={row.date}
                            onChange={(event) => handleEntryRowChange(row.id, 'date', event.target.value)}
                            onFocus={(event) => event.target.select()}
                            className="h-10 w-[180px] border-slate-300 px-2.5 text-center text-[13px] font-mono tabular-nums transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01]"
                          />
                          <Input
                            type="time"
                            step="60"
                            value={row.start}
                            onChange={(event) => handleEntryRowChange(row.id, 'start', event.target.value)}
                            onFocus={(event) => event.target.select()}
                            className="h-10 w-[120px] border-slate-300 px-2.5 text-center text-[13px] font-mono tabular-nums transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01]"
                          />
                          <Input
                            type="time"
                            step="60"
                            value={row.end}
                            onChange={(event) => handleEntryRowChange(row.id, 'end', event.target.value)}
                            onFocus={(event) => event.target.select()}
                            className="h-10 w-[120px] border-slate-300 px-2.5 text-center text-[13px] font-mono tabular-nums transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01]"
                          />
                          <div className="text-right text-sm font-semibold text-slate-700">{duration}</div>
                          <div className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveEntryRow(row.id)}
                              disabled={entryRows.length === 1}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-start">
                  <Button variant="outline" size="sm" onClick={handleAddEntryRow}>
                    Adicionar linha
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Dica: ao informar o início de uma linha, o fim sugere +1h automaticamente.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                Duração total prevista: <span className="font-semibold text-slate-800">{manualMinutesPreview > 0 ? formatMinutes(manualMinutesPreview) : '--'}</span>
              </div>

              {feedback.message ? (
                <p
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    feedback.type === 'error'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
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
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200 pb-3">
            <CardTitle className="text-base">Planilha de Horas</CardTitle>
            <CardDescription>Visualizacao em grade para leitura e conferencia rapida.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {entries.length === 0 ? (
              <div className="p-6 text-sm text-slate-600">Nenhum apontamento registrado.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[840px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#f4f7fb] text-left text-slate-700">
                      <th className="px-3 py-2.5 font-semibold">Data</th>
                      <th className="px-3 py-2.5 font-semibold">Projeto</th>
                      <th className="px-3 py-2.5 font-semibold">Tarefa</th>
                      <th className="px-3 py-2.5 font-semibold">Inicio</th>
                      <th className="px-3 py-2.5 font-semibold">Fim</th>
                      <th className="px-3 py-2.5 font-semibold">Total</th>
                      <th className="px-3 py-2.5 font-semibold">Modo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                        <td className="px-3 py-2.5">{entry.date}</td>
                        <td className="px-3 py-2.5">{entry.projectName}</td>
                        <td className="px-3 py-2.5">{entry.taskName}</td>
                        <td className="px-3 py-2.5">{entry.start}</td>
                        <td className="px-3 py-2.5">{entry.end}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-900">{formatMinutes(entry.minutes)}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant="secondary" className={`border ${modeBadgeClass(entry.mode)}`}>
                            {modeLabel(entry.mode)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        ) : null}
      </div>

      {showMultiSection ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200 pb-3">
            <CardTitle className="text-base">Editor de Apontamento Multi-projetos</CardTitle>
            <CardDescription>Edite o grid e salve varios lancamentos de uma vez.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[250px_1fr]">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Filtrar projeto</label>
                <Select value={multiProjectFilter} onValueChange={setMultiProjectFilter}>
                  <SelectTrigger className="h-11 border-slate-300 bg-white px-3.5 text-[15px] transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01]">
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
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Filtrar tarefa</label>
                <Input
                  value={multiTaskFilter}
                  onChange={(event) => setMultiTaskFilter(event.target.value)}
                  placeholder="Digite parte do nome da tarefa"
                  className="h-11 border-slate-300 px-3.5 text-[15px] transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01]"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-[980px] w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#f4f7fb] text-left text-slate-700">
                    <th className="px-3 py-2.5 font-semibold">Projeto</th>
                    <th className="px-3 py-2.5 font-semibold">Tarefa</th>
                    <th className="w-[155px] px-3 py-2.5 font-semibold">Data</th>
                    <th className="w-[130px] px-3 py-2.5 font-semibold">Inicio</th>
                    <th className="w-[130px] px-3 py-2.5 font-semibold">Fim</th>
                    <th className="px-3 py-2.5 font-semibold">Duracao</th>
                    <th className="px-3 py-2.5 font-semibold text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-sm text-slate-600">
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
                        <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-2">
                            <Select
                              value={row.projectId}
                              onValueChange={(value) => handleMultiRowChange(row.id, 'projectId', value)}
                            >
                              <SelectTrigger className="h-10 border-slate-300 bg-white px-3 text-sm transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01]">
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
                              <SelectTrigger className="h-10 border-slate-300 bg-white px-3 text-sm transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01]">
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
                            <Input
                              type="date"
                              value={row.date}
                              onChange={(event) => handleMultiRowChange(row.id, 'date', event.target.value)}
                              onFocus={(event) => event.target.select()}
                              className="h-10 max-w-[145px] border-slate-300 px-3 text-center text-sm font-mono tabular-nums transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="time"
                              step="60"
                              value={row.start}
                              onChange={(event) => handleMultiRowChange(row.id, 'start', event.target.value)}
                              onFocus={(event) => event.target.select()}
                              className="h-10 max-w-[120px] border-slate-300 px-3 text-center text-sm font-mono tabular-nums transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="time"
                              step="60"
                              value={row.end}
                              onChange={(event) => handleMultiRowChange(row.id, 'end', event.target.value)}
                              onFocus={(event) => event.target.select()}
                              className="h-10 max-w-[120px] border-slate-300 px-3 text-center text-sm font-mono tabular-nums transition-transform duration-150 focus:ring-0 focus:border-slate-500 focus:scale-[1.01]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <span className={rowMinutes > 0 ? 'font-semibold text-slate-900' : 'text-slate-400'}>
                              {rowMinutes > 0 ? formatMinutes(rowMinutes) : '--'}
                            </span>
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
              <Button onClick={handleSaveMultiRows}>Salvar grid</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default TimeSheetModule;

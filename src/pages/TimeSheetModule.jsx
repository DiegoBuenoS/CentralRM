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

const TIMESHEET_STORAGE_KEY = 'timesheet_entries_v1';
const TIMESHEET_ACTIVE_STORAGE_KEY = 'timesheet_active_v1';

const PROJECTS = [
  {
    id: 'prj-rm-core',
    name: 'Central RM Core',
    tasks: [
      { id: 'task-login', name: 'Melhorias de Login' },
      { id: 'task-dashboard', name: 'Ajustes de Dashboard' },
      { id: 'task-integracao', name: 'Integração com API RM' },
    ],
  },
  {
    id: 'prj-mobile',
    name: 'App Mobile',
    tasks: [
      { id: 'task-ui-mobile', name: 'UI/UX Mobile' },
      { id: 'task-auth-mobile', name: 'Autenticação Mobile' },
      { id: 'task-release-mobile', name: 'Build e Publicação' },
    ],
  },
  {
    id: 'prj-sustentacao',
    name: 'Sustentação',
    tasks: [
      { id: 'task-bugs', name: 'Correções de Bugs' },
      { id: 'task-suporte', name: 'Suporte ao Usuário' },
      { id: 'task-refatoracao', name: 'Refatoração Técnica' },
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

const TimeSheetModule = () => {
  const [showEntryForm, setShowEntryForm] = React.useState(false);
  const [showMultiProjectForm, setShowMultiProjectForm] = React.useState(false);
  const [projectId, setProjectId] = React.useState(PROJECTS[0].id);
  const [taskId, setTaskId] = React.useState(PROJECTS[0].tasks[0].id);
  const [entryDate, setEntryDate] = React.useState(nowLocalDate);
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
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
    if (!projectId || !taskId || !entryDate || !startTime || !endTime) {
      setFeedback({ type: 'error', message: 'Preencha projeto, tarefa, data, início e fim.' });
      return;
    }

    const start = toDateTime(entryDate, startTime);
    const end = toDateTime(entryDate, endTime);
    if (!start || !end) {
      setFeedback({ type: 'error', message: 'Data ou horário inválido.' });
      return;
    }

    const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    if (diffMinutes <= 0) {
      setFeedback({ type: 'error', message: 'O horário final deve ser maior que o inicial.' });
      return;
    }

    const selectedTask = tasks.find((task) => task.id === taskId);
    appendEntry({
      projectName: selectedProject.name,
      taskName: selectedTask?.name || 'Tarefa',
      date: entryDate,
      start: startTime,
      end: endTime,
      minutes: diffMinutes,
      mode: 'manual',
    });
    setFeedback({ type: 'success', message: 'Apontamento manual registrado.' });
    setStartTime('');
    setEndTime('');
    setShowEntryForm(false);
  };

  const handleStartTimer = () => {
    setFeedback({ type: '', message: '' });
    if (activeTimer) {
      setFeedback({ type: 'error', message: 'Já existe um apontamento em andamento.' });
      return;
    }
    if (!projectId || !taskId) {
      setFeedback({ type: 'error', message: 'Selecione projeto e tarefa antes de iniciar.' });
      return;
    }
    const now = new Date();
    const selectedTask = tasks.find((task) => task.id === taskId);
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
      setFeedback({ type: 'error', message: 'Não há apontamento ativo para encerrar.' });
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

  const manualStart = toDateTime(entryDate, startTime);
  const manualEnd = toDateTime(entryDate, endTime);
  const manualMinutes =
    manualStart && manualEnd ? Math.round((manualEnd.getTime() - manualStart.getTime()) / 60000) : 0;
  const isManualReady = Boolean(projectId && taskId && entryDate && startTime && endTime && manualMinutes > 0);
  const canStartTimer = Boolean(!activeTimer && projectId && taskId);
  const canStopTimer = Boolean(activeTimer);
  const totalTrackedMinutes = entries.reduce((acc, entry) => acc + Number(entry.minutes || 0), 0);
  const normalizedTaskFilter = multiTaskFilter.trim().toLowerCase();

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

  const handleSaveMultiRows = () => {
    setFeedback({ type: '', message: '' });
    if (multiRows.length === 0) {
      setFeedback({ type: 'error', message: 'Adicione ao menos uma linha no grid.' });
      return;
    }

    const preparedEntries = [];
    for (const row of multiRows) {
      if (!row.projectId || !row.taskId || !row.date || !row.start || !row.end) {
        setFeedback({ type: 'error', message: 'Preencha todos os campos obrigatórios do grid.' });
        return;
      }
      const start = toDateTime(row.date, row.start);
      const end = toDateTime(row.date, row.end);
      if (!start || !end) {
        setFeedback({ type: 'error', message: 'Existe linha no grid com data/hora inválida.' });
        return;
      }
      const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
      if (minutes <= 0) {
        setFeedback({ type: 'error', message: 'Horário final deve ser maior que o inicial em todas as linhas.' });
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

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="overflow-hidden border-blue-100 shadow-sm">
        <CardContent className="relative p-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#dbeafe,transparent_45%),radial-gradient(circle_at_bottom_left,#eef2ff,transparent_58%)] opacity-90" />
          <div className="relative grid gap-3 p-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Gestão de Horas</p>
              <h2 className="mt-1 text-2xl font-semibold text-graphite-900">TimeSheet</h2>
              <p className="mt-2 text-sm text-graphite-600">
                Escolha projeto e tarefa, depois aponte horas manualmente ou por cronômetro.
              </p>
            </div>
            <div className="rounded-xl border border-white/80 bg-white/85 p-4 shadow-sm">
              <p className="text-xs text-graphite-500">Registros</p>
              <p className="mt-1 text-2xl font-semibold text-graphite-900">{entries.length}</p>
            </div>
            <div className="rounded-xl border border-white/80 bg-white/85 p-4 shadow-sm">
              <p className="text-xs text-graphite-500">Horas totais</p>
              <p className="mt-1 text-2xl font-semibold text-graphite-900">{formatMinutes(totalTrackedMinutes)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Registrar apontamento</CardTitle>
              <CardDescription>
                Clique em novo apontamento para abrir o card de registro.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!showEntryForm ? (
                <Button onClick={() => setShowEntryForm(true)}>Novo apontamento</Button>
              ) : (
                <Button variant="outline" onClick={() => setShowEntryForm(false)}>
                  Fechar
                </Button>
              )}
              {!showMultiProjectForm ? (
                <Button variant="secondary" onClick={() => setShowMultiProjectForm(true)}>
                  Apontamento Multi-projetos
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setShowMultiProjectForm(false)}>
                  Fechar multi-projetos
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {showEntryForm ? (
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-3 transition-colors hover:border-blue-200 focus-within:border-emerald-300 focus-within:bg-emerald-50/40">
              <label className="mb-1.5 block text-xs font-semibold text-graphite-600">Projeto</label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="h-11 border-blue-200 bg-white px-3.5 text-[15px] hover:border-blue-300 focus:ring-emerald-200 focus-visible:ring-emerald-200 focus:border-emerald-400 focus-visible:border-emerald-400">
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
              <p className="mt-1.5 text-xs text-graphite-500">Defina o projeto para carregar as tarefas relacionadas.</p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-3 transition-colors hover:border-blue-200 focus-within:border-emerald-300 focus-within:bg-emerald-50/40">
              <label className="mb-1.5 block text-xs font-semibold text-graphite-600">Tarefa</label>
              <Select value={taskId} onValueChange={setTaskId}>
                <SelectTrigger className="h-11 border-blue-200 bg-white px-3.5 text-[15px] hover:border-blue-300 focus:ring-emerald-200 focus-visible:ring-emerald-200 focus:border-emerald-400 focus-visible:border-emerald-400">
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
              <p className="mt-1.5 text-xs text-graphite-500">
                Tarefa atual: <span className="font-medium text-graphite-700">{selectedTask?.name || '-'}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-blue-100 bg-white p-3 transition-colors hover:border-blue-200 focus-within:border-emerald-300 focus-within:bg-emerald-50/30">
              <label className="mb-1.5 block text-xs font-semibold text-graphite-600">Data do apontamento</label>
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="h-11 border-blue-200 px-3.5 text-[15px] hover:border-blue-300 focus-visible:ring-emerald-200 focus-visible:border-emerald-400"
              />
            </div>
            <div className="rounded-xl border border-blue-100 bg-white p-3 transition-colors hover:border-blue-200 focus-within:border-emerald-300 focus-within:bg-emerald-50/30">
              <label className="mb-1.5 block text-xs font-semibold text-graphite-600">Hora de início</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-11 border-blue-200 px-3.5 text-[15px] hover:border-blue-300 focus-visible:ring-emerald-200 focus-visible:border-emerald-400"
              />
            </div>
            <div className="rounded-xl border border-blue-100 bg-white p-3 transition-colors hover:border-blue-200 focus-within:border-emerald-300 focus-within:bg-emerald-50/30">
              <label className="mb-1.5 block text-xs font-semibold text-graphite-600">Hora de fim</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-11 border-blue-200 px-3.5 text-[15px] hover:border-blue-300 focus-visible:ring-emerald-200 focus-visible:border-emerald-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-graphite-200 bg-graphite-50/60 p-3">
            <Button onClick={handleManualEntry} disabled={!isManualReady}>
              Registrar manual
            </Button>
            <Button variant="secondary" onClick={handleStartTimer} disabled={!canStartTimer}>
              Iniciar apontamento
            </Button>
            <Button variant="outline" onClick={handleStopTimer} disabled={!canStopTimer}>
              Encerrar apontamento
            </Button>
            {activeTimer ? (
              <Badge variant="secondary" className="border border-amber-200 bg-amber-100 text-amber-800">
                Em andamento: {activeTimer.projectName} • {activeTimer.taskName} • {activeTimer.startedTime}
              </Badge>
            ) : (
              <Badge variant="secondary" className="border border-graphite-200 bg-white text-graphite-700">
                Nenhum apontamento ativo
              </Badge>
            )}
          </div>

          <p className="text-xs text-graphite-500">
            Duração prevista (manual):{' '}
            <span className={manualMinutes > 0 ? 'font-medium text-graphite-700' : 'text-graphite-400'}>
              {manualMinutes > 0 ? formatMinutes(manualMinutes) : '--'}
            </span>
          </p>

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
        </CardContent>
        ) : (
          <CardContent>
            <div className="rounded-lg border border-dashed border-graphite-300 bg-graphite-50/60 p-6 text-center text-sm text-graphite-500">
              Nenhum formulário aberto. Clique em <span className="font-medium text-graphite-700">Novo apontamento</span> para iniciar.
            </div>
          </CardContent>
        )}
      </Card>

      {showMultiProjectForm ? (
        <Card className="border-emerald-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Apontamento Multi-projetos</CardTitle>
            <CardDescription>
              Edite o grid por linha para lançar vários apontamentos de uma vez.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-graphite-600">Filtrar projeto</label>
                <Select value={multiProjectFilter} onValueChange={setMultiProjectFilter}>
                  <SelectTrigger className="h-11 border-emerald-200 bg-white px-3.5 text-[15px] hover:border-emerald-300 focus:ring-emerald-200">
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
                <label className="mb-1.5 block text-xs font-semibold text-graphite-600">Filtrar tarefa</label>
                <Input
                  value={multiTaskFilter}
                  onChange={(event) => setMultiTaskFilter(event.target.value)}
                  placeholder="Digite parte do nome da tarefa"
                  className="h-11 border-emerald-200 px-3.5 text-[15px] hover:border-emerald-300 focus-visible:ring-emerald-200 focus-visible:border-emerald-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-graphite-200 bg-white">
              <table className="min-w-[980px] w-full text-sm">
                <thead>
                  <tr className="border-b border-graphite-200 bg-graphite-50 text-left text-graphite-600">
                    <th className="px-3 py-2.5 font-medium">Projeto</th>
                    <th className="px-3 py-2.5 font-medium">Tarefa</th>
                    <th className="px-3 py-2.5 font-medium">Data</th>
                    <th className="px-3 py-2.5 font-medium">Início</th>
                    <th className="px-3 py-2.5 font-medium">Fim</th>
                    <th className="px-3 py-2.5 font-medium">Duração</th>
                    <th className="px-3 py-2.5 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-sm text-graphite-500">
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
                        <tr key={row.id} className="border-b border-graphite-100">
                          <td className="px-3 py-2">
                            <Select
                              value={row.projectId}
                              onValueChange={(value) => handleMultiRowChange(row.id, 'projectId', value)}
                            >
                              <SelectTrigger className="h-10 border-emerald-200 bg-white px-3 text-sm">
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
                              <SelectTrigger className="h-10 border-emerald-200 bg-white px-3 text-sm">
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
                              className="h-10 border-emerald-200 px-3 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="time"
                              value={row.start}
                              onChange={(event) => handleMultiRowChange(row.id, 'start', event.target.value)}
                              className="h-10 border-emerald-200 px-3 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="time"
                              value={row.end}
                              onChange={(event) => handleMultiRowChange(row.id, 'end', event.target.value)}
                              className="h-10 border-emerald-200 px-3 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <span className={rowMinutes > 0 ? 'font-medium text-graphite-800' : 'text-graphite-400'}>
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

      <Card className="border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle>Apontamentos</CardTitle>
          <CardDescription>Histórico local dos seus registros de horas em formato de cards.</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-graphite-300 bg-graphite-50/60 p-6 text-center text-sm text-graphite-500">
              Nenhum apontamento registrado ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-graphite-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-graphite-500">{entry.date}</p>
                      <p className="text-sm font-semibold text-graphite-900">{entry.projectName}</p>
                      <p className="text-sm text-graphite-600">{entry.taskName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-graphite-500">Total</p>
                      <p className="text-base font-semibold text-graphite-900">{formatMinutes(entry.minutes)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-lg border border-graphite-200 bg-graphite-50 px-2.5 py-2">
                      <p className="text-[11px] text-graphite-500">Início</p>
                      <p className="font-medium text-graphite-800">{entry.start}</p>
                    </div>
                    <div className="rounded-lg border border-graphite-200 bg-graphite-50 px-2.5 py-2">
                      <p className="text-[11px] text-graphite-500">Fim</p>
                      <p className="font-medium text-graphite-800">{entry.end}</p>
                    </div>
                    <div className="rounded-lg border border-graphite-200 bg-graphite-50 px-2.5 py-2">
                      <p className="text-[11px] text-graphite-500">Modo</p>
                      <div className="mt-0.5">
                        <Badge
                          variant="secondary"
                          className={
                            entry.mode === 'timer'
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                              : entry.mode === 'multi-projeto'
                              ? 'border border-violet-200 bg-violet-50 text-violet-700'
                              : 'border border-blue-200 bg-blue-50 text-blue-700'
                          }
                        >
                          {entry.mode === 'timer'
                            ? 'Timer'
                            : entry.mode === 'multi-projeto'
                            ? 'Multi-projetos'
                            : 'Manual'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeSheetModule;

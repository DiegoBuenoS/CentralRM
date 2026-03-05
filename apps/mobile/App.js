import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { APP_NAME, currencyToBRL } from '@central-rm/shared';
import { loadSession } from './src/lib/sessionStorage';
import { loginUser, logoutUser } from './src/services/auth.service';
import { createTravelRequest, listTravelRequests } from './src/services/travelRequests.service';
import { getApiBaseUrl } from './src/config/api';
import { uploadTravelAttachments } from './src/services/upload.service';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const mapIntegrationStatus = (status) => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'INTEGRADO') return 'Integrado';
  if (normalized === 'ENVIADO') return 'Enviado';
  if (normalized === 'ERRO') return 'Erro';
  return 'Pendente';
};

const statusStyle = (status) => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'INTEGRADO') return styles.statusIntegrated;
  if (normalized === 'ENVIADO') return styles.statusSent;
  if (normalized === 'ERRO') return styles.statusError;
  return styles.statusPending;
};

const parseMoney = (value) => {
  if (typeof value === 'number') return value;
  const normalized = String(value || '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
};

const createEmptyTravelForm = () => ({
  tipoSolicitacao: '',
  origem: '',
  destino: '',
  periodoInicio: '',
  periodoFim: '',
  totalValue: '',
  kmEstimado: '',
  centroCusto: '',
  observacao: '',
});

const createDemoTravelForm = () => ({
  tipoSolicitacao: 'Adiantamento de Viagem',
  origem: 'Sao Paulo/SP',
  destino: 'Rio de Janeiro/RJ',
  periodoInicio: '2026-03-10',
  periodoFim: '2026-03-12',
  totalValue: '2480,50',
  kmEstimado: '430',
  centroCusto: 'FIN-OPER',
  observacao: 'Visita comercial e reuniao com cliente estrategico.',
});

const DEMO_TRAVEL_REQUESTS = [
  {
    requestId: 'TRV-2026-0142',
    destino: 'Rio de Janeiro/RJ',
    tipoSolicitacao: 'Adiantamento de Viagem',
    numeroRm: 'RM-88321',
    integrationStatus: 'INTEGRADO',
    totalValue: 2480.5,
  },
  {
    requestId: 'TRV-2026-0143',
    destino: 'Belo Horizonte/MG',
    tipoSolicitacao: 'Reembolso',
    numeroRm: '',
    integrationStatus: 'PENDENTE',
    totalValue: 1320.9,
  },
  {
    requestId: 'TRV-2026-0144',
    destino: 'Curitiba/PR',
    tipoSolicitacao: 'Adiantamento de Viagem',
    numeroRm: 'RM-88328',
    integrationStatus: 'ENVIADO',
    totalValue: 980.0,
  },
];

const getUserDisplayName = (user) => {
  if (!user) return 'Usuario';
  if (typeof user?.name === 'string' && user.name.trim()) return user.name.trim();
  if (user?.name?.formatted) return String(user.name.formatted);
  if (user?.name?.givenName) return String(user.name.givenName);
  if (user?.username) return String(user.username);
  return 'Usuario';
};

const getUserInitials = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'US';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const SummaryCard = ({ label, value }) => (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

export default function App() {
  const [booting, setBooting] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [loadingList, setLoadingList] = React.useState(false);
  const [creatingRequest, setCreatingRequest] = React.useState(false);
  const [error, setError] = React.useState('');
  const [createError, setCreateError] = React.useState('');
  const [createSuccess, setCreateSuccess] = React.useState('');

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [token, setToken] = React.useState('');
  const [user, setUser] = React.useState(null);
  const [_travelRequests, setTravelRequests] = React.useState([]);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [travelForm, setTravelForm] = React.useState(createEmptyTravelForm());
  const [attachments, setAttachments] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState('home');

  const displayedRequests = DEMO_TRAVEL_REQUESTS;

  const totalAmount = React.useMemo(
    () => displayedRequests.reduce((sum, item) => sum + parseMoney(item.totalValue), 0),
    [displayedRequests]
  );

  const pendingCount = React.useMemo(
    () => displayedRequests.filter((item) => String(item.integrationStatus || '').toUpperCase() === 'PENDENTE').length,
    [displayedRequests]
  );

  const loadTravelRequests = React.useCallback(async (sessionToken) => {
    setLoadingList(true);
    setError('');
    try {
      const data = await listTravelRequests({ token: sessionToken, limit: 50 });
      setTravelRequests(data.items || []);
    } catch (requestError) {
      if (requestError?.status === 401) {
        setToken('');
        setUser(null);
      }
      setError(requestError?.message || 'Falha ao carregar despesas.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const session = await loadSession();
        if (!mounted) return;

        if (session?.token) {
          setToken(session.token);
          setUser(session.user || null);
          await loadTravelRequests(session.token);
        }
      } finally {
        if (mounted) setBooting(false);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [loadTravelRequests]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Usuario e senha sao obrigatorios.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await loginUser({ username: username.trim(), password });
      setToken(result.token);
      setUser(result.user);
      setPassword('');
      await loadTravelRequests(result.token);
    } catch (loginError) {
      setError(loginError?.message || 'Falha no login.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser(token);
    setToken('');
    setUser(null);
    setTravelRequests([]);
    setPassword('');
    setError('');
    setCreateError('');
    setCreateSuccess('');
    setTravelForm(createEmptyTravelForm());
    setAttachments([]);
    setShowCreateForm(false);
    setActiveTab('home');
  };

  const updateTravelForm = (field, value) => {
    setTravelForm((prev) => ({ ...prev, [field]: value }));
  };

  const appendAttachments = (items) => {
    setAttachments((prev) => {
      const merged = [...prev];
      items.forEach((item) => {
        if (!item?.uri) return;
        if (!merged.some((existing) => existing.uri === item.uri)) {
          merged.push(item);
        }
      });
      return merged;
    });
  };

  const handleRemoveAttachment = (uri) => {
    setAttachments((prev) => prev.filter((item) => item.uri !== uri));
  };

  const handleOpenCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setCreateError('Permissao da camera negada.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.75,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      appendAttachments([
        {
          uri: asset.uri,
          name: asset.fileName || `camera-${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        },
      ]);
      setCreateError('');
    } catch {
      setCreateError('Nao foi possivel abrir a camera.');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
        type: '*/*',
      });
      if (result.canceled || !result.assets?.length) return;

      const items = result.assets.map((asset, index) => ({
        uri: asset.uri,
        name: asset.name || `arquivo-${Date.now()}-${index + 1}`,
        type: asset.mimeType || 'application/octet-stream',
      }));

      appendAttachments(items);
      setCreateError('');
    } catch {
      setCreateError('Nao foi possivel selecionar arquivos.');
    }
  };

  const handleChooseAttachmentSource = () => {
    Alert.alert('Adicionar comprovante', 'Escolha uma opcao', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Camera', onPress: handleOpenCamera },
      { text: 'Arquivo', onPress: handlePickDocument },
    ]);
  };

  const handleCreateTravelRequest = async () => {
    const requiredFields = [
      ['tipoSolicitacao', 'Tipo de solicitacao'],
      ['origem', 'Origem'],
      ['destino', 'Destino'],
      ['periodoInicio', 'Periodo inicio'],
      ['periodoFim', 'Periodo fim'],
      ['totalValue', 'Total'],
    ];

    const missing = requiredFields.find(([field]) => !String(travelForm[field] || '').trim());
    if (missing) {
      setCreateError(`Campo obrigatorio: ${missing[1]}.`);
      setCreateSuccess('');
      return;
    }

    if (!DATE_PATTERN.test(travelForm.periodoInicio) || !DATE_PATTERN.test(travelForm.periodoFim)) {
      setCreateError('Datas devem estar no formato YYYY-MM-DD.');
      setCreateSuccess('');
      return;
    }

    const totalValue = parseMoney(travelForm.totalValue);
    if (totalValue <= 0) {
      setCreateError('Total deve ser maior que zero.');
      setCreateSuccess('');
      return;
    }

    setCreatingRequest(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      const uploadedFiles = attachments.length
        ? await uploadTravelAttachments({ token, files: attachments })
        : [];

      await createTravelRequest({
        token,
        payload: {
          tipoSolicitacao: travelForm.tipoSolicitacao.trim(),
          origem: travelForm.origem.trim(),
          destino: travelForm.destino.trim(),
          periodoInicio: travelForm.periodoInicio.trim(),
          periodoFim: travelForm.periodoFim.trim(),
          totalValue,
          kmEstimado: parseMoney(travelForm.kmEstimado),
          centroCusto: travelForm.centroCusto.trim(),
          observacao: travelForm.observacao.trim(),
          requester: user?.username || username || 'mobile-user',
          anexos: uploadedFiles,
        },
      });

      setCreateSuccess('Despesa criada com sucesso.');
      setTravelForm(createEmptyTravelForm());
      setAttachments([]);
      setShowCreateForm(false);
      setActiveTab('home');
      await loadTravelRequests(token);
    } catch (requestError) {
      setCreateError(requestError?.message || 'Falha ao criar despesa.');
      if (requestError?.status === 401) {
        await handleLogout();
      }
    } finally {
      setCreatingRequest(false);
    }
  };

  if (booting) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f4f8ff" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#0070ba" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#003087" />
        <View style={styles.loginTop}>
          <Text style={styles.brand}>RM Despesas</Text>
          <Text style={styles.brandTitle}>{APP_NAME}</Text>
          <Text style={styles.brandSubtitle}>Controle financeiro de viagens</Text>
        </View>
        <View style={styles.loginBody}>
          <Text style={styles.label}>Backend</Text>
          <Text style={styles.backendValue}>{getApiBaseUrl()}</Text>

          <Text style={styles.label}>Usuario</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Seu usuario"
            placeholderTextColor="#7a8ca5"
            style={styles.input}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            placeholderTextColor="#7a8ca5"
            secureTextEntry
            style={styles.input}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}
            disabled={submitting}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Entrar</Text>}
          </Pressable>

          <View style={styles.footerBlock}>
            <Text style={styles.footerText}>Desenvolvido por Diego Bueno</Text>
            <Text style={styles.footerText}>versao beta</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8ff" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.headerBadge}>Travel Finance</Text>
          <Text style={styles.headerTitle}>Despesas de Viagem</Text>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getUserInitials(getUserDisplayName(user))}</Text>
            </View>
            <View>
              <Text style={styles.headerUserLabel}>Conta</Text>
              <Text style={styles.headerUser}>{getUserDisplayName(user)}</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <SummaryCard label="Lancamentos" value={String(displayedRequests.length)} />
            <SummaryCard label="Pendentes" value={String(pendingCount)} />
            <SummaryCard label="Total" value={currencyToBRL(totalAmount)} />
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => {
              setShowCreateForm((prev) => !prev);
              setCreateError('');
              setCreateSuccess('');
              setActiveTab('add');
            }}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}
          >
            <Text style={styles.secondaryButtonText}>{showCreateForm ? 'Fechar' : 'Nova despesa'}</Text>
          </Pressable>
          <Pressable
            onPress={() => loadTravelRequests(token)}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}
          >
            <Text style={styles.secondaryButtonText}>{loadingList ? 'Atualizando...' : 'Atualizar'}</Text>
          </Pressable>
          <Pressable onPress={handleLogout} style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}>
            <Text style={styles.secondaryButtonText}>Sair</Text>
          </Pressable>
        </View>

        {showCreateForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Nova Despesa</Text>

            <Text style={styles.label}>Tipo de solicitacao</Text>
            <TextInput value={travelForm.tipoSolicitacao} onChangeText={(value) => updateTravelForm('tipoSolicitacao', value)} placeholder="Ex: Adiantamento" placeholderTextColor="#7a8ca5" style={styles.input} />

            <Text style={styles.label}>Origem</Text>
            <TextInput value={travelForm.origem} onChangeText={(value) => updateTravelForm('origem', value)} placeholder="Ex: Sao Paulo/SP" placeholderTextColor="#7a8ca5" style={styles.input} />

            <Text style={styles.label}>Destino</Text>
            <TextInput value={travelForm.destino} onChangeText={(value) => updateTravelForm('destino', value)} placeholder="Ex: Rio de Janeiro/RJ" placeholderTextColor="#7a8ca5" style={styles.input} />

            <View style={styles.row}>
              <View style={styles.rowCol}>
                <Text style={styles.label}>Periodo inicio</Text>
                <TextInput value={travelForm.periodoInicio} onChangeText={(value) => updateTravelForm('periodoInicio', value)} placeholder="YYYY-MM-DD" placeholderTextColor="#7a8ca5" style={styles.input} />
              </View>
              <View style={styles.rowCol}>
                <Text style={styles.label}>Periodo fim</Text>
                <TextInput value={travelForm.periodoFim} onChangeText={(value) => updateTravelForm('periodoFim', value)} placeholder="YYYY-MM-DD" placeholderTextColor="#7a8ca5" style={styles.input} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.rowCol}>
                <Text style={styles.label}>Total (R$)</Text>
                <TextInput value={travelForm.totalValue} onChangeText={(value) => updateTravelForm('totalValue', value)} placeholder="0,00" placeholderTextColor="#7a8ca5" keyboardType="decimal-pad" style={styles.input} />
              </View>
              <View style={styles.rowCol}>
                <Text style={styles.label}>KM estimado</Text>
                <TextInput value={travelForm.kmEstimado} onChangeText={(value) => updateTravelForm('kmEstimado', value)} placeholder="0" placeholderTextColor="#7a8ca5" keyboardType="decimal-pad" style={styles.input} />
              </View>
            </View>

            <Text style={styles.label}>Centro de custo</Text>
            <TextInput value={travelForm.centroCusto} onChangeText={(value) => updateTravelForm('centroCusto', value)} placeholder="Ex: Financeiro" placeholderTextColor="#7a8ca5" style={styles.input} />

            <Text style={styles.label}>Observacao</Text>
            <TextInput value={travelForm.observacao} onChangeText={(value) => updateTravelForm('observacao', value)} placeholder="Detalhes" placeholderTextColor="#7a8ca5" style={[styles.input, styles.textarea]} multiline />

            <Pressable
              onPress={() => {
                setTravelForm(createDemoTravelForm());
                setCreateError('');
                setCreateSuccess('Dados ficticios aplicados para demonstracao.');
              }}
              style={({ pressed }) => [styles.fillDemoButton, pressed && styles.secondaryPressed]}
            >
              <Ionicons name="sparkles-outline" size={15} color="#0a3f82" />
              <Text style={styles.fillDemoButtonText}>Preencher com dados ficticios</Text>
            </Pressable>

            <Text style={styles.label}>Comprovantes</Text>
            <View style={styles.attachmentActions}>
              <Pressable onPress={handleChooseAttachmentSource} style={({ pressed }) => [styles.attachmentButton, pressed && styles.secondaryPressed]}>
                <Ionicons name="camera-outline" size={16} color="#0a3f82" />
                <Text style={styles.attachmentButtonText}>Camera ou arquivo</Text>
              </Pressable>
              <Pressable onPress={handlePickDocument} style={({ pressed }) => [styles.attachmentButton, pressed && styles.secondaryPressed]}>
                <Ionicons name="document-text-outline" size={16} color="#0a3f82" />
                <Text style={styles.attachmentButtonText}>Procurar arquivo</Text>
              </Pressable>
            </View>

            {attachments.length > 0 && (
              <View style={styles.attachmentList}>
                {attachments.map((item) => (
                  <View key={item.uri} style={styles.attachmentItem}>
                    <Ionicons name="attach-outline" size={14} color="#2f4d74" />
                    <Text numberOfLines={1} style={styles.attachmentName}>{item.name}</Text>
                    <Pressable onPress={() => handleRemoveAttachment(item.uri)}>
                      <Ionicons name="close-circle" size={18} color="#8aa0bf" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {createError ? <Text style={styles.errorText}>{createError}</Text> : null}
            {createSuccess ? <Text style={styles.successText}>{createSuccess}</Text> : null}

            <Pressable
              onPress={handleCreateTravelRequest}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}
              disabled={creatingRequest}
            >
              {creatingRequest ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Salvar despesa</Text>}
            </Pressable>
          </View>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {activeTab === 'insights' ? (
          <View style={styles.insightGrid}>
            <View style={styles.insightCard}>
              <Text style={styles.insightLabel}>Total registrado</Text>
              <Text style={styles.insightValue}>{currencyToBRL(totalAmount)}</Text>
            </View>
            <View style={styles.insightCard}>
              <Text style={styles.insightLabel}>Solicitacoes pendentes</Text>
              <Text style={styles.insightValue}>{pendingCount}</Text>
            </View>
            <View style={styles.insightCard}>
              <Text style={styles.insightLabel}>Lancamentos</Text>
              <Text style={styles.insightValue}>{displayedRequests.length}</Text>
            </View>
          </View>
        ) : activeTab === 'account' ? (
          <View style={styles.accountCard}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getUserInitials(getUserDisplayName(user))}</Text>
              </View>
              <View>
                <Text style={styles.headerUserLabel}>Conta</Text>
                <Text style={styles.headerUser}>{getUserDisplayName(user)}</Text>
              </View>
            </View>
            <Text style={styles.itemLine}>Aplicacao: RM Despesas</Text>
            <Text style={styles.itemLine}>Modo: versao beta</Text>
            <Text style={styles.itemLine}>Desenvolvido por Diego Bueno</Text>
          </View>
        ) : loadingList ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#0070ba" />
          </View>
        ) : (
          <FlatList
            data={displayedRequests}
            keyExtractor={(item, index) => item.requestId || String(index)}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma despesa encontrada.</Text>}
            renderItem={({ item }) => {
              const amount = parseMoney(item.totalValue ?? item.total);
              return (
                <View style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.requestId || 'Sem ID'}</Text>
                    <View style={[styles.statusChip, statusStyle(item.integrationStatus)]}>
                      <Text style={styles.statusText}>{mapIntegrationStatus(item.integrationStatus)}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemLine}>Destino: {item.destino || '--'}</Text>
                  <Text style={styles.itemLine}>Tipo: {item.tipoSolicitacao || '--'}</Text>
                  <Text style={styles.itemLine}>Numero RM: {item.numeroRm || 'Pendente'}</Text>
                  <Text style={styles.itemAmount}>{currencyToBRL(amount)}</Text>
                </View>
              );
            }}
          />
        )}

        <View style={styles.footerBlock}>
          <Text style={styles.footerText}>Desenvolvido por Diego Bueno</Text>
          <Text style={styles.footerText}>versao beta</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable onPress={() => setActiveTab('home')} style={({ pressed }) => [styles.navItem, pressed && styles.navPressed]}>
          <Ionicons name="home-outline" size={20} color={activeTab === 'home' ? '#0070ba' : '#8aa0bf'} />
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>Inicio</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setActiveTab('add');
            setShowCreateForm(true);
          }}
          style={({ pressed }) => [styles.navItem, pressed && styles.navPressed]}
        >
          <Ionicons name="add-circle-outline" size={20} color={activeTab === 'add' ? '#0070ba' : '#8aa0bf'} />
          <Text style={[styles.navText, activeTab === 'add' && styles.navTextActive]}>Novo</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('insights')} style={({ pressed }) => [styles.navItem, pressed && styles.navPressed]}>
          <Ionicons name="stats-chart-outline" size={20} color={activeTab === 'insights' ? '#0070ba' : '#8aa0bf'} />
          <Text style={[styles.navText, activeTab === 'insights' && styles.navTextActive]}>Insights</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('account')} style={({ pressed }) => [styles.navItem, pressed && styles.navPressed]}>
          <Ionicons name="person-outline" size={20} color={activeTab === 'account' ? '#0070ba' : '#8aa0bf'} />
          <Text style={[styles.navText, activeTab === 'account' && styles.navTextActive]}>Conta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f8ff',
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
    color: '#3b4b61',
  },
  loginTop: {
    backgroundColor: '#003087',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 44,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  brand: {
    color: '#d7ecff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  brandTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  brandSubtitle: {
    color: '#d6e8ff',
    fontSize: 13,
    marginTop: 4,
  },
  loginBody: {
    marginTop: -18,
    marginHorizontal: 16,
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d9e6f7',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  headerCard: {
    backgroundColor: '#003087',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  headerBadge: {
    color: '#a7cfff',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 11,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 6,
  },
  headerUser: {
    color: '#ffffff',
    marginTop: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  headerUserLabel: {
    color: '#c7dfff',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  userRow: {
    marginTop: 6,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: '#0070ba',
    borderWidth: 1,
    borderColor: '#9ed2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#0057a3',
  },
  summaryLabel: {
    color: '#c4e2ff',
    fontSize: 11,
  },
  summaryValue: {
    color: '#fff',
    fontWeight: '700',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1e0f2',
  },
  secondaryPressed: {
    opacity: 0.85,
  },
  secondaryButtonText: {
    color: '#0a3f82',
    fontWeight: '700',
    fontSize: 12,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d1e0f2',
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f3f80',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#46678e',
    marginTop: 8,
    marginBottom: 5,
  },
  backendValue: {
    color: '#0f4f93',
    fontSize: 12,
    fontFamily: 'Courier',
  },
  input: {
    borderWidth: 1,
    borderColor: '#c7d9ef',
    borderRadius: 12,
    backgroundColor: '#f7fbff',
    color: '#12395f',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowCol: {
    flex: 1,
  },
  attachmentActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 2,
  },
  attachmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#c7d9ef',
    borderRadius: 10,
    paddingVertical: 9,
    backgroundColor: '#f7fbff',
  },
  attachmentButtonText: {
    color: '#0a3f82',
    fontSize: 11,
    fontWeight: '700',
  },
  attachmentList: {
    marginTop: 8,
    gap: 6,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#d1e0f2',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  attachmentName: {
    flex: 1,
    color: '#2f4d74',
    fontSize: 12,
  },
  textarea: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  fillDemoButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#c7d9ef',
    borderRadius: 10,
    paddingVertical: 9,
    backgroundColor: '#f1f8ff',
  },
  fillDemoButtonText: {
    color: '#0a3f82',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#0070ba',
  },
  primaryPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    gap: 10,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d1e0f2',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    color: '#143f70',
    fontSize: 16,
    fontWeight: '700',
  },
  statusChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPending: {
    backgroundColor: '#eaf3ff',
    borderColor: '#bfdbfe',
  },
  statusSent: {
    backgroundColor: '#fff5e9',
    borderColor: '#f5d0a8',
  },
  statusIntegrated: {
    backgroundColor: '#ecfdf3',
    borderColor: '#bbf7d0',
  },
  statusError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  itemLine: {
    color: '#4b617a',
    fontSize: 13,
    marginBottom: 4,
  },
  itemAmount: {
    color: '#0057a3',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  emptyText: {
    textAlign: 'center',
    color: '#617b99',
    marginTop: 18,
  },
  errorText: {
    color: '#c5352f',
    marginTop: 8,
  },
  successText: {
    color: '#118d47',
    marginTop: 8,
  },
  footerBlock: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  footerText: {
    color: '#5f7290',
    fontSize: 11,
  },
  insightGrid: {
    gap: 10,
    marginBottom: 8,
  },
  insightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d1e0f2',
    padding: 14,
  },
  insightLabel: {
    color: '#55779f',
    fontSize: 12,
  },
  insightValue: {
    color: '#0f3f80',
    fontWeight: '800',
    fontSize: 20,
    marginTop: 4,
  },
  accountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d1e0f2',
    padding: 14,
    marginBottom: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#d1e0f2',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 10,
    paddingVertical: 6,
  },
  navPressed: {
    backgroundColor: '#f0f7ff',
  },
  navText: {
    fontSize: 11,
    color: '#8aa0bf',
    fontWeight: '600',
  },
  navTextActive: {
    color: '#0070ba',
  },
});

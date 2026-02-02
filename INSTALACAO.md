# 📦 Guia de Instalação - RM Login

Este guia fornece instruções passo a passo para instalar e executar o projeto **RM Login** na sua máquina local.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

### Obrigatórios

- **Node.js** versão 16.0 ou superior
  - Verificar versão: `node --version`
  - Download: [nodejs.org](https://nodejs.org/)

- **npm** (geralmente vem com Node.js)
  - Verificar versão: `npm --version`

### Opcionais

- **Git** para clonar o repositório
  - Verificar versão: `git --version`
  - Download: [git-scm.com](https://git-scm.com/)

- **Visual Studio Code** (recomendado)
  - Download: [code.visualstudio.com](https://code.visualstudio.com/)

## 🚀 Instalação Passo a Passo

### 1. Obter o Projeto

#### Opção A: Clonar do GitHub (se já estiver no GitHub)

```bash
git clone https://github.com/seu-usuario/rm_login.git
cd rm_login
```

#### Opção B: Baixar o arquivo ZIP

1. Baixe o arquivo ZIP do projeto
2. Extraia em uma pasta de sua preferência
3. Abra o terminal na pasta extraída

```bash
cd caminho/para/rm_login
```

### 2. Instalar Dependências

Execute o comando para instalar todas as dependências do projeto:

```bash
npm install
```

**Aguarde:** Este processo pode levar alguns minutos dependendo da sua conexão.

**Saída esperada:**
```
added 385 packages, and audited 385 packages in 30s
found 0 vulnerabilities
```

### 3. Configurar Variáveis de Ambiente

#### 3.1. Copiar arquivo de exemplo

```bash
cp .env.example .env.local
```

**No Windows (PowerShell):**
```powershell
Copy-Item .env.example .env.local
```

#### 3.2. Editar configurações

Abra o arquivo `.env.local` em um editor de texto e configure:

```env
# URL base da API TOTVS RM
VITE_API_BASE_URL=http://dbs.brazilsouth.cloudapp.azure.com:8051

# Contexto da aplicação (coligada/empresa)
VITE_CONTEXT=1
```

**⚠️ Importante:**
- Ajuste `VITE_API_BASE_URL` para a URL do seu ambiente RM
- Ajuste `VITE_CONTEXT` conforme sua coligada/empresa

### 4. Verificar Instalação

Execute os testes para garantir que tudo está funcionando:

```bash
npm run test
```

**Saída esperada:**
```
✓ src/components/ui/Button.test.jsx (10 tests)
✓ src/components/ui/Input.test.jsx (10 tests)
✓ src/pages/LoginPage.test.jsx (9 tests)
✓ src/services/api.service.test.js (6 tests)

Test Files  4 passed (4)
     Tests  35 passed (35)
```

### 5. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

**Saída esperada:**
```
VITE v7.1.7  ready in 320 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### 6. Acessar a Aplicação

Abra seu navegador e acesse:

```
http://localhost:5173
```

Você deverá ver a tela de login do RM Login! 🎉

## 📂 Estrutura do Projeto

Após a instalação, você terá a seguinte estrutura:

```
rm_login/
├── .github/
│   └── workflows/          # Workflows do GitHub Actions
│       ├── ci.yml          # Pipeline de CI
│       └── deploy.yml      # Pipeline de deploy
├── node_modules/           # Dependências (não commitar)
├── public/                 # Arquivos públicos
├── src/
│   ├── components/
│   │   └── ui/             # Componentes reutilizáveis
│   │       ├── Button.jsx
│   │       ├── Button.test.jsx
│   │       ├── Input.jsx
│   │       └── Input.test.jsx
│   ├── config/
│   │   └── api.config.js   # Configuração de endpoints
│   ├── pages/
│   │   ├── LoginPage.jsx   # Página de login
│   │   └── LoginPage.test.jsx
│   ├── services/
│   │   ├── api.service.js  # Serviço de API
│   │   └── api.service.test.js
│   ├── test/
│   │   └── setup.js        # Setup de testes
│   ├── utils/
│   │   └── cn.js           # Utilitários
│   ├── App.jsx             # Componente raiz
│   ├── index.css           # Estilos globais
│   └── main.jsx            # Ponto de entrada
├── .env.example            # Exemplo de variáveis
├── .env.local              # Suas variáveis (não commitar)
├── .eslintrc.cjs           # Configuração ESLint
├── .gitignore              # Arquivos ignorados
├── .prettierrc             # Configuração Prettier
├── CI_CD.md                # Guia de CI/CD
├── CONTRIBUTING.md         # Guia de contribuição
├── INSTALACAO.md           # Este arquivo
├── LICENSE                 # Licença MIT
├── package.json            # Dependências e scripts
├── README.md               # Documentação principal
├── TESTING.md              # Guia de testes
├── tailwind.config.js      # Configuração Tailwind
├── vite.config.js          # Configuração Vite
└── vitest.config.js        # Configuração Vitest
```

## 🔧 Scripts Disponíveis

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar em: http://localhost:5173
```

### Build

```bash
# Criar build de produção
npm run build

# Pré-visualizar build
npm run preview
```

### Testes

```bash
# Executar todos os testes
npm run test

# Testes em modo watch
npm run test:watch

# Interface gráfica de testes
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage
```

### Qualidade de Código

```bash
# Verificar código com ESLint
npm run lint

# Corrigir automaticamente
npm run lint:fix
```

## 🐛 Solução de Problemas

### Erro: "Cannot find module"

**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 5173 already in use"

**Solução:**
```bash
# Parar processo na porta 5173
# Linux/Mac:
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Erro: "EACCES: permission denied"

**Solução (Linux/Mac):**
```bash
sudo chown -R $(whoami) ~/.npm
```

### Testes falhando

**Solução:**
```bash
# Limpar cache do Vitest
npm run test -- --clearCache

# Executar novamente
npm run test
```

### Build falhando

**Verificar:**
1. Todos os testes passam? `npm run test`
2. Lint passa? `npm run lint`
3. Dependências instaladas? `npm install`

## 📱 Testando a Aplicação

### 1. Testar Interface

1. Acesse `http://localhost:5173`
2. Verifique se a tela de login carrega
3. Teste validações de formulário

### 2. Testar Autenticação

1. Digite um usuário válido
2. Digite uma senha (mínimo 3 caracteres)
3. Clique em "Entrar"
4. Verifique mensagens de erro/sucesso

### 3. Testar Componentes

```bash
# Executar testes
npm run test

# Ver cobertura
npm run test:coverage
```

## 🚀 Próximos Passos

Após instalação bem-sucedida:

1. **Explorar o código**
   - Leia `README.md` para visão geral
   - Veja `TESTING.md` para testes
   - Consulte `CI_CD.md` para automação

2. **Personalizar**
   - Ajuste cores em `tailwind.config.js`
   - Modifique componentes em `src/components/`
   - Adicione novas páginas em `src/pages/`

3. **Contribuir**
   - Leia `CONTRIBUTING.md`
   - Crie uma branch para suas mudanças
   - Envie um Pull Request

## 📞 Suporte

### Problemas Comuns

- **Documentação**: Leia `README.md`, `TESTING.md`, `CI_CD.md`
- **Issues**: Abra uma issue no GitHub
- **Comunidade**: Participe das discussões

### Recursos Úteis

- [Documentação React](https://react.dev/)
- [Documentação Vite](https://vitejs.dev/)
- [Documentação Vitest](https://vitest.dev/)
- [Documentação Tailwind CSS](https://tailwindcss.com/)
- [TOTVS Identity Docs](https://tdn.totvs.com/)

## ✅ Checklist de Instalação

- [ ] Node.js 16+ instalado
- [ ] npm funcionando
- [ ] Projeto baixado/clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env.local` configurado
- [ ] Testes passando (`npm run test`)
- [ ] Servidor rodando (`npm run dev`)
- [ ] Aplicação acessível em `http://localhost:5173`

---

**Instalação completa! Bom desenvolvimento! 🎉**

Se encontrar problemas, consulte a seção de Solução de Problemas ou abra uma issue no GitHub.

# RM Login - Sistema de Autenticação TOTVS Identity

[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0+-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Sistema moderno de autenticação integrado com a API do TOTVS RM. Desenvolvido com React, Tailwind CSS e shadcn/ui.

## 🌟 Características

- **Autenticação Segura**: Integração com TOTVS Identity usando OAuth2
- **Interface Moderna**: Design responsivo com Tailwind CSS e shadcn/ui
- **Validação de Formulário**: Validação em tempo real com mensagens de erro claras
- **Gerenciamento de Tokens**: Armazenamento seguro de tokens de autenticação
- **Configuração Centralizada**: Arquivo de configuração para gerenciar endpoints da API
- **Escalável**: Arquitetura preparada para futuras funcionalidades como dashboard
- **Documentação em PT-BR**: Código e documentação totalmente em português

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 16.0 ou superior
- npm ou yarn

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/rm_login.git
cd rm_login
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env.local
```

4. Edite o arquivo `.env.local` com suas credenciais do TOTVS Identity:

```env
REACT_APP_API_BASE_URL=https://identity.totvs.com.br
REACT_APP_OAUTH2_CLIENT_ID=seu_client_id
REACT_APP_OAUTH2_CLIENT_SECRET=seu_client_secret
REACT_APP_REDIRECT_URI=http://localhost:5173/callback
```

5. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
rm_login/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── Button.jsx        # Componente de botão reutilizável
│   │       └── Input.jsx         # Componente de input reutilizável
│   ├── config/
│   │   └── api.config.js         # Configuração centralizada de endpoints
│   ├── pages/
│   │   └── LoginPage.jsx         # Página principal de login
│   ├── services/
│   │   └── api.service.js        # Serviço de requisições HTTP
│   ├── utils/
│   │   └── cn.js                 # Utilitário para concatenar classes CSS
│   ├── App.jsx                   # Componente raiz da aplicação
│   ├── index.css                 # Estilos globais com Tailwind CSS
│   └── main.jsx                  # Ponto de entrada da aplicação
├── .env.example                  # Exemplo de variáveis de ambiente
├── .env.local                    # Variáveis de ambiente locais (não commitar)
├── .gitignore                    # Arquivos ignorados pelo Git
├── package.json                  # Dependências do projeto
├── tailwind.config.js            # Configuração do Tailwind CSS
├── postcss.config.js             # Configuração do PostCSS
├── vite.config.js                # Configuração do Vite
└── README.md                     # Este arquivo
```

## 🔧 Configuração da API

O arquivo `src/config/api.config.js` centraliza todas as configurações de endpoints da API. Modifique conforme necessário:

```javascript
const API_CONFIG = {
  BASE_URL: 'https://identity.totvs.com.br',
  AUTH: {
    LOGIN: '/api/oauth2/token',
    LOGOUT: '/api/oauth2/revoke',
    USER_INFO: '/api/oauth2/userinfo',
  },
  OAUTH2: {
    CLIENT_ID: 'seu_client_id',
    GRANT_TYPE: 'password',
    SCOPE: 'openid profile email',
  },
};
```

## 📚 Documentação da API

### Serviço de Autenticação (`src/services/api.service.js`)

#### `loginUser(username, password)`

Realiza login com credenciais de usuário.

```javascript
import { loginUser } from './services/api.service';

try {
  const response = await loginUser('usuario@email.com', 'senha123');
  console.log('Token de acesso:', response.access_token);
} catch (error) {
  console.error('Erro ao fazer login:', error);
}
```

#### `logoutUser()`

Realiza logout do usuário.

```javascript
import { logoutUser } from './services/api.service';

try {
  await logoutUser();
  console.log('Logout realizado com sucesso');
} catch (error) {
  console.error('Erro ao fazer logout:', error);
}
```

#### `getUserInfo()`

Obtém informações do usuário autenticado.

```javascript
import { getUserInfo } from './services/api.service';

try {
  const userInfo = await getUserInfo();
  console.log('Informações do usuário:', userInfo);
} catch (error) {
  console.error('Erro ao obter informações:', error);
}
```

#### `validateToken(token)`

Valida um token de acesso.

```javascript
import { validateToken } from './services/api.service';

try {
  const result = await validateToken('seu_token_aqui');
  console.log('Token válido:', result.active);
} catch (error) {
  console.error('Erro ao validar token:', error);
}
```

#### `refreshAccessToken()`

Renova o token de acesso usando refresh token.

```javascript
import { refreshAccessToken } from './services/api.service';

try {
  const newToken = await refreshAccessToken();
  console.log('Novo token:', newToken.access_token);
} catch (error) {
  console.error('Erro ao renovar token:', error);
}
```

## 🎎 Componentes UI

### Button

Botão reutilizável com múltiplas variantes.

```jsx
import Button from './components/ui/Button';

<Button variant="primary" size="lg" onClick={handleClick}>
  Clique aqui
</Button>
```

**Variantes**: `primary`, `secondary`, `outline`, `ghost`, `danger`
**Tamanhos**: `sm`, `md`, `lg`, `xl`

### Input

Campo de entrada com validação integrada.

```jsx
import Input from './components/ui/Input';
import { Mail } from 'lucide-react';

<Input
  type="email"
  placeholder="seu@email.com"
  icon={Mail}
  error={emailError}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

## 🔐 Segurança

- **Tokens Armazenados**: Tokens de acesso são armazenados no `localStorage`
- **Interceptadores**: Requisições HTTP incluem automaticamente o token de autorização
- **Tratamento de Erros**: Erros 401 (não autorizado) disparam logout automático
- **Variáveis de Ambiente**: Credenciais sensíveis são gerenciadas via `.env.local`

## 📦 Dependências Principais

- **React 18**: Framework JavaScript para construir interfaces
- **Vite**: Build tool moderno e rápido
- **Tailwind CSS**: Framework CSS utilitário
- **Axios**: Cliente HTTP para requisições
- **Lucide React**: Ícones SVG de alta qualidade
- **class-variance-authority**: Gerenciamento de variantes de componentes

## 🚀 Scripts Disponíveis

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Fazer build para produção
npm run build

# Pré-visualizar build de produção
npm run preview

# Lint do código (se configurado)
npm run lint
```

## 🌐 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|----------|
| `REACT_APP_API_BASE_URL` | URL base da API TOTVS Identity | `https://identity.totvs.com.br` |
| `REACT_APP_OAUTH2_CLIENT_ID` | Client ID da aplicação | `seu_client_id` |
| `REACT_APP_OAUTH2_CLIENT_SECRET` | Client Secret da aplicação | `seu_client_secret` |
| `REACT_APP_REDIRECT_URI` | URL de redirecionamento após login | `http://localhost:5173/callback` |
| `NODE_ENV` | Ambiente de execução | `development` ou `production` |

## 🔄 Fluxo de Autenticação

1. Usuário insere email e senha na tela de login
2. Validação de formulário em tempo real
3. Requisição POST para `/api/oauth2/token` com credenciais
4. API retorna `access_token` e `refresh_token`
5. Tokens são armazenados no `localStorage`
6. Usuário é redirecionado para o dashboard (futuro)
7. Requisições subsequentes incluem o token no header `Authorization`

## 📝 Próximas Funcionalidades

- [ ] Dashboard com painel de controle
- [ ] Gerenciamento de perfil de usuário
- [ ] Autenticação de dois fatores (2FA)
- [ ] Recuperação de senha
- [ ] Integração com mais provedores OAuth2
- [ ] Testes unitários e E2E
- [ ] Documentação de API com Swagger

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- **RM Login Team** - Desenvolvimento inicial

## 💬 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do email de suporte.

## 🙏 Agradecimentos

- TOTVS pela API de Identity
- Comunidade React
- Tailwind CSS
- shadcn/ui

---

**Desenvolvido com ❤️ para a comunidade open source**

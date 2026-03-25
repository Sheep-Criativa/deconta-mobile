---
name: deconta-identidade-visual
description: Manual completo de identidade visual da DeConta para desenvolvimento mobile (React Native / Expo). Use esta skill sempre que for criar, modificar ou revisar qualquer tela, componente ou estilo do app deconta-mobile. Ela define cores, tipografia, bordas, espaçamentos, componentes e assets oficiais da marca.
---

# DeConta — Manual de Identidade Visual
> Guia de Referência para o Desenvolvimento Mobile (React Native / Expo)

---

## ⚠️ IMPORTANTE
Este documento é o guia oficial de identidade visual da DeConta. **Toda implementação mobile deve seguir rigorosamente estas diretrizes** para garantir consistência com a versão web.

---

## 1. Marca

### 1.1 Logotipo — Variações e Uso no Mobile

| Variação | Arquivo | Quando usar no mobile |
|---|---|---|
| Horizontal preta | `logohorizontal.png` | Splash screen / onboarding em fundo branco |
| Símbolo amarelo | `simbolo.png` | App icon, favicon, loading screen |
| Símbolo + texto | `simbolo-logo.png` | Header / Navbar da app mobile |
| Vertical branco | `logoverticalbranco.png` | Telas de Login/Register sobre imagem de fundo |

Todos os assets estão em: `assets/img-deconta/`

### 1.2 Anatomia do Símbolo
- **Fundo:** Quadrado com bordas arredondadas (~28px)
- **Mão/cursor:** Ícone branco — representa controle e toque digital
- **Círculo:** Bolinha branca — simula a ponta do dedo / interação tátil
- **Cor do fundo:** Amarelo âmbar `#F5C518` / `#FCC419`

> 💡 O símbolo comunica "controle financeiro na ponta dos dedos".

---

## 2. Paleta de Cores

### 2.1 Cores Primárias (CTA / Positivo)

| Nome | Hex | Uso |
|---|---|---|
| Emerald 500 | `#10b981` | ✅ CTA principal, receitas, ações positivas, botão primário |
| Emerald 600 | `#059669` | Hover de botões primários, links |
| Emerald 50 | `#ecfdf5` | Backgrounds sutis de receita, badges positivos |
| Emerald 100 | `#d1fae5` | Avatar fallback background |
| Emerald 700 | `#047857` | Text color sobre fundo claro |

```js
// Tokens principais React Native
const COLORS = {
  primary: '#10b981',       // emerald-500
  primaryDark: '#059669',   // emerald-600
  primaryLight: '#ecfdf5',  // emerald-50
};
```

### 2.2 Cores do Logotipo

| Nome | Hex | Uso |
|---|---|---|
| Amarelo DeConta | `#FCC419` / `#F5C518` | Símbolo/ícone da logo, app icon |
| Preto Logo | `#1a1a1a` / `#111` | Texto "DeConta" e fundo símbolo na versão preta |

### 2.3 Cores Neutras (Escala Zinc)

| Token | Hex | Uso |
|---|---|---|
| zinc-900 | `#18181b` | Títulos principais, texto pesado |
| zinc-800 | `#27272a` | Labels, texto de formulário |
| zinc-700 | `#3f3f46` | Texto secundário importante |
| zinc-600 | `#52525b` | Legendas, metadados |
| zinc-500 | `#71717a` | Placeholder, subtítulos |
| zinc-400 | `#a1a1aa` | Ícones inativos, bordas suaves |
| zinc-300 | `#d4d4d8` | Bordas de input |
| zinc-200 | `#e4e4e7` | Divisores |
| zinc-100 | `#f4f4f5` | Background de cards, hover states |
| zinc-50 | `#fafafa` | Background geral da página |

### 2.4 Cores Semânticas

| Tipo | Cor | Hex | Uso |
|---|---|---|---|
| Receita / Positivo | Verde | `#10b981` | Valores positivos, badges de entrada |
| Despesa / Negativo | Rosa | `#f43f5e` | Valores negativos, alertas de gasto |
| Atenção / Fechada | Âmbar | `#f59e0b` | Faturas fechadas, avisos |
| Erro / Excluir | Vermelho | `#ef4444` | Erros de formulário, ações destrutivas |
| Informação | Azul | `#3b82f6` | Transferências, informações neutras |
| Roxo / Investimento | Índigo | `#6366f1` | Contas de investimento |
| Rosa / Criativo | Pink | `#ec4899` | Categoria criativa |

### 2.5 Cores de Contas (Account Colors)

```js
const ACCOUNT_COLORS = [
  "#10b981", // emerald — conta 1
  "#6366f1", // indigo  — conta 2
  "#f59e0b", // amber   — conta 3
  "#ef4444", // red     — conta 4
  "#3b82f6", // blue    — conta 5
  "#ec4899", // pink    — conta 6
];
// Uso: ACCOUNT_COLORS[account.id % ACCOUNT_COLORS.length]
```

### 2.6 Fundos Temáticos

| Tela | Background |
|---|---|
| Login / Register | `ceu1.png` (céu azul) + overlay glassmorphism |
| Dashboard | Branco `#ffffff` |
| Cards | Branco com `borderColor: '#f4f4f5'` |

---

## 3. Tipografia

### 3.1 Família de Fontes

**Poppins** é a fonte oficial da DeConta.

```bash
# Instalação no Expo
npx expo install @expo-google-fonts/poppins expo-font
```

```js
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';
```

### 3.2 Escala Tipográfica Mobile

| Elemento | Tamanho | Peso | Cor |
|---|---|---|---|
| H1 — Título de página | 24px | 600 (semibold) | `#18181b` |
| H2 — KPI / Valor | 24px | 700 (bold) | `#18181b` |
| H3 — Cabeçalho de card | 14px | 700 (bold) | `#18181b` |
| Body / Parágrafo | 14px | 400 (regular) | `#71717a` |
| Label de formulário | 14px | 600 (semibold) | `#27272a` |
| Caption / Legenda | 12px | 500 (medium) | `#a1a1aa` |
| Micro-label (KPI title) | 10px | 900 (black) | `#a1a1aa` |
| Erro de formulário | 14px | 400 (regular) | `#ef4444` |

### 3.3 Padrões de Texto Especiais

```js
// Label de KPI (ex: "SALDO TOTAL")
{
  fontSize: 10,
  fontWeight: '900',
  textTransform: 'uppercase',
  letterSpacing: 2,
  color: '#a1a1aa',
}

// Valor monetário grande
{
  fontSize: 24,
  fontWeight: '700',
  letterSpacing: -0.5,
  color: '#18181b',
}
```

---

## 4. Formas e Geometria

### 4.1 Raios de Borda (Border Radius)

| Elemento | Raio |
|---|---|
| Cards principais | 24px |
| Mini cards de conta | 16px |
| Botões primários | 8px |
| Inputs | 8px |
| Badges / chips / Avatar | 9999px |
| Ícone de categoria | 12px |
| Card de crédito | 32px |
| Cartão de login | 32px |

> ⚠️ **Princípio:** A DeConta usa bordas arredondadas generosas. Nunca use cantos retos em elementos de UI.

### 4.2 Sombras

| Nível | Uso |
|---|---|
| Nenhuma | Cards internos, itens de lista |
| Suave (`elevation: 2`) | Sidebar, dropdown trigger |
| Média (`elevation: 4`) | Mini cards de conta |
| Grande (`elevation: 12`) | Card de login |
| Colorida emerald | Botão primário CTA |

```js
// Sombra colorida no botão primário
shadowColor: '#10b981',
shadowOffset: { width: 0, height: 8 },
shadowOpacity: 0.3,
shadowRadius: 12,
elevation: 8,
```

---

## 5. Componentes UI — StyleSheet React Native

### 5.1 Botão Primário (CTA)

```js
primaryButton: {
  height: 44,
  backgroundColor: '#10b981',  // emerald-500
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#10b981',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 8,
},
primaryButtonText: {
  color: '#ffffff',
  fontSize: 16,
  fontWeight: '600',
  fontFamily: 'Poppins_600SemiBold',
},
```

### 5.2 Botão de Receita (INCOME)

```js
incomeButton: {
  height: 32,
  paddingHorizontal: 12,
  borderRadius: 8,
  backgroundColor: '#10b981',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},
incomeButtonText: {
  color: '#ffffff',
  fontSize: 12,
  fontWeight: '700',
},
```

### 5.3 Botão de Despesa (EXPENSE)

```js
expenseButton: {
  height: 32,
  paddingHorizontal: 12,
  borderRadius: 8,
  backgroundColor: '#fff1f2',  // rose-50
},
expenseButtonText: {
  color: '#e11d48',  // rose-600
  fontSize: 12,
  fontWeight: '700',
},
```

### 5.4 Card Principal

```js
card: {
  backgroundColor: '#ffffff',
  borderWidth: 1,
  borderColor: '#f4f4f5',  // zinc-100
  borderRadius: 24,
  padding: 20,
  marginBottom: 16,
},
```

### 5.5 Input de Formulário

```js
input: {
  height: 44,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#d4d4d8',    // zinc-300
  backgroundColor: '#ffffff',
  paddingHorizontal: 12,
  fontSize: 14,
  fontFamily: 'Poppins_400Regular',
  color: '#18181b',
},
inputFocused: {
  borderColor: '#18181b',
},
```

### 5.6 Avatar / Initials

```js
avatar: {
  width: 36,
  height: 36,
  borderRadius: 9999,
  backgroundColor: '#d1fae5',  // emerald-100
  alignItems: 'center',
  justifyContent: 'center',
},
avatarText: {
  color: '#065f46',  // emerald-700
  fontWeight: '500',
  fontSize: 14,
},
```

### 5.7 Mini Card de Conta

```js
accountCard: {
  width: 208,
  borderRadius: 16,
  padding: 16,
  overflow: 'hidden',
  // backgroundColor: ACCOUNT_COLORS[index]
},
// Círculo decorativo de glassmorphism
accountCardCircle: {
  position: 'absolute',
  top: -20,
  right: -20,
  width: 96,
  height: 96,
  borderRadius: 9999,
  backgroundColor: 'rgba(255,255,255,0.1)',
},
```

### 5.8 Cartão de Crédito Visual

```js
creditCard: {
  aspectRatio: 1.58,
  borderRadius: 32,
  padding: 32,
  overflow: 'hidden',
  // background: LinearGradient com cor da conta
},
// Glassmorphism superior
creditCardCircleTop: {
  position: 'absolute',
  top: -64,
  right: -64,
  width: 128,
  height: 128,
  borderRadius: 9999,
  backgroundColor: 'rgba(255,255,255,0.1)',
},
// Glassmorphism inferior
creditCardCircleBottom: {
  position: 'absolute',
  bottom: -48,
  left: -48,
  width: 96,
  height: 96,
  borderRadius: 9999,
  backgroundColor: 'rgba(0,0,0,0.1)',
},
```

---

## 6. Ícones

### 6.1 Biblioteca

**lucide-react-native** — todos os ícones da interface.

```bash
npx expo install lucide-react-native
```

### 6.2 Ícones de Navegação Principal

| Tela | Ícone |
|---|---|
| Dashboard | `LayoutDashboard` |
| Contas | `Building` |
| Cartões | `CreditCard` |
| Responsáveis | `Users` |
| Categorias | `Tag` |
| Histórico | `History` |
| Relatórios | `FileText` |

### 6.3 Ícones de Ação / KPI

| Ação | Ícone |
|---|---|
| Saldo total | `Wallet` |
| Receita | `ArrowUpCircle` |
| Despesa | `ArrowDownCircle` |
| Subiu | `ArrowUpRight` |
| Desceu | `ArrowDownRight` |
| Notificações | `Bell` |
| Loading | `Loader2` (com `animate-spin`) |

### 6.4 Tamanhos de Ícones

| Contexto | Tamanho |
|---|---|
| Navegação (bottom tab) | 20px |
| Header actions | 24px |
| KPI card icon | 17px |
| Botão pequeno | 14px |
| Item de lista | 18px |

---

## 7. Espaçamento e Layout

### 7.1 Espaçamentos Comuns

| Valor | Uso |
|---|---|
| 8px | Ícone + texto em botão |
| 12px | Itens internos de card, item de lista |
| 16px | Espaço entre KPI cards |
| 20px | Padding interno de card |
| 24px | Espaço entre seções/cards |
| 28px | Padding horizontal de telas |
| 32px | Padding top após safe area |

### 7.2 Alturas de Elementos Interativos

| Elemento | Altura |
|---|---|
| Input principal | 44px |
| Botão primário | 44px |
| Botão secundário pequeno | 32px |
| Bottom Tab Bar | 60–64px + inset |

---

## 8. Efeitos Visuais

### 8.1 Glassmorphism (Auth Screen)

```js
// Container do formulário de login no mobile
{
  backgroundColor: 'rgba(56, 189, 248, 0.10)',  // sky-400/10
  // Usar BlurView do expo-blur para backdrop
}
```

### 8.2 Fundo da Tela de Auth

No mobile: usar `ImageBackground` com `ceu1.png` + overlay semi-transparente.

```jsx
<ImageBackground
  source={require('../assets/img-deconta/ceu1.png')}
  style={{ flex: 1 }}
  resizeMode="cover"
>
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}>
    {/* conteúdo */}
  </View>
</ImageBackground>
```

---

## 9. Estrutura de Telas

### 9.1 Tela de Autenticação (Login / Register)

```
┌──────────────────────────────────┐
│  [BG: ceu1.png com overlay]      │
│                                  │
│  Logo: simbolo-logo.png (120px)  │
│                                  │
│  H1: "Acesse sua conta"          │
│  Subtitle zinc-500               │
│                                  │
│  Form: Email + Senha             │
│  Botão verde "Comece Agora"      │
│  Google Login                    │
│  Link "Criar conta" verde        │
└──────────────────────────────────┘
```

### 9.2 Bottom Tab Bar (substitui Sidebar)

```
┌──────────────────────────────────────┐
│  🏠    🏦    💳    📋    📊        │
│ Home  Conta Cartão Hist. Rel.       │
└──────────────────────────────────────┘
```

```js
// Item ativo
{
  width: 40,
  height: 40,
  borderRadius: 9999,
  backgroundColor: '#9ca3af',  // gray-400
  alignItems: 'center',
  justifyContent: 'center',
}
// Item inativo — só ícone, cor gray-400
```

---

## 10. Diretrizes Mobile

### 10.1 Safe Areas

```js
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
// Aplicar: paddingTop: insets.top, paddingBottom: insets.bottom
```

### 10.2 Touch Targets

Todos os elementos tocáveis: **mínimo 44×44px**.

### 10.3 Formatação Monetária

```js
// Sempre em pt-BR com 2 casas decimais
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
```

### 10.4 Loading State

```jsx
// Usar ActivityIndicator ou Loader2 (lucide) na cor primary
<ActivityIndicator color="#10b981" />
```

---

## 11. Assets Disponíveis

| Arquivo | Uso sugerido |
|---|---|
| `ceu1.png` | Background das telas de auth |
| `ceuinteiro.png` | Splash screen / onboarding |
| `chaveiro.png` | Tela de onboarding / hero |
| `logohorizontal.png` | Splash screen fundo branco |
| `logoverdical.png` | Splash vertical |
| `logoverticalbranco.png` | Auth screens sobre fundo escuro |
| `simbolo.png` | App icon, loading screen |
| `simbolo-logo.png` | Header / Navbar |

Caminho base: `assets/img-deconta/`

---

## 12. ✅ Checklist de Consistência

Antes de entregar qualquer tela mobile, verifique:

- [ ] Fonte Poppins carregada e aplicada em todos os textos
- [ ] Cor primária `#10b981` nos CTAs e valores positivos
- [ ] Cor de despesa `#f43f5e` em todos os valores negativos
- [ ] `borderRadius` ≥ 16px em todos os cards
- [ ] Touch targets ≥ 44×44px em todos os botões e ícones
- [ ] Cards com `backgroundColor: '#ffffff'` e `borderColor: '#f4f4f5'`
- [ ] Fundo da tela de auth com `ceu1.png`
- [ ] Micro-labels de KPI em uppercase + letterSpacing extra + fontWeight 900
- [ ] Valores monetários formatados em pt-BR com 2 casas decimais
- [ ] Loading state com spinner na cor `#10b981`
- [ ] Safe areas respeitadas (top/bottom insets)
- [ ] Sombra colorida emerald no botão primário

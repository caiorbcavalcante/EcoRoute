# 🌱 EcoRoutes

> Otimização inteligente de rotas para frotas de veículos elétricos.

EcoRoutes é uma aplicação web full-stack que resolve o problema de roteirização de entregas para vans ecológicas, equilibrando a **minimização de distância percorrida** com o **gerenciamento eficiente da autonomia da bateria**.

---

## 📋 Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Algoritmo](#algoritmo)
- [Como Executar](#como-executar)
- [Equipe](#equipe)

---

## Sobre o Projeto

O problema central abordado é a **roteirização de entregas em múltiplos pontos geográficos**, garantindo que o veículo complete todas as entregas e retorne à base sem esgotar a bateria. Quando o nível de carga atinge um limiar crítico, o sistema realiza **desvios dinâmicos e automáticos** para a estação de recarga mais próxima.

---

## Funcionalidades

- 📍 **Inserção de pontos de entrega** — clicando diretamente no mapa (Modo Manual) ou gerando pontos aleatórios
- ⚡ **Rota otimizada** via algoritmo Nearest Neighbor (Vizinho Mais Próximo)
- 📦 **Rota simples** via ordem de inserção (FIFO)
- 🔋 **Gestão de bateria em tempo real** — consumo proporcional à distância percorrida
- 🔌 **Desvio automático para recarga** quando a bateria cai abaixo de 30%
- 🚐 **Animação visual da van** se deslocando pelo trajeto
- 📊 **Painel de monitoramento** com bateria restante, distância percorrida, energia consumida e progresso das entregas
- 🎚️ **Controle de velocidade** da simulação

---

## Tecnologias

### Backend
| Tecnologia | Uso |
|---|---|
| Java | Linguagem principal |
| Spring Boot | Framework web e API REST |
| Armazenamento em memória | Persistência de dados durante a sessão |

### Frontend
| Tecnologia | Uso |
|---|---|
| TypeScript | Linguagem principal |
| Angular | Framework web |
| Chart.js | Renderização do mapa e animações via canvas |

---

## Arquitetura

O sistema segue uma arquitetura cliente-servidor desacoplada:

```
┌─────────────────────────────────┐        ┌──────────────────────────────────┐
│           FRONTEND              │        │            BACKEND               │
│         Angular / TS            │        │        Java / Spring Boot        │
│                                 │        │                                  │
│  ┌──────────────────────────┐   │  POST  │  ┌────────────────────────────┐  │
│  │   Dashboard (Canvas)     │──────────▶│  │   /api/routes/optimize     │  │
│  │   Chart.js Map           │   │        │  │   RouteCalculator          │  │
│  └──────────────────────────┘   │        │  └────────────────────────────┘  │
│                                 │        │                                  │
│  ┌────────────┐  ┌───────────┐  │◀───────│  ┌────────────────────────────┐  │
│  │ Animation  │  │ Battery   │  │  JSON  │  │   RouteResponse            │  │
│  │ Service    │  │ Service   │  │        │  │   (caminho + distância)    │  │
│  └────────────┘  └───────────┘  │        │  └────────────────────────────┘  │
└─────────────────────────────────┘        └──────────────────────────────────┘
```

### Principais Entidades

- **Vehicle** — veículo com bateria máxima, bateria atual e taxa de consumo
- **Depot** — ponto de partida e retorno obrigatório de toda rota
- **Delivery** — ponto de entrega com coordenadas
- **ChargingStation** — estação de recarga com localização e potência
- **Route** — rota completa com caminho, distância total e energia utilizada

---

## Algoritmo

O sistema utiliza a heurística **Gulosa do Vizinho Mais Próximo (Nearest Neighbor)**:

```
1. Parta do Depósito
2. Calcule a distância euclidiana até todos os pontos não visitados
3. Vá para o ponto mais próximo
4. Repita até completar todas as entregas
5. Retorne ao Depósito
```

**Por que Nearest Neighbor?**
O TSP (Travelling Salesman Problem) é NP-Difícil — encontrar a solução ótima para muitos pontos é computacionalmente inviável. O algoritmo guloso oferece respostas em frações de segundo com qualidade de rota satisfatória, ideal para uma aplicação web interativa.

### Lógica de Recarga Dinâmica

Durante a **simulação visual** no frontend, o `BatteryService` monitora continuamente o nível de carga. Ao atingir **< 30%**, o `AnimationService` sobrescreve temporariamente a rota para desviar até a `ChargingStation` mais próxima, retomando o trajeto original após a recarga.

---

## Como Executar

### Pré-requisitos
- Java 17+
- Node.js 18+
- Angular CLI

### Backend

```bash
# Na pasta do backend
cd backend
./mvnw spring-boot:run
```

O servidor estará disponível em `http://localhost:8080`.

### Frontend

```bash
# Na pasta do frontend
cd frontend
npm install
ng serve
```

A aplicação estará disponível em `http://localhost:4200`.

---

## Equipe

Desenvolvido por estudantes da **Universidade Estadual da Paraíba (UEPB)** — Departamento de Computação, na disciplina de **Laboratório de Programação**, sob orientação do Prof. **Thiago Soares Marques**.

| Aluno | Matrícula |
|---|---|
| Caio Victor Rocha Bezerra Cavalcante 
| Lorenzo Donato Rolim 
| Nilo Gonçalves Santos 

---

*Campina Grande – PB · Março de 2026*

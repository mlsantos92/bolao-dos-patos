# 🦆 Bolão dos Patos

App de bolão do **Brasileirão Série A**, feito para um grupo de amigos. Cada participante palpita o placar dos 10 jogos da rodada e escolhe um **jogo da rodada**, que vale o dobro. O app calcula pontos, ranking, rivalidade Gre-Nal e a curva de colocação ao longo das 38 rodadas. Roda no **Firebase** (login com Google e banco Firestore) e pode ser instalado no celular como app.

> **Os dados deste repositório são fictícios.** Sem a configuração de um projeto Firebase, o app abre em modo demonstração, com participantes, palpites e placares gerados pelo `public/demo-firebase.js`.

## Ver a demonstração

Sirva a pasta `public/` (por exemplo, com `npx serve public` ou pelo GitHub Pages) e abra no navegador. Toque em **Entrar com Google** para entrar como a participante fictícia **Ana**, organizadora do bolão, na 31ª rodada. O código de resultados é `RES-DEMO123`. O link **Recomeçar**, no aviso do topo, apaga o que você gravou.

## O que o app faz

| Aba | Para quê |
|---|---|
| **Palpitar** | Placar de cada jogo e a ⭐ do jogo da rodada. Cada palpite fecha no início do jogo e salva sozinho. Jogos adiados aparecem num aviso ⏰ e ficam abertos até o novo horário. |
| **Rodada** | Palpites de todos, revelados só quando cada jogo começa, com pontos, acumulado e posição. 🦆 marca quem não palpitou. |
| **Ranking** | Classificação geral e da "fase beta", líder, vantagem, o 🦆 pato (último colocado), média Gre-Nal e gráfico de colocação rodada a rodada. Participantes de teste aparecem à parte e não contam. |
| **Brasileirão** | Tabela do campeonato calculada pelos resultados e próximos jogos. |
| **Regras** | Pontuação, prazos e onde digitar o código de resultados. |
| **Resultados** | Para quem tem o código: lança ou corrige placares, que aparecem na hora para todos. |
| **Organização** | Só o organizador: links exclusivos de cada participante, quem já entrou (e com qual conta) e o código de resultados. |

### Pontuação

| Acerto | Pontos |
|---|---|
| Placar exato | 9 |
| Vencedor e gols do vencedor | 6 |
| Empate sem placar exato, ou vencedor e gols do perdedor | 5 |
| Vencedor e saldo de gols | 4 |
| Só o vencedor | 3 |
| Errou ou não palpitou (🦆) | 0 |
| ⭐ Jogo da rodada | dobro (placar exato = 18) |

Os pontos da rodada são multiplicados por **(1 + peso)** e arredondados para baixo. O peso sobe 0,05 por rodada (38ª = 1,85), então o fim do campeonato vale mais.

## Como funciona por dentro

- **Página única** (`public/index.html`): HTML, CSS e JavaScript puro, sem framework nem build.
- **Login com Google** pelo Firebase Authentication. Cada participante recebe um **link exclusivo**. No primeiro acesso, o link fica preso à conta Google de quem o abriu (coleção `vinculos`). Depois a pessoa entra só com essa conta.
- **Sigilo garantido pelo servidor** (`firestore.rules`): cada palpite é um documento próprio em `apostas/{jogo}/p/{participante}`. Só o dono grava, e só antes do início do jogo. Os outros só leem depois do início. Nem o organizador vê palpites antes.
- **Resultados**: quem digita o código de resultados ganha o papel de lançar placares (`papeis/{conta}`).
- **Histórico**: as rodadas jogadas antes do app (1 a 28) vêm de uma importação única da planilha antiga.
- **App no celular**: `manifest.webmanifest` e `sw.js` permitem "Adicionar à tela de início" e abrem a casca do app mesmo sem sinal.

## Usar com um projeto Firebase de verdade

1. Crie um projeto no Firebase com **Authentication (Google)** e **Firestore**.
2. Copie `public/firebase-config.example.js` para `public/firebase-config.js` e preencha com a configuração web do projeto. Esse arquivo fica fora do Git.
3. Publique o site e as regras: `npx firebase-tools deploy --only hosting,firestore:rules`.

## Arquivos

```
firebase.json                    configuração do Hosting e das regras
firestore.rules                  regras de segurança: sigilo e prazos
public/index.html                o app
public/firebase.js               usa o Firebase real se houver firebase-config.js; senão, a demonstração
public/demo-firebase.js          Firebase simulado com dados fictícios
public/firebase-config.example.js
public/manifest.webmanifest, sw.js, icon-*.png   instalação no celular
```

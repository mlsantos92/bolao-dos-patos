# 🦆 Bolão dos Patos

App de bolão do **Brasileirão Série A**, feito para um grupo de amigos. Cada participante palpita o placar dos 10 jogos da rodada, escolhe um **jogo da rodada** que vale o dobro, e o app calcula pontos, ranking, rivalidade Gre-Nal e a curva de colocação ao longo das 38 rodadas.

> **Os dados deste repositório são fictícios.** Participantes, palpites e placares são gerados pelo arquivo `demo-db.js` só para mostrar o funcionamento.

## Ver a demonstração

Abra o `index.html` num navegador (ou ative o GitHub Pages neste repositório). A demonstração abre como a participante fictícia **Ana**, na 31ª rodada, com rodadas anteriores já pontuadas. O código de resultados da demonstração é `demo123`.

## O que o app faz

| Aba | Para quê |
|---|---|
| **Palpitar** | Placar de cada jogo e a ⭐ do jogo da rodada. Cada palpite fecha no início do jogo; salva sozinho. Avisa sobre jogos adiados de rodadas anteriores. |
| **Rodada** | Palpites de todos, revelados só quando cada jogo começa, com pontos, acumulado e posição. 🦆 marca quem não palpitou. |
| **Ranking** | Classificação geral e da "fase beta", líder, vantagem, o 🦆 pato (último colocado), média Gre-Nal e gráfico de colocação rodada a rodada. |
| **Brasileirão** | Tabela do campeonato calculada pelos resultados e próximos jogos. |
| **Regras** | Pontuação, prazos e a área para lançar resultados com o código. |
| **Organização** | Só o organizador: links exclusivos de cada participante, quem já entrou e o código de resultados. |

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

- **Um arquivo só** (`index.html`): HTML, CSS e JavaScript puro, sem framework nem build.
- **Banco compartilhado**: no uso real, a página é publicada no Claude (claude.ai), que entrega um banco de dados por `claude.use("db")` e a conta de quem abre por `claude.use("user")`. Fora do Claude, o `demo-db.js` substitui os dois por versões em memória com a mesma interface.
- **Sigilo dos palpites**: cada participante só grava no próprio espaço (`palpites/{conta}`). Os palpites dos outros só aparecem a partir do horário de início de cada jogo.
- **Identidade por link exclusivo**: cada participante recebe um link com um código. O app guarda apenas o hash SHA-256 desse código e, no primeiro acesso, a pessoa assina a própria conta com uma chave ECDSA derivada do link. Assim ninguém palpita no lugar de outro.
- **Resultados automáticos**: uma tarefa agendada busca os placares oficiais durante os jogos (a cada 30 minutos, marcados como "ao vivo") e grava o placar final. Correções entram pelo código de resultados, e o placar oficial sempre prevalece.

## Arquivos

```
index.html   o app
demo-db.js   banco em memória com dados fictícios (só fora do Claude)
```

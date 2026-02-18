

## Plano: Inserir 10 registros na knowledge base da Clara

### O que sera feito
Inserir 10 novos registros na tabela `clara_knowledge_base` usando SQL direto (ferramenta de insert). Os registros cobrem:

1. Lei do Bem (P&D e Inovacao)
2. Holding Patrimonial
3. Cisao de Atividades
4. SUDENE/SUDAM
5. Equiparacao Hospitalar
6. JCP (Juros sobre Capital Proprio)
7. Drawback
8. RET (Construcao Civil)
9. Imunidade Tributaria (Sem Fins Lucrativos)
10. Desoneracao da Folha

### Etapa unica
- Executar o INSERT com os 10 registros usando os dados exatos fornecidos pelo usuario
- Validar que todos os 10 foram inseridos corretamente com uma query de verificacao

### Sobre a coluna `system_prompt` em `clara_agents`
- **Nao sera feita neste momento** -- e uma melhoria valida mas nao prioritaria
- Pode ser implementada em um momento futuro quando houver necessidade de iterar nos prompts dos agentes sem redeploy

### Observacao tecnica
- Os registros nao terao `embedding` preenchido apos a insercao. A busca semantica (RAG via vetor) so funcionara apos rodar o pipeline de geracao de embeddings. A busca por keywords (`trigger_keywords`) funcionara imediatamente.
- Se necessario, podemos rodar a geracao de embeddings como proximo passo.


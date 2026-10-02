# Vértice Consultoria: test scenario data

Last updated: 2026-10-01

Fictional company used to seed the test prototype: 19 collaborators, 5 teams and 7 recursos. All names, CPFs, CNPJs, phones and e-mails are fictitious (CPF and CNPJ have valid check digits). E-mails use the domain verticeconsultoria.com.br. Dates follow the app format (12 Mar 2018). Column names are the interface names in Portuguese, so map them to the real data schema.

## Overview

Vértice Consultoria is a management and operations consultancy for mid-sized companies, founded in 2018, based in São Paulo, with hybrid work. It has about 70 people, but the prototype starts from the first 19 profiles registered on the platform. The interviewee plays Renata Campos, coordinator of RH.

- Reference date of the scenario: 30 Set 2026
- Colaboradores: 13 CLT ativos, 2 PJ ativos, 2 em admissão and 2 em desligamento
- Times: Comercial, Operações, Tecnologia, Financeiro and RH
- Recursos: 3 benefícios, 1 verba and 3 licenças

## Date handling

The platform always uses the real current day, so the scenario cannot keep a fixed date. The dates in the tables below are the reference values for 30 Set 2026. When seeding, treat the reset day as D0 and replace the dates in this table with D0 plus the offset. All other dates (admissions in the past, such as 12 Mar 2018) are historical and stay as written.

| Item | Reference date | Offset from the reset day |
| --- | --- | --- |
| Eduardo Prado: contract signed | 28 Set 2026 | -2 days |
| Eduardo Prado: start | 05 Out 2026 | +5 days |
| Isabela Moura: contract generated | 29 Set 2026 | -1 day |
| Isabela Moura: admission | 19 Out 2026 | +19 days |
| Patrícia Lacerda: vacation start | 14 Set 2026 | -16 days |
| Patrícia Lacerda: vacation end | 03 Out 2026 | +3 days |
| Patrícia Lacerda: return | 05 Out 2026 | +5 days |
| Mariana Duarte: leave start | 03 Ago 2026 | -58 days |
| Mariana Duarte: leave end | 30 Nov 2026 | +61 days |
| Mariana Duarte: return | 01 Dez 2026 | +62 days |
| Beatriz Nogueira: leave start | 28 Set 2026 | -2 days |
| Beatriz Nogueira: leave end | 05 Out 2026 | +5 days |
| Beatriz Nogueira: return | 06 Out 2026 | +6 days |
| Thiago Cavalcanti: contract start (Ativo desde) | 10 Ago 2026 | -51 days |
| Thiago Cavalcanti: contract end | 18 Dez 2026 | +79 days |
| Marcelo Fontes: Ativo desde | 15 Jun 2026 | -107 days |
| Marcelo Fontes: term generated | 28 Set 2026 | -2 days |
| Marcelo Fontes: exit date (fim do contrato) | 16 Out 2026 | +16 days |
| Ricardo Teixeira: exit date and term generated | 25 Set 2026 | -5 days |
| Ricardo Teixeira: TRCT and payment deadline | 05 Out 2026 | +5 days |

## Times

The 5 teams add up to 17 people, and the 2 collaborators in admission have no team yet. Every team is created complete (not pending).

| Time | Líder | Membros | Pessoas |
| --- | --- | --- | --- |
| Comercial | Rodrigo Menezes | Rodrigo Menezes, Patrícia Lacerda, Felipe Andrade, Juliana Tavares | 4 |
| Operações | Carla Bittencourt | Carla Bittencourt, Henrique Souza, Mariana Duarte | 3 |
| Tecnologia | Leonardo Pires | Leonardo Pires, Beatriz Nogueira, Gustavo Ramos, Thiago Cavalcanti, Marcelo Fontes | 5 |
| Financeiro | Sandra Figueiredo | Sandra Figueiredo, Diego Matos, Ricardo Teixeira | 3 |
| RH | Renata Campos | Renata Campos, Lucas Barros | 2 |

Color, icon and description were not decided yet. This is a suggestion, using the 36-color palette (one family per team):

| Time | Cor do ícone | Cor de fundo | Ícone (Phosphor) | Descrição |
| --- | --- | --- | --- | --- |
| Comercial | Azul #1f7cd0 | #eaf3fc | Tag | Prospecta, atende e fecha contratos com clientes de médio porte, da primeira reunião à renovação. |
| Operações | Amarelo #e9a716 | #fdf4e1 | Gear | Conduz a entrega dos projetos de consultoria, garantindo prazo, qualidade e satisfação do cliente. |
| Tecnologia | Roxo #726ce2 | #eef2fe | Code | Cuida dos sistemas internos, da infraestrutura e das soluções de dados usadas nos projetos. |
| Financeiro | Verde #1fb96e | #ecfbf2 | CurrencyCircleDollar | Controla caixa, faturamento, contas a pagar e receber e o orçamento da empresa. |
| RH | Rosa #e94f9b | #fdeaf4 | IdentificationBadge | Cuida da contratação, do desenvolvimento e do bem-estar das pessoas e da administração de pessoal. |

## Colaboradores

The 19 collaborators are 13 CLT ativos, 2 PJ ativos, 2 em admissão and 2 em desligamento.

### CLT ativos: identificação

Team leaders have no "reporta para" (they answer to the board, which is not registered). The others report to their team leader.

| Nome | Time | Cargo | Reporta para | CPF | Telefone | E-mail | Ativo desde |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Rodrigo Menezes | Comercial | Diretor Comercial | Nenhum | 158.813.998-03 | (11) 97722-9380 | rodrigo.menezes@verticeconsultoria.com.br | 12 Mar 2018 |
| Patrícia Lacerda | Comercial | Executiva de Contas | Rodrigo Menezes | 973.091.141-08 | (11) 97841-0188 | patricia.lacerda@verticeconsultoria.com.br | 22 Mar 2021 |
| Felipe Andrade | Comercial | Executivo de Contas | Rodrigo Menezes | 364.556.815-84 | (11) 96367-9133 | felipe.andrade@verticeconsultoria.com.br | 16 Ago 2022 |
| Juliana Tavares | Comercial | Analista de Pré-vendas | Rodrigo Menezes | 729.405.576-91 | (11) 96371-6533 | juliana.tavares@verticeconsultoria.com.br | 20 Jan 2026 |
| Carla Bittencourt | Operações | Gerente de Operações | Nenhum | 689.768.469-40 | (11) 99793-7851 | carla.bittencourt@verticeconsultoria.com.br | 05 Ago 2018 |
| Henrique Souza | Operações | Consultor Sênior | Carla Bittencourt | 932.081.967-09 | (11) 96583-7898 | henrique.souza@verticeconsultoria.com.br | 09 Nov 2020 |
| Mariana Duarte | Operações | Consultora | Carla Bittencourt | 778.486.488-42 | (11) 98860-7846 | mariana.duarte@verticeconsultoria.com.br | 10 Jan 2023 |
| Leonardo Pires | Tecnologia | Coordenador de Tecnologia | Nenhum | 440.029.787-02 | (11) 97474-3274 | leonardo.pires@verticeconsultoria.com.br | 18 Fev 2020 |
| Beatriz Nogueira | Tecnologia | Analista de Dados | Leonardo Pires | 787.680.457-86 | (11) 99755-1611 | beatriz.nogueira@verticeconsultoria.com.br | 13 Mar 2024 |
| Sandra Figueiredo | Financeiro | Gerente Financeira | Nenhum | 908.452.059-94 | (11) 98352-8060 | sandra.figueiredo@verticeconsultoria.com.br | 14 Jan 2019 |
| Diego Matos | Financeiro | Analista Financeiro | Sandra Figueiredo | 792.984.162-61 | (11) 99829-2217 | diego.matos@verticeconsultoria.com.br | 05 Jun 2023 |
| Renata Campos | RH | Coordenadora de RH | Nenhum | 628.360.161-83 | (11) 96210-5685 | renata.campos@verticeconsultoria.com.br | 03 Jun 2019 |
| Lucas Barros | RH | Analista de DP | Renata Campos | 087.547.517-56 | (11) 99886-7644 | lucas.barros@verticeconsultoria.com.br | 02 Set 2024 |

### CLT ativos: remuneração, jornada e dados bancários

The custo para empresa is the salário bruto x 1,7 (encargos), typed by hand in the registration. The jornada comes from the Opy module and is read-only (mocked): everyone has a 1h break, 40h per week and a hybrid regime. All accounts are checking accounts.

| Nome | Salário bruto | Custo para empresa | Jornada | Forma de pagamento | Dados bancários |
| --- | --- | --- | --- | --- | --- |
| Rodrigo Menezes | R$ 22.000 | R$ 37.400 | Seg a Sex, 09h às 18h | Conta bancária | Itaú, Ag 9975, CC 893322-7 |
| Patrícia Lacerda | R$ 9.500 | R$ 16.150 | Seg a Sex, 09h às 18h | Conta bancária | Bradesco, Ag 9032, CC 722390-5 |
| Felipe Andrade | R$ 8.500 | R$ 14.450 | Seg a Sex, 09h às 18h | PIX | CPF 364.556.815-84 |
| Juliana Tavares | R$ 5.500 | R$ 9.350 | Seg a Sex, 09h às 18h | Conta bancária | Nubank, Ag 0001, CC 919351-1 |
| Carla Bittencourt | R$ 16.000 | R$ 27.200 | Seg a Sex, 08h às 17h | Conta bancária | Santander, Ag 9404, CC 553148-0 |
| Henrique Souza | R$ 11.000 | R$ 18.700 | Seg a Sex, 08h às 17h | Conta bancária | Banco do Brasil, Ag 4750, CC 900900-1 |
| Mariana Duarte | R$ 7.500 | R$ 12.750 | Seg a Sex, 08h às 17h | PIX | Telefone (11) 98860-7846 |
| Leonardo Pires | R$ 15.000 | R$ 25.500 | Seg a Sex, 10h às 19h | Conta bancária | Itaú, Ag 5261, CC 736293-7 |
| Beatriz Nogueira | R$ 8.000 | R$ 13.600 | Seg a Sex, 10h às 19h | Conta bancária | Inter, Ag 0001, CC 732818-8 |
| Sandra Figueiredo | R$ 14.500 | R$ 24.650 | Seg a Sex, 09h às 18h | Conta bancária | Bradesco, Ag 3209, CC 582316-3 |
| Diego Matos | R$ 5.800 | R$ 9.860 | Seg a Sex, 09h às 18h | Conta bancária | Caixa, Ag 6013, CC 542364-6 |
| Renata Campos | R$ 10.500 | R$ 17.850 | Seg a Sex, 09h às 18h | Conta bancária | Santander, Ag 6790, CC 989940-0 |
| Lucas Barros | R$ 4.800 | R$ 8.160 | Seg a Sex, 09h às 18h | PIX | CPF 087.547.517-56 |

### PJ ativos

The 2 PJ are in the Tecnologia team. They have no salário bruto, custo para empresa or jornada: they have contract value and payment type. They have different payment types on purpose, to test the "/mês" suffix and the fixed value with no suffix.

| Campo | Gustavo Ramos | Thiago Cavalcanti |
| --- | --- | --- |
| Tipo | PJ fixo | PJ temporário |
| Time | Tecnologia | Tecnologia |
| Cargo | Desenvolvedor Backend | Consultor de BI |
| Reporta para | Leonardo Pires | Leonardo Pires |
| CNPJ | 47.267.147/0001-06 | 27.010.798/0001-09 |
| Razão social | GR Tecnologia da Informação Ltda | TC Consultoria em Dados Ltda |
| Telefone | (11) 97516-1583 | (11) 99818-1360 |
| E-mail | gustavo.ramos@verticeconsultoria.com.br | thiago.cavalcanti@verticeconsultoria.com.br |
| Ativo desde (início do contrato) | 15 Mai 2025 | 10 Ago 2026 |
| Pagamento e valor | Mensal, R$ 13.000/mês | Valor fixo, R$ 48.000 |
| Fim do contrato | Sem data de fim | 18 Dez 2026 |
| Forma de pagamento | PIX | Conta bancária |
| Dados bancários | Chave CNPJ 47.267.147/0001-06 | Inter PJ, Ag 0001, CC 269876-1 |

### Em admissão

Isabela is at the start of the process, with all checklist items open, and Eduardo already signed the contract and only needs the registration completed. Eduardo shows as Em atividade even before starting (5 days ahead), because the contract is already signed.

| Campo | Isabela Moura | Eduardo Prado |
| --- | --- | --- |
| Situação | Processo no início, com todas as pendências | Processo adiantado, sem pendências |
| Status na tabela | Pendente 3/3 | Em atividade + ícone de alerta |
| Tipo | CLT | PJ fixo |
| Cargo | Consultora | Desenvolvedor Frontend |
| Time | Sem time | Sem time |
| Reporta para | Não definido | Não definido |
| Documento | CPF 620.966.542-03 | CNPJ 07.229.710/0001-37 |
| Razão social | Não se aplica | EP Desenvolvimento de Software Ltda |
| Telefone | (11) 98111-8087 | (11) 96519-8286 |
| Nascimento | 14 Mai 1994 | Não se aplica |
| Admissão ou início | 19 Out 2026 | 05 Out 2026 |
| Remuneração | Salário bruto R$ 7.500 e custo para empresa R$ 12.750 | Mensal, R$ 11.500/mês, sem data de fim |
| Jornada | Seg a Sex, 08h às 17h | Não se aplica |
| Contrato | Gerado em 29 Set 2026 e enviado para assinatura | Assinado em 28 Set 2026 |
| Pendências | Contrato assinado, documentos enviados, exame admissional | Nenhuma |
| Falta completar | Time, reporta para, e-mail, benefícios, dados bancários | Time, reporta para, e-mail, dados bancários |

The alert icon on Eduardo indicates an incomplete registration and leads to the list of what is missing. PJ does not receive benefits, so his list has no benefits step.

### Em desligamento

Ricardo (CLT) left without cause, with an indemnified notice, and has 5 days to receive the TRCT. Marcelo (PJ) has a contract that is ending. In both, the profile is locked for editing and shows the offboarding icon.

| Campo | Ricardo Teixeira | Marcelo Fontes |
| --- | --- | --- |
| Tipo | CLT | PJ temporário |
| Time e cargo | Financeiro, Assistente Financeiro | Tecnologia, Analista de QA |
| Reporta para | Sandra Figueiredo | Leonardo Pires |
| Status na tabela | Rescisão pendente 4/6 + ícone de desligamento | Rescisão pendente 2/3 + ícone de desligamento |
| Documento | CPF 377.594.580-61 | CNPJ 41.115.109/0001-51 |
| Razão social | Não se aplica | MF Qualidade de Software Ltda |
| Telefone | (11) 99779-7302 | (11) 97385-4704 |
| E-mail | ricardo.teixeira@verticeconsultoria.com.br | marcelo.fontes@verticeconsultoria.com.br |
| Ativo desde | 14 Mar 2023 | 15 Jun 2026 |
| Remuneração | Salário bruto R$ 4.200 e custo para empresa R$ 7.140 | Mensal, R$ 9.000/mês |
| Fim do contrato | Não se aplica | 16 Out 2026 |
| Jornada | Seg a Sex, 09h às 18h | Não se aplica |
| Forma de pagamento | Conta bancária | Conta bancária |
| Dados bancários | Bradesco, Ag 9966, CC 508516-9 | Nubank PJ, Ag 0001, CC 712851-4 |
| Tipo de rescisão | Sem justa causa | Fim de contrato |
| Aviso prévio | Indenizado, 39 dias (30 + 3 por ano completo) | Não se aplica |
| Data do desligamento | 25 Set 2026 | 16 Out 2026 |
| Motivo | Reestruturação da área financeira | Contrato do projeto chega ao fim |
| Termo | Gerado e enviado em 25 Set 2026 | Gerado e enviado em 28 Set 2026 |
| Checklist feito | Extrato do FGTS enviado, exame demissional realizado | Termo de encerramento enviado |
| Checklist pendente | TRCT, guia de saque do FGTS, requerimento do seguro-desemprego, termo assinado | Termo assinado e devolvido, última nota fiscal |
| Prazo | TRCT e pagamento até 05 Out 2026 (10 dias corridos) | Não há prazo legal |
| Recursos que recebe | Plano de Saúde R$ 520, Vale Alimentação R$ 900, Power BI Pro R$ 60, Microsoft 365 R$ 75 | Microsoft 365 R$ 75 |

Rescisão pendente counts what is missing in the checklist (4 of 6 and 2 of 3). When it reaches zero, Ricardo becomes Desligado and Marcelo becomes Fim de contrato. Until then, both keep receiving the linked recursos.

### Ausências

The 3 absences show as an icon beside the status, and the 3 people keep the status Em atividade. This data comes from the Opy module (Escala).

| Colaborador | Time e cargo | Situação | Período | Retorno | Na tabela |
| --- | --- | --- | --- | --- | --- |
| Patrícia Lacerda | Comercial, Executiva de Contas | Férias | 14 Set a 03 Out 2026 (20 dias), saldo de 10 dias para tirar depois | 05 Out 2026 | Em atividade + ícone de férias |
| Mariana Duarte | Operações, Consultora | Licença maternidade | 03 Ago a 30 Nov 2026 (120 dias) | 01 Dez 2026 | Em atividade + ícone de licença maternidade/paternidade |
| Beatriz Nogueira | Tecnologia, Analista de Dados | Licença médica | 28 Set a 05 Out 2026 (atestado de 8 dias) | 06 Out 2026 | Em atividade + ícone de licença médica |

### Estado final da tabela

The Colaboradores table opens with 19 rows: 1 Pendente, 2 Rescisão pendente, 16 Em atividade and none Desligado (the offboarding of Ricardo and Marcelo is completed during the test). The suggested order puts the 4 people in admission or offboarding on top, as in the design, and groups the others by team.

| Nome | Time | Cargo | Tipo | Status | Ícones |
| --- | --- | --- | --- | --- | --- |
| Isabela Moura | - | Consultora | CLT | Pendente 3/3 | Nenhum |
| Eduardo Prado | - | Desenvolvedor Frontend | PJ | Em atividade | Alerta |
| Ricardo Teixeira | Financeiro | Assistente Financeiro | CLT | Rescisão pendente 4/6 | Desligamento |
| Marcelo Fontes | Tecnologia | Analista de QA | PJ | Rescisão pendente 2/3 | Desligamento |
| Rodrigo Menezes | Comercial | Diretor Comercial | CLT | Em atividade | Nenhum |
| Patrícia Lacerda | Comercial | Executiva de Contas | CLT | Em atividade | Férias |
| Felipe Andrade | Comercial | Executivo de Contas | CLT | Em atividade | Nenhum |
| Juliana Tavares | Comercial | Analista de Pré-vendas | CLT | Em atividade | Nenhum |
| Carla Bittencourt | Operações | Gerente de Operações | CLT | Em atividade | Nenhum |
| Henrique Souza | Operações | Consultor Sênior | CLT | Em atividade | Nenhum |
| Mariana Duarte | Operações | Consultora | CLT | Em atividade | Licença maternidade/paternidade |
| Leonardo Pires | Tecnologia | Coordenador de Tecnologia | CLT | Em atividade | Nenhum |
| Beatriz Nogueira | Tecnologia | Analista de Dados | CLT | Em atividade | Licença médica |
| Gustavo Ramos | Tecnologia | Desenvolvedor Backend | PJ | Em atividade | Nenhum |
| Thiago Cavalcanti | Tecnologia | Consultor de BI | PJ | Em atividade | Nenhum |
| Sandra Figueiredo | Financeiro | Gerente Financeira | CLT | Em atividade | Nenhum |
| Diego Matos | Financeiro | Analista Financeiro | CLT | Em atividade | Nenhum |
| Renata Campos | RH | Coordenadora de RH | CLT | Em atividade | Nenhum |
| Lucas Barros | RH | Analista de DP | CLT | Em atividade | Nenhum |

## Recursos

The 7 recursos cover 3 benefícios, 1 verba and 3 licenças. Fourteen people receive benefits, and the 2 in admission only get Microsoft 365, because it is for the whole company. PJ collaborators only receive licenças.

The links are live: teams and people are stored as the source, and who receives is resolved on the spot (see the resolved beneficiaries table).

| Recurso | Tipo | Fornecedor | Valores | Fontes de vínculo | Pessoas | Custo total |
| --- | --- | --- | --- | --- | --- | --- |
| Plano de Saúde | Benefício (Plano de Saúde) | Alice | R$ 780 (líderes) e R$ 520 (demais) | Times Comercial, Operações, Financeiro e RH, mais as pessoas Leonardo Pires e Beatriz Nogueira | 14 | R$ 8.580 |
| Vale Alimentação | Benefício (Vale Alimentação) | Caju | R$ 900 (valor único) | As mesmas fontes do Plano de Saúde | 14 | R$ 12.600 |
| Bem-Estar | Benefício (Bem-Estar) | Wellhub | R$ 150 (valor único) | Times Comercial e Operações | 7 | R$ 1.050 |
| Verba de Treinamento | Verba | Sem fornecedor | R$ 1.200 (valor único) | Pessoas Beatriz Nogueira, Henrique Souza e Juliana Tavares | 3 | R$ 3.600 |
| Microsoft 365 | Licença | Microsoft | R$ 75 por assento | Toda a empresa | 19 | R$ 1.425 |
| HubSpot CRM | Licença | HubSpot | R$ 220 por assento | Time Comercial | 4 | R$ 880 |
| Power BI Pro | Licença | Microsoft | R$ 60 por assento | Time Financeiro, mais as pessoas Beatriz Nogueira e Thiago Cavalcanti | 5 | R$ 300 |

### Beneficiários resolvidos

Recursos with a single value apply that value to all beneficiaries, with no individual assignment. Only Plano de Saúde has two variants, and both are fully assigned.

| Recurso | Valor | Pessoas |
| --- | --- | --- |
| Plano de Saúde | R$ 780 | Rodrigo Menezes, Carla Bittencourt, Leonardo Pires, Sandra Figueiredo, Renata Campos (5) |
| Plano de Saúde | R$ 520 | Patrícia Lacerda, Felipe Andrade, Juliana Tavares, Henrique Souza, Mariana Duarte, Beatriz Nogueira, Diego Matos, Lucas Barros, Ricardo Teixeira (9) |
| Vale Alimentação | R$ 900 | As mesmas 14 pessoas do Plano de Saúde |
| Bem-Estar | R$ 150 | Rodrigo Menezes, Patrícia Lacerda, Felipe Andrade, Juliana Tavares, Carla Bittencourt, Henrique Souza, Mariana Duarte (7) |
| Verba de Treinamento | R$ 1.200 | Beatriz Nogueira, Henrique Souza, Juliana Tavares (3) |
| Microsoft 365 | R$ 75 | Todos os 19 colaboradores |
| HubSpot CRM | R$ 220 | Rodrigo Menezes, Patrícia Lacerda, Felipe Andrade, Juliana Tavares (4) |
| Power BI Pro | R$ 60 | Sandra Figueiredo, Diego Matos, Ricardo Teixeira, Beatriz Nogueira, Thiago Cavalcanti (5) |

The total cost of each recurso is the sum of the assigned values. The current model does not define the period of these values.

## Expected behaviors and assumptions

The prototype must respect the behaviors below, and the items in the second table are assumptions that still need a decision.

### Expected behaviors

- Isabela (Pendente 3/3): when the 3 pending items (contrato assinado, documentos enviados, exame admissional) are completed, the status changes by itself to Em atividade with the alert icon.
- Eduardo (alert): the icon opens the list of what is missing. When time, reporta para, e-mail and dados bancários are filled, the alert goes away.
- Ricardo and Marcelo (Rescisão pendente): the profile is locked and shows the offboarding icon. When the checklist reaches zero (4 and 2 items left), Ricardo becomes Desligado and Marcelo becomes Fim de contrato. Until then, both keep receiving the recursos.
- Team inheritance: if Isabela is placed in Operações, she receives Plano de Saúde on her own (with no assigned value, because the recurso has variants), Vale Alimentação (R$ 900) and Bem-Estar (R$ 150). This tests the "no assigned value" state.
- PJ and inheritance: if Eduardo is placed in Comercial, Operações, Financeiro or RH, he would inherit benefits, which is not normal for a PJ. His natural team is Tecnologia, which has no linked benefit.
- Toda a empresa resolves to the 19 registered collaborators, including the Pendente one, those on vacation or leave, and those in offboarding.
- People on vacation or leave (Patrícia, Mariana, Beatriz) keep receiving the recursos.
- Custo total of a collaborator = custo para empresa (CLT) or valor do contrato (PJ) + the sum of the values of the recursos they receive.

### Assumptions not yet decided

| Item | What this document assumes |
| --- | --- |
| Reporta para | Leaders have nobody; the others report to their team leader |
| Cor, ícone e descrição dos times | The suggestion in the Times table |
| Informações adicionais dos recursos (link, contato e e-mail do fornecedor, data de renovação das licenças) | All empty |
| Tipo de conta bancária | Conta corrente |
| Toda a empresa | 19 people, including the 2 in admission and the 2 in offboarding |
| Colaboradores Desligados no início | None, the offboarding of Ricardo and Marcelo is completed during the test |
| Rótulo do status em desligamento | Rescisão pendente 4/6 and 2/3, counting what is missing; Desligado (CLT) and Fim de contrato (PJ) when completed |
| Time de quem está saindo | Ricardo in Financeiro and Marcelo in Tecnologia, outside the teams with a linked benefit for the PJ |
| Periodicidade dos valores dos recursos | Not defined |
| Foto dos colaboradores | No photo, with the default avatar |
| Notas de colaboradores e times | None |
| Ordem da tabela | The 4 in admission or offboarding on top, then by team |

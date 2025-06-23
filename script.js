document.addEventListener('DOMContentLoaded', () => {
    const avaliacaoForm = document.getElementById('avaliacaoForm');
    const evaluationItemsContainer = document.getElementById('evaluationItems');
    const notaFinalInput = document.getElementById('notaFinal');
    const chronometerDisplay = document.getElementById('chronometer');
    const totalResponsesDisplay = document.getElementById('totalResponses');
    const exportCsvButton = document.getElementById('exportCsvButton');
    const clearDataButton = document.getElementById('clearDataButton');

    const CSV_STORAGE_KEY = 'pecMultiplicaAvaliacoes';
    const PASSWORD = 'Multiplica_2025-2'; // Senha para exportar/zerar

    let startTime;
    let endTime; // Variável para armazenar o tempo de fim
    let chronometerInterval;
    let hasInteracted = false; // Nova flag para controlar a primeira interação
    let inicioPreenchimento = ''; // Variável para armazenar a data e hora de início
    let conclusaoPreenchimento = ''; // Variável para armazenar a data e hora de conclusão

    // Definição dos itens de avaliação com seus pesos
    const evaluationQuestions = [
        { id: 'q1', text: 'Conduz a formação com a câmera aberta e estimula os participantes a adotarem a mesma conduta.', weight: 2 },
        { id: 'q2', text: 'Participa exclusivamente da formação, assegurando esta prática para os demais participantes.', weight: 1 },
        { id: 'q3', text: 'Adota uma postura respeitosa e não-violenta durante a formação e estabelece o mesmo aos demais participantes.', weight: 2 },
        { id: 'q4', text: 'Utiliza as ferramentas digitais de forma eficaz.', weight: 2 },
        { id: 'q5', text: 'Realiza a formação em um ambiente iluminado e com enquadramento adequado de câmera.', weight: 2 },
        { id: 'q6', text: 'O ambiente e os recursos utilizados garantem uma acústica adequada.', weight: 1 },
        { id: 'q7', text: 'Inicia a formação no horário determinado.', weight: 2 },
        { id: 'q8', text: 'Gerencia o tempo de forma que os participantes desenvolvam todas as atividades previstas na Pauta.', weight: 6 },
        { id: 'q9', text: 'Encerra a formação no horário estipulado.', weight: 2 },
        { id: 'q10', text: 'Utiliza estratégias e técnicas que favoreçam a participação de todos.', weight: 4 },
        { id: 'q11', text: 'Estimulados pelo formador, todos os participantes contribuem de alguma forma com a formação e demonstram compromisso com as atividades.', weight: 2 },
        { id: 'q12', text: 'Gerencia o tempo de participação evitando o monopólio da fala por alguns.', weight: 4 },
        { id: 'q13', text: 'As discussões se mantêm produtivas e alinhadas ao objetivo da Pauta, evitando digressões.', weight: 4 },
        { id: 'q14', text: 'Utiliza vocabulário acessível e de fácil compreensão pelos participantes.', weight: 2 },
        { id: 'q15', text: 'Faz perguntas e questionamentos que promovam reflexões e trocas produtivas.', weight: 4 },
        { id: 'q16', text: 'Demonstra domínio do conteúdo proposto na Pauta, por meio de explicações embasadas nas referências.', weight: 4 },
        { id: 'q17', text: 'Promove e estimula exemplos práticos para que conexões com a realidade escolar sejam estabelecidas.', weight: 4 },
        { id: 'q18', text: 'Assegura que a formação aconteça numa sequência lógica e progressiva.', weight: 2 }
    ];

    // Calcula a soma máxima possível dos pesos
    const maxPossibleWeightedScore = evaluationQuestions.reduce((sum, question) => {
        return sum + (question.weight * 5);
    }, 0);

    // Calcula a soma real dos pesos para definir o maxPossibleRawScore dinamicamente
    const newSumOfWeights = evaluationQuestions.reduce((acc, q) => acc + q.weight, 0); 
    const maxPossibleRawScore = newSumOfWeights * 5; // Usa a soma calculada * 5
    // console.log("Soma total dos pesos (calculada):", newSumOfWeights); 
    // console.log("Max Possible Raw Score (calculado):", maxPossibleRawScore); 

    // Função para renderizar os itens de avaliação
    function renderEvaluationItems() {
        evaluationItemsContainer.innerHTML = ''; // Limpa o conteúdo existente
        evaluationQuestions.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('evaluation-item');
            itemDiv.setAttribute('data-question-id', item.id); // Adiciona o ID da pergunta para fácil acesso

            itemDiv.innerHTML = `
                <p>${item.text} <span class="weight-label">(Peso: ${item.weight})</span></p>
                <div class="rating-options">
                    <input type="radio" id="${item.id}-0" name="${item.id}" value="0" data-weight="${item.weight}" required>
                    <label for="${item.id}-0">0</label>

                    <input type="radio" id="${item.id}-1" name="${item.id}" value="1" data-weight="${item.weight}" required>
                    <label for="${item.id}-1">1</label>

                    <input type="radio" id="${item.id}-2" name="${item.id}" value="2" data-weight="${item.weight}" required>
                    <label for="${item.id}-2">2</label>

                    <input type="radio" id="${item.id}-3" name="${item.id}" value="3" data-weight="${item.weight}" required>
                    <label for="${item.id}-3">3</label>

                    <input type="radio" id="${item.id}-4" name="${item.id}" value="4" data-weight="${item.weight}" required>
                    <label for="${item.id}-4">4</label>

                    <input type="radio" id="${item.id}-5" name="${item.id}" value="5" data-weight="${item.weight}" required>
                    <label for="${item.id}-5">5</label>
                </div>
            `;
            evaluationItemsContainer.appendChild(itemDiv);
        });

        // Adiciona listeners para calcular a nota final quando as opções são selecionadas
        evaluationItemsContainer.addEventListener('change', calculateFinalScore);
    }

    // Função para calcular a nota final (normalizada para máximo de 50)
    function calculateFinalScore() {
        let totalScore = 0; // Soma bruta dos pontos x pesos
        evaluationQuestions.forEach(item => {
            const selectedOption = document.querySelector(`input[name="${item.id}"]:checked`);
            if (selectedOption) {
                const score = parseInt(selectedOption.value);
                const weight = parseInt(selectedOption.dataset.weight);
                totalScore += score * weight;
            }
        });

        const desiredMaxScore = 50; // O objetivo é que a nota final seja no máximo 50.

        // Normaliza a nota: (nota_bruta / nota_max_bruta) * nota_max_desejada
        let normalizedScore = (totalScore / maxPossibleRawScore) * desiredMaxScore;
        
        // --- INÍCIO DOS LOGS DE DEPURACÃO ---
        console.log('--- Cálculo da Nota ---');
        console.log('totalScore (soma bruta):', totalScore);
        console.log('maxPossibleRawScore (máx bruto esperado - calculado):', maxPossibleRawScore);
        console.log('normalizedScore (após normalização):', normalizedScore);
        // --- FIM DOS LOGS DE DEPURACÃO ---

        // Arredonda para duas casas decimais e garante que não ultrapasse 50
        const finalRoundedScore = Math.min(Math.round(normalizedScore * 100) / 100, desiredMaxScore);
        
        // CORREÇÃO AQUI: Substituir o ponto por vírgula para exibir
        notaFinalInput.value = finalRoundedScore.toFixed(2).replace('.', ',');

        // --- MAIS LOGS DE DEPURACÃO ---
        console.log('finalRoundedScore (após arredondamento e limite):', finalRoundedScore);
        console.log('notaFinalInput.value (valor final exibido):', notaFinalInput.value);
        console.log('-----------------------');
        // --- FIM DOS LOGS DE DEPURACÃO ---
    }

    // Inicializa o cronômetro
    function startChronometer() {
        if (!chronometerInterval) {
            const now = new Date();
            startTime = now.getTime();
            inicioPreenchimento = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`; // Captura data e hora de início

            chronometerInterval = setInterval(() => {
                const currentNow = new Date().getTime();
                const diff = currentNow - startTime;
                chronometerDisplay.textContent = formatTime(diff);
            }, 1000);
        }
    }

    // Para o cronômetro
    function stopChronometer() {
        if (chronometerInterval) {
            clearInterval(chronometerInterval);
            chronometerInterval = null;
        }
    }

    // Formata o tempo para H:M:S
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (num) => num < 10 ? '0' + num : num;
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    // Carrega o contador de respostas do localStorage
    function loadTotalResponses() {
        const storedData = localStorage.getItem(CSV_STORAGE_KEY);
        if (storedData) {
            const dataArray = JSON.parse(storedData);
            totalResponsesDisplay.textContent = dataArray.length;
        } else {
            totalResponsesDisplay.textContent = 0;
        }
    }

    // Adiciona listener para a primeira interação para iniciar o cronômetro
    avaliacaoForm.addEventListener('change', () => {
        if (!hasInteracted) {
            startChronometer();
            hasInteracted = true;
        }
    }, { once: true }); // Apenas uma vez

    // Lógica de envio do formulário
    avaliacaoForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        stopChronometer(); // Para o cronômetro ao enviar

        let tempoPreenchimento = 'N/A';
        const now = new Date(); // Captura a data e hora de conclusão no momento do envio
        conclusaoPreenchimento = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;

        if (startTime) {
            endTime = now.getTime(); // Define endTime
            tempoPreenchimento = endTime - startTime;
        }

        // Coleta os dados do formulário - CORRIGIDO OS IDs AQUI
        const formData = {
            dataEnvio: now.toLocaleDateString('pt-BR'), // Data de envio
            dataHoraInicioPreenchimento: inicioPreenchimento, // Data e hora de início
            dataHoraConclusaoPreenchimento: conclusaoPreenchimento, // Data e hora de conclusão
            tempoPreenchimento: formatTime(tempoPreenchimento), // Tempo total de preenchimento
            // IDs CORRIGIDOS PARA CORRESPONDER AO HTML
            nomePecPcgeAvaliado: document.getElementById('nomePecPcgeAvaliado').value,
            nomeFormadorAvaliador: document.getElementById('nomeFormadorAvaliador').value,
            diretoriaEnsino: document.getElementById('diretoriaEnsino').value,
            numeroEncontro: document.getElementById('numeroEncontro').value,
            dataAvaliacao: document.getElementById('dataAvaliacao').value,
        };

        evaluationQuestions.forEach(item => {
            const selectedOption = document.querySelector(`input[name="${item.id}"]:checked`);
            formData[item.id] = selectedOption ? selectedOption.value : ''; // Adiciona a resposta de cada pergunta
        });

        formData.combinadosProximoFeedback = document.getElementById('combinadosProximoFeedback').value;
        formData.observacoesNotas = document.getElementById('observacoesNotas').value;
        // Salva a nota no formato original (com ponto) para consistência no armazenamento/exportação CSV
        // A exibição no input já terá a vírgula.
        formData.notaFinal = notaFinalInput.value.replace(',', '.'); // Converte de volta para ponto para salvar/exportar

        // Salva os dados no localStorage
        let savedData = localStorage.getItem(CSV_STORAGE_KEY);
        let dataArray = savedData ? JSON.parse(savedData) : [];
        dataArray.push(formData);
        localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(dataArray));

        loadTotalResponses(); // Atualiza o contador de respostas

        alert('Avaliação enviada com sucesso!');
        avaliacaoForm.reset(); // Limpa o formulário após o envio
        notaFinalInput.value = ''; // Limpa a nota final
        chronometerDisplay.textContent = '00:00:00'; // Reseta o cronômetro
        startTime = null; // Reseta startTime
        endTime = null; // Reseta endTime
        hasInteracted = false; // Reseta a flag de interação
        inicioPreenchimento = '';
        conclusaoPreenchimento = '';
        renderEvaluationItems(); // Renderiza os itens novamente para garantir que os rádios estejam desmarcados corretamente
    });

    // Lógica para o botão de Exportar Dados (CSV)
    exportCsvButton.addEventListener('click', () => {
        const inputPassword = prompt('Por favor, digite a senha para exportar os dados:');
        if (inputPassword === PASSWORD) {
            const savedData = localStorage.getItem(CSV_STORAGE_KEY);
            if (savedData) {
                const dataArray = JSON.parse(savedData);

                // Define as colunas do CSV
                const headers = [
                    'Data de Envio',
                    'Data e Hora Inicio Preenchimento',
                    'Data e Hora Conclusao Preenchimento',
                    'Tempo de Preenchimento',
                    'Nome do PEC/PCG Avaliado', // CORRIGIDO PARA CORRESPONDER AO DADO SALVO
                    'Nome do Formador Avaliador', // CORRIGIDO PARA CORRESPONDER AO DADO SALVO
                    'Diretoria de Ensino', // CORRIGIDO PARA CORRESPONDER AO DADO SALVO
                    'Nº do Encontro Formativo Avaliado', // CORRIGIDO PARA CORRESPONDER AO DADO SALVO
                    'Data da Avaliação', // CORRIGIDO PARA CORRESPONDER AO DADO SALVO
                    ...evaluationQuestions.map(q => `Q${q.id.substring(1)} - ${q.text} (Peso ${q.weight})`), // Adicionado o texto da pergunta
                    'Combinados para o próximo Feedback Formativo', // CORRIGIDO
                    'Observações e notas', // CORRIGIDO
                    'Nota Final'
                ];

                const rows = dataArray.map(row => {
                    const values = [
                        row.dataEnvio,
                        row.dataHoraInicioPreenchimento,
                        row.dataHoraConclusaoPreenchimento,
                        row.tempoPreenchimento,
                        row.nomePecPcgeAvaliado, // CORRIGIDO
                        row.nomeFormadorAvaliador, // CORRIGIDO
                        row.diretoriaEnsino, // CORRIGIDO
                        row.numeroEncontro, // CORRIGIDO
                        row.dataAvaliacao, // CORRIGIDO
                    ];
                    evaluationQuestions.forEach(q => {
                        values.push(row[q.id] || '');
                    });
                    values.push(
                        row.combinadosProximoFeedback,
                        row.observacoesNotas,
                        row.notaFinal 
                    );
                    // Usamos vírgula como delimitador
                    return values.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
                });

                // Usamos vírgula como delimitador
                const csvContent = [headers.join(','), ...rows].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                if (link.download !== undefined) {
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', 'avaliacoes_pec_multiplica.csv');
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    alert('Seu navegador não suporta download de arquivos diretamente. Por favor, copie o texto abaixo:\n\n' + csvContent);
                }
            } else {
                alert('Não há dados salvos para exportar.');
            }
        } else {
            alert('Senha incorreta!');
        }
    });

    // Lógica para o botão de Zerar Dados Salvos
    clearDataButton.addEventListener('click', () => {
        const inputPassword = prompt('Por favor, digite a senha para zerar os dados:');
        if (inputPassword === PASSWORD) {
            const confirmClear = confirm('Tem certeza que deseja zerar TODOS os dados de formulários salvos? Esta ação é irreversível.');

            if (confirmClear) {
                localStorage.removeItem(CSV_STORAGE_KEY);
                loadTotalResponses();
                alert('Todos os dados de formulários foram zerados com sucesso!');
            }
        } else {
            alert('Senha incorreta!');
        }
    });

    // Inicialização
    renderEvaluationItems();
    loadTotalResponses();
});
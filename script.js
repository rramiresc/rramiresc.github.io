document.addEventListener('DOMContentLoaded', () => {
    const avaliacaoForm = document.getElementById('avaliacaoForm');
    const evaluationItemsContainer = document.getElementById('evaluationItems');
    const notaFinalInput = document.getElementById('notaFinal');
    const horaInicioPreenchimentoInput = document.getElementById('horaInicioPreenchimento');
    const horaConclusaoPreenchimentoInput = document.getElementById('horaConclusaoPreenchimento');
    const chronometerDisplay = document.getElementById('chronometer');
    const totalResponsesDisplay = document.getElementById('totalResponses');
    const exportCsvButton = document.getElementById('exportCsvButton');
    const clearDataButton = document.getElementById('clearDataButton');

    const CSV_STORAGE_KEY = 'pecMultiplicaAvaliacoes';
    const PASSWORD = 'Multiplica_2025-2';

    let startTime;
    let chronometerInterval;
    let hasInteracted = false; // Nova flag para controlar a primeira interação

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

    // --- Funções de Utilitário ---

    // Formata a hora atual
    function formatTime(date) {
        return date.toTimeString().slice(0, 5); // HH:MM
    }

    // Atualiza o cronômetro
    function updateChronometer() {
        const now = new Date().getTime();
        const elapsed = now - startTime;
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

        const format = (num) => String(num).padStart(2, '0');
        chronometerDisplay.textContent = `${format(hours)}:${format(minutes)}:${format(seconds)}`;
    }

    // Inicializa o cronômetro e preenche a hora de início
    function startChronometer() {
        if (!hasInteracted) { // Inicia apenas se não houver interação prévia
            const now = new Date();
            horaInicioPreenchimentoInput.value = formatTime(now);
            startTime = now.getTime();
            chronometerInterval = setInterval(updateChronometer, 1000);
            hasInteracted = true; // Define a flag como verdadeira
        }
    }

    // Para o cronômetro
    function stopChronometer() {
        clearInterval(chronometerInterval);
        horaConclusaoPreenchimentoInput.value = formatTime(new Date());
    }

    // Carrega e exibe o total de respostas enviadas
    function loadTotalResponses() {
        const responses = JSON.parse(localStorage.getItem(CSV_STORAGE_KEY) || '[]');
        totalResponsesDisplay.textContent = responses.length;
    }

    // Função para definir a cor e a imagem de fundo com base no horário
    function setBackgroundColorAndImageBasedOnTime() {
        const now = new Date();
        const hour = now.getHours();

        const isDaytime = hour >= 6 && hour < 18;
        const body = document.body;

        if (isDaytime) {
            body.style.backgroundColor = '#FFFFFF';
            body.style.color = '#333333';
            body.style.backgroundImage = 'url("pano de fundo multiplica - branco.jpeg")';
        } else {
            body.style.backgroundColor = '#2196F3';
            body.style.color = '#FFFFFF';
            body.style.backgroundImage = 'url("pano de fundo multiplica - azul.jpeg")';
        }

        body.style.backgroundSize = 'contain';
        body.style.backgroundPosition = 'center center';
        body.style.backgroundRepeat = 'no-repeat';
        body.style.backgroundAttachment = 'fixed';
    }

    // Função para criar os grupos de rádio para cada questão
    function createRatingGroup(question) {
        const div = document.createElement('div');
        div.classList.add('rating-group');
        div.innerHTML = `<p>${question.text}</p>`;

        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('rating-options');

        for (let i = 0; i <= 5; i++) {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="radio" name="${question.id}" value="${i}" required>
                ${i}
            `;
            optionsDiv.appendChild(label);
        }
        div.appendChild(optionsDiv);
        return div;
    }

    // Função para calcular a nota final
    function calculateFinalScore() {
        let currentWeightedScore = 0;
        evaluationQuestions.forEach(question => {
            const selectedOption = document.querySelector(`input[name="${question.id}"]:checked`);
            if (selectedOption) {
                const score = parseInt(selectedOption.value);
                currentWeightedScore += score * question.weight;
            }
        });

        let finalNormalizedScore = (currentWeightedScore / maxPossibleWeightedScore) * 50;

        notaFinalInput.value = finalNormalizedScore.toFixed(2);
    }

    // --- Inicialização ---

    // Adiciona todas as questões de avaliação ao formulário
    evaluationQuestions.forEach(question => {
        evaluationItemsContainer.appendChild(createRatingGroup(question));
    });

    // Inicializa contador e background ao carregar a página
    loadTotalResponses();
    setBackgroundColorAndImageBasedOnTime();
    setInterval(setBackgroundColorAndImageBasedOnTime, 60 * 60 * 1000);

    // --- Event Listeners ---

    // Adiciona um listener ao formulário para detectar a primeira interação com inputs, selects e textareas
    avaliacaoForm.addEventListener('change', (event) => {
        const target = event.target;
        // Verifica se o elemento alterado NÃO é um botão de submit, exportar ou limpar
        if (target.tagName !== 'BUTTON' && target.type !== 'submit' && target.id !== 'exportCsvButton' && target.id !== 'clearDataButton') {
            startChronometer(); // Inicia o cronômetro na primeira interação
        }
        // Se a mudança for em um item de avaliação, recalcula a nota
        if (target.closest('.rating-group')) { // Verifica se o elemento está dentro de um grupo de avaliação
            calculateFinalScore();
        }
    });

    avaliacaoForm.addEventListener('input', (event) => {
        const target = event.target;
        // Verifica se o elemento alterado NÃO é um botão de submit, exportar ou limpar
        if (target.tagName !== 'BUTTON' && target.type !== 'submit' && target.id !== 'exportCsvButton' && target.id !== 'clearDataButton') {
            startChronometer(); // Inicia o cronômetro na primeira interação (para inputs de texto, data, etc.)
        }
    });


    // Lida com o envio do formulário
    avaliacaoForm.addEventListener('submit', (event) => {
        event.preventDefault();

        stopChronometer(); // Para o cronômetro ao submeter

        const formData = new FormData(avaliacaoForm);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        data['notaFinal'] = notaFinalInput.value;
        data['tempoPreenchimento'] = chronometerDisplay.textContent;

        saveToCsvStorage(data);

        console.log('Dados do formulário:', data);
        alert('Avaliação enviada com sucesso!');

        // Reseta o formulário e o estado do cronômetro para um novo preenchimento
        avaliacaoForm.reset();
        notaFinalInput.value = '';
        chronometerDisplay.textContent = '00:00:00'; // Zera o display do cronômetro
        hasInteracted = false; // Reseta a flag
        horaInicioPreenchimentoInput.value = ''; // Limpa a hora de início
        horaConclusaoPreenchimentoInput.value = ''; // Limpa a hora de conclusão
        loadTotalResponses();
        setBackgroundColorAndImageBasedOnTime();
        // Não chama startChronometer aqui, ele aguardará a próxima interação.
    });

    // Lógica para salvar os dados no localStorage
    function saveToCsvStorage(newData) {
        const storedData = JSON.parse(localStorage.getItem(CSV_STORAGE_KEY) || '[]');
        storedData.push(newData);
        localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(storedData));
    }

    // Lógica para exportar CSV
    exportCsvButton.addEventListener('click', () => {
        const inputPassword = prompt('Por favor, digite a senha para exportar:');
        if (inputPassword === PASSWORD) {
            const storedData = JSON.parse(localStorage.getItem(CSV_STORAGE_KEY) || '[]');

            if (storedData.length === 0) {
                alert('Não há dados para exportar.');
                return;
            }

            const allKeys = new Set();
            storedData.forEach(item => {
                Object.keys(item).forEach(key => allKeys.add(key));
            });
            const headers = Array.from(allKeys);

            let csvContent = headers.map(header => `"${header}"`).join(',') + '\n';

            storedData.forEach(row => {
                const rowData = headers.map(header => {
                    const value = row[header] !== undefined ? row[header] : '';
                    return `"${String(value).replace(/"/g, '""')}"`;
                });
                csvContent += rowData.join(',') + '\n';
            });

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
});
document.addEventListener('DOMContentLoaded', () => {
    const avaliacaoForm = document.getElementById('avaliacaoForm');
    const evaluationItemsContainer = document.getElementById('evaluationItems');
    const notaFinalInput = document.getElementById('notaFinal');
    const horaInicioPreenchimentoInput = document.getElementById('horaInicioPreenchimento');
    const horaConclusaoPreenchimentoInput = document.getElementById('horaConclusaoPreenchimento');
    const chronometerDisplay = document.getElementById('chronometer');
    const totalResponsesDisplay = document.getElementById('totalResponses');
    const exportCsvButton = document.getElementById('exportCsvButton');

    const CSV_STORAGE_KEY = 'pecMultiplicaAvaliacoes';
    const PASSWORD = 'Multiplica_2025-2'; // Senha para exportação CSV

    let startTime; // Para o cronômetro
    let chronometerInterval; // Para o intervalo do cronômetro

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
    function initializeFormTime() {
        const now = new Date();
        horaInicioPreenchimentoInput.value = formatTime(now);
        startTime = now.getTime();
        clearInterval(chronometerInterval); // Limpa qualquer intervalo anterior
        chronometerInterval = setInterval(updateChronometer, 1000);
    }

    // Carrega e exibe o total de respostas enviadas
    function loadTotalResponses() {
        const responses = JSON.parse(localStorage.getItem(CSV_STORAGE_KEY) || '[]');
        totalResponsesDisplay.textContent = responses.length;
    }

    // Função para definir a cor e a imagem de fundo com base no horário
function setBackgroundColorAndImageBasedOnTime() {
    const now = new Date();
    const hour = now.getHours(); // Pega a hora atual (0-23)

    // Define "dia" como 6h da manhã até antes das 18h (6 PM).
    const isDaytime = hour >= 6 && hour < 18;

    const body = document.body;

    if (isDaytime) {
        body.style.backgroundColor = '#FFFFFF'; // Branco para o dia
        body.style.color = '#333333'; // Cor do texto para contraste no dia
        body.style.backgroundImage = 'url("pano de fundo multiplica - branco.jpeg")'; // Imagem para o dia
    } else {
        body.style.backgroundColor = '#2196F3'; // Um tom de azul para a noite
        body.style.color = '#FFFFFF'; // Cor do texto para contraste na noite
        body.style.backgroundImage = 'url("pano de fundo multiplica - azul.jpeg")'; // Imagem para a noite
    }

    // Propriedades comuns para ambas as imagens para evitar distorção e manter fixa
    body.style.backgroundSize = 'contain'; // Alterado para 'contain'
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

        // Normaliza a nota para que o máximo seja 50
        let finalNormalizedScore = (currentWeightedScore / maxPossibleWeightedScore) * 50;

        notaFinalInput.value = finalNormalizedScore.toFixed(2);
    }

    // --- Inicialização ---

    // Adiciona todas as questões de avaliação ao formulário
    evaluationQuestions.forEach(question => {
        evaluationItemsContainer.appendChild(createRatingGroup(question));
    });

    // Inicializa o tempo, cronômetro, contador e background ao carregar a página
    initializeFormTime();
    loadTotalResponses();
    // Use a função consolidada para definir o background
    setBackgroundColorAndImageBasedOnTime(); 
    // Define o intervalo para a função consolidada
    setInterval(setBackgroundColorAndImageBasedOnTime, 60 * 60 * 1000); 

    // --- Event Listeners ---

    // Calcula a nota final quando qualquer rádio é clicado ou alterado
    evaluationItemsContainer.addEventListener('change', calculateFinalScore);

    // Lida com o envio do formulário
    avaliacaoForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        // Preenche a hora de conclusão do preenchimento
        horaConclusaoPreenchimentoInput.value = formatTime(new Date());
        clearInterval(chronometerInterval); // Para o cronômetro

        const formData = new FormData(avaliacaoForm);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Adiciona a nota final e o tempo de preenchimento aos dados
        data['notaFinal'] = notaFinalInput.value;
        data['tempoPreenchimento'] = chronometerDisplay.textContent;

        // Salva os dados no localStorage
        saveToCsvStorage(data);

        console.log('Dados do formulário:', data);
        alert('Avaliação enviada com sucesso!');

        // Reseta o formulário e reinicia o cronômetro/contador/background
        avaliacaoForm.reset();
        notaFinalInput.value = '';
        initializeFormTime(); // Reinicia o cronômetro e a hora de início
        loadTotalResponses(); // Atualiza o contador de respostas
        setBackgroundColorAndImageBasedOnTime(); // Atualiza o background novamente (caso a hora tenha mudado)
    });

    // Lógica para salvar os dados no localStorage como um array de objetos
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

            // Pega todos os cabeçalhos possíveis de todos os objetos para garantir que todas as colunas sejam incluídas
            const allKeys = new Set();
            storedData.forEach(item => {
                Object.keys(item).forEach(key => allKeys.add(key));
            });
            const headers = Array.from(allKeys);

            // Cria o cabeçalho CSV
            let csvContent = headers.map(header => `"${header}"`).join(',') + '\n';

            // Adiciona as linhas de dados
            storedData.forEach(row => {
                const rowData = headers.map(header => {
                    const value = row[header] !== undefined ? row[header] : '';
                    // Escapa aspas duplas e envolve o valor em aspas
                    return `"${String(value).replace(/"/g, '""')}"`;
                });
                csvContent += rowData.join(',') + '\n';
            });

            // Cria um blob e um link para download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            if (link.download !== undefined) { // Feature detection
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
});
// Configuração da API - detecta automaticamente se está em produção ou desenvolvimento
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : `${window.location.origin}/api`;

// Variáveis globais para os gráficos
let charts = {};

// Utilitários
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
};

// Formatar moeda compacta para cards
const formatCurrencyCompact = (value) => {
    if (!value || value === 0) return 'R$ 0';
    
    const num = parseFloat(value);
    
    if (num >= 1000000) {
        return 'R$ ' + (num / 1000000).toFixed(2).replace('.', ',') + 'M';
    } else if (num >= 1000) {
        return 'R$ ' + (num / 1000).toFixed(1).replace('.', ',') + 'K';
    } else {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    }
};

const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
};

const showLoading = () => {
    document.getElementById('loading').classList.add('active');
};

const hideLoading = () => {
    document.getElementById('loading').classList.remove('active');
};

// Função para buscar dados da API
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`);
        if (!response.ok) throw new Error(`Erro: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(`Erro ao buscar ${endpoint}:`, error);
        return null;
    }
}

// Atualizar cards de resumo
async function updateSummaryCards() {
    const data = await fetchData('summary');
    if (data) {
        document.getElementById('totalApontamentos').textContent = formatNumber(data.total_apontamentos);
        document.getElementById('totalFuncionarios').textContent = formatNumber(data.total_funcionarios);
        document.getElementById('totalHoras').textContent = formatNumber(data.total_horas) + 'h';
        document.getElementById('totalFaturamento').textContent = formatCurrencyCompact(data.total_faturamento);
    }
    
    // Carregar dados de hectares e atividades
    const hectaresData = await fetchData('atividades-hectares');
    if (hectaresData && hectaresData.length > 0) {
        const totalHectares = hectaresData.reduce((sum, item) => sum + parseFloat(item.total_hectares || 0), 0);
        const totalAtividades = hectaresData.length;
        document.getElementById('totalHectares').textContent = formatNumber(totalHectares.toFixed(2)) + ' ha';
        document.getElementById('totalAtividades').textContent = formatNumber(totalAtividades);
    }
}

// Gráfico de Paradas Mais Frequentes
async function createParadasChart() {
    const data = await fetchData('paradas-frequentes');
    if (!data || data.length === 0) return;

    const ctx = document.getElementById('paradasChart').getContext('2d');
    
    if (charts.paradas) charts.paradas.destroy();
    
    charts.paradas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.parada.substring(0, 30)),
            datasets: [{
                label: 'Quantidade de Paradas',
                data: data.map(item => item.quantidade),
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2
            }, {
                label: 'Total Horas Paradas',
                data: data.map(item => item.total_horas_paradas),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            return `Média: ${data[index].media_horas}h`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Gráfico de Horas por Período
async function createHorasChart() {
    const data = await fetchData('horas-periodo');
    if (!data || data.length === 0) return;

    const ctx = document.getElementById('horasChart').getContext('2d');
    
    if (charts.horas) charts.horas.destroy();
    
    charts.horas = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => formatDate(item.periodo)).reverse(),
            datasets: [{
                label: 'Horas Trabalhadas',
                data: data.map(item => item.total_horas).reverse(),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Horas'
                    }
                }
            }
        }
    });
}

// Gráfico de Faturamento
async function createFaturamentoChart() {
    const data = await fetchData('faturamento-periodo');
    if (!data || data.length === 0) return;

    const ctx = document.getElementById('faturamentoChart').getContext('2d');
    
    if (charts.faturamento) charts.faturamento.destroy();
    
    charts.faturamento = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => formatDate(item.periodo)).reverse(),
            datasets: [{
                label: 'Faturamento (R$)',
                data: data.map(item => item.total_faturamento).reverse(),
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Faturamento: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de Produtividade
async function createProdutividadeChart() {
    const data = await fetchData('produtividade');
    if (!data || data.length === 0) return;

    const ctx = document.getElementById('produtividadeChart').getContext('2d');
    
    if (charts.produtividade) charts.produtividade.destroy();
    
    charts.produtividade = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => formatDate(item.periodo)).reverse(),
            datasets: [{
                label: 'Horas Trabalhadas',
                data: data.map(item => item.horas_trabalhadas).reverse(),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Horas Paradas',
                data: data.map(item => item.horas_paradas).reverse(),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Taxa Produtividade (%)',
                data: data.map(item => item.taxa_produtividade).reverse(),
                borderColor: 'rgba(255, 206, 86, 1)',
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                yAxisID: 'y1',
                tension: 0.4,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Horas'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Produtividade (%)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    max: 100
                }
            }
        }
    });
}

// Gráfico Top Funcionários
async function createFuncionariosChart() {
    const data = await fetchData('top-funcionarios-horas');
    if (!data || data.length === 0) return;

    const ctx = document.getElementById('funcionariosChart').getContext('2d');
    
    if (charts.funcionarios) charts.funcionarios.destroy();
    
    charts.funcionarios = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.funcionario.substring(0, 25)),
            datasets: [{
                label: 'Total Horas',
                data: data.map(item => item.total_horas),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            return `Apontamentos: ${data[index].total_apontamentos}\nFaturamento: ${formatCurrency(data[index].total_faturamento)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Horas'
                    }
                }
            }
        }
    });
}

// Gráfico Impacto de Paradas
async function createImpactoChart() {
    const data = await fetchData('impacto-paradas');
    if (!data || data.length === 0) return;

    const ctx = document.getElementById('impactoChart').getContext('2d');
    
    if (charts.impacto) charts.impacto.destroy();
    
    charts.impacto = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => formatDate(item.periodo)).reverse(),
            datasets: [{
                label: 'Quantidade de Paradas',
                data: data.map(item => item.quantidade_paradas).reverse(),
                backgroundColor: 'rgba(255, 159, 64, 0.7)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 2,
                yAxisID: 'y'
            }, {
                label: 'Horas Paradas',
                data: data.map(item => item.total_horas_paradas).reverse(),
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                yAxisID: 'y'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Gráfico de Atividades por Hectares
async function createAtividadesHectaresChart() {
    const data = await fetchData('atividades-hectares');
    if (!data || data.length === 0) return;

    const ctx = document.getElementById('atividadesHectaresChart').getContext('2d');
    
    if (charts.atividadesHectares) charts.atividadesHectares.destroy();
    
    charts.atividadesHectares = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.atividade),
            datasets: [{
                label: 'Total Hectares',
                data: data.map(item => item.total_hectares),
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            return `Execuções: ${data[index].quantidade_execucoes}\nHoras: ${data[index].total_horas}\nEficiência: ${data[index].hectares_por_hora} ha/h`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hectares'
                    }
                }
            }
        }
    });
}

// Gráfico de Eficiência (Hectares por Hora)
async function createEficienciaChart() {
    const data = await fetchData('produtividade-atividades');
    if (!data || data.length === 0) return;

    const ctx = document.getElementById('eficienciaChart').getContext('2d');
    
    if (charts.eficiencia) charts.eficiencia.destroy();
    
    charts.eficiencia = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.atividade),
            datasets: [{
                label: 'Hectares por Hora',
                data: data.map(item => item.eficiencia_ha_hora),
                backgroundColor: 'rgba(255, 193, 7, 0.7)',
                borderColor: 'rgba(255, 193, 7, 1)',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            return `Total Hectares: ${data[index].total_hectares}\nTotal Horas: ${data[index].total_horas}\nExecuções: ${data[index].execucoes}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hectares/Hora'
                    }
                }
            }
        }
    });
}

// Gráfico de Hectares por Período
async function createHectaresPeriodoChart() {
    const data = await fetchData('hectares-periodo');
    if (!data || data.length === 0) return;

    const ctx = document.getElementById('hectaresPeriodoChart').getContext('2d');
    
    if (charts.hectaresPeriodo) charts.hectaresPeriodo.destroy();
    
    charts.hectaresPeriodo = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => formatDate(item.periodo)).reverse(),
            datasets: [{
                label: 'Hectares Trabalhados',
                data: data.map(item => item.total_hectares).reverse(),
                borderColor: 'rgba(76, 175, 80, 1)',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = data.length - 1 - context.dataIndex;
                            return `Atividades: ${data[index].quantidade_atividades}\nTipos: ${data[index].atividades_diferentes}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hectares'
                    }
                }
            }
        }
    });
}

// Atualizar tabela de atividades
async function updateAtividadesTable() {
    const data = await fetchData('atividades-hectares');
    if (!data || data.length === 0) return;

    const tbody = document.getElementById('atividadesTableBody');
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = tbody.insertRow();
        const eficienciaClass = item.hectares_por_hora >= 5 ? 'produtividade-alta' : 
                               item.hectares_por_hora >= 2 ? 'produtividade-media' : 'produtividade-baixa';
        
        row.innerHTML = `
            <td><strong>${item.atividade}</strong></td>
            <td>${formatNumber(item.quantidade_execucoes)}</td>
            <td><strong>${formatNumber(item.total_hectares)} ha</strong></td>
            <td>${formatNumber(item.media_hectares)} ha</td>
            <td>${formatNumber(item.total_horas)}h</td>
            <td class="${eficienciaClass}"><strong>${item.hectares_por_hora || 0} ha/h</strong></td>
            <td>${formatCurrency(item.total_faturamento)}</td>
        `;
    });
}

// Atualizar lista de atividades executadas
async function updateListaAtividades() {
    const data = await fetchData('lista-atividades');
    if (!data || data.length === 0) return;

    const tbody = document.getElementById('listaAtividadesTableBody');
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = tbody.insertRow();
        const statusClass = item.status === 'Concluído' ? 'produtividade-alta' : 
                           item.status === 'Em Andamento' ? 'produtividade-media' : '';
        
        row.innerHTML = `
            <td>${formatDate(item.data)}</td>
            <td><strong>${item.atividade}</strong></td>
            <td>${item.operador || '-'}</td>
            <td>${item.maquina || '-'}</td>
            <td>${item.fazenda || '-'}</td>
            <td>${item.talhao || '-'}</td>
            <td><strong>${formatNumber(item.hectares)} ha</strong></td>
            <td>${formatNumber(item.horas_trabalhadas)}h</td>
            <td>${item.eficiencia > 0 ? formatNumber(item.eficiencia) + ' ha/h' : '-'}</td>
            <td class="${statusClass}">${item.status || '-'}</td>
        `;
    });
}

// Atualizar tabela de produtividade
async function updateProdutividadeTable() {
    const data = await fetchData('produtividade');
    if (!data || data.length === 0) return;

    const tbody = document.getElementById('produtividadeTableBody');
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = tbody.insertRow();
        const taxaClass = item.taxa_produtividade >= 80 ? 'produtividade-alta' : 
                         item.taxa_produtividade >= 50 ? 'produtividade-media' : 'produtividade-baixa';
        
        row.innerHTML = `
            <td>${formatDate(item.periodo)}</td>
            <td>${formatNumber(item.horas_trabalhadas)}h</td>
            <td>${formatNumber(item.horas_paradas)}h</td>
            <td>${formatCurrency(item.faturamento)}</td>
            <td>${formatNumber(item.quantidade_paradas)}</td>
            <td class="${taxaClass}">${item.taxa_produtividade || 0}%</td>
        `;
    });
}

// Inicializar dashboard
async function initDashboard() {
    showLoading();
    
    try {
        await Promise.all([
            updateSummaryCards(),
            createParadasChart(),
            createHorasChart(),
            createFaturamentoChart(),
            createProdutividadeChart(),
            createFuncionariosChart(),
            createImpactoChart(),
            createAtividadesHectaresChart(),
            createEficienciaChart(),
            createHectaresPeriodoChart(),
            updateAtividadesTable(),
            updateListaAtividades(),
            updateProdutividadeTable()
        ]);
        
        console.log('✅ Dashboard carregado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao carregar dashboard:', error);
        alert('Erro ao carregar os dados. Verifique se o servidor está rodando.');
    } finally {
        hideLoading();
    }
}

// Event Listeners
document.getElementById('refreshBtn').addEventListener('click', initDashboard);

// Carregar dashboard ao iniciar
window.addEventListener('DOMContentLoaded', initDashboard);

// Atualizar automaticamente a cada 5 minutos
setInterval(initDashboard, 5 * 60 * 1000);

/*
 * Guardam os valores do resumo de lançamentos.
 */
let somaReceitasDisplay = 0;
let somaDespesasDisplay = 0;


/*
 * Função para zerar o resumo.
 */
function zeraResumo() {

    somaReceitasDisplay = 0;
    somaDespesasDisplay = 0;

    mostraResumo();
}

/*
 * Função para ajustar os valores do resumo.
 */
function ajustaResumo(eh_receita, valor) {

    let resultado = valor.replace(",", ".");
    resultado = parseFloat(resultado);
    resultado = Math.round(resultado * 100);

    // Se for receita
    if (eh_receita) {
        somaReceitasDisplay += resultado;

        // Se for despesa
    } else {
        somaDespesasDisplay += resultado;
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para formatar um campo de moeda a partir de um float
  ou string representando um float
  --------------------------------------------------------------------------------------
*/
const formataMoeda = (valor) => {

    // resultado sempre terá a vírgula como separador,
    // independente da entrada.
    let resultado = valor.toString().replace(".", ",");

    let partes = resultado.split(",");

    let parte_inteira = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    let parte_decimal = "";

    // Se for um número exato, a parte decimal será "00".
    if (!partes[1]) {
        parte_decimal = "00";

        // Se for 10, 20, 30, etc, a parte decimal será "10", "20", etc.
    } else if (partes[1].length == 1) {
        parte_decimal = partes[1] + "0";
    } else {
        parte_decimal = partes[1];
    }

    return "R$ " + parte_inteira + "," + parte_decimal;

}

/*
 * Função para mostrar o resumo.
 */
function mostraResumo() {

    let span = document.getElementById("receitasDisplay");
    span.innerHTML = formataMoeda(somaReceitasDisplay / 100);

    span = document.getElementById("despesasDisplay");
    span.innerHTML = formataMoeda(somaDespesasDisplay / 100);

    span = document.getElementById("totalDisplay");
    span.innerHTML = formataMoeda((somaReceitasDisplay - somaDespesasDisplay) / 100);
}

/*
 * Mostra o conteúdo da aba que foi clicada.
 * 
 * evt o evento do click
 * tabName nome da div cujo conteúdo será mostrado
 */
function openTab(evt, tabName) {

    var i, tabcontent, tablinks;

    // Esconde todos os elementos class="tabcontent" (conteúdo)
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Desativa todos os elementos class="tablinks" (botões)
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Mostra a aba atual, ativando o botão respectivo
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

/*
  --------------------------------------------------------------------------------------
  Função para criar um botão apagar para cada item da lista - Categoria
  --------------------------------------------------------------------------------------
*/
const insertButtonCategoria = (parent) => {
    let span = document.createElement("span");
    span.innerHTML = `
        <button onclick='removeElementCategoria(event)' class='btnIcone'>
            <i class='bx bx-trash'></i>
        </button>
    `;
    parent.appendChild(span);
}

/*
  --------------------------------------------------------------------------------------
  Função para deletar um item da lista do servidor via requisição DELETE
  --------------------------------------------------------------------------------------
*/
const deleteCategoria = (item) => {

    const formData = new FormData();
    formData.append('id', item.id);

    let url = 'http://127.0.0.1:5000/categoria';
    fetch(url, {
        method: 'DELETE',
        body: formData
    })
        .then((response) => response.json())
        .catch((error) => {
            console.error('Error:', error);
        });
}

/*
  --------------------------------------------------------------------------------------
  Função para remover a categoria do select no form de lançamentos
  --------------------------------------------------------------------------------------
*/
const removeElementInputCategoria = (id) => {

    var input = document.getElementById("lancamentoCategoria");

    // Remove todas as options, menos a de valor 0
    Array.from(input.options).forEach(function (option) {
        if (option.value == id) {
            option.remove();
        }
    });
}

/*
  --------------------------------------------------------------------------------------
  Função para remover a categoria
  --------------------------------------------------------------------------------------
*/
const removeElementCategoria = (evt) => {

    let row = evt.currentTarget.parentElement.parentElement.parentElement;

    if (confirm("Você tem certeza?")) {
        deleteCategoria(row);
        removeElementInputCategoria(row.id);
        row.parentElement.removeChild(row);
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir categoria na lista de Categorias (tabela Categorias)
  --------------------------------------------------------------------------------------
*/
const insertListCategoriaTable = (categoria) => {

    var table = document.getElementById("tabelaCategoria");
    var row = table.insertRow();

    row.setAttribute("id", categoria.id);
    row.insertCell(0).textContent = categoria.nome;
    row.insertCell(1).innerHTML = getIcone(categoria.eh_receita);

    insertButtonCategoria(row.insertCell(2));
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir categoria na lista de Categorias (input Categorias)
  --------------------------------------------------------------------------------------
*/
const insertListCategoriaInput = (categoria) => {

    var input = document.getElementById("lancamentoCategoria");
    var opcao = document.createElement("option");

    opcao.value = categoria.id;
    opcao.text = categoria.nome;
    opcao.className = categoria.eh_receita ? "optionReceita" : "optionDespesa";

    input.add(opcao);
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir categoria na lista de Categorias (table e input)
  --------------------------------------------------------------------------------------
*/
const insertListCategoria = (categoria) => {

    insertListCategoriaTable(categoria);
    insertListCategoriaInput(categoria);
}

/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const getListCategoria = async () => {
    let url = 'http://127.0.0.1:5000/categorias';
    fetch(url, {
        method: 'GET',
    })
        .then((response) => response.json())
        .then((data) => {
            data.categorias.forEach(categoria => insertListCategoria(categoria));
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

/*
  --------------------------------------------------------------------------------------
  Função para colocar uma Categoria na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const postCategoria = async (inputNome, inputTipo) => {

    try {
        const formData = new FormData();
        formData.append('nome', inputNome);
        formData.append('eh_receita', inputTipo);

        let url = 'http://127.0.0.1:5000/categoria';
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        const responseData = await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para limpar o input de Categorias
  --------------------------------------------------------------------------------------
*/
function limpaInputCategoria() {

    var input = document.getElementById("lancamentoCategoria");

    // Remove todas as options, menos a de valor 0
    Array.from(input.options).forEach(function (option) {
        if (option.value !== "0") {
            option.remove();
        }
    });
}

/*
  --------------------------------------------------------------------------------------
  Função para limpar a tabela de Categorias
  --------------------------------------------------------------------------------------
*/
function limpaTabelaCategoria() {

    var table = document.getElementById("tabelaCategoria");
    var rowCount = table.rows.length;

    // Remove iniciando pela última, deixando o cabeçalho
    for (var i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo item com nome e quantidade
  --------------------------------------------------------------------------------------
*/
const novaCategoria = () => {
    let inputNome = document.getElementById("categoriaNome").value;
    let inputTipo = document.getElementById("categoriaTipo").value;

    if (inputNome === "") {
        alert("Escreva o nome de uma categoria!");
    } else {
        postCategoria(inputNome, inputTipo);
        limpaTabelaCategoria();
        limpaInputCategoria();
        setTimeout(getListCategoria, 50);
        document.getElementById("categoriaNome").value = "";
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para gerar o HTML do ícone de despesa/receita
  --------------------------------------------------------------------------------------
*/
const getIcone = (eh_receita) => {
    let iconeHTML = "<i class='bx bx-right-";
    iconeHTML += eh_receita ? "top" : "down";
    iconeHTML += "-arrow-circle'></i>";

    return iconeHTML;
}

/*
  --------------------------------------------------------------------------------------
  Função para deletar um Lancamento via requisição DELETE
  --------------------------------------------------------------------------------------
*/
const deleteLancamento = (item) => {

    const formData = new FormData();
    formData.append('id', item.id);

    let url = 'http://127.0.0.1:5000/lancamento';
    fetch(url, {
        method: 'DELETE',
        body: formData
    })
        .then((response) => response.json())
        .catch((error) => {
            console.error('Error:', error);
        });
}

/*
  --------------------------------------------------------------------------------------
  Função para remover o lançamento
  --------------------------------------------------------------------------------------
*/
const removeElementLancamento = (evt) => {

    // Linha que será removida
    let row = evt.currentTarget.parentElement.parentElement.parentElement;
    let valor = row.querySelectorAll('td')[3].innerHTML;

    // Busca na célula o valor da linha a ser removida
    valor = valor.replace("R$ ", "").replace(".", "").replace(",", ".");
    valor = parseFloat(valor) * -1;

    // Busca na célula se é uma receita ou despesa
    let eh_receita = row.querySelectorAll('td')[1].innerHTML.includes("top");
    eh_receita = eh_receita ? 1 : 0;

    if (confirm("Você tem certeza?")) {
        deleteLancamento(row);
        ajustaResumo(eh_receita, valor.toString());
        mostraResumo();
        row.parentElement.removeChild(row);
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para limpar a tabela de Lancamentos
  --------------------------------------------------------------------------------------
*/
function limpaTabelaLancamento() {

    var table = document.getElementById("tabelaLancamento");
    var rowCount = table.rows.length;

    // Remove iniciando pela última, deixando o cabeçalho
    for (var i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }

    zeraResumo();
}

/*
  --------------------------------------------------------------------------------------
  Função para colocar um Lancamento na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const postLancamento = async (inputDescricao, inputCategoria, inputData,
    inputValor) => {

    try {
        const formData = new FormData();
        formData.append('descricao', inputDescricao);
        formData.append('categoria_id', inputCategoria);
        formData.append('data', formataInputDate(inputData));
        formData.append('valor', inputValor.replace(",", "."));

        let url = 'http://127.0.0.1:5000/lancamento';
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        const responseData = await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para formatar o input date
  --------------------------------------------------------------------------------------
*/
const formataInputDate = (valor) => {

    let partes = valor.split("-");
    let data_ajustada = partes[2] + "/" + partes[1] + "/" + partes[0];

    return data_ajustada;
}

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo Lancamento
  --------------------------------------------------------------------------------------
*/
const novoLancamento = () => {
    let inputDescricao = document.getElementById("lancamentoDescricao").value;
    let inputCategoria = document.getElementById("lancamentoCategoria").value;
    let inputData = document.getElementById("lancamentoData").value;
    let inputValor = document.getElementById("lancamentoValor").value;

    if (inputDescricao === "") {
        alert("Escreva a descrição de um lançamento!");
    } else if (inputCategoria == 0) {
        alert("Escolha uma categoria!");
    } else if (inputData == "") {
        alert("Escolha uma data!");
    } else if (inputValor <= 0) {
        alert("Informe um valor positivo!");
    } else {
        postLancamento(inputDescricao, inputCategoria, inputData, inputValor);
        limpaTabelaLancamento();
        setTimeout(getListLancamento, 50);
        document.getElementById("lancamentoDescricao").value = "";
        document.getElementById("lancamentoValor").value = "";
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para criar um botão apagar para cada item da lista - Lançamento
  --------------------------------------------------------------------------------------
*/
const insertButtonLancamento = (parent) => {
    let span = document.createElement("span");
    span.innerHTML = `
        <button onclick='removeElementLancamento(event)' class='btnIcone'>
            <i class='bx bx-trash'></i>
        </button>
    `;
    parent.appendChild(span);
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir lancamento na lista de Lançamentos
  --------------------------------------------------------------------------------------
*/
const insertListLancamento = (lancamento) => {

    var table = document.getElementById("tabelaLancamento");
    var row = table.insertRow();

    row.setAttribute("id", lancamento.id);
    row.insertCell(0).textContent = lancamento.descricao;
    row.insertCell(1).innerHTML = getIcone(lancamento.categoria.eh_receita) +
        " " +
        lancamento.categoria.nome;
    row.insertCell(2).textContent = lancamento.data;
    row.insertCell(3).textContent = formataMoeda(lancamento.valor);

    insertButtonLancamento(row.insertCell(4));

    ajustaResumo(lancamento.categoria.eh_receita, lancamento.valor);
}

/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const getListLancamento = async () => {
    let url = 'http://127.0.0.1:5000/lancamentos';
    fetch(url, {
        method: 'GET',
    })
        .then((response) => response.json())
        .then((data) => {
            data.lancamentos.forEach(lancamento => insertListLancamento(lancamento));
            mostraResumo();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

/*
 * Inicializa a página assim que a mesma é aberta.
 */
function inicio() {

    // Mostra a aba de Lancamentos
    document.getElementById("Lancamentos").style.display = "block";
    document.getElementById("btnLancamentos").className += " active";

    getListCategoria();
    getListLancamento();
}

inicio();
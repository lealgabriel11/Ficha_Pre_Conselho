// ============================================================
// 1. PEGANDO OS ELEMENTOS DA PÁGINA
// ============================================================
const form = document.querySelector("#formulario");
const paginas = form.querySelectorAll("[data-page]");
const resultado = document.querySelector("#resultado");
const resumo = document.querySelector("#resumo");

const botaoAnterior = document.querySelector("#anterior");
const botaoProximo = document.querySelector("#proximo");
const botaoConcluir = document.querySelector("#concluir");

const barraProgresso = document.querySelector("#progresso");
const contadorPagina = document.querySelector("#contador-pagina");
const tituloPagina = document.querySelector("#titulo-pagina");
const mensagemErro = document.querySelector("#erro-validacao");
const campoData = document.querySelector("#data");

// Número da página que está aparecendo (0 = primeira página)
let paginaAtual = 0;

// Opções que, quando marcadas, desmarcam todas as outras da pergunta
const opcoesExclusivas = [
    "Não se aplica",
    "Não sei",
    "Não preciso",
    "Não percebo",
    "Não enfrentei",
    "Não utilizo",
    "Não tive",
    "Nenhum",
];

// ============================================================
// 2. FUNÇÕES AUXILIARES
// ============================================================

// Devolve a data de hoje no formato do campo de data: AAAA-MM-DD
function pegarDataDeHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return ano + "-" + mes + "-" + dia;
}

// Preenche o campo de data com hoje (só se estiver vazio)
function preencherData() {
    if (campoData.value === "") {
        campoData.value = pegarDataDeHoje();
    }
}

// Coloca a classe "required" nas perguntas que têm resposta obrigatória
// (o CSS usa essa classe para mostrar o asterisco vermelho)
function marcarPerguntasObrigatorias() {
    const perguntas = form.querySelectorAll(".question");
    for (const pergunta of perguntas) {
        if (pergunta.querySelector("input[required]")) {
            pergunta.classList.add("required");
        }
    }
}

// Tira o destaque vermelho de todos os campos com erro
function limparErros() {
    const comErro = form.querySelectorAll(".has-error");
    for (const item of comErro) {
        item.classList.remove("has-error");
    }
}

// Dado um campo, devolve a "caixa" dele: a pergunta (.question)
// ou o campo de texto (.field). Pode devolver null.
function acharCaixa(campo) {
    return campo.closest(".question, .field");
}

// Diz se um texto de opção é do tipo "Não se aplica", "Nenhum...", etc.
function ehOpcaoExclusiva(valor) {
    for (const inicio of opcoesExclusivas) {
        if (valor.startsWith(inicio)) {
            return true;
        }
    }
    return false;
}

// Converte "2026-11-15" em "15/11/2026"
function formatarData(texto) {
    const partes = texto.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// ============================================================
// 3. NAVEGAÇÃO ENTRE PÁGINAS
// ============================================================
function mostrarPagina(numero) {
    paginaAtual = numero;
    mensagemErro.hidden = true;
    limparErros();

    // Mostra só a página atual e esconde as outras
    for (let i = 0; i < paginas.length; i++) {
        paginas[i].hidden = i !== paginaAtual;
    }

    const ehPrimeira = paginaAtual === 0;
    const ehUltima = paginaAtual === paginas.length - 1;

    // Botões: "Voltar" some na primeira página,
    // "Próxima" aparece até a penúltima e "Gerar resumo" só na última
    botaoAnterior.disabled = ehPrimeira;
    botaoProximo.hidden = ehUltima;
    botaoConcluir.hidden = !ehUltima;

    // Barra de progresso e textos do topo
    barraProgresso.value = paginaAtual + 1;
    contadorPagina.textContent = "Página " + (paginaAtual + 1) + " de " + paginas.length;
    tituloPagina.textContent = paginas[paginaAtual].dataset.pageTitle;

    // Leva o foco para o título da página (ajuda leitores de tela)
    paginas[paginaAtual].querySelector("h2").focus({ preventScroll: true });
    window.scrollTo(0, 0);
}

// ============================================================
// 4. VALIDAÇÃO
// ============================================================

// Confere se os campos obrigatórios da página atual foram preenchidos.
// Devolve true se estiver tudo certo e false se faltar algo.
function validarPaginaAtual() {
    // O navegador já sabe quais campos estão inválidos (:invalid)
    const invalidos = paginas[paginaAtual].querySelectorAll(":invalid");

    if (invalidos.length === 0) {
        mensagemErro.hidden = true;
        return true;
    }

    // Destaca em vermelho cada pergunta ou campo com problema
    limparErros();
    for (const campo of invalidos) {
        const caixa = acharCaixa(campo);
        if (caixa) {
            caixa.classList.add("has-error");
        }
    }

    // Mostra a mensagem e leva a pessoa até o primeiro erro
    mensagemErro.hidden = false;
    const primeiro = invalidos[0];
    primeiro.focus({ preventScroll: true });

    const caixaDoPrimeiro = acharCaixa(primeiro);
    if (caixaDoPrimeiro) {
        caixaDoPrimeiro.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return false;
}

// ============================================================
// 5. GERAR O RESUMO
// ============================================================
function gerarResumo() {
    const dados = new FormData(form);

    // Dados da identificação (primeira página)
    const nome = dados.get("nome").trim();
    const turma = dados.get("turma").trim();
    const periodo = dados.get("periodo").trim();
    const data = dados.get("data");

    const linhas = [];
    linhas.push("RESUMO INDIVIDUAL DO PRÉ-CONSELHO DE CLASSE");
    linhas.push("Estudante: " + (nome || "Não informado"));
    linhas.push("Turma: " + turma);
    linhas.push("Período letivo: " + periodo);
    linhas.push("Data: " + (data ? formatarData(data) : "Não informado"));

    // Para cada página (menos a primeira), lista as perguntas e respostas
    for (let i = 1; i < paginas.length; i++) {
        const pagina = paginas[i];

        linhas.push("");
        linhas.push(pagina.dataset.pageTitle.toUpperCase());

        const perguntas = pagina.querySelectorAll(".question");
        for (const pergunta of perguntas) {
            const textoPergunta = pergunta.querySelector("legend").textContent.trim();

            // Junta todas as opções marcadas dessa pergunta
            const marcadas = pergunta.querySelectorAll("input:checked");
            const respostas = [];
            for (const marcada of marcadas) {
                respostas.push(marcada.value);
            }

            const textoResposta = respostas.length > 0 ? respostas.join("; ") : "Não selecionado";
            linhas.push(textoPergunta + " " + textoResposta);
        }

        // Observações (só entram se a pessoa escreveu algo)
        const observacao = pagina.querySelector("[data-observation]").value.trim();
        if (observacao) {
            linhas.push("Observações: " + observacao);
        }
    }

    // Mostra o resumo e esconde o formulário
    resumo.textContent = linhas.join("\n");
    form.hidden = true;
    resultado.hidden = false;
    document.body.classList.add("showing-summary");
    resultado.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Volta para o formulário (usado no "Voltar e editar" e no "Limpar")
function mostrarFormulario() {
    resultado.hidden = true;
    form.hidden = false;
    document.body.classList.remove("showing-summary");
}

// ============================================================
// 6. EVENTOS (o que acontece quando a pessoa clica ou digita)
// ============================================================

// Botão "Próxima página"
botaoProximo.addEventListener("click", function () {
    if (validarPaginaAtual()) {
        mostrarPagina(paginaAtual + 1);
    }
});

// Botão "Voltar"
botaoAnterior.addEventListener("click", function () {
    if (paginaAtual > 0) {
        mostrarPagina(paginaAtual - 1);
    }
});

// Botão "Gerar meu resumo" (envio do formulário)
form.addEventListener("submit", function (evento) {
    evento.preventDefault(); // impede a página de recarregar
    if (validarPaginaAtual()) {
        gerarResumo();
    }
});

// Quando a pessoa marca ou desmarca uma opção
form.addEventListener("change", function (evento) {
    const campo = evento.target;

    // Respondeu: tira o destaque de erro dessa pergunta
    const caixa = acharCaixa(campo);
    if (caixa) {
        caixa.classList.remove("has-error");
    }

    // O resto só vale para caixinhas (checkbox) que acabaram de ser marcadas
    if (campo.type !== "checkbox" || !campo.checked) {
        return;
    }

    // Pega todas as caixinhas da mesma pergunta
    const grupo = form.querySelectorAll('input[type="checkbox"][name="' + campo.name + '"]');
    const marcouExclusiva = ehOpcaoExclusiva(campo.value);

    for (const outra of grupo) {
        if (outra === campo) {
            continue; // não mexe na que a pessoa acabou de marcar
        }
        // Desmarca as outras se marcou uma exclusiva,
        // ou desmarca a exclusiva se marcou uma opção comum
        if (marcouExclusiva || ehOpcaoExclusiva(outra.value)) {
            outra.checked = false;
        }
    }
});

// Quando a pessoa digita: tira o destaque de erro do campo
form.addEventListener("input", function (evento) {
    const caixa = acharCaixa(evento.target);
    if (caixa) {
        caixa.classList.remove("has-error");
    }
});

// Botão "Limpar respostas"
form.addEventListener("reset", function () {
    // O navegador limpa os campos DEPOIS deste evento.
    // O setTimeout espera isso acontecer antes de recomeçar.
    setTimeout(function () {
        mostrarFormulario();
        preencherData();
        mostrarPagina(0);
    }, 0);
});

// Botão "Baixar resumo (.txt)"
document.querySelector("#baixar").addEventListener("click", function () {
    const arquivo = new Blob([resumo.textContent], { type: "text/plain;charset=utf-8" });
    const endereco = URL.createObjectURL(arquivo);

    const link = document.createElement("a");
    link.href = endereco;
    link.download = "resumo-individual-pre-conselho.txt";
    link.click();

    // Libera a memória depois de 1 segundo
    setTimeout(function () {
        URL.revokeObjectURL(endereco);
    }, 1000);
});

// Botão "Imprimir / salvar em PDF"
document.querySelector("#imprimir").addEventListener("click", function () {
    window.print();
});

// Botão "Voltar e editar"
document.querySelector("#editar").addEventListener("click", function () {
    mostrarFormulario();
    mostrarPagina(paginas.length - 1);
});

// ============================================================
// 7. INÍCIO: o que roda quando a página abre
// ============================================================
barraProgresso.max = paginas.length;
marcarPerguntasObrigatorias();
preencherData();
mostrarPagina(0);
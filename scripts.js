const form = document.querySelector("#formulario");
const pages = [...form.querySelectorAll("[data-page]")];
const resultado = document.querySelector("#resultado");
const resumo = document.querySelector("#resumo");
const anterior = document.querySelector("#anterior");
const proximo = document.querySelector("#proximo");
const concluir = document.querySelector("#concluir");
const progresso = document.querySelector("#progresso");
const contadorPagina = document.querySelector("#contador-pagina");
const tituloPagina = document.querySelector("#titulo-pagina");
const erroValidacao = document.querySelector("#erro-validacao");
let paginaAtual = 0;

progresso.max = pages.length;

function mostrarPagina(indice) {
    paginaAtual = indice;
    erroValidacao.hidden = true;
    pages.forEach((pagina, posicao) => {
        pagina.hidden = posicao !== paginaAtual;
    });

    anterior.disabled = paginaAtual === 0;
    proximo.hidden = paginaAtual === pages.length - 1;
    concluir.hidden = paginaAtual !== pages.length - 1;
    progresso.value = paginaAtual + 1;
    contadorPagina.textContent = `Página ${paginaAtual + 1} de ${pages.length}`;
    tituloPagina.textContent = pages[paginaAtual].dataset.pageTitle;
    pages[paginaAtual].querySelector("h2").focus({ preventScroll: true });
    window.scrollTo(0, 0);
}

function validarPaginaAtual() {
    const invalidos = [...pages[paginaAtual].querySelectorAll(":invalid")];
    if (invalidos.length === 0) {
        erroValidacao.hidden = true;
        return true;
    }

    erroValidacao.hidden = false;
    invalidos[0].focus();
    return false;
}

function gerarResumo() {
    const dados = new FormData(form);
    const linhas = [
        "RESUMO INDIVIDUAL DO PRÉ-CONSELHO DE CLASSE",
        `Estudante: ${dados.get("nome").trim() || "Não informado"}`,
        `Turma: ${dados.get("turma").trim()}`,
        `Período letivo: ${dados.get("periodo").trim()}`,
        `Data: ${dados.get("data") ? new Date(`${dados.get("data")}T00:00:00`).toLocaleDateString("pt-BR") : "Não informado"}`,
    ];

    pages.slice(1).forEach((pagina) => {
        linhas.push("", pagina.dataset.pageTitle.toLocaleUpperCase("pt-BR"));

        pagina.querySelectorAll(".question").forEach((questao) => {
            const pergunta = questao.querySelector("legend").textContent.trim();
            const respostas = [...questao.querySelectorAll("input:checked")]
                .map((resposta) => resposta.value);
            linhas.push(`${pergunta} ${respostas.length > 0 ? respostas.join("; ") : "Não selecionado"}`);
        });

        const observacao = pagina.querySelector("[data-observation]").value.trim();
        if (observacao) {
            linhas.push(`Observações: ${observacao}`);
        }
    });

    resumo.textContent = linhas.join("\n");
    form.hidden = true;
    resultado.hidden = false;
    document.body.classList.add("showing-summary");
    resultado.scrollIntoView({ behavior: "smooth", block: "start" });
}

proximo.addEventListener("click", () => {
    if (validarPaginaAtual()) {
        mostrarPagina(paginaAtual + 1);
    }
});

anterior.addEventListener("click", () => {
    if (paginaAtual > 0) {
        mostrarPagina(paginaAtual - 1);
    }
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (validarPaginaAtual()) {
        gerarResumo();
    }
});

form.addEventListener("reset", () => {
    window.setTimeout(() => {
        resultado.hidden = true;
        form.hidden = false;
        document.body.classList.remove("showing-summary");
        mostrarPagina(0);
    }, 0);
});

document.querySelector("#baixar").addEventListener("click", () => {
    const arquivo = new Blob([resumo.textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resumo-individual-pre-conselho.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.querySelector("#imprimir").addEventListener("click", () => window.print());

document.querySelector("#editar").addEventListener("click", () => {
    resultado.hidden = true;
    form.hidden = false;
    document.body.classList.remove("showing-summary");
    mostrarPagina(pages.length - 1);
});

mostrarPagina(0);

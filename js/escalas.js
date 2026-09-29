/* =========================================================
   GERENCIAMENTO DE ESCALAS
========================================================= */

const STORAGE_ESCALAS =
    "escala_celebracoes";


let escalaAtualVisualizada = null;


/* =========================================================
   STORAGE
========================================================= */

function obterEscalas() {

    return JSON.parse(
        localStorage.getItem(STORAGE_ESCALAS) || "[]"
    );

}


function salvarEscalas(lista) {

    localStorage.setItem(
        STORAGE_ESCALAS,
        JSON.stringify(lista)
    );

}


/* =========================================================
   FORMULÁRIO
========================================================= */

function limparFormularioEscala() {

    document.getElementById(
        "formEscala"
    ).reset();


    const hoje =
        new Date()
            .toISOString()
            .split("T")[0];


    document.getElementById(
        "escalaData"
    ).value = hoje;


    document.getElementById(
        "functionsBuilder"
    ).innerHTML = "";


    adicionarFuncao("Cerimoniário", 1);

    adicionarFuncao("Cruciferário", 1);

    adicionarFuncao("Ceriferário", 2);

}


/* =========================================================
   ADICIONAR FUNÇÃO
========================================================= */

function adicionarFuncao(
    nome = "",
    quantidade = 1
) {

    const container =
        document.getElementById(
            "functionsBuilder"
        );


    const row =
        document.createElement("div");


    row.className =
        "function-row";


    row.innerHTML = `

        <select class="form-select custom-select funcao-nome">

            <option value="">
                Selecione uma função
            </option>

            <option value="Cerimoniário"
                ${nome === "Cerimoniário" ? "selected" : ""}
            >
                Cerimoniário
            </option>

            <option value="Cruciferário"
                ${nome === "Cruciferário" ? "selected" : ""}
            >
                Cruciferário
            </option>

            <option value="Ceriferário"
                ${nome === "Ceriferário" ? "selected" : ""}
            >
                Ceriferário
            </option>

            <option value="Turiferário"
                ${nome === "Turiferário" ? "selected" : ""}
            >
                Turiferário
            </option>

            <option value="Naveteiro"
                ${nome === "Naveteiro" ? "selected" : ""}
            >
                Naveteiro
            </option>
        </select>


        <input
            type="number"
            class="form-control custom-input funcao-quantidade"
            min="1"
            max="20"
            value="${quantidade}"
        >


        <button
            type="button"
            class="btn btn-outline-danger"
            onclick="this.parentElement.remove()"
        >

            <i class="bi bi-trash"></i>

        </button>

    `;


    container.appendChild(row);

}


/* =========================================================
   CRIAR ESCALA
========================================================= */

function criarEscala() {

    const data =
        document.getElementById(
            "escalaData"
        ).value;


    const hora =
        document.getElementById(
            "escalaHora"
        ).value;


    if (!data || !hora) {

        Swal.fire(
            "Informações incompletas",
            "Informe a data e o horário.",
            "warning"
        );

        return;

    }


    const linhas =
        document.querySelectorAll(
            ".function-row"
        );


    const funcoes = [];


    linhas.forEach(linha => {

        const nome =
            linha.querySelector(
                ".funcao-nome"
            ).value;


        const quantidade =
            parseInt(
                linha.querySelector(
                    ".funcao-quantidade"
                ).value
            );


        if (nome && quantidade > 0) {

            funcoes.push({

                nome,

                quantidade

            });

        }

    });


    if (!funcoes.length) {

        Swal.fire(
            "Nenhuma função",
            "Adicione pelo menos uma função.",
            "warning"
        );

        return;

    }


    const escala =
        gerarEscalaAutomaticamente(
            data,
            hora,
            funcoes
        );


    const escalas =
        obterEscalas();


    escalas.push(escala);


    salvarEscalas(escalas);


    renderizarEscalas();

    atualizarDashboard();


    bootstrap.Modal
        .getInstance(
            document.getElementById("modalEscala")
        )
        .hide();

    const vagasVazias = escala.funcoes.reduce(
        (total, f) => total + f.pessoas.filter(p => !p.acolitoId).length,
        0
    );

    if (vagasVazias > 0) {
        Swal.fire({
            icon: "warning",
            title: "Escala com vagas em aberto",
            html:
                `<p>${vagasVazias} vaga(s) ficaram como <strong>não preenchida</strong>.</p>
                 <p class="mb-0">Isso acontece quando não há acólito <em>ativo</em>, com a <em>função</em> marcada e <em>disponível neste dia da semana</em>.</p>
                 <p class="mt-2 mb-0 text-muted small">Dica: em Acólitos → Editar → marque o dia da celebração em Disponibilidade.</p>`,
            confirmButtonText: "Entendi",
            confirmButtonColor: "#435ebe"
        }).then(() => {
            visualizarEscala(escala.id);
        });
    } else {
        visualizarEscala(escala.id);
    }

}


/* =========================================================
   LISTA
========================================================= */

function renderizarEscalas() {

    const container =
        document.getElementById(
            "listaEscalas"
        );


    if (!container) return;


    const escalas =
        obterEscalas();


    if (!escalas.length) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="bi bi-calendar-x"></i>

                <h5>Nenhuma escala criada</h5>

                <p>
                    Crie sua primeira escala.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        [...escalas]
            .reverse()
            .map(criarCardEscala)
            .join("");

}


function criarCardEscala(escala) {

    const data =
        new Date(
            escala.data + "T12:00:00"
        );


    const dia =
        data.getDate();


    const mes =
        data.toLocaleDateString(
            "pt-BR",
            {
                month: "short"
            }
        );


    const quantidade =
        escala.funcoes.reduce(
            (total, funcao) =>
                total + funcao.pessoas.length,
            0
        );


    return `

        <div class="escala-card">

            <div class="escala-date">

                <strong>
                    ${dia}
                </strong>

                <span>
                    ${mes}
                </span>

            </div>


            <div class="escala-info">

                <strong>
                    Celebração · ${escala.hora}
                </strong>

                <span>
                    ${quantidade} vagas ·
                    ${formatarDataCompleta(escala.data)}
                </span>

            </div>


            <div class="escala-actions">

                <button
                    class="btn btn-sm btn-outline-primary"
                    onclick="visualizarEscala('${escala.id}')"
                >

                    <i class="bi bi-eye"></i>

                    Abrir

                </button>


                <button
                    class="btn btn-sm btn-outline-danger"
                    onclick="excluirEscala('${escala.id}')"
                >

                    <i class="bi bi-trash"></i>

                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   VISUALIZAR
========================================================= */

function visualizarEscala(id) {

    const escala =
        obterEscalas()
            .find(e => e.id === id);


    if (!escala) return;


    escalaAtualVisualizada =
        escala;


    document.getElementById(
        "visualEscalaTitulo"
    ).textContent =
        `${formatarDataCompleta(escala.data)} · ${escala.hora}`;


    renderizarEscalaVisual(escala);


    bootstrap.Modal
        .getOrCreateInstance(
            document.getElementById(
                "modalVisualizarEscala"
            )
        )
        .show();

}


/* =========================================================
   VISUAL DA ESCALA
========================================================= */

function renderizarEscalaVisual(escala) {

    const container =
        document.getElementById(
            "scalePreview"
        );


    let html = `

        <div class="scale-header">

            <span>
                ESCALA DE ACÓLITOS
            </span>

            <h2>
                ${formatarDataCompleta(escala.data)}
            </h2>

            <p>
                ${escala.hora}
            </p>

        </div>


        <div class="scale-body">

    `;


    escala.funcoes.forEach(funcao => {

        html += `

            <div class="scale-function">

                <div class="scale-function-title">
                    ${funcao.nome}
                </div>

        `;


        funcao.pessoas.forEach(
            (pessoa, index) => {

                const bloqueado =
                    pessoa.locked;

                const acolitoEscalado =
                    pessoa.acolitoId
                        ? obterAcolitos().find(
                            acolito =>
                                acolito.id === pessoa.acolitoId
                        )
                        : null;

                html += `

                    <div class="scale-person">

                        <div class="scale-person-main">

                            ${criarAvatarHTML(acolitoEscalado)}

                            <span class="scale-person-name">
                                ${pessoa.nome}
                            </span>

                        </div>

                        <div class="scale-person-controls">

                            <button
                                class="lock-btn"
                                onclick="
                                    alternarLock(
                                        '${escala.id}',
                                        '${funcao.id}',
                                        ${index}
                                    )
                                "
                                title="Alterar substituto"
                            >
                                <i class="bi bi-lock-fill"></i>
                            </button>

                        </div>

                    </div>

                `;

            }
        );


        html += `

            </div>

        `;

    });


    html += `

        </div>

    `;


    container.innerHTML = html;

}


/* =========================================================
   LOCK / UNLOCK
========================================================= */

function alternarLock(
    escalaId,
    funcaoId,
    pessoaIndex
) {
    abrirModalSubstituicao(
        escalaId,
        funcaoId,
        pessoaIndex
    );
}


/* =========================================================
   SUBSTITUIÇÃO INDIVIDUAL
========================================================= */

let vagaSubstituicaoAtual = null;

function obterContextoSubstituicao(
    escalaId,
    funcaoId,
    pessoaIndex
) {
    const escala = obterEscalas().find(
        e => e.id === escalaId
    );

    if (!escala) return null;

    const funcao = escala.funcoes.find(
        f => f.id === funcaoId
    );

    if (!funcao) return null;

    const pessoa = funcao.pessoas[pessoaIndex];

    if (!pessoa) return null;

    return { escala, funcao, pessoa, pessoaIndex };
}

function abrirModalSubstituicao(
    escalaId,
    funcaoId,
    pessoaIndex
) {
    const contexto = obterContextoSubstituicao(
        escalaId,
        funcaoId,
        pessoaIndex
    );

    if (!contexto) return;

    vagaSubstituicaoAtual = {
        escalaId,
        funcaoId,
        pessoaIndex
    };

    const modalEscala = bootstrap.Modal.getInstance(
        document.getElementById("modalVisualizarEscala")
    );

    if (modalEscala) modalEscala.hide();

    const acolitoAtual = contexto.pessoa.acolitoId
        ? obterAcolitos().find(
            a => a.id === contexto.pessoa.acolitoId
        )
        : null;

    document.getElementById("substituicaoTitulo").textContent =
        acolitoAtual
            ? `Alterar ${acolitoAtual.nome}`
            : "Escolher substituto";

    document.getElementById("substituicaoDescricao").textContent =
        `Função: ${contexto.funcao.nome}`;

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modalEscolhaSubstituicao")
    ).show();
}

function fecharModalEscolhaSubstituicao() {
    const modal = bootstrap.Modal.getInstance(
        document.getElementById("modalEscolhaSubstituicao")
    );

    if (modal) modal.hide();
}

function obterOutrosSelecionados(
    escala,
    funcaoAtual,
    pessoaIndexAtual
) {
    const selecionados = [];

    escala.funcoes.forEach(funcao => {
        funcao.pessoas.forEach((pessoa, index) => {
            if (
                funcao.id === funcaoAtual.id &&
                index === pessoaIndexAtual
            ) {
                return;
            }

            if (pessoa.acolitoId) {
                selecionados.push(pessoa);
            }
        });
    });

    return selecionados;
}

function obterCandidatosSubstituicao(
    escala,
    funcao,
    pessoaIndex
) {
    const atual = funcao.pessoas[pessoaIndex];

    const selecionados = obterOutrosSelecionados(
        escala,
        funcao,
        pessoaIndex
    );

    return obterAcolitos().filter(acolito => {
        if (!acolito.ativo) return false;

        if (!acolito.funcoes.includes(funcao.nome)) {
            return false;
        }

        if (!estaDisponivel(acolito, escala.data)) {
            return false;
        }

        if (
            atual.acolitoId &&
            acolito.id === atual.acolitoId
        ) {
            return false;
        }

        if (
            selecionados.some(
                pessoa => pessoa.acolitoId === acolito.id
            )
        ) {
            return false;
        }

        return true;
    });
}

function substituirPessoaPorSorteio() {
    if (!vagaSubstituicaoAtual) return;

    const contexto = obterContextoSubstituicao(
        vagaSubstituicaoAtual.escalaId,
        vagaSubstituicaoAtual.funcaoId,
        vagaSubstituicaoAtual.pessoaIndex
    );

    if (!contexto) return;

    const candidatos = obterCandidatosSubstituicao(
        contexto.escala,
        contexto.funcao,
        contexto.pessoaIndex
    );

    if (!candidatos.length) {
        fecharModalEscolhaSubstituicao();

        Swal.fire({
            icon: "warning",
            title: "Nenhum substituto encontrado",
            text:
                "Não há outro acólito disponível e habilitado para esta função."
        });

        return;
    }

    const novaPessoa = sortearPessoa(
        {
            nome: contexto.funcao.nome,
            quantidade: 1
        },
        contexto.escala,
        obterOutrosSelecionados(
            contexto.escala,
            contexto.funcao,
            contexto.pessoaIndex
        ),
        [contexto.pessoa.acolitoId].filter(Boolean)
    );

    if (!novaPessoa) {
        fecharModalEscolhaSubstituicao();

        Swal.fire({
            icon: "warning",
            title: "Nenhum substituto encontrado",
            text:
                "Não foi possível sortear outro acólito para esta vaga."
        });

        return;
    }

    aplicarSubstituicao(contexto, novaPessoa);
}

function abrirEscolhaManualSubstituto() {
    if (!vagaSubstituicaoAtual) return;

    const contexto = obterContextoSubstituicao(
        vagaSubstituicaoAtual.escalaId,
        vagaSubstituicaoAtual.funcaoId,
        vagaSubstituicaoAtual.pessoaIndex
    );

    if (!contexto) return;

    const candidatos = obterCandidatosSubstituicao(
        contexto.escala,
        contexto.funcao,
        contexto.pessoaIndex
    );

    document.getElementById(
        "manualSubstituicaoDescricao"
    ).textContent =
        `${contexto.funcao.nome} • ${candidatos.length} disponível(is)`;

    const container = document.getElementById(
        "listaSubstitutos"
    );

    if (!candidatos.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-person-x"></i>
                <h5>Nenhum substituto disponível</h5>
                <p>
                    Não há outro acólito ativo, disponível e habilitado
                    para esta função neste dia.
                </p>
            </div>
        `;
    } else {
        const ordem = {
            alta: 3,
            normal: 2,
            baixa: 1
        };

        container.innerHTML = candidatos
            .sort(
                (a, b) =>
                    (ordem[b.prioridade] || 0) -
                    (ordem[a.prioridade] || 0)
            )
            .map(acolito => `
                <button
                    type="button"
                    class="replacement-modal-person"
                    onclick="selecionarSubstitutoManual('${acolito.id}')"
                >
                    ${criarAvatarHTML(acolito)}

                    <span class="replacement-modal-info">
                        <span class="replacement-modal-name">
                            ${acolito.nome}
                        </span>

                        <span class="replacement-modal-details">
                            Prioridade: ${acolito.prioridade}
                        </span>
                    </span>
                </button>
            `).join("");
    }

    fecharModalEscolhaSubstituicao();

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modalSubstitutoManual")
    ).show();
}

function selecionarSubstitutoManual(acolitoId) {
    if (!vagaSubstituicaoAtual) return;

    const contexto = obterContextoSubstituicao(
        vagaSubstituicaoAtual.escalaId,
        vagaSubstituicaoAtual.funcaoId,
        vagaSubstituicaoAtual.pessoaIndex
    );

    if (!contexto) return;

    const escolhido = obterAcolitos().find(
        a => a.id === acolitoId
    );

    if (!escolhido) {
        Swal.fire({
            icon: "warning",
            title: "Acólito indisponível",
            text:
                "Esse acólito não está mais elegível para esta vaga."
        });

        return;
    }

    aplicarSubstituicao(
        contexto,
        {
            acolitoId: escolhido.id,
            nome: escolhido.nome,
            foto: escolhido.foto || ""
        }
    );
}

function aplicarSubstituicao(
    contexto,
    novaPessoa
) {
    const escalas = obterEscalas();

    const escala = escalas.find(
        e => e.id === contexto.escala.id
    );

    if (!escala) return;

    const funcao = escala.funcoes.find(
        f => f.id === contexto.funcao.id
    );

    if (!funcao) return;

    funcao.pessoas[contexto.pessoaIndex] = {
        ...novaPessoa,
        locked: true
    };

    salvarEscalas(escalas);

    escalaAtualVisualizada = escala;

    const manual = bootstrap.Modal.getInstance(
        document.getElementById("modalSubstitutoManual")
    );

    if (manual) manual.hide();

    fecharModalEscolhaSubstituicao();

    renderizarEscalaVisual(escala);

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modalVisualizarEscala")
    ).show();

    Swal.fire({
        icon: "success",
        title: "Vaga atualizada!",
        text:
            `${novaPessoa.nome} foi selecionado(a).`,
        timer: 1400,
        showConfirmButton: false
    });
}


/* =========================================================
   EXCLUIR ESCALA
========================================================= */

function excluirEscala(id) {

    Swal.fire({

        title: "Excluir escala?",

        text: "Esta ação não pode ser desfeita.",

        icon: "warning",

        showCancelButton: true,

        confirmButtonColor: "#dc3545",

        cancelButtonText: "Cancelar",

        confirmButtonText: "Excluir"

    }).then(resultado => {

        if (!resultado.isConfirmed) return;


        const novaLista =
            obterEscalas()
                .filter(
                    escala =>
                        escala.id !== id
                );


        salvarEscalas(novaLista);

        renderizarEscalas();

        atualizarDashboard();

    });

}

/* =========================================================
   GERENCIAMENTO DE ACÓLITOS
========================================================= */

const STORAGE_ACOLITOS = "escala_acolitos";
const STORAGE_EXEMPLOS_VERSAO = "escala_exemplos_versao";

/* =========================================================
   MIGRAÇÃO / ATUALIZAÇÃO DE DADOS
========================================================= */

const EXEMPLOS_VERSAO_ATUAL = "2";

function normalizarDia(dia) {
    if (!dia) return dia;
    const mapa = {
        "terça": "terca",
        "sábado": "sabado",
        "segunda-feira": "segunda",
        "terça-feira": "terca",
        "quarta-feira": "quarta",
        "quinta-feira": "quinta",
        "sexta-feira": "sexta"
    };
    return mapa[dia] || dia;
}

function atualizarDadosDeExemplo() {
    const versao = localStorage.getItem(STORAGE_EXEMPLOS_VERSAO);

    let lista = obterAcolitos();
    let alterou = false;

    lista = lista.map(acolito => {
        const copia = { ...acolito };

        if (Array.isArray(copia.disponibilidade)) {
            const normalizada = copia.disponibilidade.map(normalizarDia);
            if (JSON.stringify(normalizada) !== JSON.stringify(copia.disponibilidade)) {
                copia.disponibilidade = normalizada;
                alterou = true;
            }
        }

        if (!copia.corAvatar) {
            copia.corAvatar = gerarCorAvatarPastel();
            alterou = true;
        }

        if (!Array.isArray(copia.funcoes)) {
            copia.funcoes = [];
            alterou = true;
        }

        if (typeof copia.ativo !== "boolean") {
            copia.ativo = true;
            alterou = true;
        }

        return copia;
    });

    if (alterou || versao !== EXEMPLOS_VERSAO_ATUAL) {
        salvarAcolitos(lista);
        localStorage.setItem(STORAGE_EXEMPLOS_VERSAO, EXEMPLOS_VERSAO_ATUAL);
    }

    salvarCoresAvatarSeNecessario(obterAcolitos());
}


/* =========================================================
   AVATARES
========================================================= */

const CORES_AVATAR_PASTEL = [
    "#DCEBFF", "#E8DFFF", "#FFE1E8", "#DDF3E4", "#FFF0C7",
    "#DDF3F3", "#F1E1D0", "#E5E5FF", "#E5F0D5", "#F4DFEE"
];

let fotoTemporariaAcolito = "";

function gerarCorAvatarPastel() {
    return CORES_AVATAR_PASTEL[
        Math.floor(Math.random() * CORES_AVATAR_PASTEL.length)
    ];
}

function obterIniciais(nome) {
    const partes = nome.trim().split(/\s+/).filter(Boolean);

    if (!partes.length) return "?";

    if (partes.length === 1) {
        return partes[0].charAt(0).toUpperCase();
    }

    return (
        partes[0].charAt(0) +
        partes[partes.length - 1].charAt(0)
    ).toUpperCase();
}

function garantirCorAvatar(acolito) {
    if (!acolito.corAvatar) {
        acolito.corAvatar = gerarCorAvatarPastel();
    }

    return acolito.corAvatar;
}

function criarAvatarHTML(acolito, classe = "") {
    if (!acolito) {
        return `
            <div class="acolito-avatar ${classe} avatar-sem-pessoa">
                <i class="bi bi-person-fill"></i>
            </div>
        `;
    }

    const cor = garantirCorAvatar(acolito);

    if (acolito.foto) {
        return `
            <div class="acolito-avatar ${classe}">
                <img src="${acolito.foto}" alt="${acolito.nome}">
            </div>
        `;
    }

    return `
        <div class="acolito-avatar ${classe}"
            style="background-color: ${cor};"
            aria-label="${acolito.nome}">
            <span>${obterIniciais(acolito.nome)}</span>
        </div>
    `;
}

function salvarCoresAvatarSeNecessario(lista) {
    let alterou = false;

    lista.forEach(acolito => {
        if (!acolito.corAvatar) {
            acolito.corAvatar = gerarCorAvatarPastel();
            alterou = true;
        }
    });

    if (alterou) {
        salvarAcolitos(lista);
    }
}


/* =========================================================
   DADOS INICIAIS
========================================================= */

function inicializarDados() {

    if (!localStorage.getItem(STORAGE_ACOLITOS)) {

        const exemplos = [

            {
                id: gerarId(),

                nome: "Natali",

                foto: "",

                ativo: true,

                prioridade: "normal",

                funcoes: [
                    "Cerimoniário",
                    "Cruciferário"
                ],

                disponibilidade: [
                    "domingo",
                    "terca",
                    "quinta"
                ]

            },


            {
                id: gerarId(),

                nome: "Lorena",

                foto: "",

                ativo: true,

                prioridade: "normal",

                funcoes: [
                    "Cruciferário",
                    "Ceriferário"
                ],

                disponibilidade: [
                    "domingo",
                    "terca",
                    "quarta"
                ]

            },


            {
                id: gerarId(),

                nome: "Cristian",

                foto: "",

                ativo: true,

                prioridade: "normal",

                funcoes: [
                    "Ceriferário",
                    "Turiferário"
                ],

                disponibilidade: [
                    "terca",
                    "quinta",
                    "domingo"
                ]

            },


            {
                id: gerarId(),

                nome: "Larissa",

                foto: "",

                ativo: true,

                prioridade: "alta",

                funcoes: [
                    "Ceriferário",
                    "Naveteiro"
                ],

                disponibilidade: [
                    "terca",
                    "quarta",
                    "domingo"
                ]

            },


            {
                id: gerarId(),

                nome: "Gabriela",

                foto: "",

                ativo: true,

                prioridade: "alta",

                funcoes: [
                    "Ceriferário",
                    "Cruciferário"
                ],

                disponibilidade: [
                    "domingo",
                    "terca",
                    "quarta",
                    "quinta"
                ]

            }

        ];


        salvarAcolitos(exemplos);

    }

}


/* =========================================================
   STORAGE
========================================================= */

function obterAcolitos() {

    return JSON.parse(
        localStorage.getItem(STORAGE_ACOLITOS) || "[]"
    );

}


function salvarAcolitos(lista) {

    localStorage.setItem(
        STORAGE_ACOLITOS,
        JSON.stringify(lista)
    );

}


/* =========================================================
   FORMULÁRIO
========================================================= */

function limparFormularioAcolito() {

    document.getElementById("formAcolito").reset();

    document.getElementById("acolitoId").value = "";

    fotoTemporariaAcolito = "";

    document.getElementById("photoPreview").innerHTML =
        `<i class="bi bi-person-fill"></i>`;

    document.getElementById("modalAcolitoTitulo")
        .textContent = "Novo acólito";

}


function salvarAcolito() {

    const nome =
        document.getElementById("acolitoNome")
            .value.trim();


    if (!nome) {

        Swal.fire(
            "Ops!",
            "Digite o nome do acólito.",
            "warning"
        );

        return;

    }


    const id =
        document.getElementById("acolitoId").value;


    const funcoes = [
        ...document.querySelectorAll(".funcao-check:checked")
    ].map(input => input.value);


    const disponibilidade = [
        ...document.querySelectorAll(".dia-check:checked")
    ].map(input => input.value);


    if (!funcoes.length) {

        Swal.fire(
            "Função necessária",
            "Selecione pelo menos uma função.",
            "warning"
        );

        return;

    }


    const prioridade =
        document.getElementById(
            "acolitoPrioridade"
        ).value;


    const lista =
        obterAcolitos();


    if (id) {

        const index =
            lista.findIndex(a => a.id === id);


        if (index !== -1) {

            lista[index].nome = nome;

            lista[index].prioridade =
                prioridade;

            lista[index].funcoes =
                funcoes;

            lista[index].disponibilidade =
                disponibilidade;

            if (fotoTemporariaAcolito) {
                lista[index].foto = fotoTemporariaAcolito;
            }

        }

    } else {

        lista.push({

            id: gerarId(),

            nome,

            foto: fotoTemporariaAcolito || "",

            ativo: true,

            prioridade,

            funcoes,

            disponibilidade,

            corAvatar: gerarCorAvatarPastel()

        });

    }


    salvarAcolitos(lista);

    renderizarAcolitos();

    atualizarDashboard();


    bootstrap.Modal
        .getInstance(
            document.getElementById("modalAcolito")
        )
        .hide();


    Swal.fire({

        icon: "success",

        title: "Salvo!",

        text: "Acólito cadastrado com sucesso.",

        timer: 1500,

        showConfirmButton: false

    });

}


/* =========================================================
   RENDER
========================================================= */

function renderizarAcolitos() {

    const container =
        document.getElementById("listaAcolitos");


    if (!container) return;


    const busca =
        (
            document.getElementById(
                "searchAcolito"
            )?.value || ""
        ).toLowerCase();


    const filtro =
        document.getElementById(
            "filtroStatus"
        )?.value || "todos";


    let lista =
        obterAcolitos();


    lista = lista.filter(acolito => {

        const combinaNome =
            acolito.nome
                .toLowerCase()
                .includes(busca);


        const combinaStatus =
            filtro === "todos" ||
            (filtro === "ativo" && acolito.ativo) ||
            (filtro === "inativo" && !acolito.ativo);


        return combinaNome && combinaStatus;

    });


    if (!lista.length) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="bi bi-person-x"></i>

                <h5>Nenhum acólito encontrado</h5>

                <p>
                    Tente alterar os filtros ou cadastre alguém.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        lista.map(criarCardAcolito).join("");

}


function criarCardAcolito(acolito) {

    const funcoes =
        (acolito.funcoes || []).map(funcao => `
            <span class="function-badge">
                ${funcao}
            </span>
        `).join("");


    return `

        <div class="acolito-card">

            <div class="acolito-header">

                <div class="acolito-photo">
                    ${criarAvatarHTML(acolito)}
                </div>

                <div>

                    <div class="acolito-name">
                        ${acolito.nome}
                    </div>

                    <span class="status-badge ${
                        acolito.ativo
                            ? "ativo"
                            : "inativo"
                    }">

                        <i class="bi bi-circle-fill"></i>

                        ${
                            acolito.ativo
                                ? "Ativo"
                                : "Inativo"
                        }

                    </span>

                </div>

            </div>


            <div class="acolito-functions">

                ${funcoes}

            </div>


            <div class="mb-3">

                <span class="priority-badge ${acolito.prioridade}">

                    <i class="bi bi-star-fill"></i>

                    Prioridade:
                    ${acolito.prioridade}

                </span>

            </div>


            <div class="acolito-actions">

                <button
                    class="btn btn-sm btn-outline-primary"
                    onclick="editarAcolito('${acolito.id}')"
                >
                    <i class="bi bi-pencil"></i>
                </button>


                <button
                    class="btn btn-sm btn-outline-secondary"
                    onclick="alternarStatusAcolito('${acolito.id}')"
                >

                    <i class="bi ${
                        acolito.ativo
                            ? "bi-pause"
                            : "bi-play"
                    }"></i>

                    ${
                        acolito.ativo
                            ? "Desativar"
                            : "Ativar"
                    }

                </button>


                <button
                    class="btn btn-sm btn-outline-danger"
                    onclick="excluirAcolito('${acolito.id}')"
                >
                    <i class="bi bi-trash"></i>
                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   EDITAR
========================================================= */

function editarAcolito(id) {

    const acolito =
        obterAcolitos()
            .find(a => a.id === id);


    if (!acolito) return;


    document.getElementById("acolitoId")
        .value = acolito.id;


    document.getElementById("acolitoNome")
        .value = acolito.nome;


    document.getElementById("acolitoPrioridade")
        .value = acolito.prioridade;


    document.querySelectorAll(".funcao-check")
        .forEach(input => {

            input.checked =
                acolito.funcoes.includes(input.value);

        });


    document.querySelectorAll(".dia-check")
        .forEach(input => {

            input.checked =
                acolito.disponibilidade.includes(input.value);

        });


    document.getElementById("modalAcolitoTitulo")
        .textContent = "Editar acólito";

    fotoTemporariaAcolito = "";

    if (acolito.foto) {
        document.getElementById("photoPreview").innerHTML =
            `<img src="${acolito.foto}">`;
    } else {
        document.getElementById("photoPreview").innerHTML =
            `<i class="bi bi-person-fill"></i>`;
    }


    bootstrap.Modal
        .getOrCreateInstance(
            document.getElementById("modalAcolito")
        )
        .show();

}


/* =========================================================
   STATUS
========================================================= */

function alternarStatusAcolito(id) {

    const lista =
        obterAcolitos();


    const acolito =
        lista.find(a => a.id === id);


    if (!acolito) return;


    acolito.ativo =
        !acolito.ativo;


    salvarAcolitos(lista);

    renderizarAcolitos();

    atualizarDashboard();

}


/* =========================================================
   EXCLUIR
========================================================= */

function excluirAcolito(id) {

    const acolito =
        obterAcolitos()
            .find(a => a.id === id);


    if (!acolito) return;


    Swal.fire({

        title: "Excluir acólito?",

        text:
            `${acolito.nome} será removido do cadastro.`,

        icon: "warning",

        showCancelButton: true,

        confirmButtonColor: "#dc3545",

        cancelButtonColor: "#6c757d",

        confirmButtonText: "Excluir",

        cancelButtonText: "Cancelar"

    }).then(resultado => {

        if (!resultado.isConfirmed) return;


        const novaLista =
            obterAcolitos()
                .filter(a => a.id !== id);


        salvarAcolitos(novaLista);

        renderizarAcolitos();

        atualizarDashboard();

    });

}


/* =========================================================
   FOTO
========================================================= */

document
    .getElementById("acolitoFoto")
    ?.addEventListener("change", evento => {

        const arquivo =
            evento.target.files[0];


        if (!arquivo) return;


        const reader =
            new FileReader();


        reader.onload = e => {

            fotoTemporariaAcolito = e.target.result;

            document.getElementById(
                "photoPreview"
            ).innerHTML =
                `<img src="${e.target.result}">`;

        };


        reader.readAsDataURL(arquivo);

    });

/* =========================================================
   APP PRINCIPAL
========================================================= */


/* =========================================================
   NAVEGAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    configurarNavegacao();

    inicializarDados();

    atualizarDadosDeExemplo();

    atualizarDashboard();

    renderizarAcolitos();

    renderizarEscalas();

});


function configurarNavegacao() {

    const botoes = document.querySelectorAll(".nav-item");

    botoes.forEach(botao => {

        botao.addEventListener("click", () => {

            const pagina = botao.dataset.page;

            navegarPara(pagina);

        });

    });

}


function navegarPara(pagina) {

    document.querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active-page");

        });


    const paginaSelecionada =
        document.getElementById(`page-${pagina}`);


    if (paginaSelecionada) {

        paginaSelecionada.classList.add("active-page");

    }


    document.querySelectorAll(".nav-item")
        .forEach(botao => {

            botao.classList.toggle(
                "active",
                botao.dataset.page === pagina
            );

        });


    const nomes = {

        dashboard: "Dashboard",

        acolitos: "Acólitos",

        escalas: "Escalas"

    };


    document.getElementById("pageLabel").textContent =
        nomes[pagina] || "Escala";


    document.querySelector(".sidebar")
        ?.classList.remove("open");

}


/* =========================================================
   MENU MOBILE
========================================================= */

document
    .getElementById("mobileMenuBtn")
    ?.addEventListener("click", () => {

        document
            .querySelector(".sidebar")
            .classList.toggle("open");

    });


/* =========================================================
   DASHBOARD
========================================================= */

function atualizarDashboard() {

    const acolitos =
        obterAcolitos();

    const escalas =
        obterEscalas();


    const ativos =
        acolitos.filter(a => a.ativo);


    document.getElementById("statAcolitos")
        .textContent = ativos.length;


    document.getElementById("statEscalas")
        .textContent = escalas.length;


    let participacoes = 0;


    escalas.forEach(escala => {

        escala.funcoes.forEach(funcao => {

            participacoes += funcao.pessoas.length;

        });

    });


    document.getElementById("statParticipacoes")
        .textContent = participacoes;


    if (escalas.length > 0) {

        const ultima =
            escalas[escalas.length - 1];

        document.getElementById("statUltimaEscala")
            .textContent =
            formatarDataCurta(ultima.data);

    } else {

        document.getElementById("statUltimaEscala")
            .textContent = "—";

    }


    renderizarProximaEscala();

}


function renderizarProximaEscala() {

    const container =
        document.getElementById(
            "dashboardProximaEscala"
        );


    const escalas =
        obterEscalas();


    if (!escalas.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-calendar-x"></i>

                <h5>Nenhuma escala criada</h5>

                <p>
                    Crie a primeira escala para começar.
                </p>

                <button
                    class="btn btn-primary-custom"
                    onclick="abrirNovaEscala()"
                >
                    Criar escala
                </button>
            </div>
        `;

        return;

    }


    const escala = escalas[escalas.length - 1];


    container.innerHTML = criarCardEscalaDashboard(escala);

}


function criarCardEscalaDashboard(escala) {

    const data =
        formatarDataCompleta(escala.data);


    return `

        <div class="escala-card">

            <div class="escala-date">

                <strong>
                    ${new Date(escala.data + "T12:00:00").getDate()}
                </strong>

                <span>
                    ${formatarMes(escala.data)}
                </span>

            </div>


            <div class="escala-info">

                <strong>
                    Celebração · ${escala.hora}
                </strong>

                <span>
                    ${data}
                </span>

            </div>


            <div class="escala-actions">

                <button
                    class="btn btn-outline-primary btn-sm"
                    onclick="visualizarEscala('${escala.id}')"
                >
                    <i class="bi bi-eye"></i>
                    Ver escala
                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   MODAIS
========================================================= */

function abrirNovoAcolito() {

    limparFormularioAcolito();

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById("modalAcolito")
        );

    modal.show();

}


function abrirNovaEscala() {

    limparFormularioEscala();

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById("modalEscala")
        );

    modal.show();

}


/* =========================================================
   NOTIFICAÇÃO
========================================================= */

function mostrarNotificacao() {

    Swal.fire({

        icon: "info",

        title: "Tudo certo!",

        text: "Nenhuma nova notificação.",

        confirmButtonText: "Fechar",

        confirmButtonColor: "#435ebe"

    });

}


/* =========================================================
   UTILITÁRIOS
========================================================= */

function gerarId() {

    return Date.now().toString(36) +
        Math.random().toString(36).substring(2);

}


function formatarDataCurta(data) {

    const d =
        new Date(data + "T12:00:00");

    return d.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit"
        }
    );

}


function formatarDataCompleta(data) {

    const d =
        new Date(data + "T12:00:00");

    return d.toLocaleDateString(
        "pt-BR",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


function formatarMes(data) {

    const d =
        new Date(data + "T12:00:00");

    return d.toLocaleDateString(
        "pt-BR",
        {
            month: "short"
        }
    ).replace(".", "");

}
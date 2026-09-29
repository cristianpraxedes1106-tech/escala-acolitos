/* =========================================================
   ALGORITMO DE SORTEIO
========================================================= */


/* =========================================================
   DIAS DA SEMANA
========================================================= */

const MAPA_DIAS = {

    0: "domingo",

    1: "segunda",

    2: "terca",

    3: "quarta",

    4: "quinta",

    5: "sexta",

    6: "sabado"

};


/* =========================================================
   VERIFICAR DISPONIBILIDADE
========================================================= */

function estaDisponivel(acolito, data) {

    const dia =
        new Date(
            data + "T12:00:00"
        ).getDay();


    const nomeDia =
        MAPA_DIAS[dia];


    return acolito.disponibilidade
        .includes(nomeDia);

}


/* =========================================================
   HISTÓRICO
========================================================= */

function quantidadeParticipacoes(acolitoId) {

    const escalas =
        obterEscalas();


    let quantidade = 0;


    escalas.forEach(escala => {

        escala.funcoes.forEach(funcao => {

            funcao.pessoas.forEach(pessoa => {

                if (pessoa.acolitoId === acolitoId) {

                    quantidade++;

                }

            });

        });

    });


    return quantidade;

}


/* =========================================================
   PONTUAÇÃO
========================================================= */

function calcularPontuacao(
    acolito,
    funcao,
    escala,
    jaSelecionados
) {

    let pontos = 0;


    /* Prioridade */

    if (acolito.prioridade === "alta") {

        pontos += 40;

    }

    else if (acolito.prioridade === "normal") {

        pontos += 20;

    }

    else {

        pontos += 5;

    }


    /* Menos participações = maior prioridade */

    const participacoes =
        quantidadeParticipacoes(
            acolito.id
        );


    pontos -= participacoes * 8;


    /* Pequena aleatoriedade */

    pontos +=
        Math.random() * 25;


    /* Evita duas funções */

    if (
        jaSelecionados
            .some(
                pessoa =>
                    pessoa.acolitoId === acolito.id
            )
    ) {

        return -Infinity;

    }


    return pontos;

}


/* =========================================================
   CANDIDATOS
========================================================= */

function obterCandidatos(
    funcao,
    escala,
    selecionados = []
) {

    const acolitos =
        obterAcolitos();


    return acolitos.filter(acolito => {

        if (!acolito.ativo) {

            return false;

        }


        if (!(Array.isArray(acolito.funcoes) && acolito.funcoes.includes(funcao.nome))) {

            return false;

        }


        if (!estaDisponivel(acolito, escala.data)) {

            return false;

        }


        if (
            selecionados.some(
                pessoa =>
                    pessoa.acolitoId === acolito.id
            )
        ) {

            return false;

        }


        return true;

    });

}


/* =========================================================
   SORTEAR UMA PESSOA
========================================================= */

function sortearPessoa(
    funcao,
    escala,
    selecionados = [],
    excluidos = []
) {

    const candidatos =
        obterCandidatos(
            funcao,
            escala,
            selecionados
        )
        .filter(
            candidato =>
                !excluidos.includes(candidato.id)
        );


    if (!candidatos.length) {

        return null;

    }


    const avaliados =
        candidatos.map(acolito => ({

            acolito,

            pontos:
                calcularPontuacao(
                    acolito,
                    funcao,
                    escala,
                    selecionados
                )

        }));


    avaliados.sort(
        (a, b) =>
            b.pontos - a.pontos
    );


    /*
       Não pegamos sempre o primeiro.
       Pegamos um dos candidatos melhores
       para manter o sorteio.
    */

    const limite =
        Math.min(
            3,
            avaliados.length
        );


    const escolhido =
        avaliados[
            Math.floor(
                Math.random() * limite
            )
        ];


    return {

        acolitoId:
            escolhido.acolito.id,

        nome:
            escolhido.acolito.nome,

        foto:
            escolhido.acolito.foto || ""

    };

}


/* =========================================================
   GERAR ESCALA COMPLETA
========================================================= */

function gerarEscalaAutomaticamente(
    data,
    hora,
    funcoes
) {

    const escala = {

        id: gerarId(),

        data,

        hora,

        funcoes: [],

        criadaEm:
            new Date().toISOString()

    };


    const selecionados = [];


    for (const funcao of funcoes) {

        const pessoas = [];


        for (
            let i = 0;
            i < funcao.quantidade;
            i++
        ) {

            const pessoa =
                sortearPessoa(
                    funcao,
                    escala,
                    selecionados
                );


            if (pessoa) {

                pessoas.push({

                    ...pessoa,

                    locked: true

                });


                selecionados.push(pessoa);

            }

            else {

                pessoas.push({

                    acolitoId: null,

                    nome:
                        "VAGA NÃO PREENCHIDA",

                    foto: "",

                    locked: false

                });

            }

        }


        escala.funcoes.push({

            id: gerarId(),

            nome: funcao.nome,

            quantidade: funcao.quantidade,

            pessoas

        });

    }


    return escala;

}


/* =========================================================
   REROLL INDIVIDUAL
========================================================= */

function rerollPessoa(
    escalaId,
    funcaoId,
    pessoaIndex
) {

    const escalas =
        obterEscalas();


    const escala =
        escalas.find(
            escala =>
                escala.id === escalaId
        );


    if (!escala) return;


    const funcao =
        escala.funcoes.find(
            funcao =>
                funcao.id === funcaoId
        );


    if (!funcao) return;


    const pessoaAtual =
        funcao.pessoas[pessoaIndex];


    if (!pessoaAtual) return;


    if (pessoaAtual.locked) {

        Swal.fire({

            icon: "info",

            title: "Vaga bloqueada",

            text:
                "Desbloqueie a vaga pelo cadeado antes de fazer o reroll."

        });

        return;

    }


    const outrosSelecionados = [];


    escala.funcoes.forEach(f => {

        f.pessoas.forEach((pessoa, index) => {

            if (
                f.id === funcao.id &&
                index === pessoaIndex
            ) return;


            if (pessoa.acolitoId) {

                outrosSelecionados.push(pessoa);

            }

        });

    });


    const excluidos = [];


    if (pessoaAtual.acolitoId) {

        excluidos.push(
            pessoaAtual.acolitoId
        );

    }


    const novaPessoa =
        sortearPessoa(

            {
                nome: funcao.nome,

                quantidade: 1

            },

            escala,

            outrosSelecionados,

            excluidos

        );


    if (!novaPessoa) {

        Swal.fire({

            icon: "warning",

            title: "Nenhum substituto encontrado",

            text:
                "Não há outro acólito disponível e habilitado para esta função."

        });

        return;

    }


    funcao.pessoas[pessoaIndex] = {

        ...novaPessoa,

        locked: true

    };


    salvarEscalas(escalas);


    renderizarEscalaVisual(
        escala
    );


    Swal.fire({

        icon: "success",

        title: "Vaga atualizada!",

        text:
            `${novaPessoa.nome} foi selecionado(a).`,

        timer: 1400,

        showConfirmButton: false

    });

}
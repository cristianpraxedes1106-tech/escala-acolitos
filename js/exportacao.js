/* =========================================================
   EXPORTAÇÃO DA ESCALA
========================================================= */

async function baixarEscalaImagem() {

    const elemento =
        document.getElementById(
            "scalePreview"
        );


    if (!elemento) return;


    try {

        const canvas =
            await html2canvas(
                elemento,
                {
                    scale: 2,

                    backgroundColor: "#ffffff",

                    useCORS: true

                }
            );


        const link =
            document.createElement("a");


        const escala =
            escalaAtualVisualizada;


        let nomeArquivo =
            "escala-acolitos";


        if (escala) {

            nomeArquivo =
                `escala-acolitos-${escala.data}`;

        }


        link.download =
            `${nomeArquivo}.png`;


        link.href =
            canvas.toDataURL(
                "image/png"
            );


        link.click();


        Swal.fire({

            icon: "success",

            title: "Imagem pronta!",

            text:
                "A escala foi baixada como PNG.",

            timer: 1500,

            showConfirmButton: false

        });

    }

    catch (erro) {

        console.error(erro);


        Swal.fire({

            icon: "error",

            title: "Não foi possível exportar",

            text:
                "Ocorreu um erro ao gerar a imagem."

        });

    }

}
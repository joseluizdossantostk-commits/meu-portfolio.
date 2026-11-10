/* CP3 — Site Pessoal | José Luiz dos Santos
   Scripts compartilhados por todas as páginas. */

"use strict";

/* ---------- Tema claro/escuro (todas as páginas) ----------
   A escolha fica salva em localStorage e vale para o site inteiro. */
const CHAVE_TEMA = "cp3:tema";

function lerTema() {
    try {
        return localStorage.getItem(CHAVE_TEMA);
    } catch (erro) {
        return null; // localStorage indisponível (ex.: navegação restrita)
    }
}

function salvarTema(tema) {
    try {
        localStorage.setItem(CHAVE_TEMA, tema);
    } catch (erro) {
        /* sem persistência: o tema continua valendo apenas nesta página */
    }
}

function aplicarTema(tema) {
    document.documentElement.setAttribute("data-tema", tema);
    const botao = document.getElementById("botaoTema");
    if (botao) {
        const escuro = tema === "escuro";
        botao.textContent = escuro ? "Tema claro" : "Tema escuro";
        botao.setAttribute("aria-pressed", String(escuro));
    }
}

// Aplica já no <head> para evitar o "flash" de tema errado ao carregar.
(function () {
    const salvo = lerTema();
    const preferido = window.matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
    document.documentElement.setAttribute("data-tema", salvo || preferido);
})();

function iniciarTema() {
    aplicarTema(document.documentElement.getAttribute("data-tema"));
    const botao = document.getElementById("botaoTema");
    if (!botao) return;
    botao.addEventListener("click", () => {
        const novo = document.documentElement.getAttribute("data-tema") === "escuro" ? "claro" : "escuro";
        aplicarTema(novo);
        salvarTema(novo);
    });
}

/* ---------- Gráfico em canvas (somente em graficos.html) ---------- */
function desenharGrafico() {
    const canvas = document.getElementById("meuCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Título
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 30px Arial";
    ctx.fillText("Meu aprendizado em tecnologia", 35, 55);

    // Eixos
    ctx.beginPath();
    ctx.moveTo(70, 350);
    ctx.lineTo(750, 350);
    ctx.moveTo(70, 350);
    ctx.lineTo(70, 90);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Barras
    const dados = [
        { nome: "HTML", valor: 190 },
        { nome: "CSS", valor: 160 },
        { nome: "Python", valor: 130 },
        { nome: "C++", valor: 110 }
    ];

    dados.forEach((item, indice) => {
        const x = 115 + indice * 155;
        const y = 350 - item.valor;

        ctx.fillStyle = "#2563eb";
        ctx.fillRect(x, y, 80, item.valor);

        ctx.fillStyle = "#0f172a";
        ctx.font = "16px Arial";
        ctx.fillText(item.nome, x, 375);
    });
}

/* ---------- Formulário de contato (formulario.html) ----------
   Validação com mensagens na tela + rascunho salvo em localStorage. */
const CHAVE_RASCUNHO = "cp3:rascunhoFormulario";

function validarCampo(form, nome) {
    const valor = (form.elements[nome].value || "").trim();
    switch (nome) {
        case "nome":
            if (!valor) return "Informe seu nome completo.";
            if (valor.length < 3) return "O nome deve ter pelo menos 3 caracteres.";
            return "";
        case "email":
            if (!valor) return "Informe seu e-mail.";
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) return "Digite um e-mail válido, como nome@exemplo.com.";
            return "";
        case "telefone": {
            if (!valor) return ""; // opcional
            const digitos = valor.replace(/\D/g, "");
            return digitos.length === 10 || digitos.length === 11 ? "" : "Telefone deve ter DDD + número (10 ou 11 dígitos).";
        }
        case "data": {
            if (!valor) return "Escolha a data para retorno.";
            const hoje = new Date();
            const hojeTexto = hoje.getFullYear() + "-" + String(hoje.getMonth() + 1).padStart(2, "0") + "-" + String(hoje.getDate()).padStart(2, "0");
            return valor < hojeTexto ? "A data de retorno não pode estar no passado." : "";
        }
        case "assunto":
            return valor ? "" : "Selecione um assunto.";
        case "retorno":
            return form.querySelector('input[name="retorno"]:checked') ? "" : "Escolha como prefere receber o retorno.";
        case "mensagem":
            if (!valor) return "Escreva sua mensagem.";
            if (valor.length < 10) return "A mensagem deve ter pelo menos 10 caracteres.";
            return "";
        default:
            return "";
    }
}

function mostrarErro(form, nome, mensagem) {
    const campo = form.elements[nome];
    const alvo = nome === "retorno" ? campo[0].closest("fieldset") : campo;
    const container = nome === "retorno" ? alvo : alvo.closest(".campo");
    let erro = document.getElementById("erro-" + nome);
    if (!erro) {
        erro = document.createElement("p");
        erro.id = "erro-" + nome;
        erro.className = "erro";
        container.appendChild(erro);
    }
    erro.textContent = mensagem;
    erro.hidden = !mensagem;
    alvo.classList.toggle("invalido", Boolean(mensagem));
    const controles = nome === "retorno" ? Array.from(campo) : [campo];
    controles.forEach((c) => {
        c.setAttribute("aria-invalid", String(Boolean(mensagem)));
        if (mensagem) c.setAttribute("aria-describedby", erro.id);
        else c.removeAttribute("aria-describedby");
    });
}

function salvarRascunho(form) {
    const dados = {
        nome: form.nome.value, email: form.email.value, telefone: form.telefone.value,
        data: form.data.value, assunto: form.assunto.value, mensagem: form.mensagem.value,
        retorno: (form.querySelector('input[name="retorno"]:checked') || {}).value || "",
        interesse: Array.from(form.querySelectorAll('input[name="interesse"]:checked')).map((i) => i.value)
    };
    try {
        localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(dados));
    } catch (erro) { /* sem persistência */ }
}

function restaurarRascunho(form) {
    let dados = null;
    try {
        dados = JSON.parse(localStorage.getItem(CHAVE_RASCUNHO));
    } catch (erro) { return false; }
    if (!dados) return false;
    ["nome", "email", "telefone", "data", "assunto", "mensagem"].forEach((n) => { form.elements[n].value = dados[n] || ""; });
    form.querySelectorAll('input[name="retorno"]').forEach((r) => { r.checked = r.value === dados.retorno; });
    form.querySelectorAll('input[name="interesse"]').forEach((i) => { i.checked = (dados.interesse || []).includes(i.value); });
    return true;
}

function limparRascunho() {
    try {
        localStorage.removeItem(CHAVE_RASCUNHO);
    } catch (erro) { /* nada a fazer */ }
}

function iniciarFormulario() {
    const form = document.getElementById("formContato");
    if (!form) return;
    const feedback = document.getElementById("feedbackForm");
    const campos = ["nome", "email", "telefone", "data", "assunto", "retorno", "mensagem"];

    function mostrarFeedback(tipo, texto) {
        feedback.className = "feedback " + tipo;
        feedback.textContent = texto;
        feedback.hidden = false;
    }

    if (restaurarRascunho(form)) {
        mostrarFeedback("sucesso", "Rascunho recuperado: continuamos de onde você parou.");
    }

    form.addEventListener("input", () => salvarRascunho(form));
    form.addEventListener("change", () => salvarRascunho(form));

    // Valida cada campo ao sair dele, para o usuário corrigir na hora.
    campos.forEach((nome) => {
        const alvo = nome === "retorno" ? form.querySelectorAll('input[name="retorno"]') : [form.elements[nome]];
        alvo.forEach((el) => el.addEventListener("blur", () => mostrarErro(form, nome, validarCampo(form, nome))));
    });

    form.addEventListener("submit", (evento) => {
        evento.preventDefault();
        let primeiroInvalido = null;
        let total = 0;
        campos.forEach((nome) => {
            const msg = validarCampo(form, nome);
            mostrarErro(form, nome, msg);
            if (msg) {
                total++;
                if (!primeiroInvalido) primeiroInvalido = nome === "retorno" ? form.querySelector('input[name="retorno"]') : form.elements[nome];
            }
        });
        if (total > 0) {
            mostrarFeedback("falha", "Corrija " + total + (total === 1 ? " campo" : " campos") + " destacado" + (total === 1 ? "" : "s") + " antes de enviar.");
            primeiroInvalido.focus();
            return;
        }
        const nome = form.nome.value.trim().split(" ")[0];
        mostrarFeedback("sucesso", "Obrigado, " + nome + "! Sua mensagem foi validada com sucesso. (Demonstração: nenhum dado é enviado a servidor.)");
        form.reset();
        limparRascunho();
    });

    document.getElementById("limparRascunho").addEventListener("click", () => {
        limparRascunho();
        form.reset();
        campos.forEach((nome) => mostrarErro(form, nome, ""));
        mostrarFeedback("sucesso", "Rascunho apagado.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    iniciarTema();
    iniciarFormulario();
    desenharGrafico();
});

/**** Alterna entre tema claro e escuro ****/
document.addEventListener("DOMContentLoaded", function () {

    // Obter o elemento <html> para manipular a classe dark
    const htmlElement = document.documentElement;

    // Aplicar o tema salvo no localStorage ou a preferência do sistema
    const isDarkMode = localStorage.theme === "dark" || // Se o localStorage.theme for "dark", ativa o modo escuro
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    // Se NÃO houver um tema salvo no localStorage, verifica se o sistema está em dark mode

    htmlElement.classList.toggle("dark", isDarkMode);
});
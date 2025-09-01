/**** Script para abrir/fechar o dropdown ****/
const dropdownButton = document.getElementById("userDropdownButton");
const dropdownContent = document.getElementById("dropdownContent");

dropdownButton.addEventListener("click", function () {
  dropdownContent.classList.toggle("hidden");
});

// Fechar o dropdown se clicar fora dele
window.addEventListener("click", function (event) {
  if (
    !dropdownButton.contains(event.target) &&
    !dropdownContent.contains(event.target)
  ) {
    dropdownContent.classList.add("hidden");
  }
});

/**** Apresentar e ocultar sidebar ****/
document.getElementById("toggleSidebar").addEventListener("click", function () {
  document.getElementById("sidebar").classList.toggle("sidebar-open");
});

document.getElementById("closeSidebar").addEventListener("click", function () {
  document.getElementById("sidebar").classList.remove("sidebar-open");
});

/**** Alterna entre tema claro e escuro com seletor moderno ****/
document.addEventListener("DOMContentLoaded", function () {
  const htmlElement = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const thumb = document.getElementById("themeToggleThumb");

  // Detectar o tema salvo ou a preferência do sistema
  const isDarkMode =
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Aplicar o tema inicial
  htmlElement.classList.toggle("dark", isDarkMode);
  thumb.classList.toggle("translate-x-6", isDarkMode);

  // Alternar tema ao clicar no seletor
  themeToggle.addEventListener("click", function () {
    htmlElement.classList.toggle("dark");
    const isNowDark = htmlElement.classList.contains("dark");
    localStorage.theme = isNowDark ? "dark" : "light";
    thumb.classList.toggle("translate-x-6", isNowDark);
  });
});

module.exports = {
  types: [
    { value: "✨ feat", name: "✨ feat:     Nova funcionalidade" },
    { value: "🐛 fix", name: "🐛 fix:      Correção de bug" },
    { value: "📝 docs", name: "📝 docs:     Documentação" },
    {
      value: "🎨 style",
      name: "🎨 style:    Estilo e formatação (espaços, ponto e vírgula, etc)",
    },
    { value: "♻️ refactor", name: "♻️ refactor: Refatoração de código" },
    { value: "✅ test", name: "✅ test:     Adição ou correção de testes" },
    { value: "🔧 chore", name: "🔧 chore:    Configuração ou tarefa de build" },
  ],
  messages: {
    type: "Selecione o tipo de alteração que você está submetendo:",
    scope: "Qual é o escopo desta mudança (opcional):",
    customScope: "Informe o escopo personalizado:",
    subject: "Escreva uma descrição curta e objetiva:\n",
    body: "Escreva uma descrição mais detalhada (opcional):\n",
    breaking: "Liste alterações que quebram compatibilidade (se houver):\n",
    footer: "Liste issues relacionadas (ex: #123):\n",
    confirmCommit: "Confirma esse commit?",
  },
  skipQuestions: ["body", "breaking", "footer"], // pode deixar só o essencial
  subjectLimit: 72,
};

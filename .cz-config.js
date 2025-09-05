module.exports = {
  types: [
    { value: "feat", name: "✨ feat:     Nova funcionalidade" },
    { value: "fix", name: "🐛 fix:      Correção de bug" },
    { value: "docs", name: "📝 docs:     Documentação" },
    { value: "refactor", name: "♻️ refactor: Refatoração de código" },
    { value: "style", name: "🎨 style:    Estilo e formatação" },
    { value: "test", name: "✅ test:     Testes" },
    { value: "chore", name: "🔧 chore:    Configuração ou tarefa de build" },
  ],

  messages: {
    type: "Selecione o tipo de alteração que você está submetendo:",
    subject: "Escreva uma descrição curta e objetiva:\n",
    body: "Escreva uma descrição mais detalhada (opcional):\n",
    breaking: "Liste alterações que quebram compatibilidade (se houver):\n",
    footer: "Liste issues relacionadas (ex: #123):\n",
    confirmCommit: "Confirma esse commit?",
  },

  // removemos completamente o prompt de scope
  skipQuestions: ["scope", "customScope"],

  allowCustomScopes: false, // não precisa mais do customScope
  allowBreakingChanges: ["feat", "fix"],
  subjectLimit: 100,
};

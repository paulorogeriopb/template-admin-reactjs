# React Admin Template

Template administrativo baseado em **Next.js**, **React**, **Tailwind CSS** e **SweetAlert2**, com formulários validados, dark mode e painel funcional.

---

## 1. Requisitos

- Node.js **22 ou superior**
  ```bash
  node -v
  ```

NPM / NPX instalado

npx -v

2. Criar projeto React + Next.js

Se ainda não tiver criado o projeto:

npx create-next-app@latest .

3. Rodar o projeto
   npm run dev

4. Instalar dependências
   Dependências principais:
   npm install react react-dom next

Estilo e Tailwind CSS:
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss

Funcionalidades adicionais:

npm install react-icons sweetalert2 axios react-hook-form @hookform/resolvers yup next-themes

5. Configuração do Tailwind CSS

tailwind.config.js:

/** @type {import('tailwindcss').Config} \*/
module.exports = {
content: [
"./src/**/_.{js,ts,jsx,tsx}",
"./pages/\*\*/_.{js,ts,jsx,tsx}",
],
theme: {
extend: {},
},
plugins: [],
}

postcss.config.js:

module.exports = {
plugins: {
tailwindcss: {},
autoprefixer: {},
},
}

No CSS global (globals.css):

@tailwind base;
@tailwind components;
@tailwind utilities;

6. Fluxo de criação com SweetAlert2

Exemplo de uso em um formulário de criação (CreateUserStatus.tsx):

import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

// Após criar via API
await Swal.fire({
title: "Sucesso!",
text: "Status cadastrado com sucesso!",
icon: "success",
confirmButtonText: "Ok",
});

router.push("/painel/user-status/list");

8. Dicas de manutenção

Caso dê algum erro de módulos, limpar node_modules e reinstalar:

rm -rf node_modules package-lock.json
npm install

Para rodar dev server novamente:
npm run dev

Para atualizar dependências desatualizadas e corrigir warnings:

npm audit fix --force

9. Estrutura recomendada do projeto

/src
/app
/painel
/user-status
create.tsx
list.tsx
/components
/Painel
Layout.tsx
LoadingSpinner.tsx
AlertMessageDismissible.tsx
DeleteButton.tsx
Pagination.tsx
/globals.css
/package.json
/tailwind.config.js
/postcss.config.js

npm install react react-dom next axios react-hook-form @hookform/resolvers yup react-icons sweetalert2 next-themes && npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss

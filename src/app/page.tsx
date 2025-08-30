import Link from "next/link";

const Home = () => {
  return (
    <main>
      <h1>Bem vindo </h1>
      <Link href="/auth/login">Login</Link>
    </main>
  );
};

export default Home;

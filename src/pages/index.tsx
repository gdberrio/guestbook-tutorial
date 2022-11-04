import { signIn, signOut, useSession } from 'next-auth/react';

const Home = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main>loading...</main>
  }

  return (
    <main>
      <h1>Guestbook</h1>
      <div>
        {session ? (
          <div>
          <p>hi {session.user?.name}</p>
          <button onClick={() => signOut()}>sign out</button>
          </div>
        ) : (
          <button onClick={() => signIn()}>Sign in Google</button>
        )}
      </div>
    </main>
  );
};

export default Home;
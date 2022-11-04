import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { trpc } from '../utils/trpc';

const Messages = () => {
  const {data: messages, isLoading} = trpc.guestbook.getAll.useQuery();

  if (isLoading) {
    return <div>Fetching messages...</div>;
  }

  return (
    <div className='flex flex-col gap-4'>
      {messages?.map((msg, index) => {
        return (
          <div key={index}>
            <p>{msg.message}</p>
            <span>{msg.name}</span>
          </div>
        );
      })}
    </div>
  );
};

const Form = () => {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const utils = trpc.useContext();
  const postMessage = trpc.guestbook.postMessage.useMutation({
    onMutate: () => {
      utils.guestbook.getAll.cancel();
      const optimisticUpdate = utils.guestbook.getAll.getData();

      if (optimisticUpdate) {
        utils.guestbook.getAll.setData(optimisticUpdate);
      }
    },
    onSettled: () => {
      utils.guestbook.getAll.invalidate();
    },
  });

  return (
    <form
      className='flex gap-2'
      onSubmit={(event) => {
        event.preventDefault();
        postMessage.mutate({
          name: session?.user?.name as string,
          message,
        });
        setMessage("");
      }}>
      <input
        type="text"
        value={message}
        placeholder="Enter your message"
        minLength={2}
        maxLength={255}
        onChange={(event) => setMessage(event.target.value)}
        className='px-4 py-2 rounded-md border-2 border-zinc-800 bg-neutral-900 focus:outline-none'/>
      <button
        type="submit"
        className='p-2 rounded-md border-2 border-zinc-899 focus:outline-none'>
          Submit</button>
        </form>
    );
};

const Home = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
    <main className="flex flex-col items-center pt-4">
      loading...</main>
    );
  }

  return (
    <main className='flex flex-col items-center'>
      <h1 className='text-3xl pt-4'>Guestbook</h1>
      <p>
        Tutorial for <code>create-t3-app</code>
      </p>
      <div className='pt-10'>
        {session ? (
          <div>
            <p>hi {session.user?.name}</p>
            <button onClick={() => signOut()}>sign out</button>
            <div className='pt-6'>
              <Form />
            </div>
          </div>
        ) : (
          <button onClick={() => signIn('google')}>Sign in Google</button>
        )}
        <div className='pt-10'>
          <Messages />
        </div>
      </div>
    </main>
  );
};

export default Home;
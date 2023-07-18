import Head from "next/head";
import HomeFeed from "~/components/HomeFeed";
import Navbar from "~/components/Navbar";
import UserBar from "~/components/UserBar";

export default function Home() {
  return (
    <>
      <Head>
        <title>Creators Club | Feed</title>
        <meta
          name="description"
          content="See the content from the creators you love."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex h-full flex-col lg:flex-row">
        <Navbar />
        <HomeFeed />
        <UserBar />
      </main>
    </>
  );
}

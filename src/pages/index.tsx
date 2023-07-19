import Head from "next/head";
import HomeFeed from "~/components/HomeFeed";

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

      <HomeFeed />
    </>
  );
}

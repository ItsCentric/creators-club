import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { cabin, montserrat, yantramanav } from "~/utils/fonts";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider>
      <main
        className={`${cabin.variable} ${montserrat.variable} ${yantramanav.variable}`}
      >
        <Component {...pageProps} />
      </main>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);

import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { cabin, montserrat, yantramanav } from "~/utils/fonts";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider>
      <Component
        {...pageProps}
        className={`${cabin.variable} ${montserrat.variable} ${yantramanav.variable}`}
      />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);

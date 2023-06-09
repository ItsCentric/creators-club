import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { cabin, montserrat, yantramanav } from "~/utils/fonts";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: "bg-primary-500 hover:bg-primary-900",
          footerActionLink: "text-primary-500 hover:text-primary-500",
          formFieldLabel: "text-gray-900",
          identityPreviewEditButtonIcon: "text-accent-500",
        },
      }}
    >
      <main
        className={`${cabin.variable} ${montserrat.variable} ${yantramanav.variable}`}
      />
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);

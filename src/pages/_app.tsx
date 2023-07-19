import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { cabin, montserrat, yantramanav } from "~/utils/fonts";
import Layout from "~/components/Layout";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#fc8c54",
        },
        elements: {
          formButtonPrimary: "bg-primary-500 hover:bg-primary-600",
          footerActionLink: "text-secondary-500 hover:text-secondary-600",
          formFieldLabel: "text-gray-900",
          identityPreviewEditButtonIcon: "text-accent-500",
        },
      }}
    >
      <main
        className={`${cabin.variable} ${montserrat.variable} ${yantramanav.variable}`}
      >
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </main>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);

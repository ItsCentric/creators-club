import type { ReactNode } from "react";
import Navbar from "./Navbar";

export default function Layout(props: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col lg:flex-row">
      <Navbar />
      <main className="flex flex-grow flex-col">{props.children}</main>
    </div>
  );
}

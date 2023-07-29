import type { ReactNode } from "react";
import Navbar from "./Navbar";
import { Toaster } from "./ui/toaster";

export default function Layout(props: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <Navbar />
      <main className="flex flex-grow flex-col">{props.children}</main>
      <Toaster />
    </div>
  );
}

import { FaQuestion } from "react-icons/fa";
import styles from "../styles/500.module.css";

export default function ServerError() {
  return (
    <div
      className={
        "p-to-s-gradient-animated flex h-full w-auto flex-col items-center justify-center " +
        (styles.pToSGradientAnimated ?? "")
      }
    >
      <div className="max-w-[80%] rounded-lg bg-white p-8 text-center shadow-lg">
        <FaQuestion size={48} className="mx-auto mb-2" />
        <h1 className="text-2xl font-bold">Huh, thats weird.</h1>
        <p className="text-gray-500">
          {"Sorry about that, it's not your fault. Please try again."}
        </p>
      </div>
    </div>
  );
}

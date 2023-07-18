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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          className="mx-auto"
        >
          <path
            fill="currentColor"
            d="M12.025 16q-.6 0-1.012-.425t-.363-1q.075-1.05.5-1.825t1.35-1.6q1.025-.9 1.563-1.563t.537-1.512q0-1.025-.687-1.7T12 5.7q-.8 0-1.363.338t-.912.837q-.35.5-.862.675t-.988-.025q-.575-.25-.787-.825t.087-1.075Q7.9 4.5 9.125 3.75T12 3q2.625 0 4.038 1.462t1.412 3.513q0 1.25-.537 2.138t-1.688 2.012q-.85.8-1.2 1.3t-.475 1.15q-.1.625-.525 1.025t-1 .4ZM12 22q-.825 0-1.413-.588T10 20q0-.825.588-1.413T12 18q.825 0 1.413.588T14 20q0 .825-.588 1.413T12 22Z"
          />
        </svg>
        <h1 className="text-2xl font-bold">Huh, thats weird.</h1>
        <p className="text-gray-500">
          {"Sorry about that, it's not your fault. Please try again."}
        </p>
      </div>
    </div>
  );
}

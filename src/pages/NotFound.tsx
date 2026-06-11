import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-32 text-center">
      <p className="text-6xl font-extrabold text-sap-blue">404</p>
      <h1 className="mt-4 text-2xl font-bold text-strong">
        Página no encontrada
      </h1>
      <p className="mt-2 text-muted">
        La ruta que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className="glow mt-8 inline-block rounded-xl bg-sap-blue px-6 py-3 font-semibold text-white transition-all hover:bg-sap-blue-light"
      >
        Volver al inicio
      </Link>
    </section>
  );
}

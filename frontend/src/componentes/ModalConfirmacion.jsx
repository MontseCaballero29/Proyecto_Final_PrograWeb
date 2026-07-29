import { useEffect, useRef } from "react";

import {
  AlertTriangle,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";

import "./ModalConfirmacion.css";

function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = "Eliminar",
  procesando = false,
  onCancelar,
  onConfirmar,
}) {
  const botonCancelar = useRef(null);

  useEffect(() => {
    if (!abierto) {
      return undefined;
    }

    const desplazamientoAnterior =
      document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botonCancelar.current?.focus();

    const manejarTeclado = (evento) => {
      if (evento.key === "Escape" && !procesando) {
        onCancelar();
      }
    };

    document.addEventListener("keydown", manejarTeclado);

    return () => {
      document.body.style.overflow = desplazamientoAnterior;
      document.removeEventListener(
        "keydown",
        manejarTeclado,
      );
    };
  }, [abierto, onCancelar, procesando]);

  if (!abierto) {
    return null;
  }

  return (
    <div
      className="fondo-modal-confirmacion"
      onMouseDown={(evento) => {
        if (
          evento.target === evento.currentTarget &&
          !procesando
        ) {
          onCancelar();
        }
      }}
    >
      <section
        className="modal-confirmacion"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-confirmacion"
        aria-describedby="mensaje-modal-confirmacion"
      >
        <header className="cabecera-modal-confirmacion">
          <div className="titulo-modal-confirmacion">
            <span className="icono-modal-confirmacion">
              <AlertTriangle size={22} />
            </span>
            <h3 id="titulo-modal-confirmacion">
              {titulo}
            </h3>
          </div>

          <button
            className="boton-cerrar-modal"
            type="button"
            onClick={onCancelar}
            disabled={procesando}
            aria-label="Cerrar confirmación"
          >
            <X size={20} />
          </button>
        </header>

        <p
          className="mensaje-modal-confirmacion"
          id="mensaje-modal-confirmacion"
        >
          {mensaje}
        </p>

        <footer className="acciones-modal-confirmacion">
          <button
            className="boton-cancelar-modal"
            type="button"
            onClick={onCancelar}
            disabled={procesando}
            ref={botonCancelar}
          >
            Cancelar
          </button>

          <button
            className="boton-confirmar-modal"
            type="button"
            onClick={onConfirmar}
            disabled={procesando}
          >
            {procesando ? (
              <LoaderCircle
                className="icono-girando"
                size={18}
              />
            ) : (
              <Trash2 size={18} />
            )}
            {procesando ? "Eliminando..." : textoConfirmar}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default ModalConfirmacion;

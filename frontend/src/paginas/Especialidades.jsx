import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import ModalConfirmacion from "../componentes/ModalConfirmacion";

const API_ESPECIALIDADES = `${import.meta.env.VITE_API_URL}/api/especialidades`;

async function obtenerMensajeError(respuesta, mensajePredeterminado) {
  try {
    const datos = await respuesta.json();
    return datos?.mensaje || datos?.error || mensajePredeterminado;
  } catch {
    return mensajePredeterminado;
  }
}

function Especialidades() {
  const esAdmin = localStorage.getItem("rol") === "ADMIN";
  const [especialidades, setEspecialidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensajeAccion, setMensajeAccion] = useState("");
  const [especialidadAEliminar, setEspecialidadAEliminar] =
    useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargarEspecialidades = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(API_ESPECIALIDADES, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las especialidades");
      }

      const datos = await respuesta.json();
      setEspecialidades(Array.isArray(datos) ? datos : []);
    } catch (errorPeticion) {
      setError(errorPeticion.message);
      setEspecialidades([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEspecialidades();
  }, [cargarEspecialidades]);

  const eliminarEspecialidad = async () => {
    if (!esAdmin || !especialidadAEliminar) {
      return;
    }

    try {
      setEliminando(true);
      setMensajeAccion("");

      const respuesta = await fetch(
        `${API_ESPECIALIDADES}/${especialidadAEliminar.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!respuesta.ok) {
        throw new Error(
          await obtenerMensajeError(
            respuesta,
            `No se pudo eliminar la especialidad. Código: ${respuesta.status}`,
          ),
        );
      }

      setEspecialidadAEliminar(null);
      await cargarEspecialidades();
    } catch (errorPeticion) {
      setMensajeAccion(
        errorPeticion.message ||
          "No fue posible eliminar la especialidad.",
      );
      setEspecialidadAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <section className="encabezado-panel">
      <h2>Especialidades</h2>
      <p>Oficios artesanales registrados en el catálogo</p>

      <div className="detalle-artesanal" />

      {mensajeAccion && (
        <p className="mensaje-accion-eliminacion">{mensajeAccion}</p>
      )}

      {cargando && <p className="mensaje-estado">Cargando especialidades...</p>}

      {!cargando && error && <p className="mensaje-estado">{error}</p>}

      {!cargando && !error && especialidades.length === 0 && (
        <p className="mensaje-estado">No hay especialidades registradas.</p>
      )}

      {!cargando && !error && especialidades.length > 0 && (
        <div className="rejilla-especialidades">
          {especialidades.map((especialidad) => (
            <article className="tarjeta-especialidad" key={especialidad.id}>
              <h3>{especialidad.nombre}</h3>
              <p>{especialidad.descripcion}</p>

              {esAdmin && (
                <div className="acciones-especialidad">
                  <button
                    className="boton-eliminar-especialidad"
                    type="button"
                    onClick={() => {
                      setMensajeAccion("");
                      setEspecialidadAEliminar(especialidad);
                    }}
                    aria-label={`Eliminar ${especialidad.nombre}`}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <ModalConfirmacion
        abierto={Boolean(especialidadAEliminar)}
        titulo="Eliminar especialidad"
        mensaje={
          especialidadAEliminar
            ? `¿Confirmas que deseas eliminar la especialidad “${especialidadAEliminar.nombre}”? Esta acción no se puede deshacer.`
            : ""
        }
        procesando={eliminando}
        onCancelar={() => {
          if (!eliminando) {
            setEspecialidadAEliminar(null);
          }
        }}
        onConfirmar={eliminarEspecialidad}
      />
    </section>
  );
}

export default Especialidades;

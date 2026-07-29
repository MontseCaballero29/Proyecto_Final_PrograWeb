import { useCallback, useEffect, useState } from "react";

import {
  AlertCircle,
  LoaderCircle,
  MessageSquareText,
  Send,
  Star,
  Trash2,
} from "lucide-react";

import "./Resenas.css";

const API_RESENAS =
  "http://localhost:8090/api/resenas";
const RECURSOS = {
  ARTESANO: "http://localhost:8090/api/artesanos",
  TALLER: "http://localhost:8090/api/talleres",
  ARTESANIA: "http://localhost:8090/api/artesanias",
};

function extraerLista(datos) {
  if (Array.isArray(datos)) {
    return datos;
  }

  return Array.isArray(datos?.content) ? datos.content : [];
}

async function obtenerMensajeError(
  respuesta,
  mensajePredeterminado,
) {
  try {
    const datos = await respuesta.json();
    return (
      datos?.mensaje ||
      datos?.error ||
      mensajePredeterminado
    );
  } catch {
    return mensajePredeterminado;
  }
}

function obtenerNombreRecurso(recurso, tipo) {
  if (tipo === "ARTESANO") {
    return recurso.nombreUsuario || `Artesano ${recurso.id}`;
  }

  return recurso.nombre || `Registro ${recurso.id}`;
}

function Resenas() {
  const rol = localStorage.getItem("rol");
  const correo = localStorage.getItem("correo");
  const esVisitante = rol === "VISITANTE";
  const esAdmin = rol === "ADMIN";
  const [resenas, setResenas] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [formulario, setFormulario] = useState({
    tipoRecurso: "TALLER",
    recursoId: "",
    calificacion: "5",
    comentario: "",
  });
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [cargandoRecursos, setCargandoRecursos] =
    useState(esVisitante);
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarResenas = useCallback(
    async (numeroPagina = 0) => {
      try {
        setCargando(true);
        setError("");
        const respuesta = await fetch(
          `${API_RESENAS}?page=${numeroPagina}&size=8`,
          {
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
              "No se pudieron cargar las reseñas.",
            ),
          );
        }

        const datos = await respuesta.json();
        setResenas(extraerLista(datos));
        setPagina(Number(datos?.number) || 0);
        setTotalPaginas(Number(datos?.totalPages) || 0);
      } catch (errorPeticion) {
        setError(
          errorPeticion.message ||
            "No fue posible cargar las reseñas.",
        );
      } finally {
        setCargando(false);
      }
    },
    [],
  );

  const cargarRecursos = useCallback(async () => {
    if (!esVisitante) {
      return;
    }

    try {
      setCargandoRecursos(true);
      const respuesta = await fetch(
        `${RECURSOS[formulario.tipoRecurso]}?page=0&size=1000`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron cargar los elementos para reseñar.",
        );
      }

      const datos = await respuesta.json();
      setRecursos(extraerLista(datos));
      setFormulario((anterior) => ({
        ...anterior,
        recursoId: "",
      }));
    } catch (errorPeticion) {
      setRecursos([]);
      setMensaje(errorPeticion.message);
    } finally {
      setCargandoRecursos(false);
    }
  }, [esVisitante, formulario.tipoRecurso]);

  useEffect(() => {
    cargarResenas(0);
  }, [cargarResenas]);

  useEffect(() => {
    cargarRecursos();
  }, [cargarRecursos]);

  const publicar = async (evento) => {
    evento.preventDefault();
    setMensaje("");

    if (
      !formulario.recursoId ||
      formulario.comentario.trim().length < 10
    ) {
      setMensaje(
        "Selecciona un elemento y escribe al menos 10 caracteres.",
      );
      return;
    }

    try {
      setPublicando(true);
      const respuesta = await fetch(API_RESENAS, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          tipoRecurso: formulario.tipoRecurso,
          recursoId: Number(formulario.recursoId),
          calificacion: Number(formulario.calificacion),
          comentario: formulario.comentario.trim(),
        }),
      });

      if (!respuesta.ok) {
        throw new Error(
          await obtenerMensajeError(
            respuesta,
            "No se pudo publicar la reseña.",
          ),
        );
      }

      setFormulario((anterior) => ({
        ...anterior,
        recursoId: "",
        calificacion: "5",
        comentario: "",
      }));
      setMensaje("Tu reseña se publicó correctamente.");
      await cargarResenas(0);
    } catch (errorPeticion) {
      setMensaje(
        errorPeticion.message ||
          "No fue posible publicar la reseña.",
      );
    } finally {
      setPublicando(false);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Deseas eliminar esta reseña?")) {
      return;
    }

    try {
      const respuesta = await fetch(`${API_RESENAS}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!respuesta.ok) {
        throw new Error(
          await obtenerMensajeError(
            respuesta,
            "No se pudo eliminar la reseña.",
          ),
        );
      }

      await cargarResenas(pagina);
    } catch (errorPeticion) {
      setError(errorPeticion.message);
    }
  };

  return (
    <section className="pagina-resenas">
      <header className="encabezado-resenas">
        <p>Operación / Reseñas</p>
        <h2>Reseñas de la comunidad</h2>
        <span>
          Opiniones sobre artesanos, talleres y artesanías.
        </span>
      </header>

      <div className="detalle-artesanal" />

      {esVisitante && (
        <form className="formulario-resena" onSubmit={publicar}>
          <div className="titulo-formulario-resena">
            <MessageSquareText size={24} />
            <div>
              <h3>Escribe una reseña</h3>
              <p>
                Puedes publicar una opinión por cada
                elemento.
              </p>
            </div>
          </div>

          {mensaje && (
            <div className="mensaje-formulario-resena">
              {mensaje}
            </div>
          )}

          <div className="campos-resena">
            <label>
              <span>Tipo</span>
              <select
                value={formulario.tipoRecurso}
                onChange={(evento) =>
                  setFormulario((anterior) => ({
                    ...anterior,
                    tipoRecurso: evento.target.value,
                  }))
                }
                disabled={publicando}
              >
                <option value="TALLER">Taller</option>
                <option value="ARTESANO">Artesano</option>
                <option value="ARTESANIA">Artesanía</option>
              </select>
            </label>

            <label>
              <span>Elemento</span>
              <select
                value={formulario.recursoId}
                onChange={(evento) =>
                  setFormulario((anterior) => ({
                    ...anterior,
                    recursoId: evento.target.value,
                  }))
                }
                disabled={cargandoRecursos || publicando}
              >
                <option value="">
                  {cargandoRecursos
                    ? "Cargando..."
                    : "Selecciona una opción"}
                </option>
                {recursos.map((recurso) => (
                  <option
                    value={recurso.id}
                    key={recurso.id}
                  >
                    {obtenerNombreRecurso(
                      recurso,
                      formulario.tipoRecurso,
                    )}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Calificación</span>
              <select
                value={formulario.calificacion}
                onChange={(evento) =>
                  setFormulario((anterior) => ({
                    ...anterior,
                    calificacion: evento.target.value,
                  }))
                }
                disabled={publicando}
              >
                <option value="5">5 - Excelente</option>
                <option value="4">4 - Muy buena</option>
                <option value="3">3 - Buena</option>
                <option value="2">2 - Regular</option>
                <option value="1">1 - Mala</option>
              </select>
            </label>

            <label className="campo-comentario-resena">
              <span>Comentario</span>
              <textarea
                value={formulario.comentario}
                onChange={(evento) =>
                  setFormulario((anterior) => ({
                    ...anterior,
                    comentario: evento.target.value,
                  }))
                }
                rows="4"
                minLength="10"
                maxLength="1000"
                disabled={publicando}
                placeholder="Comparte tu experiencia..."
              />
              <small>
                {formulario.comentario.length} / 1000
              </small>
            </label>
          </div>

          <button
            className="boton-publicar-resena"
            type="submit"
            disabled={publicando}
          >
            {publicando ? (
              <LoaderCircle
                className="icono-girando"
                size={18}
              />
            ) : (
              <Send size={18} />
            )}
            Publicar reseña
          </button>
        </form>
      )}

      <section className="listado-resenas">
        <h3>Opiniones recientes</h3>

        {cargando && (
          <div className="estado-resenas">
            <LoaderCircle
              className="icono-girando"
              size={34}
            />
            <p>Cargando reseñas...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="estado-resenas estado-resenas-error">
            <AlertCircle size={34} />
            <p>{error}</p>
            <button
              type="button"
              onClick={() => cargarResenas(pagina)}
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {!cargando && !error && resenas.length === 0 && (
          <div className="estado-resenas">
            <MessageSquareText size={38} />
            <p>Aún no hay reseñas publicadas.</p>
          </div>
        )}

        {!cargando && !error && resenas.length > 0 && (
          <div className="rejilla-resenas">
            {resenas.map((resena) => {
              const puedeEliminar =
                esAdmin ||
                (esVisitante &&
                  resena.correoAutor === correo);

              return (
                <article
                  className="tarjeta-resena"
                  key={resena.id}
                >
                  <div className="cabecera-tarjeta-resena">
                    <span>
                      {resena.tipoRecurso} ·{" "}
                      {resena.recursoNombre}
                    </span>
                    {puedeEliminar && (
                      <button
                        type="button"
                        onClick={() => eliminar(resena.id)}
                        aria-label="Eliminar reseña"
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>

                  <div
                    className="estrellas-resena"
                    aria-label={`${resena.calificacion} de 5 estrellas`}
                  >
                    {Array.from({ length: 5 }).map(
                      (_, indice) => (
                        <Star
                          key={indice}
                          size={18}
                          fill={
                            indice < resena.calificacion
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ),
                    )}
                  </div>

                  <p>{resena.comentario}</p>
                  <footer>
                    <strong>{resena.autor}</strong>
                    <time>
                      {new Intl.DateTimeFormat("es-MX", {
                        dateStyle: "medium",
                      }).format(new Date(resena.creadoEn))}
                    </time>
                  </footer>
                </article>
              );
            })}
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="paginacion">
            <button
              type="button"
              disabled={pagina === 0 || cargando}
              onClick={() => cargarResenas(pagina - 1)}
            >
              Anterior
            </button>
            <span>
              Página {pagina + 1} de {totalPaginas}
            </span>
            <button
              type="button"
              disabled={
                pagina + 1 >= totalPaginas || cargando
              }
              onClick={() => cargarResenas(pagina + 1)}
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </section>
  );
}

export default Resenas;

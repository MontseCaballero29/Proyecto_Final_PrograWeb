import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Image,
  LoaderCircle,
  LockKeyhole,
  PackageOpen,
  Save,
} from "lucide-react";

import "./EditarArtesania.css";

const API_ARTESANIAS =
  "http://localhost:8090/api/artesanias";
const API_TALLERES =
  "http://localhost:8090/api/talleres";

const FORMULARIO_INICIAL = {
  nombre: "",
  descripcion: "",
  precio: "",
  existencia: "",
  imagenUrl: "",
  tallerId: "",
};

function extraerLista(datos) {
  if (Array.isArray(datos)) {
    return datos;
  }

  if (Array.isArray(datos?.content)) {
    return datos.content;
  }

  return [];
}

async function obtenerMensajeError(respuesta, mensajePredeterminado) {
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

function validarCampo(nombre, valor) {
  const texto =
    typeof valor === "string" ? valor.trim() : valor;

  if (nombre === "nombre") {
    if (!texto) {
      return "El nombre de la artesanía es obligatorio.";
    }

    if (texto.length > 120) {
      return "El nombre no puede exceder 120 caracteres.";
    }
  }

  if (nombre === "descripcion" && texto.length > 1000) {
    return "La descripción no puede exceder 1000 caracteres.";
  }

  if (nombre === "precio") {
    if (texto === "") {
      return "El precio es obligatorio.";
    }

    if (!/^\d+(\.\d{1,2})?$/.test(texto)) {
      return "Escribe un precio válido con máximo 2 decimales.";
    }

    if (Number(texto) <= 0) {
      return "El precio debe ser mayor que cero.";
    }
  }

  if (nombre === "existencia") {
    if (texto === "") {
      return "La existencia es obligatoria.";
    }

    if (!/^\d+$/.test(texto)) {
      return "La existencia debe ser un número entero sin valores negativos.";
    }
  }

  if (nombre === "imagenUrl" && texto.length > 255) {
    return "La URL de la imagen no puede exceder 255 caracteres.";
  }

  if (nombre === "tallerId" && !texto) {
    return "Selecciona el taller de procedencia.";
  }

  return "";
}

function validarFormulario(formulario) {
  return Object.keys(formulario).reduce(
    (resultado, nombre) => {
      const mensaje = validarCampo(
        nombre,
        formulario[nombre],
      );

      if (mensaje) {
        resultado[nombre] = mensaje;
      }

      return resultado;
    },
    {},
  );
}

function EditarArtesania() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState(
    FORMULARIO_INICIAL,
  );
  const [talleres, setTalleres] = useState([]);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");
  const [mensaje, setMensaje] = useState({
    tipo: "",
    texto: "",
  });

  const esAdmin =
    localStorage.getItem("rol") === "ADMIN";

  const cargarDatos = useCallback(async () => {
    if (!esAdmin) {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setErrorCarga("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "No se encontró una sesión iniciada. Inicia sesión nuevamente.",
        );
      }

      const cabeceras = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [respuestaArtesania, respuestaTalleres] =
        await Promise.all([
          fetch(`${API_ARTESANIAS}/${id}`, {
            headers: cabeceras,
          }),
          fetch(API_TALLERES, {
            headers: cabeceras,
          }),
        ]);

      if (!respuestaArtesania.ok) {
        const mensajesPorEstado = {
          401: "Tu sesión no es válida o ha expirado.",
          403: "No tienes permiso para editar esta artesanía.",
          404: "La artesanía que intentas editar no existe.",
        };

        throw new Error(
          await obtenerMensajeError(
            respuestaArtesania,
            mensajesPorEstado[
              respuestaArtesania.status
            ] ||
              `No se pudo obtener la artesanía. Código: ${respuestaArtesania.status}`,
          ),
        );
      }

      if (!respuestaTalleres.ok) {
        throw new Error(
          await obtenerMensajeError(
            respuestaTalleres,
            "No se pudo cargar la lista de talleres.",
          ),
        );
      }

      const [artesania, datosTalleres] =
        await Promise.all([
          respuestaArtesania.json(),
          respuestaTalleres.json(),
        ]);

      const listaTalleres =
        extraerLista(datosTalleres);

      setTalleres(
        [...listaTalleres].sort((tallerA, tallerB) =>
          (tallerA.nombre || "").localeCompare(
            tallerB.nombre || "",
            "es",
          ),
        ),
      );

      setFormulario({
        nombre: artesania.nombre || "",
        descripcion: artesania.descripcion || "",
        precio:
          artesania.precio === null ||
          artesania.precio === undefined
            ? ""
            : String(artesania.precio),
        existencia:
          artesania.existencia === null ||
          artesania.existencia === undefined
            ? ""
            : String(artesania.existencia),
        imagenUrl: artesania.imagenUrl || "",
        tallerId:
          artesania.tallerId === null ||
          artesania.tallerId === undefined
            ? ""
            : String(artesania.tallerId),
      });
    } catch (errorPeticion) {
      console.error(
        "Error al cargar la artesanía:",
        errorPeticion,
      );
      setErrorCarga(
        errorPeticion.message ||
          "No fue posible cargar la información solicitada.",
      );
    } finally {
      setCargando(false);
    }
  }, [esAdmin, id]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target;

    setFormulario((formularioAnterior) => ({
      ...formularioAnterior,
      [name]: value,
    }));

    setErrores((erroresAnteriores) => {
      const erroresActualizados = {
        ...erroresAnteriores,
      };
      const mensajeCampo = validarCampo(name, value);

      if (mensajeCampo) {
        erroresActualizados[name] = mensajeCampo;
      } else {
        delete erroresActualizados[name];
      }

      return erroresActualizados;
    });

    if (mensaje.texto) {
      setMensaje({ tipo: "", texto: "" });
    }
  };

  const guardarCambios = async (evento) => {
    evento.preventDefault();

    const erroresFormulario =
      validarFormulario(formulario);

    setErrores(erroresFormulario);
    setMensaje({ tipo: "", texto: "" });

    if (Object.keys(erroresFormulario).length > 0) {
      return;
    }

    try {
      setGuardando(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "No se encontró una sesión iniciada. Inicia sesión nuevamente.",
        );
      }

      const peticion = {
        nombre: formulario.nombre.trim(),
        descripcion:
          formulario.descripcion.trim() || null,
        precio: Number(formulario.precio),
        existencia: Number(formulario.existencia),
        imagenUrl:
          formulario.imagenUrl.trim() || null,
        tallerId: Number(formulario.tallerId),
      };

      const respuesta = await fetch(
        `${API_ARTESANIAS}/${id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(peticion),
        },
      );

      if (!respuesta.ok) {
        const mensajesPorEstado = {
          400: "Revisa los datos del formulario.",
          401: "Tu sesión no es válida o ha expirado.",
          403: "No tienes permiso para editar esta artesanía.",
          404: "La artesanía o el taller seleccionado ya no existe.",
        };

        throw new Error(
          await obtenerMensajeError(
            respuesta,
            mensajesPorEstado[respuesta.status] ||
              `No se pudieron guardar los cambios. Código: ${respuesta.status}`,
          ),
        );
      }

      const artesaniaActualizada =
        await respuesta.json();

      setFormulario({
        nombre: artesaniaActualizada.nombre || "",
        descripcion:
          artesaniaActualizada.descripcion || "",
        precio: String(
          artesaniaActualizada.precio ?? "",
        ),
        existencia: String(
          artesaniaActualizada.existencia ?? "",
        ),
        imagenUrl:
          artesaniaActualizada.imagenUrl || "",
        tallerId: String(
          artesaniaActualizada.tallerId ?? "",
        ),
      });
      setErrores({});
      setMensaje({
        tipo: "exito",
        texto:
          "La artesanía se actualizó correctamente.",
      });
    } catch (errorPeticion) {
      console.error(
        "Error al actualizar la artesanía:",
        errorPeticion,
      );
      setMensaje({
        tipo: "error",
        texto:
          errorPeticion.message ||
          "No fue posible guardar los cambios.",
      });
    } finally {
      setGuardando(false);
    }
  };

  if (!esAdmin) {
    return (
      <section className="pagina-editar-artesania">
        <div className="estado-edicion-artesania estado-sin-permiso">
          <LockKeyhole size={42} />
          <h2>Acceso restringido</h2>
          <p>
            Solo una cuenta con rol ADMIN puede editar
            artesanías.
          </p>
          <button
            type="button"
            onClick={() => navigate("/artesanias")}
          >
            <ArrowLeft size={18} />
            Volver al listado
          </button>
        </div>
      </section>
    );
  }

  if (cargando) {
    return (
      <section className="pagina-editar-artesania">
        <div className="estado-edicion-artesania">
          <LoaderCircle
            className="icono-girando"
            size={38}
          />
          <p>Cargando información de la artesanía...</p>
        </div>
      </section>
    );
  }

  if (errorCarga) {
    return (
      <section className="pagina-editar-artesania">
        <div className="estado-edicion-artesania estado-edicion-error">
          <AlertCircle size={40} />
          <h2>No fue posible abrir la artesanía</h2>
          <p>{errorCarga}</p>

          <div className="acciones-error-edicion">
            <button
              type="button"
              onClick={cargarDatos}
            >
              Intentar nuevamente
            </button>

            <button
              type="button"
              onClick={() => navigate("/artesanias")}
            >
              Volver al listado
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pagina-editar-artesania">
      <div className="encabezado-editar-artesania">
        <div>
          <p className="ruta-editar-artesania">
            Catálogo / Artesanías / Editar
          </p>

          <h2>Editar artesanía</h2>

          <p className="descripcion-editar-artesania">
            Actualiza la información de la pieza
            seleccionada.
          </p>
        </div>

        <button
          className="boton-volver-artesanias"
          type="button"
          onClick={() => navigate("/artesanias")}
          disabled={guardando}
        >
          <ArrowLeft size={18} />
          Volver al listado
        </button>
      </div>

      <div className="detalle-artesanal" />

      {mensaje.texto && (
        <div
          className={`mensaje-edicion-artesania ${
            mensaje.tipo === "exito"
              ? "mensaje-edicion-exito"
              : "mensaje-edicion-error"
          }`}
          role="status"
        >
          {mensaje.tipo === "exito" ? (
            <CheckCircle2 size={21} />
          ) : (
            <AlertCircle size={21} />
          )}
          <p>{mensaje.texto}</p>
        </div>
      )}

      <article className="tarjeta-editar-artesania">
        <div className="titulo-formulario-artesania">
          <div className="icono-formulario-artesania">
            <PackageOpen size={25} />
          </div>

          <div>
            <h3>Datos de la artesanía</h3>
            <p>
              Los campos marcados con * son
              obligatorios.
            </p>
          </div>
        </div>

        <form
          className="formulario-editar-artesania"
          onSubmit={guardarCambios}
          noValidate
        >
          <div className="cuadricula-editar-artesania">
            <div className="grupo-campo-artesania campo-artesania-ancho">
              <label htmlFor="nombre">
                Nombre <span>*</span>
              </label>

              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formulario.nombre}
                onChange={actualizarCampo}
                disabled={guardando}
                maxLength="120"
                className={
                  errores.nombre
                    ? "campo-artesania-error"
                    : ""
                }
              />

              {errores.nombre && (
                <small className="texto-error-artesania">
                  <AlertCircle size={14} />
                  {errores.nombre}
                </small>
              )}
            </div>

            <div className="grupo-campo-artesania">
              <label htmlFor="precio">
                Precio (MXN) <span>*</span>
              </label>

              <input
                id="precio"
                name="precio"
                type="number"
                min="0.01"
                step="0.01"
                value={formulario.precio}
                onChange={actualizarCampo}
                disabled={guardando}
                className={
                  errores.precio
                    ? "campo-artesania-error"
                    : ""
                }
              />

              {errores.precio && (
                <small className="texto-error-artesania">
                  <AlertCircle size={14} />
                  {errores.precio}
                </small>
              )}
            </div>

            <div className="grupo-campo-artesania">
              <label htmlFor="existencia">
                Existencia <span>*</span>
              </label>

              <input
                id="existencia"
                name="existencia"
                type="number"
                min="0"
                step="1"
                value={formulario.existencia}
                onChange={actualizarCampo}
                disabled={guardando}
                className={
                  errores.existencia
                    ? "campo-artesania-error"
                    : ""
                }
              />

              {errores.existencia && (
                <small className="texto-error-artesania">
                  <AlertCircle size={14} />
                  {errores.existencia}
                </small>
              )}
            </div>

            <div className="grupo-campo-artesania">
              <label htmlFor="tallerId">
                Taller de procedencia <span>*</span>
              </label>

              <select
                id="tallerId"
                name="tallerId"
                value={formulario.tallerId}
                onChange={actualizarCampo}
                disabled={guardando}
                className={
                  errores.tallerId
                    ? "campo-artesania-error"
                    : ""
                }
              >
                <option value="">
                  Selecciona un taller
                </option>

                {talleres.map((taller) => (
                  <option
                    key={taller.id}
                    value={taller.id}
                  >
                    {taller.nombre ||
                      `Taller ${taller.id}`}
                  </option>
                ))}
              </select>

              {errores.tallerId && (
                <small className="texto-error-artesania">
                  <AlertCircle size={14} />
                  {errores.tallerId}
                </small>
              )}
            </div>

            <div className="grupo-campo-artesania campo-artesania-ancho">
              <label htmlFor="imagenUrl">
                URL de la imagen
              </label>

              <div className="entrada-imagen-artesania">
                <Image size={18} />
                <input
                  id="imagenUrl"
                  name="imagenUrl"
                  type="url"
                  value={formulario.imagenUrl}
                  onChange={actualizarCampo}
                  disabled={guardando}
                  maxLength="255"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className={
                    errores.imagenUrl
                      ? "campo-artesania-error"
                      : ""
                  }
                />
              </div>

              {errores.imagenUrl && (
                <small className="texto-error-artesania">
                  <AlertCircle size={14} />
                  {errores.imagenUrl}
                </small>
              )}
            </div>

            <div className="grupo-campo-artesania campo-artesania-ancho">
              <label htmlFor="descripcion">
                Descripción
              </label>

              <textarea
                id="descripcion"
                name="descripcion"
                rows="6"
                value={formulario.descripcion}
                onChange={actualizarCampo}
                disabled={guardando}
                maxLength="1000"
                className={
                  errores.descripcion
                    ? "campo-artesania-error"
                    : ""
                }
              />

              <div className="pie-descripcion-artesania">
                <div>
                  {errores.descripcion && (
                    <small className="texto-error-artesania">
                      <AlertCircle size={14} />
                      {errores.descripcion}
                    </small>
                  )}
                </div>

                <small>
                  {formulario.descripcion.length} / 1000
                </small>
              </div>
            </div>
          </div>

          <div className="acciones-formulario-artesania">
            <button
              className="boton-cancelar-artesania"
              type="button"
              onClick={() => navigate("/artesanias")}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              className="boton-guardar-artesania"
              type="submit"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <LoaderCircle
                    className="icono-girando"
                    size={18}
                  />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}

export default EditarArtesania;

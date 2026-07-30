import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Image,
  LoaderCircle,
  PackagePlus,
  Save,
} from "lucide-react";

import "./EditarArtesania.css";

const API_ARTESANIAS =
  `${import.meta.env.VITE_API_URL}/api/artesanias`
const API_TALLERES =
  `${import.meta.env.VITE_API_URL}/api/talleres`

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

function validarFormulario(formulario) {
  const errores = {};
  const nombre = formulario.nombre.trim();
  const descripcion = formulario.descripcion.trim();
  const imagenUrl = formulario.imagenUrl.trim();

  if (!nombre) {
    errores.nombre =
      "El nombre de la artesanía es obligatorio.";
  } else if (nombre.length > 120) {
    errores.nombre =
      "El nombre no puede exceder 120 caracteres.";
  }

  if (descripcion.length > 1000) {
    errores.descripcion =
      "La descripción no puede exceder 1000 caracteres.";
  }

  if (
    !/^\d+(\.\d{1,2})?$/.test(formulario.precio) ||
    Number(formulario.precio) <= 0
  ) {
    errores.precio =
      "Escribe un precio mayor que cero con máximo 2 decimales.";
  }

  if (!/^\d+$/.test(formulario.existencia)) {
    errores.existencia =
      "La existencia debe ser un número entero no negativo.";
  }

  if (imagenUrl.length > 255) {
    errores.imagenUrl =
      "La URL de la imagen no puede exceder 255 caracteres.";
  }

  if (!formulario.tallerId) {
    errores.tallerId =
      "Selecciona el taller de procedencia.";
  }

  return errores;
}

function RegistrarArtesania() {
  const navigate = useNavigate();
  const rol = localStorage.getItem("rol");
  const esAdmin = rol === "ADMIN";
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

  const cargarTalleres = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga("");

      const respuesta = await fetch(
        esAdmin
          ? `${API_TALLERES}?page=0&size=1000`
          : `${API_TALLERES}/mios?page=0&size=1000`,
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
            "No se pudieron cargar los talleres disponibles.",
          ),
        );
      }

      const datos = await respuesta.json();
      setTalleres(
        extraerLista(datos).sort((tallerA, tallerB) =>
          (tallerA.nombre || "").localeCompare(
            tallerB.nombre || "",
            "es",
          ),
        ),
      );
    } catch (error) {
      setErrorCarga(
        error.message ||
          "No fue posible cargar los talleres.",
      );
    } finally {
      setCargando(false);
    }
  }, [esAdmin]);

  useEffect(() => {
    cargarTalleres();
  }, [cargarTalleres]);

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
    setErrores((anteriores) => {
      const actualizados = { ...anteriores };
      delete actualizados[name];
      return actualizados;
    });
    setMensaje({ tipo: "", texto: "" });
  };

  const registrar = async (evento) => {
    evento.preventDefault();
    const erroresFormulario =
      validarFormulario(formulario);
    setErrores(erroresFormulario);

    if (Object.keys(erroresFormulario).length > 0) {
      return;
    }

    try {
      setGuardando(true);
      setMensaje({ tipo: "", texto: "" });

      const respuesta = await fetch(API_ARTESANIAS, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          nombre: formulario.nombre.trim(),
          descripcion:
            formulario.descripcion.trim() || null,
          precio: Number(formulario.precio),
          existencia: Number(formulario.existencia),
          imagenUrl: formulario.imagenUrl.trim() || null,
          tallerId: Number(formulario.tallerId),
        }),
      });

      if (!respuesta.ok) {
        throw new Error(
          await obtenerMensajeError(
            respuesta,
            respuesta.status === 403
              ? "No tienes permiso para agregar una artesanía a ese taller."
              : "No se pudo registrar la artesanía.",
          ),
        );
      }

      setFormulario(FORMULARIO_INICIAL);
      setErrores({});
      setMensaje({
        tipo: "exito",
        texto: "La artesanía se registró correctamente.",
      });
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto:
          error.message ||
          "No fue posible registrar la artesanía.",
      });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <section className="pagina-editar-artesania">
        <div className="estado-edicion-artesania">
          <LoaderCircle
            className="icono-girando"
            size={38}
          />
          <p>Cargando talleres disponibles...</p>
        </div>
      </section>
    );
  }

  if (errorCarga) {
    return (
      <section className="pagina-editar-artesania">
        <div className="estado-edicion-artesania estado-edicion-error">
          <AlertCircle size={40} />
          <h2>No fue posible abrir el formulario</h2>
          <p>{errorCarga}</p>
          <button type="button" onClick={cargarTalleres}>
            Intentar nuevamente
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="pagina-editar-artesania">
      <div className="encabezado-editar-artesania">
        <div>
          <p className="ruta-editar-artesania">
            Catálogo / Artesanías / Nuevo registro
          </p>
          <h2>Agregar artesanía</h2>
          <p className="descripcion-editar-artesania">
            Registra una pieza y relaciónala con un taller.
          </p>
        </div>

        <button
          className="boton-volver-artesanias"
          type="button"
          onClick={() => navigate("/artesanias")}
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
            <PackagePlus size={25} />
          </div>
          <div>
            <h3>Datos de la artesanía</h3>
            <p>
              Los campos marcados con * son obligatorios.
            </p>
          </div>
        </div>

        <form
          className="formulario-editar-artesania"
          onSubmit={registrar}
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
                    value={taller.id}
                    key={taller.id}
                  >
                    {taller.nombre || `Taller ${taller.id}`}
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
              disabled={guardando || talleres.length === 0}
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
                  Registrar artesanía
                </>
              )}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}

export default RegistrarArtesania;

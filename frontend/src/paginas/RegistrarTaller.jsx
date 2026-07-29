import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  LoaderCircle,
  Save,
} from "lucide-react";

import "./RegistrarTaller.css";

const API_TALLERES =
  "http://localhost:8090/api/talleres";
const API_COMUNIDADES =
  "http://localhost:8090/api/comunidades";
const API_ARTESANOS =
  "http://localhost:8090/api/artesanos?size=100";

const FORMULARIO_INICIAL = {
  nombre: "",
  descripcion: "",
  direccion: "",
  municipio: "",
  comunidadId: "",
  artesanoIds: [],
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

function validarCampo(nombre, valor) {
  const texto = String(valor ?? "").trim();

  if (nombre === "nombre") {
    if (!texto) {
      return "El nombre del taller es obligatorio.";
    }

    if (texto.length > 120) {
      return "El nombre no puede exceder 120 caracteres.";
    }
  }

  if (nombre === "descripcion" && texto.length > 1000) {
    return "La descripción no puede exceder 1000 caracteres.";
  }

  if (nombre === "direccion") {
    if (!texto) {
      return "La dirección es obligatoria.";
    }

    if (texto.length > 200) {
      return "La dirección no puede exceder 200 caracteres.";
    }
  }

  if (nombre === "municipio") {
    if (!texto) {
      return "El municipio es obligatorio.";
    }

    if (texto.length > 120) {
      return "El municipio no puede exceder 120 caracteres.";
    }
  }

  if (nombre === "comunidadId" && !texto) {
    return "Selecciona una comunidad.";
  }

  return "";
}

function validarFormulario(formulario) {
  const errores = {};

  [
    "nombre",
    "descripcion",
    "direccion",
    "municipio",
    "comunidadId",
  ].forEach((nombre) => {
    const mensaje = validarCampo(
      nombre,
      formulario[nombre],
    );

    if (mensaje) {
      errores[nombre] = mensaje;
    }
  });

  return errores;
}

function RegistrarTaller() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState(
    FORMULARIO_INICIAL,
  );
  const [comunidades, setComunidades] = useState([]);
  const [artesanos, setArtesanos] = useState([]);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");
  const [errorPeticion, setErrorPeticion] =
    useState("");
  const [registroExitoso, setRegistroExitoso] =
    useState(false);

  const cargarCatalogos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "No se encontró una sesión iniciada.",
        );
      }

      const cabeceras = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [respuestaComunidades, respuestaArtesanos] =
        await Promise.all([
          fetch(API_COMUNIDADES, {
            headers: cabeceras,
          }),
          fetch(`${API_ARTESANOS}?page=0&size=1000`, {
            headers: cabeceras,
          }),
        ]);

      if (!respuestaComunidades.ok) {
        throw new Error(
          "No se pudo cargar la lista de comunidades.",
        );
      }

      if (!respuestaArtesanos.ok) {
        throw new Error(
          "No se pudo cargar la lista de artesanos.",
        );
      }

      const [datosComunidades, datosArtesanos] =
        await Promise.all([
          respuestaComunidades.json(),
          respuestaArtesanos.json(),
        ]);

      setComunidades(extraerLista(datosComunidades));
      setArtesanos(extraerLista(datosArtesanos));
    } catch (error) {
      console.error(
        "Error al cargar los catálogos del taller:",
        error,
      );
      setErrorCarga(
        error.message ||
          "No fue posible preparar el formulario.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target;

    setFormulario((formularioAnterior) => ({
      ...formularioAnterior,
      [name]: value,
    }));

    setErrores((erroresAnteriores) => {
      const actualizados = { ...erroresAnteriores };
      const mensaje = validarCampo(name, value);

      if (mensaje) {
        actualizados[name] = mensaje;
      } else {
        delete actualizados[name];
      }

      return actualizados;
    });

    setErrorPeticion("");
  };

  const alternarArtesano = (artesanoId) => {
    const idTexto = String(artesanoId);

    setFormulario((formularioAnterior) => ({
      ...formularioAnterior,
      artesanoIds:
        formularioAnterior.artesanoIds.includes(idTexto)
          ? formularioAnterior.artesanoIds.filter(
              (idActual) => idActual !== idTexto,
            )
          : [
              ...formularioAnterior.artesanoIds,
              idTexto,
            ],
    }));
  };

  const registrarTaller = async (evento) => {
    evento.preventDefault();

    const nuevosErrores =
      validarFormulario(formulario);
    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    try {
      setGuardando(true);
      setErrorPeticion("");
      setRegistroExitoso(false);

      const token = localStorage.getItem("token");

      const respuesta = await fetch(API_TALLERES, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: formulario.nombre.trim(),
          descripcion:
            formulario.descripcion.trim() || null,
          direccion: formulario.direccion.trim(),
          municipio: formulario.municipio.trim(),
          comunidadId: Number(
            formulario.comunidadId,
          ),
          artesanoIds: formulario.artesanoIds.map(
            Number,
          ),
        }),
      });

      if (!respuesta.ok) {
        throw new Error(
          await obtenerMensajeError(
            respuesta,
            respuesta.status === 403
              ? "No tienes permiso para registrar talleres."
              : "No se pudo registrar el taller.",
          ),
        );
      }

      await respuesta.json();
      setRegistroExitoso(true);
      setFormulario(FORMULARIO_INICIAL);
      setErrores({});

      setTimeout(() => {
        navigate("/talleres");
      }, 1200);
    } catch (error) {
      console.error(
        "Error al registrar el taller:",
        error,
      );
      setErrorPeticion(
        error.message ||
          "No fue posible registrar el taller.",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <section className="pagina-registro-taller">
        <div className="estado-registro-taller">
          <LoaderCircle
            className="icono-girando"
            size={34}
          />
          <p>Preparando formulario...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pagina-registro-taller">
      <div className="encabezado-registro-taller">
        <div>
          <p className="ruta-registro-taller">
            Catálogo / Talleres / Nuevo registro
          </p>

          <h2>Registrar taller</h2>

          <p className="descripcion-registro-taller">
            Captura la información del nuevo taller
            artesanal.
          </p>
        </div>

        <button
          className="boton-volver-talleres"
          type="button"
          onClick={() => navigate("/talleres")}
          disabled={guardando}
        >
          <ArrowLeft size={18} />
          Volver al listado
        </button>
      </div>

      <div className="detalle-artesanal" />

      {registroExitoso && (
        <div className="mensaje-registro mensaje-registro-exitoso">
          <CheckCircle2 size={22} />
          <div>
            <strong>
              Taller registrado correctamente
            </strong>
            <p>Regresando al listado de talleres...</p>
          </div>
        </div>
      )}

      {(errorCarga || errorPeticion) && (
        <div className="mensaje-registro mensaje-registro-error">
          <AlertCircle size={22} />
          <div>
            <strong>
              No se pudo completar la operación
            </strong>
            <p>{errorCarga || errorPeticion}</p>
          </div>
        </div>
      )}

      {!errorCarga && (
        <article className="tarjeta-formulario-taller">
          <div className="titulo-formulario-taller">
            <div className="icono-formulario-taller">
              <Building2 size={25} />
            </div>

            <div>
              <h3>Información del taller</h3>
              <p>
                Los campos con asterisco son
                obligatorios.
              </p>
            </div>
          </div>

          <form
            className="formulario-taller"
            onSubmit={registrarTaller}
            noValidate
          >
            <div className="cuadricula-formulario-taller">
              <div className="grupo-campo-taller">
                <label htmlFor="nombre">
                  Nombre del taller <span>*</span>
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formulario.nombre}
                  onChange={actualizarCampo}
                  placeholder="Ej. Taller Artesanal Monte Albán"
                  disabled={guardando}
                  maxLength="120"
                  className={
                    errores.nombre
                      ? "campo-con-error"
                      : ""
                  }
                />
                {errores.nombre && (
                  <small className="texto-error-campo">
                    <AlertCircle size={14} />
                    {errores.nombre}
                  </small>
                )}
              </div>

              <div className="grupo-campo-taller">
                <label htmlFor="comunidadId">
                  Comunidad <span>*</span>
                </label>
                <select
                  id="comunidadId"
                  name="comunidadId"
                  value={formulario.comunidadId}
                  onChange={actualizarCampo}
                  disabled={guardando}
                  className={
                    errores.comunidadId
                      ? "campo-con-error"
                      : ""
                  }
                >
                  <option value="">
                    Selecciona una comunidad
                  </option>
                  {comunidades.map((comunidad) => (
                    <option
                      key={comunidad.id}
                      value={comunidad.id}
                    >
                      {comunidad.nombre} —{" "}
                      {comunidad.region}
                    </option>
                  ))}
                </select>
                {errores.comunidadId && (
                  <small className="texto-error-campo">
                    <AlertCircle size={14} />
                    {errores.comunidadId}
                  </small>
                )}
              </div>

              <div className="grupo-campo-taller">
                <label htmlFor="direccion">
                  Dirección <span>*</span>
                </label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  value={formulario.direccion}
                  onChange={actualizarCampo}
                  placeholder="Ej. Calle Principal #31"
                  disabled={guardando}
                  maxLength="200"
                  className={
                    errores.direccion
                      ? "campo-con-error"
                      : ""
                  }
                />
                {errores.direccion && (
                  <small className="texto-error-campo">
                    <AlertCircle size={14} />
                    {errores.direccion}
                  </small>
                )}
              </div>

              <div className="grupo-campo-taller">
                <label htmlFor="municipio">
                  Municipio <span>*</span>
                </label>
                <input
                  id="municipio"
                  name="municipio"
                  type="text"
                  value={formulario.municipio}
                  onChange={actualizarCampo}
                  placeholder="Ej. San Bartolo Coyotepec"
                  disabled={guardando}
                  maxLength="120"
                  className={
                    errores.municipio
                      ? "campo-con-error"
                      : ""
                  }
                />
                {errores.municipio && (
                  <small className="texto-error-campo">
                    <AlertCircle size={14} />
                    {errores.municipio}
                  </small>
                )}
              </div>

              <div className="grupo-campo-taller campo-ancho-completo">
                <label htmlFor="descripcion">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows="5"
                  value={formulario.descripcion}
                  onChange={actualizarCampo}
                  placeholder="Describe brevemente el taller y el trabajo artesanal que realiza."
                  disabled={guardando}
                  maxLength="1000"
                />
                <div className="pie-campo-resenia">
                  <div>
                    {errores.descripcion && (
                      <small className="texto-error-campo">
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

              <fieldset className="campo-ancho-completo selector-artesanos">
                <legend>Artesanos responsables</legend>
                <p>
                  Selecciona uno o más artesanos para
                  relacionarlos con el taller.
                </p>

                <div className="lista-selector-artesanos">
                  {artesanos.map((artesano) => (
                    <label
                      className="opcion-artesano"
                      key={artesano.id}
                    >
                      <input
                        type="checkbox"
                        checked={formulario.artesanoIds.includes(
                          String(artesano.id),
                        )}
                        onChange={() =>
                          alternarArtesano(artesano.id)
                        }
                        disabled={guardando}
                      />
                      <span>
                        <strong>
                          {artesano.nombreUsuario}
                        </strong>
                        <small>
                          {Array.isArray(
                            artesano.especialidades,
                          ) &&
                          artesano.especialidades.length > 0
                            ? artesano.especialidades.join(
                                ", ",
                              )
                            : "Sin especialidad"}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="acciones-formulario-taller">
              <button
                className="boton-cancelar-taller"
                type="button"
                onClick={() => navigate("/talleres")}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                className="boton-guardar-taller"
                type="submit"
                disabled={guardando || registroExitoso}
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
                    Registrar taller
                  </>
                )}
              </button>
            </div>
          </form>
        </article>
      )}
    </section>
  );
}

export default RegistrarTaller;

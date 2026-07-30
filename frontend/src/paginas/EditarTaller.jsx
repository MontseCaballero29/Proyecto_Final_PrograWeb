import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  LoaderCircle,
  Save,
} from "lucide-react";

import "./EditarTaller.css";

const API_TALLERES =
  `${import.meta.env.VITE_API_URL}/api/talleres`
const API_COMUNIDADES =
  `${import.meta.env.VITE_API_URL}/api/comunidades`
const API_ARTESANOS =
  `${import.meta.env.VITE_API_URL}/api/artesanos`

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

function EditarTaller() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esAdmin =
    localStorage.getItem("rol") === "ADMIN";

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
  const [actualizacionExitosa, setActualizacionExitosa] =
    useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga("");
      setErrorPeticion("");

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

      const [
        respuestaTaller,
        respuestaComunidades,
        respuestaRelacionada,
      ] = await Promise.all([
        fetch(`${API_TALLERES}/${id}`, {
          headers: cabeceras,
        }),
        fetch(API_COMUNIDADES, {
          headers: cabeceras,
        }),
        fetch(
          esAdmin
            ? `${API_ARTESANOS}?page=0&size=1000`
            : `${API_TALLERES}/mios?page=0&size=1000`,
          { headers: cabeceras },
        ),
      ]);

      if (!respuestaTaller.ok) {
        throw new Error(
          await obtenerMensajeError(
            respuestaTaller,
            "No se pudo obtener el taller seleccionado.",
          ),
        );
      }

      if (!respuestaComunidades.ok) {
        throw new Error(
          "No se pudo cargar la lista de comunidades.",
        );
      }

      if (!respuestaRelacionada.ok) {
        throw new Error(
          esAdmin
            ? "No se pudo cargar la lista de artesanos."
            : "No se pudo validar la propiedad del taller.",
        );
      }

      const [taller, datosComunidades, datosRelacionados] =
        await Promise.all([
          respuestaTaller.json(),
          respuestaComunidades.json(),
          respuestaRelacionada.json(),
        ]);

      if (
        !esAdmin &&
        !extraerLista(datosRelacionados).some(
          (tallerPropio) =>
            Number(tallerPropio.id) === Number(id),
        )
      ) {
        throw new Error(
          "No tienes permiso para editar este taller.",
        );
      }

      setComunidades(extraerLista(datosComunidades));
      setArtesanos(
        esAdmin ? extraerLista(datosRelacionados) : [],
      );
      setFormulario({
        nombre: taller.nombre || "",
        descripcion: taller.descripcion || "",
        direccion: taller.direccion || "",
        municipio: taller.municipio || "",
        comunidadId: String(taller.comunidadId ?? ""),
        artesanoIds: Array.isArray(
          taller.artesanoIds,
        )
          ? taller.artesanoIds.map(String)
          : [],
      });
    } catch (error) {
      console.error(
        "Error al cargar el taller:",
        error,
      );
      setErrorCarga(
        error.message ||
          "No fue posible obtener la información del taller.",
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

  const actualizarTaller = async (evento) => {
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
      setActualizacionExitosa(false);

      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        `${API_TALLERES}/${id}`,
        {
          method: "PUT",
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
        },
      );

      if (!respuesta.ok) {
        throw new Error(
          await obtenerMensajeError(
            respuesta,
            respuesta.status === 403
              ? "No tienes permiso para editar talleres."
              : "No se pudo actualizar el taller.",
          ),
        );
      }

      await respuesta.json();
      setActualizacionExitosa(true);

      setTimeout(() => {
        navigate("/talleres");
      }, 1200);
    } catch (error) {
      console.error(
        "Error al actualizar el taller:",
        error,
      );
      setErrorPeticion(
        error.message ||
          "No fue posible actualizar el taller.",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <section className="pagina-editar-taller">
        <div className="estado-editar-taller">
          <LoaderCircle
            className="icono-girando"
            size={34}
          />
          <p>Cargando información del taller...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pagina-editar-taller">
      <div className="encabezado-editar-taller">
        <div>
          <p className="ruta-editar-taller">
            Catálogo / Talleres / Editar
          </p>

          <h2>Editar taller</h2>

          <p className="descripcion-editar-taller">
            Actualiza la información del taller
            seleccionado.
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

      {actualizacionExitosa && (
        <div className="mensaje-editar mensaje-editar-exitoso">
          <CheckCircle2 size={22} />
          <div>
            <strong>
              Taller actualizado correctamente
            </strong>
            <p>Regresando al listado de talleres...</p>
          </div>
        </div>
      )}

      {(errorCarga || errorPeticion) && (
        <div className="mensaje-editar mensaje-editar-error">
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
        <article className="tarjeta-editar-taller">
          <div className="titulo-editar-taller">
            <div className="icono-editar-taller">
              <Building2 size={25} />
            </div>

            <div>
              <h3>Información del taller</h3>
              <p>
                Modifica los datos necesarios y guarda los
                cambios.
              </p>
            </div>
          </div>

          <form
            className="formulario-editar-taller"
            onSubmit={actualizarTaller}
            noValidate
          >
            <div className="cuadricula-editar-taller">
              <div className="grupo-campo-editar">
                <label htmlFor="nombre">
                  Nombre del taller <span>*</span>
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

              <div className="grupo-campo-editar">
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

              <div className="grupo-campo-editar">
                <label htmlFor="direccion">
                  Dirección <span>*</span>
                </label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  value={formulario.direccion}
                  onChange={actualizarCampo}
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

              <div className="grupo-campo-editar">
                <label htmlFor="municipio">
                  Municipio <span>*</span>
                </label>
                <input
                  id="municipio"
                  name="municipio"
                  type="text"
                  value={formulario.municipio}
                  onChange={actualizarCampo}
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

              <div className="grupo-campo-editar campo-ancho-completo">
                <label htmlFor="descripcion">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows="5"
                  value={formulario.descripcion}
                  onChange={actualizarCampo}
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

              {esAdmin && (
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
              )}
            </div>

            <div className="acciones-editar-taller">
              <button
                className="boton-cancelar-edicion"
                type="button"
                onClick={() => navigate("/talleres")}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                className="boton-guardar-cambios"
                type="submit"
                disabled={
                  guardando || actualizacionExitosa
                }
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
      )}
    </section>
  );
}

export default EditarTaller;

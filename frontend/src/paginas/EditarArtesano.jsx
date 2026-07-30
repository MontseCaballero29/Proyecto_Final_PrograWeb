import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  LoaderCircle,
  Save,
  XCircle,
} from "lucide-react";

import FormularioArtesano from "./FormularioArtesano";
import {
  API_ARTESANOS,
  API_COMUNIDADES,
  API_ESPECIALIDADES,
  FORMULARIO_ARTESANO_INICIAL,
  crearPeticionArtesano,
  extraerLista,
  obtenerMensajeError,
  validarFormularioArtesano,
} from "./artesanoFormulario";

function EditarArtesano() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState(
    FORMULARIO_ARTESANO_INICIAL,
  );
  const [comunidades, setComunidades] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [correoUsuario, setCorreoUsuario] = useState("");
  const [estadoValidacion, setEstadoValidacion] = useState("");
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [aprobando, setAprobando] = useState(false);
  const [rechazando, setRechazando] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");
  const [mensaje, setMensaje] = useState({
    tipo: "",
    texto: "",
  });

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga("");

      const token = localStorage.getItem("token");
      const cabeceras = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };
      const respuestas = await Promise.all([
        fetch(`${API_ARTESANOS}/${id}/edicion`, {
          headers: cabeceras,
        }),
        fetch(API_COMUNIDADES, { headers: cabeceras }),
        fetch(API_ESPECIALIDADES, {
          headers: cabeceras,
        }),
      ]);
      const respuestaConError = respuestas.find(
        (respuesta) => !respuesta.ok,
      );

      if (respuestaConError) {
        throw new Error(
          await obtenerMensajeError(
            respuestaConError,
            respuestaConError.status === 404
              ? "El artesano que intentas editar no existe."
              : "No se pudieron cargar los datos del artesano.",
          ),
        );
      }

      const [artesano, datosComunidades, datosEspecialidades] =
        await Promise.all(
          respuestas.map((respuesta) => respuesta.json()),
        );

      setComunidades(extraerLista(datosComunidades));
      setEspecialidades(extraerLista(datosEspecialidades));
      setNombreUsuario(artesano.nombreUsuario || "");
      setCorreoUsuario(artesano.correo || "");
      setEstadoValidacion(
        artesano.estadoValidacion || "EN_REVISION",
      );
      setFormulario({
        usuarioId: String(artesano.usuarioId ?? ""),
        comunidadId: String(artesano.comunidadId ?? ""),
        curp: artesano.curp || "",
        biografia: artesano.biografia || "",
        aniosOficio:
          artesano.aniosOficio === null ||
          artesano.aniosOficio === undefined
            ? ""
            : String(artesano.aniosOficio),
        lengua: artesano.lengua || "",
        especialidadIds: Array.isArray(
          artesano.especialidadIds,
        )
          ? artesano.especialidadIds.map(String)
          : [],
      });
    } catch (errorPeticion) {
      setErrorCarga(
        errorPeticion.message ||
          "No fue posible cargar el artesano.",
      );
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target;
    const valor =
      name === "curp" ? value.toUpperCase() : value;

    setFormulario((actual) => ({
      ...actual,
      [name]: valor,
    }));
    setErrores((actual) => ({
      ...actual,
      [name]: "",
    }));
    setMensaje({ tipo: "", texto: "" });
  };

  const cambiarEspecialidad = (idEspecialidad) => {
    setFormulario((actual) => {
      const seleccionada =
        actual.especialidadIds.includes(idEspecialidad);

      return {
        ...actual,
        especialidadIds: seleccionada
          ? actual.especialidadIds.filter(
              (idActual) => idActual !== idEspecialidad,
            )
          : [...actual.especialidadIds, idEspecialidad],
      };
    });
    setMensaje({ tipo: "", texto: "" });
  };

  const aprobarArtesano = async () => {
    try {
      setAprobando(true);
      setMensaje({ tipo: "", texto: "" });

      const respuesta = await fetch(
        `${API_ARTESANOS}/${id}/aprobar`,
        {
          method: "PATCH",
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
            "No se pudo aprobar al artesano.",
          ),
        );
      }

      const artesanoAprobado = await respuesta.json();
      setEstadoValidacion(
        artesanoAprobado.estadoValidacion || "APROBADO",
      );
      setMensaje({
        tipo: "exito",
        texto:
          "El artesano fue aprobado y se solicitó el envío del mensaje por WhatsApp.",
      });
    } catch (errorPeticion) {
      setMensaje({
        tipo: "error",
        texto:
          errorPeticion.message ||
          "No fue posible aprobar al artesano.",
      });
    } finally {
      setAprobando(false);
    }
  };

  const rechazarArtesano = async () => {
    const confirmado = window.confirm(
      "¿Seguro que deseas rechazar esta solicitud de artesano?",
    );

    if (!confirmado) {
      return;
    }

    try {
      setRechazando(true);
      setMensaje({ tipo: "", texto: "" });

      const respuesta = await fetch(
        `${API_ARTESANOS}/${id}/rechazar`,
        {
          method: "PATCH",
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
            "No se pudo rechazar al artesano.",
          ),
        );
      }

      const artesanoRechazado = await respuesta.json();
      setEstadoValidacion(
        artesanoRechazado.estadoValidacion || "RECHAZADO",
      );
      setMensaje({
        tipo: "exito",
        texto: "La solicitud del artesano fue rechazada.",
      });
    } catch (errorPeticion) {
      setMensaje({
        tipo: "error",
        texto:
          errorPeticion.message ||
          "No fue posible rechazar al artesano.",
      });
    } finally {
      setRechazando(false);
    }
  };

  const guardarCambios = async (evento) => {
    evento.preventDefault();

    const erroresFormulario = validarFormularioArtesano(
      formulario,
      false,
    );

    if (Object.keys(erroresFormulario).length > 0) {
      setErrores(erroresFormulario);
      setMensaje({
        tipo: "error",
        texto: "Revisa los campos marcados antes de guardar.",
      });
      return;
    }

    try {
      setGuardando(true);
      setMensaje({ tipo: "", texto: "" });

      const token = localStorage.getItem("token");
      const respuesta = await fetch(
        `${API_ARTESANOS}/${id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(
            crearPeticionArtesano(formulario),
          ),
        },
      );

      if (!respuesta.ok) {
        throw new Error(
          await obtenerMensajeError(
            respuesta,
            "No se pudieron guardar los cambios.",
          ),
        );
      }

      setErrores({});
      setMensaje({
        tipo: "exito",
        texto: "Los datos del artesano se actualizaron correctamente.",
      });
    } catch (errorPeticion) {
      setMensaje({
        tipo: "error",
        texto:
          errorPeticion.message ||
          "No fue posible actualizar el artesano.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const estadoNormalizado = String(
    estadoValidacion || "EN_REVISION",
  )
    .trim()
    .toUpperCase();
  const estaEnRevision = estadoNormalizado === "EN_REVISION";
  const procesandoValidacion = aprobando || rechazando;

  return (
    <section className="pagina-formulario-artesano">
      <div className="encabezado-formulario-artesano">
        <button
          className="boton-volver-artesano"
          type="button"
          onClick={() => navigate("/artesanos")}
          aria-label="Volver al listado"
        >
          <ArrowLeft size={21} />
        </button>

        <div>
          <p className="ruta-formulario-artesano">
            Catálogo / Artesanos / Edición
          </p>
          <h2>Editar artesano</h2>
          <p className="descripcion-formulario-artesano">
            Modifica la información del perfil artesanal seleccionado.
          </p>
        </div>
      </div>

      <form
        className="tarjeta-formulario-artesano"
        onSubmit={guardarCambios}
      >
        <div className="titulo-tarjeta-artesano">
          <h3>Información del artesano</h3>
          <p>Los cambios se guardarán directamente en la base de datos.</p>
          <span
            className={`estado-validacion-artesano estado-${estadoNormalizado.toLowerCase()}`}
          >
            {estadoNormalizado}
          </span>
        </div>

        {cargando ? (
          <div className="estado-carga-formulario-artesano">
            <LoaderCircle
              className="icono-girando"
              size={34}
            />
            <p>Cargando información del artesano...</p>
          </div>
        ) : errorCarga ? (
          <div className="estado-carga-formulario-artesano">
            <p>{errorCarga}</p>
            <button type="button" onClick={cargarDatos}>
              Intentar nuevamente
            </button>
          </div>
        ) : (
          <FormularioArtesano
            formulario={formulario}
            errores={errores}
            usuarios={[]}
            comunidades={comunidades}
            especialidades={especialidades}
            modoEdicion
            nombreUsuario={nombreUsuario}
            correoUsuario={correoUsuario}
            deshabilitado={guardando || procesandoValidacion}
            onChange={actualizarCampo}
            onEspecialidad={cambiarEspecialidad}
          />
        )}

        {mensaje.texto && (
          <p
            className={`mensaje-formulario-artesano ${
              mensaje.tipo === "exito"
                ? "mensaje-formulario-exito"
                : "mensaje-formulario-error"
            }`}
          >
            {mensaje.texto}
          </p>
        )}

        <div className="acciones-formulario-artesano">
          <button
            className="boton-cancelar-artesano"
            type="button"
            onClick={() => navigate("/artesanos")}
            disabled={guardando || procesandoValidacion}
          >
            Cancelar
          </button>
          {estaEnRevision && (
            <>
              <button
                className="boton-rechazar-artesano"
                type="button"
                onClick={rechazarArtesano}
                disabled={guardando || procesandoValidacion}
              >
                {rechazando ? (
                  <LoaderCircle
                    className="icono-girando"
                    size={18}
                  />
                ) : (
                  <XCircle size={18} />
                )}
                {rechazando ? "Rechazando..." : "Rechazar"}
              </button>
              <button
                className="boton-aprobar-artesano"
                type="button"
                onClick={aprobarArtesano}
                disabled={guardando || procesandoValidacion}
              >
                {aprobando ? (
                  <LoaderCircle
                    className="icono-girando"
                    size={18}
                  />
                ) : (
                  <BadgeCheck size={18} />
                )}
                {aprobando ? "Aprobando..." : "Aprobar artesano"}
              </button>
            </>
          )}
          <button
            className="boton-guardar-artesano"
            type="submit"
            disabled={
              cargando ||
              Boolean(errorCarga) ||
              guardando ||
              procesandoValidacion
            }
          >
            {guardando ? (
              <LoaderCircle
                className="icono-girando"
                size={18}
              />
            ) : (
              <Save size={18} />
            )}
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default EditarArtesano;

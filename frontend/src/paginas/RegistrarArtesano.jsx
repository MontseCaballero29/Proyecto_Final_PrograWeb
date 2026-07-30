import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  LoaderCircle,
  UserRoundPlus,
} from "lucide-react";

import FormularioArtesano from "./FormularioArtesano";
import {
  API_ARTESANOS,
  API_COMUNIDADES,
  API_ESPECIALIDADES,
  API_USUARIOS_DISPONIBLES,
  FORMULARIO_ARTESANO_INICIAL,
  crearPeticionArtesano,
  extraerLista,
  obtenerMensajeError,
  validarFormularioArtesano,
} from "./artesanoFormulario";

function RegistrarArtesano() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState(
    FORMULARIO_ARTESANO_INICIAL,
  );
  const [usuarios, setUsuarios] = useState([]);
  const [comunidades, setComunidades] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");
  const [mensaje, setMensaje] = useState({
    tipo: "",
    texto: "",
  });

  const cargarCatalogos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga("");

      const token = localStorage.getItem("token");
      const cabeceras = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const respuestas = await Promise.all([
        fetch(API_USUARIOS_DISPONIBLES, {
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
            "No se pudieron cargar los datos del formulario.",
          ),
        );
      }

      const [datosUsuarios, datosComunidades, datosEspecialidades] =
        await Promise.all(
          respuestas.map((respuesta) => respuesta.json()),
        );

      setUsuarios(extraerLista(datosUsuarios));
      setComunidades(extraerLista(datosComunidades));
      setEspecialidades(extraerLista(datosEspecialidades));
    } catch (errorPeticion) {
      setErrorCarga(
        errorPeticion.message ||
          "No fue posible cargar el formulario.",
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

  const cambiarEspecialidad = (id) => {
    setFormulario((actual) => {
      const seleccionada =
        actual.especialidadIds.includes(id);

      return {
        ...actual,
        especialidadIds: seleccionada
          ? actual.especialidadIds.filter(
              (especialidadId) => especialidadId !== id,
            )
          : [...actual.especialidadIds, id],
      };
    });
    setMensaje({ tipo: "", texto: "" });
  };

  const guardarArtesano = async (evento) => {
    evento.preventDefault();

    const erroresFormulario = validarFormularioArtesano(
      formulario,
      true,
    );
    const usuarioSeleccionado = usuarios.find(
      (usuario) =>
        String(usuario.id) === String(formulario.usuarioId),
    );

    if (
      formulario.usuarioId &&
      usuarioSeleccionado &&
      !usuarioSeleccionado.telefono
    ) {
      erroresFormulario.usuarioId =
        "El usuario seleccionado debe agregar su celular en Configuración.";
    }

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
      const respuesta = await fetch(API_ARTESANOS, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          crearPeticionArtesano(formulario),
        ),
      });

      if (!respuesta.ok) {
        throw new Error(
          await obtenerMensajeError(
            respuesta,
            "No se pudo registrar el artesano.",
          ),
        );
      }

      setFormulario(FORMULARIO_ARTESANO_INICIAL);
      setErrores({});
      setMensaje({
        tipo: "exito",
        texto:
          "El artesano se registró correctamente. Se solicitó el envío del SMS al celular de su cuenta.",
      });
      await cargarCatalogos();
    } catch (errorPeticion) {
      setMensaje({
        tipo: "error",
        texto:
          errorPeticion.message ||
          "No fue posible registrar el artesano.",
      });
    } finally {
      setGuardando(false);
    }
  };

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
            Catálogo / Artesanos / Registro
          </p>
          <h2>Registrar artesano</h2>
          <p className="descripcion-formulario-artesano">
            Vincula un usuario visitante y captura la información de
            su perfil artesanal.
          </p>
        </div>
      </div>

      <form
        className="tarjeta-formulario-artesano"
        onSubmit={guardarArtesano}
      >
        <div className="titulo-tarjeta-artesano">
          <h3>Información del artesano</h3>
          <p>Los campos marcados con * son obligatorios.</p>
        </div>

        {cargando ? (
          <div className="estado-carga-formulario-artesano">
            <LoaderCircle
              className="icono-girando"
              size={34}
            />
            <p>Cargando datos del formulario...</p>
          </div>
        ) : errorCarga ? (
          <div className="estado-carga-formulario-artesano">
            <p>{errorCarga}</p>
            <button type="button" onClick={cargarCatalogos}>
              Intentar nuevamente
            </button>
          </div>
        ) : (
          <FormularioArtesano
            formulario={formulario}
            errores={errores}
            usuarios={usuarios}
            comunidades={comunidades}
            especialidades={especialidades}
            modoEdicion={false}
            deshabilitado={guardando}
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
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            className="boton-guardar-artesano"
            type="submit"
            disabled={
              cargando ||
              Boolean(errorCarga) ||
              guardando ||
              usuarios.length === 0
            }
          >
            {guardando ? (
              <LoaderCircle
                className="icono-girando"
                size={18}
              />
            ) : (
              <UserRoundPlus size={18} />
            )}
            {guardando ? "Registrando..." : "Registrar artesano"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default RegistrarArtesano;

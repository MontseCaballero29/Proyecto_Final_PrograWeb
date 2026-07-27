import { useEffect, useState } from "react";
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
  "https://6a545ff38547b9f7111c26d6.mockapi.io/talleres";

const FORMULARIO_INICIAL = {
  nombreTaller: "",
  responsable: "",
  especialidad: "",
  ubicacion: "",
  resenia: "",
};

function EditarTaller() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formulario, setFormulario] = useState(
    FORMULARIO_INICIAL,
  );

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorPeticion, setErrorPeticion] = useState("");
  const [actualizacionExitosa, setActualizacionExitosa] =
    useState(false);

  useEffect(() => {
    const cargarTaller = async () => {
      try {
        setCargando(true);
        setErrorPeticion("");

        const respuesta = await fetch(
          `${API_TALLERES}/${id}`,
        );

        if (!respuesta.ok) {
          throw new Error(
            `No se pudo obtener el taller. Código: ${respuesta.status}`,
          );
        }

        const taller = await respuesta.json();

        setFormulario({
          nombreTaller: taller.nombreTaller || "",
          responsable: taller.responsable || "",
          especialidad: taller.especialidad || "",
          ubicacion: taller.ubicacion || "",
          resenia:
            taller.resenia !== undefined &&
            taller.resenia !== null
              ? String(taller.resenia)
              : "",
        });
      } catch (error) {
        console.error(
          "Error al cargar el taller:",
          error,
        );

        setErrorPeticion(
          "No fue posible obtener la información del taller.",
        );
      } finally {
        setCargando(false);
      }
    };

    cargarTaller();
  }, [id]);

  const validarCampo = (nombre, valor) => {
    const texto = String(valor ?? "").trim();

    if (nombre === "nombreTaller") {
      if (!texto) {
        return "El nombre del taller es obligatorio.";
      }

      if (texto.length < 3) {
        return "El nombre debe tener al menos 3 caracteres.";
      }
    }

    if (nombre === "responsable") {
      if (!texto) {
        return "El responsable es obligatorio.";
      }

      if (texto.length < 3) {
        return "El responsable debe tener al menos 3 caracteres.";
      }
    }

    if (nombre === "especialidad" && !texto) {
      return "La especialidad es obligatoria.";
    }

    if (nombre === "ubicacion" && !texto) {
      return "La ubicación es obligatoria.";
    }

    if (nombre === "resenia") {
      if (!texto) {
        return "La calificación es obligatoria.";
      }

      const calificacion = Number(texto);

      if (Number.isNaN(calificacion)) {
        return "La calificación debe ser un número.";
      }

      if (calificacion < 0 || calificacion > 5) {
        return "La calificación debe estar entre 0 y 5.";
      }
    }

    return "";
  };

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target;

    setFormulario((formularioAnterior) => ({
      ...formularioAnterior,
      [name]: value,
    }));

    setErrores((erroresAnteriores) => ({
      ...erroresAnteriores,
      [name]: validarCampo(name, value),
    }));

    setErrorPeticion("");
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    Object.entries(formulario).forEach(
      ([nombre, valor]) => {
        const mensaje = validarCampo(nombre, valor);

        if (mensaje) {
          nuevosErrores[nombre] = mensaje;
        }
      },
    );

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const actualizarTaller = async (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setGuardando(true);
      setErrorPeticion("");
      setActualizacionExitosa(false);

      const tallerActualizado = {
        nombreTaller: formulario.nombreTaller.trim(),
        responsable: formulario.responsable.trim(),
        especialidad: formulario.especialidad.trim(),
        ubicacion: formulario.ubicacion.trim(),
        resenia: Number(formulario.resenia),
      };

      const respuesta = await fetch(
        `${API_TALLERES}/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tallerActualizado),
        },
      );

      if (!respuesta.ok) {
        throw new Error(
          `No se pudo actualizar el taller. Código: ${respuesta.status}`,
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
        "No fue posible actualizar el taller. Intenta nuevamente.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const volverAlListado = () => {
    navigate("/talleres");
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
            Actualiza la información del taller seleccionado.
          </p>
        </div>

        <button
          className="boton-volver-talleres"
          type="button"
          onClick={volverAlListado}
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

      {errorPeticion && (
        <div className="mensaje-editar mensaje-editar-error">
          <AlertCircle size={22} />

          <div>
            <strong>
              No se pudo completar la operación
            </strong>

            <p>{errorPeticion}</p>
          </div>
        </div>
      )}

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
              <label htmlFor="nombreTaller">
                Nombre del taller <span>*</span>
              </label>

              <input
                id="nombreTaller"
                name="nombreTaller"
                type="text"
                value={formulario.nombreTaller}
                onChange={actualizarCampo}
                disabled={guardando}
                className={
                  errores.nombreTaller
                    ? "campo-con-error"
                    : ""
                }
              />

              {errores.nombreTaller && (
                <small className="texto-error-campo">
                  <AlertCircle size={14} />
                  {errores.nombreTaller}
                </small>
              )}
            </div>

            <div className="grupo-campo-editar">
              <label htmlFor="responsable">
                Responsable <span>*</span>
              </label>

              <input
                id="responsable"
                name="responsable"
                type="text"
                value={formulario.responsable}
                onChange={actualizarCampo}
                disabled={guardando}
                className={
                  errores.responsable
                    ? "campo-con-error"
                    : ""
                }
              />

              {errores.responsable && (
                <small className="texto-error-campo">
                  <AlertCircle size={14} />
                  {errores.responsable}
                </small>
              )}
            </div>

            <div className="grupo-campo-editar">
              <label htmlFor="especialidad">
                Especialidad <span>*</span>
              </label>

              <input
                id="especialidad"
                name="especialidad"
                type="text"
                value={formulario.especialidad}
                onChange={actualizarCampo}
                disabled={guardando}
                className={
                  errores.especialidad
                    ? "campo-con-error"
                    : ""
                }
              />

              {errores.especialidad && (
                <small className="texto-error-campo">
                  <AlertCircle size={14} />
                  {errores.especialidad}
                </small>
              )}
            </div>

            <div className="grupo-campo-editar">
              <label htmlFor="ubicacion">
                Ubicación <span>*</span>
              </label>

              <input
                id="ubicacion"
                name="ubicacion"
                type="text"
                value={formulario.ubicacion}
                onChange={actualizarCampo}
                disabled={guardando}
                className={
                  errores.ubicacion
                    ? "campo-con-error"
                    : ""
                }
              />

              {errores.ubicacion && (
                <small className="texto-error-campo">
                  <AlertCircle size={14} />
                  {errores.ubicacion}
                </small>
              )}
            </div>

            <div className="grupo-campo-editar campo-ancho-completo">
              <label htmlFor="resenia">
                Calificación <span>*</span>
              </label>

              <input
                id="resenia"
                name="resenia"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formulario.resenia}
                onChange={actualizarCampo}
                disabled={guardando}
                placeholder="Ej. 4.8"
                className={
                  errores.resenia
                    ? "campo-con-error"
                    : ""
                }
              />

              {errores.resenia && (
                <small className="texto-error-campo">
                  <AlertCircle size={14} />
                  {errores.resenia}
                </small>
              )}
            </div>
          </div>

          <div className="acciones-editar-taller">
            <button
              className="boton-cancelar-edicion"
              type="button"
              onClick={volverAlListado}
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
    </section>
  );
}

export default EditarTaller;
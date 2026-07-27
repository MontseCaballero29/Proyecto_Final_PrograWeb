import { useState } from "react";
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
  "https://6a545ff38547b9f7111c26d6.mockapi.io/talleres";

const FORMULARIO_INICIAL = {
  nombreTaller: "",
  responsable: "",
  especialidad: "",
  ubicacion: "",
  resenia: "",
};

function RegistrarTaller() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState(
    FORMULARIO_INICIAL,
  );

  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [errorPeticion, setErrorPeticion] = useState("");
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target;

    setFormulario((formularioAnterior) => ({
      ...formularioAnterior,
      [name]: value,
    }));

    setErrores((erroresAnteriores) => ({
      ...erroresAnteriores,
      [name]: "",
    }));

    setErrorPeticion("");
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formulario.nombreTaller.trim()) {
      nuevosErrores.nombreTaller =
        "El nombre del taller es obligatorio.";
    } else if (formulario.nombreTaller.trim().length < 3) {
      nuevosErrores.nombreTaller =
        "El nombre debe contener al menos 3 caracteres.";
    }

    if (!formulario.responsable.trim()) {
      nuevosErrores.responsable =
        "El nombre del responsable es obligatorio.";
    } else if (formulario.responsable.trim().length < 3) {
      nuevosErrores.responsable =
        "El responsable debe contener al menos 3 caracteres.";
    }

    if (!formulario.especialidad.trim()) {
      nuevosErrores.especialidad =
        "La especialidad es obligatoria.";
    }

    if (!formulario.ubicacion.trim()) {
      nuevosErrores.ubicacion =
        "La ubicación es obligatoria.";
    }

    if (!formulario.resenia.trim()) {
      nuevosErrores.resenia =
        "La reseña del taller es obligatoria.";
    } else if (formulario.resenia.trim().length < 10) {
      nuevosErrores.resenia =
        "La reseña debe contener al menos 10 caracteres.";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const registrarTaller = async (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setGuardando(true);
      setErrorPeticion("");
      setRegistroExitoso(false);

      const nuevoTaller = {
        nombreTaller: formulario.nombreTaller.trim(),
        responsable: formulario.responsable.trim(),
        especialidad: formulario.especialidad.trim(),
        ubicacion: formulario.ubicacion.trim(),
        resenia: formulario.resenia.trim(),
      };

      const respuesta = await fetch(API_TALLERES, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoTaller),
      });

      if (!respuesta.ok) {
        throw new Error(
          `No fue posible registrar el taller. Código: ${respuesta.status}`,
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
      console.error("Error al registrar el taller:", error);

      setErrorPeticion(
        "No fue posible registrar el taller en la API. Intenta nuevamente.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const cancelarRegistro = () => {
    navigate("/talleres");
  };

  return (
    <section className="pagina-registro-taller">
      <div className="encabezado-registro-taller">
        <div>
          <p className="ruta-registro-taller">
            Catálogo / Talleres / Nuevo registro
          </p>

          <h2>Registrar taller</h2>

          <p className="descripcion-registro-taller">
            Captura la información del nuevo taller artesanal.
          </p>
        </div>

        <button
          className="boton-volver-talleres"
          type="button"
          onClick={cancelarRegistro}
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
            <strong>Taller registrado correctamente</strong>
            <p>Regresando al listado de talleres...</p>
          </div>
        </div>
      )}

      {errorPeticion && (
        <div className="mensaje-registro mensaje-registro-error">
          <AlertCircle size={22} />

          <div>
            <strong>No se pudo completar el registro</strong>
            <p>{errorPeticion}</p>
          </div>
        </div>
      )}

      <article className="tarjeta-formulario-taller">
        <div className="titulo-formulario-taller">
          <div className="icono-formulario-taller">
            <Building2 size={25} />
          </div>

          <div>
            <h3>Información del taller</h3>
            <p>
              Todos los campos marcados con un asterisco son
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
              <label htmlFor="nombreTaller">
                Nombre del taller <span>*</span>
              </label>

              <input
                id="nombreTaller"
                name="nombreTaller"
                type="text"
                value={formulario.nombreTaller}
                onChange={actualizarCampo}
                placeholder="Ej. Taller Artesanal Monte Albán"
                disabled={guardando}
                className={
                  errores.nombreTaller ? "campo-con-error" : ""
                }
              />

              {errores.nombreTaller && (
                <small className="texto-error-campo">
                  <AlertCircle size={14} />
                  {errores.nombreTaller}
                </small>
              )}
            </div>

            <div className="grupo-campo-taller">
              <label htmlFor="responsable">
                Responsable <span>*</span>
              </label>

              <input
                id="responsable"
                name="responsable"
                type="text"
                value={formulario.responsable}
                onChange={actualizarCampo}
                placeholder="Nombre completo del responsable"
                disabled={guardando}
                className={
                  errores.responsable ? "campo-con-error" : ""
                }
              />

              {errores.responsable && (
                <small className="texto-error-campo">
                  <AlertCircle size={14} />
                  {errores.responsable}
                </small>
              )}
            </div>

            <div className="grupo-campo-taller">
              <label htmlFor="especialidad">
                Especialidad <span>*</span>
              </label>

              <input
                id="especialidad"
                name="especialidad"
                type="text"
                value={formulario.especialidad}
                onChange={actualizarCampo}
                placeholder="Ej. Barro negro, textiles o alebrijes"
                disabled={guardando}
                className={
                  errores.especialidad ? "campo-con-error" : ""
                }
              />

              {errores.especialidad && (
                <small className="texto-error-campo">
                  <AlertCircle size={14} />
                  {errores.especialidad}
                </small>
              )}
            </div>

            <div className="grupo-campo-taller">
              <label htmlFor="ubicacion">
                Ubicación <span>*</span>
              </label>

              <input
                id="ubicacion"
                name="ubicacion"
                type="text"
                value={formulario.ubicacion}
                onChange={actualizarCampo}
                placeholder="Ej. San Bartolo Coyotepec, Oaxaca"
                disabled={guardando}
                className={
                  errores.ubicacion ? "campo-con-error" : ""
                }
              />

              {errores.ubicacion && (
                <small className="texto-error-campo">
                  <AlertCircle size={14} />
                  {errores.ubicacion}
                </small>
              )}
            </div>

            <div className="grupo-campo-taller campo-ancho-completo">
              <label htmlFor="resenia">
                Reseña <span>*</span>
              </label>

              <textarea
                id="resenia"
                name="resenia"
                rows="5"
                value={formulario.resenia}
                onChange={actualizarCampo}
                placeholder="Describe brevemente el taller, su historia y el trabajo artesanal que realiza."
                disabled={guardando}
                className={
                  errores.resenia ? "campo-con-error" : ""
                }
              />

              <div className="pie-campo-resenia">
                <div>
                  {errores.resenia && (
                    <small className="texto-error-campo">
                      <AlertCircle size={14} />
                      {errores.resenia}
                    </small>
                  )}
                </div>

                <small>
                  {formulario.resenia.length} caracteres
                </small>
              </div>
            </div>
          </div>

          <div className="acciones-formulario-taller">
            <button
              className="boton-cancelar-taller"
              type="button"
              onClick={cancelarRegistro}
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
    </section>
  );
}

export default RegistrarTaller;
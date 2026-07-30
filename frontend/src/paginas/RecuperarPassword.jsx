import { useState } from "react";
import { Link } from "react-router-dom";

const API_RECUPERAR = `${import.meta.env.VITE_API_URL}/api/auth/recuperar`;

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RecuperarPassword() {
  const [correo, setCorreo] = useState("");
  const [errorCorreo, setErrorCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const validarCorreo = (valor) => {
    if (valor.trim() === "") {
      return "El correo es obligatorio";
    }
    if (!PATRON_CORREO.test(valor)) {
      return "El formato del correo no es válido";
    }
    return "";
  };

  const alCambiarCorreo = (evento) => {
    const valor = evento.target.value;
    setCorreo(valor);
    setErrorCorreo(validarCorreo(valor));
  };

  const solicitar = async (evento) => {
    evento.preventDefault();

    const fallo = validarCorreo(correo);
    setErrorCorreo(fallo);
    if (fallo) {
      return;
    }

    setCargando(true);

    try {
      await fetch(API_RECUPERAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      setEnviado(true);
    } catch (errorPeticion) {
      setEnviado(true);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pagina-login">
      <div className="marca-login">
        <div className="greca-login" />

        <div className="marca-login-centro">
          <h1>Manos de Oaxaca</h1>
          <p>Recupera el acceso a tu cuenta.</p>
        </div>

        <div className="greca-login-pie">
          <div className="greca-login" />
          <span>Instituto Oaxaqueño de las Artesanías</span>
        </div>
      </div>

      <div className="formulario-login">
        <div className="tarjeta-login">
          <h2>Recuperar contraseña</h2>

          <div className="linea-dorada" />

          {enviado ? (
            <p className="subtitulo-login">
              Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.
            </p>
          ) : (
            <form onSubmit={solicitar}>
              <p className="subtitulo-login">
                Escribe tu correo y te enviaremos un enlace de recuperación.
              </p>

              <div className="campo-login">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={alCambiarCorreo}
                />
                {errorCorreo && <p className="error-campo">{errorCorreo}</p>}
              </div>

              <button type="submit" disabled={cargando}>
                {cargando ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
          )}

          <div className="linea-dorada" />

          <p className="nota-login">
            <Link to="/login" className="enlace-acceso">Volver a iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecuperarPassword;
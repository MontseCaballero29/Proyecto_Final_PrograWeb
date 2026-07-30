import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const API_RESTABLECER = `${import.meta.env.VITE_API_URL}/api/auth/restablecer`;

const PATRON_PASSWORD = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function RestablecerPassword() {
  const navigate = useNavigate();
  const [parametrosBusqueda] = useSearchParams();
  const token = parametrosBusqueda.get("token") || "";

  const [password, setPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");
  const [cargando, setCargando] = useState(false);

  const validarPassword = (valor) => {
    if (valor === "") {
      return "La contraseña es obligatoria";
    }
    if (!PATRON_PASSWORD.test(valor)) {
      return "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial";
    }
    return "";
  };

  const alCambiarPassword = (evento) => {
    const valor = evento.target.value;
    setPassword(valor);
    setErrorPassword(validarPassword(valor));
  };

  const restablecer = async (evento) => {
    evento.preventDefault();
    setErrorGeneral("");

    const fallo = validarPassword(password);
    setErrorPassword(fallo);
    if (fallo) {
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(API_RESTABLECER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!respuesta.ok) {
        throw new Error("El enlace de recuperación no es válido o ha expirado.");
      }

      navigate("/login");
    } catch (errorPeticion) {
      setErrorGeneral(errorPeticion.message);
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
          <p>Define una nueva contraseña para tu cuenta.</p>
        </div>

        <div className="greca-login-pie">
          <div className="greca-login" />
          <span>Instituto Oaxaqueño de las Artesanías</span>
        </div>
      </div>

      <div className="formulario-login">
        <div className="tarjeta-login">
          <h2>Nueva contraseña</h2>

          <div className="linea-dorada" />

          {token === "" ? (
            <p className="error-login">
              El enlace no es válido. Solicita uno nuevo desde "¿Olvidaste tu contraseña?".
            </p>
          ) : (
            <form onSubmit={restablecer}>
              <p className="subtitulo-login">
                Escribe tu nueva contraseña.
              </p>

              <div className="campo-login">
                <label htmlFor="password">Nueva contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={alCambiarPassword}
                />
                {errorPassword && <p className="error-campo">{errorPassword}</p>}
              </div>

              {errorGeneral && <p className="error-login">{errorGeneral}</p>}

              <button type="submit" disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar contraseña"}
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

export default RestablecerPassword;
import { useState } from "react";
import logo from "../assets/logo.jpeg";
import { Link, useNavigate } from "react-router-dom";

const API_REGISTRO = `${import.meta.env.VITE_API_URL}/api/auth/register`;

const PATRON_PASSWORD = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PATRON_TELEFONO = /^\+[1-9]\d{9,14}$/;

function Registro() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");

  const [errorNombre, setErrorNombre] = useState("");
  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorTelefono, setErrorTelefono] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const [errorGeneral, setErrorGeneral] = useState("");
  const [cargando, setCargando] = useState(false);

  const validarNombre = (valor) => {
    if (valor.trim() === "") {
      return "El nombre es obligatorio";
    }
    if (valor.trim().length > 100) {
      return "El nombre no puede exceder 100 caracteres";
    }
    return "";
  };

  const validarCorreo = (valor) => {
    if (valor.trim() === "") {
      return "El correo es obligatorio";
    }
    if (!PATRON_CORREO.test(valor)) {
      return "El formato del correo no es válido";
    }
    return "";
  };

  const validarTelefono = (valor) => {
    if (valor.trim() === "") {
      return "El teléfono es obligatorio";
    }
    if (!PATRON_TELEFONO.test(valor.trim())) {
      return "Usa formato internacional, por ejemplo +529511234567";
    }
    return "";
  };

  const validarPassword = (valor) => {
    if (valor === "") {
      return "La contraseña es obligatoria";
    }
    if (!PATRON_PASSWORD.test(valor)) {
      return "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial";
    }
    return "";
  };

  const alCambiarNombre = (evento) => {
    const valor = evento.target.value;
    setNombre(valor);
    setErrorNombre(validarNombre(valor));
  };

  const alCambiarCorreo = (evento) => {
    const valor = evento.target.value;
    setCorreo(valor);
    setErrorCorreo(validarCorreo(valor));
  };

  const alCambiarTelefono = (evento) => {
    const valor = evento.target.value.replace(/[^+\d]/g, "");
    setTelefono(valor);
    setErrorTelefono(validarTelefono(valor));
  };

  const alCambiarPassword = (evento) => {
    const valor = evento.target.value;
    setPassword(valor);
    setErrorPassword(validarPassword(valor));
  };

  const registrar = async (evento) => {
    evento.preventDefault();
    setErrorGeneral("");

    const falloNombre = validarNombre(nombre);
    const falloCorreo = validarCorreo(correo);
    const falloTelefono = validarTelefono(telefono);
    const falloPassword = validarPassword(password);

    setErrorNombre(falloNombre);
    setErrorCorreo(falloCorreo);
    setErrorTelefono(falloTelefono);
    setErrorPassword(falloPassword);

    if (falloNombre || falloCorreo || falloTelefono || falloPassword) {
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(API_REGISTRO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          telefono: telefono.trim(),
          password,
        }),
      });

      if (!respuesta.ok) {
        throw new Error("No se pudo completar el registro. El correo ya podría estar en uso.");
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
          <img src={logo} alt="ARIPO" className="logo-login" />
          <h1>Manos de Oaxaca</h1>
          <p>Crea tu cuenta para explorar el catálogo de la comunidad artesana.</p>
        </div>

        <div className="greca-login-pie">
          <div className="greca-login" />
          <span>Instituto Oaxaqueño de las Artesanías</span>
        </div>
      </div>

      <div className="formulario-login">
        <div className="tarjeta-login">
          <h2>Crear cuenta</h2>
          <p className="subtitulo-login">
            Regístrate como visitante para consultar artesanos y talleres.
          </p>

          <div className="linea-dorada" />

          <form onSubmit={registrar}>
            <div className="campo-login">
              <label htmlFor="nombre">Nombre completo</label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={alCambiarNombre}
              />
              {errorNombre && <p className="error-campo">{errorNombre}</p>}
            </div>

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

            <div className="campo-login">
              <label htmlFor="telefono">
                Celular para SMS y WhatsApp
              </label>
              <input
                id="telefono"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={telefono}
                onChange={alCambiarTelefono}
                placeholder="+529511234567"
                maxLength={16}
                required
              />
              <small>
                Usa código de país; para México comienza con +52.
              </small>
              {errorTelefono && (
                <p className="error-campo">{errorTelefono}</p>
              )}
            </div>

            <div className="campo-login">
              <label htmlFor="password">Contraseña</label>
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
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="linea-dorada" />

          <p className="nota-login">
            ¿Ya tienes cuenta? <Link to="/login" className="enlace-acceso">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Registro;

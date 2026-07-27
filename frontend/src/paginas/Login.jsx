import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";

const API_LOGIN = "http://localhost:8090/api/auth/login";

function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (evento) => {
    evento.preventDefault();
    setError("");
    setCargando(true);

    try {
      const respuesta = await fetch(API_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      if (!respuesta.ok) {
        throw new Error("Correo o contraseña incorrectos");
      }

      const datos = await respuesta.json();
      localStorage.setItem("token", datos.token);
      localStorage.setItem("correo", datos.correo);
      localStorage.setItem("rol", datos.rol);
      navigate("/");
    } catch (errorPeticion) {
      setError(errorPeticion.message);
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
          <p>Catálogo, validación y difusión de la comunidad artesana.</p>
        </div>

        <div className="greca-login-pie">
          <div className="greca-login" />
          <span>Instituto Oaxaqueño de las Artesanías</span>
        </div>
      </div>

      <div className="formulario-login">
        <div className="tarjeta-login">
          <h2>Entrar al sistema</h2>

          <div className="linea-dorada" />

          <form onSubmit={iniciarSesion}>
            <div className="campo-login">
              <label htmlFor="correo">Correo institucional</label>
              <input
                id="correo"
                type="email"
                placeholder="r.mendoza@aripo.oaxaca.gob.mx"
                value={correo}
                onChange={(evento) => setCorreo(evento.target.value)}
                required
              />
            </div>

            <div className="campo-login">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(evento) => setPassword(evento.target.value)}
                required
              />
            </div>

            <a href="#" className="recuperar-login">Recuperar acceso</a>

            {error && <p className="error-login">{error}</p>}

            <button type="submit" disabled={cargando}>
              {cargando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="linea-dorada" />

        </div>
      </div>
    </div>
  );
}

export default Login;
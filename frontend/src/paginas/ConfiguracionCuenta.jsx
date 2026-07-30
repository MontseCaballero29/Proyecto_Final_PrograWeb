import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Mail,
  PackagePlus,
  Pencil,
  Save,
  UserRound,
} from "lucide-react";

import "./ConfiguracionCuenta.css";

const API_USUARIOS =
  `${import.meta.env.VITE_API_URL}/api/usuarios`
const API_TALLERES =
  `${import.meta.env.VITE_API_URL}/api/talleres`
const API_ARTESANIAS =
  `${import.meta.env.VITE_API_URL}/api/artesanias`

function extraerLista(datos) {
  if (Array.isArray(datos)) {
    return datos;
  }

  return Array.isArray(datos?.content) ? datos.content : [];
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

function ConfiguracionCuenta() {
  const esArtesano =
    localStorage.getItem("rol") === "ARTESANO";
  const [cuenta, setCuenta] = useState({
    nombre: "",
    correo: "",
    rol: "",
  });
  const [passwords, setPasswords] = useState({
    passwordActual: "",
    passwordNueva: "",
    confirmarPassword: "",
  });
  const [talleres, setTalleres] = useState([]);
  const [artesanias, setArtesanias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardandoPerfil, setGuardandoPerfil] =
    useState(false);
  const [guardandoPassword, setGuardandoPassword] =
    useState(false);
  const [errorCarga, setErrorCarga] = useState("");
  const [mensajePerfil, setMensajePerfil] = useState({
    tipo: "",
    texto: "",
  });
  const [mensajePassword, setMensajePassword] = useState({
    tipo: "",
    texto: "",
  });

  const cargarCuenta = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga("");
      const cabeceras = {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };
      const solicitudes = [
        fetch(`${API_USUARIOS}/me`, {
          headers: cabeceras,
        }),
      ];

      if (esArtesano) {
        solicitudes.push(
          fetch(`${API_TALLERES}/mios?page=0&size=1000`, {
            headers: cabeceras,
          }),
          fetch(
            `${API_ARTESANIAS}/mias?page=0&size=1000`,
            { headers: cabeceras },
          ),
        );
      }

      const respuestas = await Promise.all(solicitudes);

      if (!respuestas[0].ok) {
        throw new Error(
          await obtenerMensajeError(
            respuestas[0],
            "No se pudo cargar la cuenta.",
          ),
        );
      }

      const datosCuenta = await respuestas[0].json();
      setCuenta({
        nombre: datosCuenta.nombre || "",
        correo: datosCuenta.correo || "",
        rol: datosCuenta.rol || "",
      });

      if (esArtesano) {
        const datosTalleres = respuestas[1].ok
          ? await respuestas[1].json()
          : { content: [] };
        const datosArtesanias = respuestas[2].ok
          ? await respuestas[2].json()
          : { content: [] };
        setTalleres(extraerLista(datosTalleres));
        setArtesanias(extraerLista(datosArtesanias));
      }
    } catch (error) {
      setErrorCarga(
        error.message ||
          "No fue posible cargar la configuración.",
      );
    } finally {
      setCargando(false);
    }
  }, [esArtesano]);

  useEffect(() => {
    cargarCuenta();
  }, [cargarCuenta]);

  const actualizarPerfil = async (evento) => {
    evento.preventDefault();
    setMensajePerfil({ tipo: "", texto: "" });

    if (!cuenta.nombre.trim() || !cuenta.correo.trim()) {
      setMensajePerfil({
        tipo: "error",
        texto: "El nombre y el correo son obligatorios.",
      });
      return;
    }

    try {
      setGuardandoPerfil(true);
      const respuesta = await fetch(`${API_USUARIOS}/me`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          nombre: cuenta.nombre.trim(),
          correo: cuenta.correo.trim(),
        }),
      });

      if (!respuesta.ok) {
        throw new Error(
          await obtenerMensajeError(
            respuesta,
            "No se pudo actualizar la cuenta.",
          ),
        );
      }

      const datos = await respuesta.json();
      localStorage.setItem("correo", datos.correo);
      localStorage.setItem("rol", datos.rol);

      if (datos.token) {
        localStorage.setItem("token", datos.token);
      }

      setCuenta({
        nombre: datos.nombre,
        correo: datos.correo,
        rol: datos.rol,
      });
      window.dispatchEvent(
        new Event("cuenta-actualizada"),
      );
      setMensajePerfil({
        tipo: "exito",
        texto: "Los datos de tu cuenta se actualizaron.",
      });
    } catch (error) {
      setMensajePerfil({
        tipo: "error",
        texto:
          error.message ||
          "No fue posible actualizar la cuenta.",
      });
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const cambiarPassword = async (evento) => {
    evento.preventDefault();
    setMensajePassword({ tipo: "", texto: "" });

    if (
      passwords.passwordNueva !==
      passwords.confirmarPassword
    ) {
      setMensajePassword({
        tipo: "error",
        texto: "Las contraseñas nuevas no coinciden.",
      });
      return;
    }

    try {
      setGuardandoPassword(true);
      const respuesta = await fetch(
        `${API_USUARIOS}/me/password`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            passwordActual: passwords.passwordActual,
            passwordNueva: passwords.passwordNueva,
          }),
        },
      );

      if (!respuesta.ok) {
        throw new Error(
          await obtenerMensajeError(
            respuesta,
            "No se pudo cambiar la contraseña.",
          ),
        );
      }

      setPasswords({
        passwordActual: "",
        passwordNueva: "",
        confirmarPassword: "",
      });
      setMensajePassword({
        tipo: "exito",
        texto: "Tu contraseña se cambió correctamente.",
      });
    } catch (error) {
      setMensajePassword({
        tipo: "error",
        texto:
          error.message ||
          "No fue posible cambiar la contraseña.",
      });
    } finally {
      setGuardandoPassword(false);
    }
  };

  if (cargando) {
    return (
      <section className="pagina-cuenta estado-cuenta">
        <LoaderCircle
          className="icono-girando"
          size={38}
        />
        <p>Cargando configuración...</p>
      </section>
    );
  }

  if (errorCarga) {
    return (
      <section className="pagina-cuenta estado-cuenta">
        <AlertCircle size={40} />
        <h2>No fue posible cargar tu cuenta</h2>
        <p>{errorCarga}</p>
        <button type="button" onClick={cargarCuenta}>
          Intentar nuevamente
        </button>
      </section>
    );
  }

  return (
    <section className="pagina-cuenta">
      <header className="encabezado-cuenta">
        <p>Cuenta / Configuración</p>
        <h2>Configuración de la cuenta</h2>
        <span>
          Actualiza tus datos personales y la contraseña.
        </span>
      </header>

      <div className="detalle-artesanal" />

      <div className="rejilla-cuenta">
        <form
          className="tarjeta-cuenta"
          onSubmit={actualizarPerfil}
        >
          <div className="titulo-tarjeta-cuenta">
            <UserRound size={23} />
            <div>
              <h3>Datos personales</h3>
              <p>Tu nombre y correo de acceso.</p>
            </div>
          </div>

          {mensajePerfil.texto && (
            <div
              className={`mensaje-cuenta mensaje-cuenta-${mensajePerfil.tipo}`}
            >
              {mensajePerfil.tipo === "exito" ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              {mensajePerfil.texto}
            </div>
          )}

          <label className="campo-cuenta">
            <span>Nombre</span>
            <div>
              <UserRound size={18} />
              <input
                type="text"
                value={cuenta.nombre}
                onChange={(evento) =>
                  setCuenta((anterior) => ({
                    ...anterior,
                    nombre: evento.target.value,
                  }))
                }
                maxLength="100"
                disabled={guardandoPerfil}
              />
            </div>
          </label>

          <label className="campo-cuenta">
            <span>Correo electrónico</span>
            <div>
              <Mail size={18} />
              <input
                type="email"
                value={cuenta.correo}
                onChange={(evento) =>
                  setCuenta((anterior) => ({
                    ...anterior,
                    correo: evento.target.value,
                  }))
                }
                maxLength="150"
                disabled={guardandoPerfil}
              />
            </div>
          </label>

          <button
            className="boton-principal-cuenta"
            type="submit"
            disabled={guardandoPerfil}
          >
            {guardandoPerfil ? (
              <LoaderCircle
                className="icono-girando"
                size={18}
              />
            ) : (
              <Save size={18} />
            )}
            Guardar datos
          </button>
        </form>

        <form
          className="tarjeta-cuenta"
          onSubmit={cambiarPassword}
        >
          <div className="titulo-tarjeta-cuenta">
            <KeyRound size={23} />
            <div>
              <h3>Cambiar contraseña</h3>
              <p>Protege el acceso a tu cuenta.</p>
            </div>
          </div>

          {mensajePassword.texto && (
            <div
              className={`mensaje-cuenta mensaje-cuenta-${mensajePassword.tipo}`}
            >
              {mensajePassword.tipo === "exito" ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              {mensajePassword.texto}
            </div>
          )}

          <label className="campo-cuenta">
            <span>Contraseña actual</span>
            <input
              type="password"
              value={passwords.passwordActual}
              onChange={(evento) =>
                setPasswords((anterior) => ({
                  ...anterior,
                  passwordActual: evento.target.value,
                }))
              }
              required
              disabled={guardandoPassword}
            />
          </label>

          <label className="campo-cuenta">
            <span>Nueva contraseña</span>
            <input
              type="password"
              value={passwords.passwordNueva}
              onChange={(evento) =>
                setPasswords((anterior) => ({
                  ...anterior,
                  passwordNueva: evento.target.value,
                }))
              }
              required
              disabled={guardandoPassword}
            />
            <small>
              Mínimo 8 caracteres, una mayúscula, un número
              y un carácter especial.
            </small>
          </label>

          <label className="campo-cuenta">
            <span>Confirmar contraseña</span>
            <input
              type="password"
              value={passwords.confirmarPassword}
              onChange={(evento) =>
                setPasswords((anterior) => ({
                  ...anterior,
                  confirmarPassword: evento.target.value,
                }))
              }
              required
              disabled={guardandoPassword}
            />
          </label>

          <button
            className="boton-principal-cuenta"
            type="submit"
            disabled={guardandoPassword}
          >
            {guardandoPassword ? (
              <LoaderCircle
                className="icono-girando"
                size={18}
              />
            ) : (
              <KeyRound size={18} />
            )}
            Cambiar contraseña
          </button>
        </form>
      </div>

      {esArtesano && (
        <section className="gestion-artesano-cuenta">
          <div className="encabezado-gestion-cuenta">
            <div>
              <h3>Mi actividad artesanal</h3>
              <p>
                Administra tus talleres y las piezas que
                tienes registradas.
              </p>
            </div>
            <Link
              className="boton-principal-cuenta"
              to="/artesanias/nueva"
            >
              <PackagePlus size={18} />
              Agregar artesanía
            </Link>
          </div>

          <div className="columnas-gestion-cuenta">
            <article>
              <div className="subtitulo-gestion-cuenta">
                <Building2 size={20} />
                <h4>Mis talleres</h4>
              </div>
              {talleres.length === 0 ? (
                <p className="lista-cuenta-vacia">
                  Aún no tienes talleres asociados.
                </p>
              ) : (
                <div className="lista-recursos-cuenta">
                  {talleres.map((taller) => (
                    <div key={taller.id}>
                      <span>
                        <strong>{taller.nombre}</strong>
                        <small>{taller.comunidad}</small>
                      </span>
                      <Link
                        to={`/talleres/editar/${taller.id}`}
                      >
                        <Pencil size={16} />
                        Editar
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article>
              <div className="subtitulo-gestion-cuenta">
                <PackagePlus size={20} />
                <h4>Mis artesanías</h4>
              </div>
              {artesanias.length === 0 ? (
                <p className="lista-cuenta-vacia">
                  Aún no tienes artesanías registradas.
                </p>
              ) : (
                <div className="lista-recursos-cuenta">
                  {artesanias.map((artesania) => (
                    <div key={artesania.id}>
                      <span>
                        <strong>{artesania.nombre}</strong>
                        <small>{artesania.taller}</small>
                      </span>
                      <Link
                        to={`/artesanias/editar/${artesania.id}`}
                      >
                        <Pencil size={16} />
                        Editar
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </div>
        </section>
      )}
    </section>
  );
}

export default ConfiguracionCuenta;

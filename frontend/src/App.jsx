import { useCallback, useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  Grid2X2,
  LogOut,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";


import Login from "./paginas/Login";
import Registro from "./paginas/Registro";
import Talleres from "./paginas/Talleres";
import RegistrarTaller from "./paginas/RegistrarTaller";
import EditarTaller from "./paginas/EditarTaller";
import Artesanos from "./paginas/Artesanos";
import Artesanias from "./paginas/Artesanias";
import EditarArtesania from "./paginas/EditarArtesania";

import "./App.css";

//metodos auxiliares
function obtenerSesion() {
  const correo = localStorage.getItem("correo");
  const rol = localStorage.getItem("rol");
  const token = localStorage.getItem("token");

  return { correo, rol, token };
}

function haySesion() {
  return Boolean(localStorage.getItem("token"));
}

function obtenerIniciales(correo) {
  if (typeof correo !== "string" || correo.trim() === "") {
    return "MO";
  }

  return correo.trim().slice(0, 2).toUpperCase();
}


const API_TALLERES = "http://localhost:8090/api/talleres";

const seccionesMenu = [
  {
    titulo: "VALIDACIÓN",
    opciones: [
      { nombre: "Solicitudes de registro" },
      { nombre: "Vigencias" },
      { nombre: "Verificación de identidad" },
    ],
  },
  {
    titulo: "CATÁLOGO",
    opciones: [
      { nombre: "Artesanos" , ruta: "/artesanos"},
      { nombre: "Talleres", ruta: "/talleres" },
      { nombre: "Experiencias" },
      { nombre: "Artesanías", ruta: "/artesanias" },
      { nombre: "Taxonomías" },
    ],
  },
  {
    titulo: "OPERACIÓN",
    opciones: [
      { nombre: "Reservas" },
      { nombre: "Calendario de sesiones" },
      { nombre: "Incidencias" },
      { nombre: "Reseñas" },
    ],
  },
  {
    titulo: "FINANZAS",
    opciones: [
      { nombre: "Ingresos" },
      { nombre: "Liquidaciones" },
      { nombre: "Tarifas y comisiones" },
    ],
  },
  {
    titulo: "REPORTES",
    opciones: [
      { nombre: "Indicadores" },
      { nombre: "Impacto por comunidad" },
    ],
  },
];

const clasesBarras = [
  "azul",
  "rosa",
  "naranja",
  "marino",
  "amarillo",
];

function obtenerTexto(valor, valorPredeterminado) {
  if (typeof valor !== "string" || valor.trim() === "") {
    return valorPredeterminado;
  }

  return valor.trim();
}

function contarValoresUnicos(registros, propiedad) {
  const valores = registros
    .map((registro) => obtenerTexto(registro[propiedad], ""))
    .filter((valor) => valor !== "")
    .map((valor) => valor.toLowerCase());

  return new Set(valores).size;
}

function obtenerFechaActual() {
  const fecha = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return fecha.charAt(0).toUpperCase() + fecha.slice(1);
}

function PanelPrincipal() {
  const [talleres, setTalleres] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarTalleres = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(API_TALLERES);

      if (!respuesta.ok) {
        throw new Error(
          `No se pudieron obtener los talleres. Código: ${respuesta.status}`,
        );
      }

      const datos = await respuesta.json();

      setTalleres(Array.isArray(datos) ? datos : []);
    } catch (errorPeticion) {
      console.error(
        "Error al cargar la información del panel:",
        errorPeticion,
      );

      setTalleres([]);
      setError(
        "No fue posible obtener la información desde la API.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTalleres();
  }, [cargarTalleres]);

  const totalTalleres = talleres.length;

  const totalResponsables = useMemo(() => {
    return contarValoresUnicos(talleres, "responsable");
  }, [talleres]);

  const totalEspecialidades = useMemo(() => {
    return contarValoresUnicos(talleres, "especialidad");
  }, [talleres]);

  /*
   * Permanece en cero porque todavía no existe
   * una API para solicitudes de registro.
   */
  const solicitudesPorValidar = 0;

  const talleresRecientes = useMemo(() => {
    return [...talleres]
      .sort((tallerA, tallerB) => {
        const idA = Number(tallerA.id);
        const idB = Number(tallerB.id);

        if (Number.isNaN(idA) || Number.isNaN(idB)) {
          return 0;
        }

        return idB - idA;
      })
      .slice(0, 4);
  }, [talleres]);

  const talleresPorUbicacion = useMemo(() => {
    const conteo = new Map();

    talleres.forEach((taller) => {
      const ubicacion = obtenerTexto(
        taller.ubicacion,
        "Sin ubicación",
      );

      conteo.set(
        ubicacion,
        (conteo.get(ubicacion) || 0) + 1,
      );
    });

    const ubicacionesOrdenadas = Array.from(conteo.entries())
      .map(([ubicacion, cantidad]) => ({
        ubicacion,
        cantidad,
      }))
      .sort(
        (ubicacionA, ubicacionB) =>
          ubicacionB.cantidad - ubicacionA.cantidad,
      )
      .slice(0, 5);

    const cantidadMayor =
      ubicacionesOrdenadas[0]?.cantidad || 1;

    return ubicacionesOrdenadas.map(
      (ubicacion, indice) => ({
        ...ubicacion,
        porcentaje:
          (ubicacion.cantidad / cantidadMayor) * 100,
        clase:
          clasesBarras[indice % clasesBarras.length],
      }),
    );
  }, [talleres]);

  return (
    <>
      <section className="encabezado-panel">
        <h2>Panel operativo</h2>

        <p>
          {obtenerFechaActual()} · Información general
        </p>

        <div className="detalle-artesanal" />
      </section>

      <section className="tarjetas-indicadores">
        <article className="tarjeta-indicador tarjeta-roja">
          <div className="titulo-indicador">
            <Building2 size={19} />
            <span>Total de talleres</span>
          </div>

          <strong className="valor-indicador">
            {cargando ? "..." : totalTalleres}
          </strong>

          <p>
            {error
              ? "Información no disponible"
              : "registrados en la API"}
          </p>
        </article>

        <article className="tarjeta-indicador tarjeta-verde">
          <div className="titulo-indicador">
            <Users size={19} />
            <span>Responsables registrados</span>
          </div>

          <strong className="valor-indicador">
            {cargando ? "..." : totalResponsables}
          </strong>

          <p>responsables diferentes</p>
        </article>

        <article className="tarjeta-indicador tarjeta-azul">
          <div className="titulo-indicador">
            <BarChart3 size={19} />
            <span>Especialidades</span>
          </div>

          <strong className="valor-indicador">
            {cargando ? "..." : totalEspecialidades}
          </strong>

          <p>especialidades registradas</p>
        </article>

        <article className="tarjeta-indicador tarjeta-amarilla">
          <div className="titulo-indicador">
            <ShieldCheck size={19} />
            <span>Solicitudes por validar</span>
          </div>

          <strong className="valor-indicador">
            {solicitudesPorValidar}
          </strong>

          <p className="mensaje-secundario">
            Módulo todavía no conectado
          </p>
        </article>
      </section>

      <section className="zona-inferior">
        <article className="panel-tabla">
          <div className="encabezado-tarjeta">
            <h3>Talleres recientes</h3>

            <NavLink
              to="/talleres"
              style={{
                border: 0,
                background: "transparent",
                color: "#496453",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Ver todos
            </NavLink>
          </div>

          <div className="contenedor-tabla">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Taller</th>
                  <th>Responsable</th>
                  <th>Especialidad</th>
                  <th>Ubicación</th>
                </tr>
              </thead>

              <tbody>
                {cargando && (
                  <tr>
                    <td colSpan="5">
                      Cargando información...
                    </td>
                  </tr>
                )}

                {!cargando && error && (
                  <tr>
                    <td colSpan="5">
                      <button
                        type="button"
                        onClick={cargarTalleres}
                        style={{
                          border: 0,
                          background: "transparent",
                          color: "#a72f42",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        No fue posible cargar los datos.
                        Intentar nuevamente
                      </button>
                    </td>
                  </tr>
                )}

                {!cargando &&
                  !error &&
                  talleresRecientes.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        No hay talleres registrados.
                      </td>
                    </tr>
                  )}

                {!cargando &&
                  !error &&
                  talleresRecientes.map((taller) => (
                    <tr key={taller.id}>
                      <td className="folio">
                        {String(taller.id).padStart(3, "0")}
                      </td>

                      <td>
                        {obtenerTexto(
                          taller.nombreTaller,
                          "Sin nombre",
                        )}
                      </td>

                      <td>
                        {obtenerTexto(
                          taller.responsable,
                          "Sin responsable",
                        )}
                      </td>

                      <td>
                        {obtenerTexto(
                          taller.especialidad,
                          "Sin especialidad",
                        )}
                      </td>

                      <td>
                        {obtenerTexto(
                          taller.ubicacion,
                          "Sin ubicación",
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel-ingresos">
          <div className="encabezado-ingresos">
            <div>
              <h3>
                Talleres distribuidos por ubicación
              </h3>

              <p>Información actual de la API</p>
            </div>

            <ShieldCheck size={22} />
          </div>

          <div className="lista-ingresos">
            {cargando && (
              <div className="ingreso">
                <div className="datos-ingreso">
                  <span>Cargando ubicaciones...</span>
                </div>
              </div>
            )}

            {!cargando && error && (
              <div className="ingreso">
                <div className="datos-ingreso">
                  <span>Información no disponible</span>
                  <strong>0</strong>
                </div>

                <div className="barra-ingreso">
                  <span style={{ width: "0%" }} />
                </div>
              </div>
            )}

            {!cargando &&
              !error &&
              talleresPorUbicacion.length === 0 && (
                <div className="ingreso">
                  <div className="datos-ingreso">
                    <span>
                      No hay ubicaciones registradas
                    </span>

                    <strong>0</strong>
                  </div>

                  <div className="barra-ingreso">
                    <span style={{ width: "0%" }} />
                  </div>
                </div>
              )}

            {!cargando &&
              !error &&
              talleresPorUbicacion.map((ubicacion) => (
                <div
                  className="ingreso"
                  key={ubicacion.ubicacion}
                >
                  <div className="datos-ingreso">
                    <span>{ubicacion.ubicacion}</span>

                    <strong>
                      {ubicacion.cantidad}{" "}
                      {ubicacion.cantidad === 1
                        ? "taller"
                        : "talleres"}
                    </strong>
                  </div>

                  <div className="barra-ingreso">
                    <span
                      className={ubicacion.clase}
                      style={{
                        width: `${ubicacion.porcentaje}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div className="pie-ingresos">
            <Star size={17} />

            {error
              ? "Información no disponible"
              : "Información obtenida desde la API"}
          </div>
        </article>
      </section>
    </>
  );
}

function Layout() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("correo");
    localStorage.removeItem("rol");
    navigate("/login");
  };

  return (
      <div className="aplicacion">
        <header className="barra-superior">
          <div className="marca">
            <div className="logo-marca">MO</div>

            <h1>Manos de Oaxaca</h1>
          </div>

          <div className="acciones-superiores">
            <button
              className="selector-region"
              type="button"
            >
              <MapPin size={21} />
              <span>Todas las ubicaciones</span>
              <ChevronDown size={17} />
            </button>

            <div className="buscador">
              <Search size={21} />

              <input
                type="search"
                placeholder="Buscar artesano, taller o folio..."
                aria-label="Buscar"
              />
            </div>

            <button
              type="button"
              className="notificaciones"
              aria-label="Notificaciones"
            >
              <Bell size={21} />
              <span />
            </button>

            <div className="separador-superior" />

            <div className="perfil">
              <div className="perfil-texto">
                <strong>{sesion.correo || "Sin iniciar sesión"}</strong>
                <span>{sesion.rol || "Rol no disponible"}</span>
              </div>

              <div className="avatar">
                {obtenerIniciales(sesion.correo)}
              </div>

              <button
                type="button"
                className="boton-salir"
                onClick={cerrarSesion}
                aria-label="Cerrar sesión"
              >
                <LogOut size={19} />
              </button>
            </div>
          </div>
        </header>

        <div className="estructura">
          <aside className="barra-lateral">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `opcion-panel ${
                  isActive
                    ? "opcion-panel-activa"
                    : ""
                }`
              }
            >
              <Grid2X2 size={20} />
              <span>Panel</span>
            </NavLink>

            <nav className="menu-lateral">
              {seccionesMenu.map((seccion) => (
                <section
                  className="grupo-menu"
                  key={seccion.titulo}
                >
                  <h2>{seccion.titulo}</h2>

                  {seccion.opciones.map((opcion) =>
                    opcion.ruta ? (
                      <NavLink
                        to={opcion.ruta}
                        className={({ isActive }) =>
                          `opcion-menu ${
                            isActive
                              ? "opcion-menu-activa"
                              : ""
                          }`
                        }
                        key={opcion.nombre}
                      >
                        <span>{opcion.nombre}</span>
                      </NavLink>
                    ) : (
                      <button
                        className="opcion-menu"
                        type="button"
                        key={opcion.nombre}
                      >
                        <span>{opcion.nombre}</span>
                      </button>
                    ),
                  )}
                </section>
              ))}
            </nav>
          </aside>

          <main className="contenido">
            <Outlet />
          </main>
        </div>
      </div>
  );
}

function RutaProtegida() {
  if (!haySesion()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function RutaSoloAdmin() {
  if (localStorage.getItem("rol") !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route element={<RutaProtegida />}>
          <Route element={<Layout />}>
            <Route path="/" element={<PanelPrincipal />} />
            <Route path="/artesanos" element={<Artesanos />} />
          <Route path="/talleres" element={<Talleres />} />
            <Route
              path="/artesanias"
              element={<Artesanias />}
            />
            <Route element={<RutaSoloAdmin />}>
              <Route
                path="/talleres/nuevo"
                element={<RegistrarTaller />}
              />
              <Route
                path="/talleres/editar/:id"
                element={<EditarTaller />}
              />
              <Route
                path="/artesanias/editar/:id"
                element={<EditarArtesania />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

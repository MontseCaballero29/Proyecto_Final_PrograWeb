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
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";


import Login from "./paginas/Login";
import Registro from "./paginas/Registro";
import Talleres from "./paginas/Talleres";
import RegistrarTaller from "./paginas/RegistrarTaller";
import EditarTaller from "./paginas/EditarTaller";
import Artesanos from "./paginas/Artesanos";
import RegistrarArtesano from "./paginas/RegistrarArtesano";
import EditarArtesano from "./paginas/EditarArtesano";
import Artesanias from "./paginas/Artesanias";
import EditarArtesania from "./paginas/EditarArtesania";
import RegistrarArtesania from "./paginas/RegistrarArtesania";
import Especialidades from "./paginas/Especialidades";
import Resenas from "./paginas/Resenas";
import ConfiguracionCuenta from "./paginas/ConfiguracionCuenta";
import SolicitudesRegistro from "./paginas/SolicitudesRegistro";

import "./App.css";

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
const API_COMUNIDADES =
  "http://localhost:8090/api/comunidades";
const API_ARTESANOS =
  "http://localhost:8090/api/artesanos";

const obtenerSeccionesMenu = (rol) => [
  ...(rol === "ADMIN"
    ? [
        {
          titulo: "VALIDACIÓN",
          opciones: [
            {
              nombre: "Solicitudes de registro",
              ruta: "/solicitudes-registro",
            },
          ],
        },
      ]
    : []),
  {
    titulo: "CATÁLOGO",
    opciones: [
      { nombre: "Artesanos", ruta: "/artesanos" },
      { nombre: "Talleres", ruta: "/talleres" },
      { nombre: "Artesanías", ruta: "/artesanias" },
      {
        nombre: "Especialidades",
        ruta: "/especialidades",
      },
    ],
  },
  {
    titulo: "OPERACIÓN",
    opciones: [{ nombre: "Reseñas", ruta: "/resenas" }],
  },
  {
    titulo: "CUENTA",
    opciones: [
      {
        nombre: "Configuración de cuenta",
        ruta: "/cuenta",
      },
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
    .flatMap((registro) => {
      const valor = registro[propiedad];

      return Array.isArray(valor) ? valor : [valor];
    })
    .map((valor) => obtenerTexto(valor, ""))
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
  const esAdmin =
    localStorage.getItem("rol") === "ADMIN";
  const [talleres, setTalleres] = useState([]);
  const [solicitudesPorValidar, setSolicitudesPorValidar] =
    useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarTalleres = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("token");
      const respuesta = await fetch(
        `${API_TALLERES}?page=0&size=1000`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!respuesta.ok) {
        throw new Error(
          `No se pudieron obtener los talleres. Código: ${respuesta.status}`,
        );
      }

      const datos = await respuesta.json();

      setTalleres(
        Array.isArray(datos?.content)
          ? datos.content
          : Array.isArray(datos)
            ? datos
            : [],
      );
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

  useEffect(() => {
    if (!esAdmin) {
      return;
    }

    const cargarSolicitudes = async () => {
      try {
        const respuesta = await fetch(
          `${API_ARTESANOS}?estadoValidacion=EN_REVISION&page=0&size=1`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!respuesta.ok) {
          return;
        }

        const datos = await respuesta.json();
        setSolicitudesPorValidar(
          Number(datos?.totalElements) || 0,
        );
      } catch {
        setSolicitudesPorValidar(0);
      }
    };

    cargarSolicitudes();
  }, [esAdmin]);

  const totalTalleres = talleres.length;

  const totalResponsables = useMemo(() => {
    return contarValoresUnicos(talleres, "artesanos");
  }, [talleres]);

  const totalEspecialidades = useMemo(() => {
    return contarValoresUnicos(talleres, "especialidades");
  }, [talleres]);

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
        taller.comunidad || taller.municipio,
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

        {esAdmin && (
          <article className="tarjeta-indicador tarjeta-amarilla">
            <div className="titulo-indicador">
              <ShieldCheck size={19} />
              <span>Solicitudes por validar</span>
            </div>

            <strong className="valor-indicador">
              {solicitudesPorValidar}
            </strong>

            <p className="mensaje-secundario">
              Perfiles en revisión
            </p>
          </article>
        )}
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
                          taller.nombre,
                          "Sin nombre",
                        )}
                      </td>

                      <td>
                        {Array.isArray(taller.artesanos) &&
                        taller.artesanos.length > 0
                          ? taller.artesanos.join(", ")
                          : "Sin responsable"}
                      </td>

                      <td>
                        {Array.isArray(
                          taller.especialidades,
                        ) &&
                        taller.especialidades.length > 0
                          ? taller.especialidades.join(", ")
                          : "Sin especialidad"}
                      </td>

                      <td>
                        {obtenerTexto(
                          taller.comunidad ||
                            taller.municipio,
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
  const location = useLocation();
  const [parametros, setParametros] = useSearchParams();
  const [sesion, setSesion] = useState(obtenerSesion);
  const [busqueda, setBusqueda] = useState(
    parametros.get("q") || "",
  );
  const [regiones, setRegiones] = useState([]);
  const rutasConBusqueda = [
    "/artesanos",
    "/talleres",
    "/artesanias",
  ];
  const mostrarBusqueda = rutasConBusqueda.includes(
    location.pathname,
  );
  const seccionesMenu = obtenerSeccionesMenu(sesion.rol);

  useEffect(() => {
    const actualizarSesion = () => {
      setSesion(obtenerSesion());
    };

    window.addEventListener(
      "cuenta-actualizada",
      actualizarSesion,
    );

    return () => {
      window.removeEventListener(
        "cuenta-actualizada",
        actualizarSesion,
      );
    };
  }, []);

  useEffect(() => {
    setBusqueda(parametros.get("q") || "");
  }, [parametros]);

  useEffect(() => {
    if (!mostrarBusqueda || regiones.length > 0) {
      return;
    }

    const cargarRegiones = async () => {
      try {
        const respuesta = await fetch(API_COMUNIDADES, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!respuesta.ok) {
          return;
        }

        const datos = await respuesta.json();
        const regionesUnicas = Array.from(
          new Set(
            (Array.isArray(datos) ? datos : [])
              .map((comunidad) => comunidad.region?.trim())
              .filter(Boolean),
          ),
        ).sort((regionA, regionB) =>
          regionA.localeCompare(regionB, "es"),
        );

        setRegiones(regionesUnicas);
      } catch {
        setRegiones([]);
      }
    };

    cargarRegiones();
  }, [mostrarBusqueda, regiones.length]);

  const cambiarParametro = (nombre, valor) => {
    const siguientes = new URLSearchParams(parametros);

    if (valor.trim()) {
      siguientes.set(nombre, valor.trim());
    } else {
      siguientes.delete(nombre);
    }

    setParametros(siguientes);
  };

  const buscar = (evento) => {
    evento.preventDefault();
    cambiarParametro("q", busqueda);
  };

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
            {mostrarBusqueda && (
              <>
                <label className="selector-region">
                  <MapPin size={21} />
                  <select
                    value={parametros.get("region") || ""}
                    onChange={(evento) =>
                      cambiarParametro(
                        "region",
                        evento.target.value,
                      )
                    }
                    aria-label="Filtrar por región"
                  >
                    <option value="">
                      Todas las regiones
                    </option>
                    {regiones.map((region) => (
                      <option value={region} key={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={17} />
                </label>

                <form
                  className="buscador"
                  onSubmit={buscar}
                >
                  <Search size={21} />

                  <input
                    type="search"
                    value={busqueda}
                    onChange={(evento) =>
                      setBusqueda(evento.target.value)
                    }
                    placeholder={
                      location.pathname === "/artesanos"
                        ? "Buscar artesano, correo o comunidad..."
                        : location.pathname === "/talleres"
                          ? "Buscar taller, responsable o especialidad..."
                          : "Buscar artesanía o taller..."
                    }
                    aria-label="Buscar en el catálogo"
                  />
                </form>
              </>
            )}

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

function RutaPorRoles({ roles }) {
  if (!roles.includes(localStorage.getItem("rol"))) {
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
            <Route
              path="/especialidades"
              element={<Especialidades />}
            />
            <Route path="/resenas" element={<Resenas />} />
            <Route
              path="/cuenta"
              element={<ConfiguracionCuenta />}
            />
            <Route element={<RutaSoloAdmin />}>
              <Route
                path="/solicitudes-registro"
                element={<SolicitudesRegistro />}
              />
              <Route
                path="/artesanos/nuevo"
                element={<RegistrarArtesano />}
              />
              <Route
                path="/artesanos/editar/:id"
                element={<EditarArtesano />}
              />
              <Route
                path="/talleres/nuevo"
                element={<RegistrarTaller />}
              />
            </Route>
            <Route
              element={
                <RutaPorRoles
                  roles={["ADMIN", "ARTESANO"]}
                />
              }
            >
              <Route
                path="/talleres/editar/:id"
                element={<EditarTaller />}
              />
              <Route
                path="/artesanias/nueva"
                element={<RegistrarArtesania />}
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

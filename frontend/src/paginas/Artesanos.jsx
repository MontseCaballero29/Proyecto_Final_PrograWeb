import { useCallback, useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  AlertCircle,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  UsersRound,
} from "lucide-react";

import "./Artesanos.css";

const API_ARTESANOS = `${import.meta.env.VITE_API_URL}/api/artesanos`;

function Artesanos() {
  const navigate = useNavigate();
  const [parametrosBusqueda] = useSearchParams();
  const busqueda = parametrosBusqueda.get("q") || "";
  const region = parametrosBusqueda.get("region") || "";
  const esAdmin =
    localStorage.getItem("rol") === "ADMIN";
  const [artesanos, setArtesanos] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalArtesanos, setTotalArtesanos] = useState(0);
  const [esPrimera, setEsPrimera] = useState(true);
  const [esUltima, setEsUltima] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarArtesanos = useCallback(async (numeroPagina) => {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("token");
      const parametros = new URLSearchParams({
        page: String(numeroPagina),
        size: "10",
      });

      if (busqueda.trim()) {
        parametros.set("busqueda", busqueda.trim());
      }

      if (region.trim()) {
        parametros.set("region", region.trim());
      }

      const respuesta = await fetch(
        `${API_ARTESANOS}?${parametros.toString()}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!respuesta.ok) {
        throw new Error(
          respuesta.status === 401
            ? "Tu sesión no es válida o ha expirado."
            : "No se pudieron cargar los artesanos.",
        );
      }

      const datos = await respuesta.json();

      setArtesanos(
        Array.isArray(datos?.content) ? datos.content : [],
      );
      setTotalPaginas(Number(datos?.totalPages) || 0);
      setTotalArtesanos(Number(datos?.totalElements) || 0);
      setEsPrimera(Boolean(datos?.first));
      setEsUltima(Boolean(datos?.last));
      setPagina(Number(datos?.number) || 0);
    } catch (errorPeticion) {
      setError(
        errorPeticion.message ||
          "No fue posible cargar los artesanos.",
      );
      setArtesanos([]);
      setTotalPaginas(0);
      setTotalArtesanos(0);
    } finally {
      setCargando(false);
    }
  }, [busqueda, region]);

  useEffect(() => {
    cargarArtesanos(0);
  }, [cargarArtesanos]);

  const obtenerClaseEstado = (estado) => {
    if (estado === "APROBADO") {
      return "estado-artesano estado-artesano-aprobado";
    }

    if (estado === "RECHAZADO") {
      return "estado-artesano estado-artesano-rechazado";
    }

    return "estado-artesano estado-artesano-revision";
  };

  return (
    <section className="pagina-artesanos">
      <div className="encabezado-artesanos">
        <div>
          <p className="ruta-artesanos">
            Catálogo / Artesanos
          </p>
          <h2>Artesanos registrados</h2>
          <p className="descripcion-artesanos">
            Consulta los perfiles, comunidades y especialidades
            registradas.
          </p>
        </div>

        <div className="acciones-encabezado-artesanos">
          {esAdmin && (
            <button
              className="boton-registrar-artesano"
              type="button"
              onClick={() => navigate("/artesanos/nuevo")}
            >
              <Plus size={18} />
              Registrar artesano
            </button>
          )}
          <button
            className="boton-actualizar-artesanos"
            type="button"
            onClick={() => cargarArtesanos(pagina)}
            disabled={cargando}
          >
            <RefreshCw
              size={18}
              className={cargando ? "icono-girando" : ""}
            />
            Actualizar
          </button>
        </div>
      </div>

      <div className="detalle-artesanal" />

      <article className="resumen-artesanos">
        <div className="icono-resumen-artesanos">
          <UsersRound size={25} />
        </div>
        <div>
          <span>Total de artesanos</span>
          <strong>{cargando ? "..." : totalArtesanos}</strong>
        </div>
      </article>

      <article className="contenedor-artesanos">
        <div className="titulo-listado-artesanos">
          <div>
            <h3>Listado de artesanos</h3>
            <p>Información obtenida desde Spring Boot y MySQL</p>
          </div>
        </div>

        {cargando && (
          <div className="estado-listado-artesanos">
            <LoaderCircle
              className="icono-girando"
              size={34}
            />
            <p>Cargando artesanos...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="estado-listado-artesanos estado-error-artesanos">
            <AlertCircle size={34} />
            <p>{error}</p>
            <button
              type="button"
              onClick={() => cargarArtesanos(pagina)}
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {!cargando && !error && artesanos.length === 0 && (
          <div className="estado-listado-artesanos">
            <UsersRound size={38} />
            <h4>No hay artesanos registrados</h4>
            <p>Los perfiles aparecerán aquí después de registrarlos.</p>
          </div>
        )}

        {!cargando && !error && artesanos.length > 0 && (
          <>
            <div className="tabla-artesanos-contenedor">
              <table className="tabla-artesanos">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Comunidad</th>
                    <th>Especialidades</th>
                    <th>Años de oficio</th>
                    <th>Estado</th>
                    {esAdmin && <th>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {artesanos.map((artesano) => {
                    const especialidades = Array.isArray(
                      artesano.especialidades,
                    )
                      ? artesano.especialidades.join(", ")
                      : "Sin especialidades";

                    return (
                      <tr key={artesano.id}>
                        <td className="identificador-artesano">
                          {String(artesano.id).padStart(3, "0")}
                        </td>
                        <td>
                          <div className="nombre-artesano">
                            <div className="inicial-artesano">
                              {(artesano.nombreUsuario || "A")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <strong>
                                {artesano.nombreUsuario ||
                                  "Sin nombre"}
                              </strong>
                              <span>
                                {artesano.correo || "Sin correo"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>{artesano.comunidad || "Sin comunidad"}</td>
                        <td>{especialidades || "Sin especialidades"}</td>
                        <td>
                          {artesano.aniosOficio ?? "Sin información"}
                        </td>
                        <td>
                          <span
                            className={obtenerClaseEstado(
                              artesano.estadoValidacion,
                            )}
                          >
                            {artesano.estadoValidacion ||
                              "EN_REVISION"}
                          </span>
                        </td>
                        {esAdmin && (
                          <td>
                            <button
                              className="boton-editar-artesano"
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/artesanos/editar/${artesano.id}`,
                                )
                              }
                            >
                              <Pencil size={16} />
                              Editar
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPaginas > 1 && (
              <div className="paginacion-artesanos">
                <button
                  type="button"
                  onClick={() => cargarArtesanos(pagina - 1)}
                  disabled={esPrimera || cargando}
                >
                  Anterior
                </button>
                <span>
                  Página {pagina + 1} de {totalPaginas}
                </span>
                <button
                  type="button"
                  onClick={() => cargarArtesanos(pagina + 1)}
                  disabled={esUltima || cargando}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </article>
    </section>
  );
}

export default Artesanos;

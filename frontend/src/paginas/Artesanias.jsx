import { useCallback, useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  AlertCircle,
  Boxes,
  ImageOff,
  LoaderCircle,
  PackageSearch,
  Pencil,
  Plus,
  RefreshCw,
} from "lucide-react";

import "./Artesanias.css";

const API_ARTESANIAS =
  "http://localhost:8090/api/artesanias";
const API_TALLERES =
  "http://localhost:8090/api/talleres";

function extraerLista(datos) {
  if (Array.isArray(datos)) {
    return datos;
  }

  if (Array.isArray(datos?.content)) {
    return datos.content;
  }

  return [];
}

async function obtenerMensajeError(respuesta, mensajePredeterminado) {
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

function formatearPrecio(precio) {
  const cantidad = Number(precio);

  if (!Number.isFinite(cantidad)) {
    return "Sin precio";
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(cantidad);
}

function ImagenArtesania({ src, nombre }) {
  const [imagenConError, setImagenConError] =
    useState(false);

  useEffect(() => {
    setImagenConError(false);
  }, [src]);

  if (!src || imagenConError) {
    return (
      <div
        className="imagen-artesania imagen-artesania-vacia"
        aria-label={`Sin imagen para ${nombre}`}
      >
        <ImageOff size={23} />
      </div>
    );
  }

  return (
    <img
      className="imagen-artesania"
      src={src}
      alt={nombre}
      onError={() => setImagenConError(true)}
    />
  );
}

function Artesanias() {
  const navigate = useNavigate();
  const [parametrosBusqueda] = useSearchParams();
  const busqueda = parametrosBusqueda.get("q") || "";
  const region = parametrosBusqueda.get("region") || "";
  const [artesanias, setArtesanias] = useState([]);
  const [talleresPropios, setTalleresPropios] =
    useState(new Set());
  const [totalArtesanias, setTotalArtesanias] =
    useState(0);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [esPrimera, setEsPrimera] = useState(true);
  const [esUltima, setEsUltima] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const rol = localStorage.getItem("rol");
  const esAdmin = rol === "ADMIN";
  const esArtesano = rol === "ARTESANO";

  const cargarArtesanias = useCallback(async (numeroPagina = 0) => {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "No se encontró una sesión iniciada. Inicia sesión nuevamente.",
        );
      }

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
        `${API_ARTESANIAS}?${parametros.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!respuesta.ok) {
        const mensajesPorEstado = {
          401: "Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.",
          403: "No tienes permiso para consultar las artesanías.",
        };

        throw new Error(
          await obtenerMensajeError(
            respuesta,
            mensajesPorEstado[respuesta.status] ||
              `No se pudieron obtener las artesanías. Código: ${respuesta.status}`,
          ),
        );
      }

      const datos = await respuesta.json();
      const lista = extraerLista(datos);

      setArtesanias(lista);
      setTotalArtesanias(
        Number.isFinite(Number(datos?.totalElements))
          ? Number(datos.totalElements)
          : lista.length,
      );
      setPagina(Number(datos?.number) || 0);
      setTotalPaginas(Number(datos?.totalPages) || 0);
      setEsPrimera(Boolean(datos?.first));
      setEsUltima(Boolean(datos?.last));
    } catch (errorPeticion) {
      console.error(
        "Error al consultar las artesanías:",
        errorPeticion,
      );

      setArtesanias([]);
      setTotalArtesanias(0);
      setPagina(0);
      setTotalPaginas(0);
      setEsPrimera(true);
      setEsUltima(true);
      setError(
        errorPeticion.message ||
          "No fue posible obtener las artesanías desde la API.",
      );
    } finally {
      setCargando(false);
    }
  }, [busqueda, region]);

  const cargarTalleresPropios = useCallback(async () => {
    if (!esArtesano) {
      setTalleresPropios(new Set());
      return;
    }

    try {
      const respuesta = await fetch(
        `${API_TALLERES}/mios?page=0&size=1000`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!respuesta.ok) {
        setTalleresPropios(new Set());
        return;
      }

      const datos = await respuesta.json();
      setTalleresPropios(
        new Set(
          (Array.isArray(datos?.content)
            ? datos.content
            : []
          ).map((taller) => Number(taller.id)),
        ),
      );
    } catch {
      setTalleresPropios(new Set());
    }
  }, [esArtesano]);

  useEffect(() => {
    cargarArtesanias(0);
  }, [cargarArtesanias]);

  useEffect(() => {
    cargarTalleresPropios();
  }, [cargarTalleresPropios]);

  return (
    <section className="pagina-artesanias">
      <div className="encabezado-artesanias">
        <div>
          <p className="ruta-artesanias">
            Catálogo / Artesanías
          </p>

          <h2>Artesanías registradas</h2>

          <p className="descripcion-artesanias">
            Consulta las piezas disponibles y el taller
            del que provienen.
          </p>
        </div>

        <div className="acciones-encabezado-artesanias">
          {(esAdmin || esArtesano) && (
            <button
              className="boton-registrar-artesania"
              type="button"
              onClick={() => navigate("/artesanias/nueva")}
            >
              <Plus size={18} />
              Agregar artesanía
            </button>
          )}

          <button
            className="boton-actualizar-artesanias"
            type="button"
            onClick={() => cargarArtesanias(pagina)}
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

      <article className="resumen-artesanias">
        <div className="icono-resumen-artesanias">
          <Boxes size={25} />
        </div>

        <div>
          <span>Total de artesanías</span>
          <strong>
            {cargando ? "..." : totalArtesanias}
          </strong>
        </div>
      </article>

      <article className="contenedor-artesanias">
        <div className="titulo-listado-artesanias">
          <div>
            <h3>Listado de artesanías</h3>
            <p>
              Información obtenida desde Spring Boot y
              MySQL
            </p>
          </div>
        </div>

        {cargando && (
          <div className="estado-artesanias">
            <LoaderCircle
              className="icono-girando"
              size={34}
            />
            <p>Cargando artesanías...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="estado-artesanias estado-artesanias-error">
            <AlertCircle size={34} />
            <h4>No fue posible cargar el catálogo</h4>
            <p>{error}</p>

            <button
              type="button"
              onClick={() => cargarArtesanias(pagina)}
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {!cargando &&
          !error &&
          artesanias.length === 0 && (
            <div className="estado-artesanias">
              <PackageSearch size={38} />
              <h4>No hay artesanías registradas</h4>
              <p>
                Las artesanías aparecerán aquí cuando se
                agreguen a la base de datos.
              </p>
            </div>
          )}

        {!cargando &&
          !error &&
          artesanias.length > 0 && (
            <>
              <div className="tabla-artesanias-contenedor">
                <table className="tabla-artesanias">
                <thead>
                  <tr>
                    <th scope="col">Pieza</th>
                    <th scope="col">Taller</th>
                    <th scope="col">Precio</th>
                    <th scope="col">Existencia</th>
                    {(esAdmin || esArtesano) && (
                      <th scope="col">Acciones</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {artesanias.map((artesania) => (
                    <tr key={artesania.id}>
                      <td>
                        <div className="pieza-artesania">
                          <ImagenArtesania
                            src={artesania.imagenUrl}
                            nombre={
                              artesania.nombre ||
                              "Artesanía"
                            }
                          />

                          <div>
                            <strong>
                              {artesania.nombre ||
                                "Sin nombre"}
                            </strong>

                            <span>
                              {artesania.descripcion ||
                                "Sin descripción"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="nombre-taller-artesania">
                          {artesania.taller ||
                            "Sin taller"}
                        </span>
                      </td>

                      <td className="precio-artesania">
                        {formatearPrecio(
                          artesania.precio,
                        )}
                      </td>

                      <td>
                        <span
                          className={`existencia-artesania ${
                            Number(artesania.existencia) ===
                            0
                              ? "existencia-agotada"
                              : Number(
                                    artesania.existencia,
                                  ) <= 5
                                ? "existencia-baja"
                                : "existencia-disponible"
                          }`}
                        >
                          {Number(artesania.existencia) ||
                            0}{" "}
                          unidades
                        </span>
                      </td>

                      {(esAdmin || esArtesano) && (
                        <td>
                          {(esAdmin ||
                            talleresPropios.has(
                              Number(artesania.tallerId),
                            )) && (
                            <button
                              className="boton-editar-artesania"
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/artesanias/editar/${artesania.id}`,
                                )
                              }
                              aria-label={`Editar ${artesania.nombre}`}
                            >
                              <Pencil size={17} />
                              Editar
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>

              {totalPaginas > 1 && (
                <div className="paginacion-artesanias">
                  <button
                    type="button"
                    onClick={() =>
                      cargarArtesanias(pagina - 1)
                    }
                    disabled={esPrimera || cargando}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {pagina + 1} de {totalPaginas}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      cargarArtesanias(pagina + 1)
                    }
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

export default Artesanias;

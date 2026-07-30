import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ClipboardCheck,
  LoaderCircle,
  SearchCheck,
} from "lucide-react";

import "./SolicitudesRegistro.css";

const API_ARTESANOS =
  `${import.meta.env.VITE_API_URL}/api/artesanos`

function SolicitudesRegistro() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async (numeroPagina = 0) => {
    try {
      setCargando(true);
      setError("");
      const parametros = new URLSearchParams({
        estadoValidacion: "EN_REVISION",
        page: String(numeroPagina),
        size: "10",
      });
      const respuesta = await fetch(
        `${API_ARTESANOS}?${parametros.toString()}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron cargar las solicitudes.",
        );
      }

      const datos = await respuesta.json();
      setSolicitudes(
        Array.isArray(datos?.content) ? datos.content : [],
      );
      setPagina(Number(datos?.number) || 0);
      setTotalPaginas(Number(datos?.totalPages) || 0);
    } catch (errorPeticion) {
      setError(
        errorPeticion.message ||
          "No fue posible cargar las solicitudes.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar(0);
  }, [cargar]);

  return (
    <section className="pagina-solicitudes">
      <header className="encabezado-solicitudes">
        <p>Validación / Solicitudes de registro</p>
        <h2>Solicitudes de artesanos</h2>
        <span>
          Revisa los perfiles que esperan validación.
        </span>
      </header>

      <div className="detalle-artesanal" />

      <article className="tarjeta-solicitudes">
        <div className="titulo-solicitudes">
          <ClipboardCheck size={25} />
          <div>
            <h3>Perfiles en revisión</h3>
            <p>
              Solo las cuentas ADMIN pueden acceder a esta
              pantalla.
            </p>
          </div>
        </div>

        {cargando && (
          <div className="estado-solicitudes">
            <LoaderCircle
              className="icono-girando"
              size={34}
            />
            <p>Cargando solicitudes...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="estado-solicitudes estado-solicitudes-error">
            <AlertCircle size={34} />
            <p>{error}</p>
            <button type="button" onClick={() => cargar(pagina)}>
              Intentar nuevamente
            </button>
          </div>
        )}

        {!cargando &&
          !error &&
          solicitudes.length === 0 && (
            <div className="estado-solicitudes">
              <SearchCheck size={38} />
              <h4>No hay solicitudes pendientes</h4>
              <p>
                Todos los perfiles registrados ya fueron
                revisados.
              </p>
            </div>
          )}

        {!cargando &&
          !error &&
          solicitudes.length > 0 && (
            <>
              <div className="tabla-solicitudes-contenedor">
                <table className="tabla-solicitudes">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Comunidad</th>
                      <th>Especialidades</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((solicitud) => (
                      <tr key={solicitud.id}>
                        <td>
                          {solicitud.nombreUsuario ||
                            "Sin nombre"}
                        </td>
                        <td>{solicitud.correo}</td>
                        <td>
                          {solicitud.comunidad ||
                            "Sin comunidad"}
                        </td>
                        <td>
                          {Array.isArray(
                            solicitud.especialidades,
                          ) &&
                          solicitud.especialidades.length > 0
                            ? solicitud.especialidades.join(
                                ", ",
                              )
                            : "Sin especialidades"}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/artesanos/editar/${solicitud.id}`,
                              )
                            }
                          >
                            Revisar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPaginas > 1 && (
                <div className="paginacion">
                  <button
                    type="button"
                    disabled={pagina === 0}
                    onClick={() => cargar(pagina - 1)}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {pagina + 1} de {totalPaginas}
                  </span>
                  <button
                    type="button"
                    disabled={pagina + 1 >= totalPaginas}
                    onClick={() => cargar(pagina + 1)}
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

export default SolicitudesRegistro;

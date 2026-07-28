import { useCallback, useEffect, useState } from "react";

const API_ARTESANOS = "http://localhost:8090/api/artesanos";

function Artesanos() {
  const [artesanos, setArtesanos] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [esPrimera, setEsPrimera] = useState(true);
  const [esUltima, setEsUltima] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarArtesanos = useCallback(async (numeroPagina) => {
    setCargando(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const url = `${API_ARTESANOS}?page=${numeroPagina}&size=10`;

      const respuesta = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los artesanos");
      }

      const datos = await respuesta.json();

      console.log("Artesanos recibidos:", datos);
      setArtesanos(datos.content);
      setTotalPaginas(datos.totalPages);
      setEsPrimera(datos.first);
      setEsUltima(datos.last);
      setPagina(datos.number);
    } catch (errorPeticion) {
      setError(errorPeticion.message);
      setArtesanos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarArtesanos(0);
  }, [cargarArtesanos]);

  const irPaginaAnterior = () => {
    if (!esPrimera) {
      cargarArtesanos(pagina - 1);
    }
  };

  const irPaginaSiguiente = () => {
    if (!esUltima) {
      cargarArtesanos(pagina + 1);
    }
  };

  const obtenerClaseEstado = (estado) => {
    if (estado === "APROBADO") {
      return "estado estado-aprobada";
    }
    if (estado === "RECHAZADO") {
      return "estado estado-documento";
    }
    return "estado estado-revision";
  };

  return (
    <section className="encabezado-panel">
      <h2>Artesanos</h2>
      <p>Listado de artesanos registrados</p>

      <div className="detalle-artesanal" />

      <article className="panel-tabla" style={{ marginTop: "24px" }}>
        <div className="contenedor-tabla">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Comunidad</th>
                <th>Especialidades</th>
                <th>Años de oficio</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {cargando && (
                <tr>
                  <td colSpan="6">Cargando artesanos...</td>
                </tr>
              )}

              {!cargando && error && (
                <tr>
                  <td colSpan="6">{error}</td>
                </tr>
              )}

              {!cargando && !error && artesanos.length === 0 && (
                <tr>
                  <td colSpan="6">No hay artesanos registrados.</td>
                </tr>
              )}

              {!cargando &&
                !error &&
                artesanos.map((artesano) => (
                  <tr key={artesano.id}>
                    <td className="folio">
                      {String(artesano.id).padStart(3, "0")}
                    </td>
                    <td>{artesano.nombreUsuario}</td>
                    <td>{artesano.comunidad}</td>
                    <td>{artesano.especialidades.join(", ")}</td>
                    <td>{artesano.aniosOficio}</td>
                    <td>
                      <span className={obtenerClaseEstado(artesano.estadoValidacion)}>
                        {artesano.estadoValidacion}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="paginacion">
          <button
            type="button"
            onClick={irPaginaAnterior}
            disabled={esPrimera}
          >
            Anterior
          </button>

          <span>
            Página {pagina + 1} de {totalPaginas}
          </span>

          <button
            type="button"
            onClick={irPaginaSiguiente}
            disabled={esUltima}
          >
            Siguiente
          </button>
        </div>
      </article>
    </section>
  );
}

export default Artesanos;
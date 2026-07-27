import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  Building2,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import "./Talleres.css";

const API_TALLERES =
  "https://6a545ff38547b9f7111c26d6.mockapi.io/talleres";

function Talleres() {
  const navigate = useNavigate();

  const [talleres, setTalleres] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [municipio, setMunicipio] = useState("");
  const [municipioAplicado, setMunicipioAplicado] =
    useState("");

  const cargarTalleres = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const url = new URL(API_TALLERES);

      /*
       * El filtro se manda a la API como parámetro.
       * En MockAPI el campo disponible se llama "ubicacion".
       */
      if (municipioAplicado.trim()) {
        url.searchParams.set(
          "ubicacion",
          municipioAplicado.trim(),
        );
      }

      const respuesta = await fetch(url.toString());

      if (!respuesta.ok) {
        throw new Error(
          `No se pudieron obtener los talleres. Código: ${respuesta.status}`,
        );
      }

      const datos = await respuesta.json();

      setTalleres(Array.isArray(datos) ? datos : []);
    } catch (errorPeticion) {
      console.error(
        "Error al consultar los talleres:",
        errorPeticion,
      );

      setError(
        "No fue posible obtener los talleres desde la API. Intenta nuevamente.",
      );

      setTalleres([]);
    } finally {
      setCargando(false);
    }
  }, [municipioAplicado]);

  useEffect(() => {
    cargarTalleres();
  }, [cargarTalleres]);

  const aplicarFiltro = (evento) => {
    evento.preventDefault();

    setMunicipioAplicado(municipio.trim());
  };

  const limpiarFiltro = () => {
    setMunicipio("");
    setMunicipioAplicado("");
  };

  return (
    <section className="pagina-talleres">
      <div className="encabezado-talleres">
        <div>
          <p className="ruta-talleres">
            Catálogo / Talleres
          </p>

          <h2>Talleres artesanales</h2>

          <p className="descripcion-talleres">
            Consulta los talleres registrados y su información.
          </p>
        </div>

        <div className="acciones-encabezado-talleres">
          <button
            className="boton-registrar-taller"
            type="button"
            onClick={() => navigate("/talleres/nuevo")}
          >
            <Plus size={18} />
            <span>Registrar taller</span>
          </button>

          <button
            className="boton-actualizar"
            type="button"
            onClick={cargarTalleres}
            disabled={cargando}
          >
            <RefreshCw
              size={18}
              className={
                cargando ? "icono-girando" : ""
              }
            />

            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <div className="detalle-artesanal" />

      <form
        className="filtros-talleres"
        onSubmit={aplicarFiltro}
      >
        <div className="campo-filtro-municipio">
          <label htmlFor="municipio">
            Filtrar por municipio
          </label>

          <div className="entrada-filtro-municipio">
            <Search size={18} />

            <input
              id="municipio"
              name="municipio"
              type="search"
              value={municipio}
              onChange={(evento) =>
                setMunicipio(evento.target.value)
              }
              placeholder="Ej. San Bartolo Coyotepec"
              disabled={cargando}
            />
          </div>
        </div>

        <div className="acciones-filtro-talleres">
          <button
            className="boton-aplicar-filtro"
            type="submit"
            disabled={cargando}
          >
            <Search size={17} />
            Filtrar
          </button>

          {municipioAplicado && (
            <button
              className="boton-limpiar-filtro"
              type="button"
              onClick={limpiarFiltro}
              disabled={cargando}
            >
              <X size={17} />
              Limpiar
            </button>
          )}
        </div>
      </form>

      {municipioAplicado && (
        <p className="filtro-aplicado">
          Mostrando talleres ubicados en:{" "}
          <strong>{municipioAplicado}</strong>
        </p>
      )}

      <article className="resumen-talleres">
        <div className="icono-resumen">
          <Building2 size={25} />
        </div>

        <div>
          <span>
            {municipioAplicado
              ? "Talleres encontrados"
              : "Total de talleres"}
          </span>

          <strong>{talleres.length}</strong>
        </div>
      </article>

      <article className="contenedor-listado-talleres">
        <div className="titulo-listado-talleres">
          <div>
            <h3>Listado de talleres</h3>

            <p>
              Información obtenida desde la API
            </p>
          </div>
        </div>

        {cargando && (
          <div className="estado-talleres">
            <LoaderCircle
              className="icono-girando"
              size={32}
            />

            <p>Cargando talleres...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="estado-talleres estado-error">
            <AlertCircle size={32} />

            <p>{error}</p>

            <button
              type="button"
              onClick={cargarTalleres}
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {!cargando &&
          !error &&
          talleres.length === 0 && (
            <div className="estado-talleres">
              <Building2 size={36} />

              <h4>
                {municipioAplicado
                  ? "No se encontraron talleres"
                  : "No hay talleres registrados"}
              </h4>

              <p>
                {municipioAplicado
                  ? `No existen talleres registrados con la ubicación "${municipioAplicado}".`
                  : "Los talleres aparecerán aquí cuando se registren en la API."}
              </p>

              {municipioAplicado && (
                <button
                  type="button"
                  onClick={limpiarFiltro}
                >
                  Mostrar todos los talleres
                </button>
              )}
            </div>
          )}

        {!cargando &&
          !error &&
          talleres.length > 0 && (
            <div className="tabla-talleres-contenedor">
              <table className="tabla-talleres">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre del taller</th>
                    <th>Responsable</th>
                    <th>Especialidad</th>
                    <th>Ubicación</th>
                    <th>Reseña</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {talleres.map((taller) => {
                    const nombre =
                      taller.nombreTaller?.trim() ||
                      "Sin nombre";

                    const responsable =
                      taller.responsable?.trim() ||
                      "Sin responsable";

                    const especialidad =
                      taller.especialidad?.trim() ||
                      "Sin especialidad";

                    const ubicacion =
                      taller.ubicacion?.trim() ||
                      "Sin ubicación";

                    const resenia =
                      taller.resenia ??
                      taller.reseña ??
                      "Sin reseña";

                    return (
                      <tr key={taller.id}>
                        <td className="identificador-taller">
                          {String(taller.id).padStart(
                            3,
                            "0",
                          )}
                        </td>

                        <td>
                          <div className="nombre-taller">
                            <div className="inicial-taller">
                              {nombre
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>{nombre}</strong>
                            </div>
                          </div>
                        </td>

                        <td>{responsable}</td>

                        <td>{especialidad}</td>

                        <td>
                          <span className="comunidad-taller">
                            <MapPin size={15} />
                            {ubicacion}
                          </span>
                        </td>

                        <td>{resenia}</td>

                        <td>
                          <button
                            className="boton-editar-taller"
                            type="button"
                            onClick={() =>
                              navigate(
                                `/talleres/editar/${taller.id}`,
                              )
                            }
                          >
                            <Pencil size={16} />
                            <span>Editar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </article>
    </section>
  );
}

export default Talleres;
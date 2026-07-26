import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  LoaderCircle,
  MapPin,
  RefreshCw,
} from "lucide-react";

import "./Talleres.css";

const API_TALLERES =
  "https://6a545ff38547b9f7111c26d6.mockapi.io/talleres";

function Talleres() {
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
      console.error("Error al consultar los talleres:", errorPeticion);

      setError(
        "No fue posible obtener los talleres desde la API. Intenta nuevamente.",
      );

      setTalleres([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTalleres();
  }, [cargarTalleres]);

  return (
    <section className="pagina-talleres">
      <div className="encabezado-talleres">
        <div>
          <p className="ruta-talleres">Catálogo / Talleres</p>

          <h2>Talleres artesanales</h2>

          <p className="descripcion-talleres">
            Consulta los talleres registrados y su información.
          </p>
        </div>

        <button
          className="boton-actualizar"
          type="button"
          onClick={cargarTalleres}
          disabled={cargando}
        >
          <RefreshCw
            size={18}
            className={cargando ? "icono-girando" : ""}
          />

          <span>Actualizar</span>
        </button>
      </div>

      <div className="detalle-artesanal" />

      <article className="resumen-talleres">
        <div className="icono-resumen">
          <Building2 size={25} />
        </div>

        <div>
          <span>Total de talleres</span>
          <strong>{talleres.length}</strong>
        </div>
      </article>

      <article className="contenedor-listado-talleres">
        <div className="titulo-listado-talleres">
          <div>
            <h3>Listado de talleres</h3>
            <p>Información obtenida desde la API</p>
          </div>
        </div>

        {cargando && (
          <div className="estado-talleres">
            <LoaderCircle className="icono-girando" size={32} />
            <p>Cargando talleres...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="estado-talleres estado-error">
            <AlertCircle size={32} />

            <p>{error}</p>

            <button type="button" onClick={cargarTalleres}>
              Intentar nuevamente
            </button>
          </div>
        )}

        {!cargando && !error && talleres.length === 0 && (
          <div className="estado-talleres">
            <Building2 size={36} />

            <h4>No hay talleres registrados</h4>

            <p>
              Los talleres aparecerán aquí cuando se registren en la API.
            </p>
          </div>
        )}

        {!cargando && !error && talleres.length > 0 && (
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
                </tr>
              </thead>

              <tbody>
                {talleres.map((taller) => {
                  const nombre =
                    taller.nombreTaller?.trim() || "Sin nombre";

                  const responsable =
                    taller.responsable?.trim() || "Sin responsable";

                  const especialidad =
                    taller.especialidad?.trim() || "Sin especialidad";

                  const ubicacion =
                    taller.ubicacion?.trim() || "Sin ubicación";

                  const resenia =
                    taller.resenia ?? taller.reseña ?? "Sin reseña";

                  return (
                    <tr key={taller.id}>
                      <td className="identificador-taller">
                        {String(taller.id).padStart(3, "0")}
                      </td>

                      <td>
                        <div className="nombre-taller">
                          <div className="inicial-taller">
                            {nombre.charAt(0).toUpperCase()}
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

                      <td>
                        {resenia === "Sin reseña"
                          ? resenia
                          : `${resenia} / 5`}
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
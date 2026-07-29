import { useCallback, useEffect, useState } from "react";

const API_ESPECIALIDADES = `${import.meta.env.VITE_API_URL}/api/especialidades`;

function Especialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarEspecialidades = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(API_ESPECIALIDADES, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las especialidades");
      }

      const datos = await respuesta.json();
      setEspecialidades(datos);
    } catch (errorPeticion) {
      setError(errorPeticion.message);
      setEspecialidades([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEspecialidades();
  }, [cargarEspecialidades]);

  return (
    <section className="encabezado-panel">
      <h2>Especialidades</h2>
      <p>Oficios artesanales registrados en el catálogo</p>

      <div className="detalle-artesanal" />

      {cargando && <p className="mensaje-estado">Cargando especialidades...</p>}

      {!cargando && error && <p className="mensaje-estado">{error}</p>}

      {!cargando && !error && especialidades.length === 0 && (
        <p className="mensaje-estado">No hay especialidades registradas.</p>
      )}

      {!cargando && !error && especialidades.length > 0 && (
        <div className="rejilla-especialidades">
          {especialidades.map((especialidad) => (
            <article className="tarjeta-especialidad" key={especialidad.id}>
              <h3>{especialidad.nombre}</h3>
              <p>{especialidad.descripcion}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Especialidades;
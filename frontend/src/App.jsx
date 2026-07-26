import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Grid2X2,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

import "./App.css";

const seccionesMenu = [
  {
    titulo: "VALIDACIÓN",
    opciones: [
      { nombre: "Solicitudes de registro", contador: 12 },
      { nombre: "Vigencias", contador: 3 },
      { nombre: "Verificación de identidad" },
    ],
  },
  {
    titulo: "CATÁLOGO",
    opciones: [
      { nombre: "Artesanos" },
      { nombre: "Talleres" },
      { nombre: "Experiencias" },
      { nombre: "Piezas" },
      { nombre: "Taxonomías" },
    ],
  },
  {
    titulo: "OPERACIÓN",
    opciones: [
      { nombre: "Reservas" },
      { nombre: "Calendario de sesiones" },
      { nombre: "Incidencias" },
      { nombre: "Reseñas", contador: 5 },
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

const solicitudes = [
  {
    folio: "VAL-0842",
    artesano: "María Teresa Cruz",
    comunidad: "Teotitlán del Valle",
    tecnica: "Lana en telar",
    estado: "En revisión",
    clase: "revision",
  },
  {
    folio: "VAL-0841",
    artesano: "Taller Jacobo y María",
    comunidad: "San Martín Tilcajete",
    tecnica: "Talla en madera",
    estado: "Falta documento",
    clase: "documento",
  },
  {
    folio: "VAL-0840",
    artesano: "Colectivo Mujeres del Barro",
    comunidad: "San Bartolo Coyotepec",
    tecnica: "Barro negro",
    estado: "Aprobada",
    clase: "aprobada",
  },
  {
    folio: "VAL-0839",
    artesano: "Pedro Mendoza",
    comunidad: "Santo Tomás Jalieza",
    tecnica: "Telar de cintura",
    estado: "Sin asignar",
    clase: "sin-asignar",
  },
];

const ingresos = [
  {
    comunidad: "Teotitlán del Valle",
    cantidad: "$62,400",
    porcentaje: 88,
    clase: "azul",
  },
  {
    comunidad: "San Bartolo Coyotepec",
    cantidad: "$50,100",
    porcentaje: 72,
    clase: "rosa",
  },
  {
    comunidad: "San Martín Tilcajete",
    cantidad: "$38,300",
    porcentaje: 55,
    clase: "naranja",
  },
  {
    comunidad: "Santo Tomás Jalieza",
    cantidad: "$23,700",
    porcentaje: 35,
    clase: "marino",
  },
  {
    comunidad: "Ocotlán de Morelos",
    cantidad: "$10,000",
    porcentaje: 20,
    clase: "amarillo",
  },
];

function App() {
  return (
    <div className="aplicacion">
      <header className="barra-superior">
        <div className="marca">
          <div className="logo-marca">MO</div>

          <h1>Manos de Oaxaca</h1>
        </div>

        <div className="acciones-superiores">
          <button className="selector-region" type="button">
            <MapPin size={21} />
            <span>Valles Centrales</span>
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
              <strong>Rocío Mendoza</strong>
              <span>Validadora</span>
            </div>

            <div className="avatar">RM</div>
          </div>
        </div>
      </header>

      <div className="estructura">
        <aside className="barra-lateral">
          <button type="button" className="opcion-panel">
            <Grid2X2 size={20} />
            <span>Panel</span>
          </button>

          <nav className="menu-lateral">
            {seccionesMenu.map((seccion) => (
              <section className="grupo-menu" key={seccion.titulo}>
                <h2>{seccion.titulo}</h2>

                {seccion.opciones.map((opcion) => (
                  <button
                    className="opcion-menu"
                    type="button"
                    key={opcion.nombre}
                  >
                    <span>{opcion.nombre}</span>

                    {opcion.contador !== undefined && (
                      <strong>{opcion.contador}</strong>
                    )}
                  </button>
                ))}
              </section>
            ))}
          </nav>
        </aside>

        <main className="contenido">
          <section className="encabezado-panel">
            <h2>Panel operativo</h2>
            <p>Miércoles 22 de julio · Valles Centrales</p>
            <div className="detalle-artesanal" />
          </section>

          <section className="tarjetas-indicadores">
            <article className="tarjeta-indicador tarjeta-roja">
              <div className="titulo-indicador">
                <Users size={19} />
                <span>Solicitudes por validar</span>
              </div>

              <strong className="valor-indicador">12</strong>

              <p className="mensaje-alerta">
                <span>△</span> 3 llevan más de 5 días
              </p>
            </article>

            <article className="tarjeta-indicador tarjeta-verde">
              <div className="titulo-indicador">
                <CalendarDays size={19} />
                <span>Sesiones esta semana</span>
              </div>

              <strong className="valor-indicador">38</strong>

              <p>en 14 comunidades</p>
            </article>

            <article className="tarjeta-indicador tarjeta-azul">
              <div className="titulo-indicador">
                <BarChart3 size={19} />
                <span>Ocupación promedio</span>
              </div>

              <strong className="valor-indicador">72%</strong>

              <p className="mensaje-positivo">↗ +6 pts vs. semana pasada</p>
            </article>

            <article className="tarjeta-indicador tarjeta-amarilla">
              <div className="titulo-indicador">
                <CircleDollarSign size={19} />
                <span>Por liquidar</span>
              </div>

              <strong className="valor-indicador valor-dinero">
                $184,500
              </strong>

              <p className="mensaje-secundario">
                <Clock3 size={15} />
                corte del viernes
              </p>
            </article>
          </section>

          <section className="zona-inferior">
            <article className="panel-tabla">
              <div className="encabezado-tarjeta">
                <h3>Solicitudes recientes</h3>
                <button type="button">Ver todas</button>
              </div>

              <div className="contenedor-tabla">
                <table>
                  <thead>
                    <tr>
                      <th>Folio</th>
                      <th>Artesano</th>
                      <th>Comunidad</th>
                      <th>Técnica</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {solicitudes.map((solicitud) => (
                      <tr key={solicitud.folio}>
                        <td className="folio">{solicitud.folio}</td>
                        <td>{solicitud.artesano}</td>
                        <td>{solicitud.comunidad}</td>
                        <td>{solicitud.tecnica}</td>
                        <td>
                          <span
                            className={`estado estado-${solicitud.clase}`}
                          >
                            {solicitud.estado}
                          </span>
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
                  <h3>Ingreso distribuido por comunidad</h3>
                  <p>Periodo actual</p>
                </div>

                <ShieldCheck size={22} />
              </div>

              <div className="lista-ingresos">
                {ingresos.map((ingreso) => (
                  <div className="ingreso" key={ingreso.comunidad}>
                    <div className="datos-ingreso">
                      <span>{ingreso.comunidad}</span>
                      <strong>{ingreso.cantidad}</strong>
                    </div>

                    <div className="barra-ingreso">
                      <span
                        className={ingreso.clase}
                        style={{ width: `${ingreso.porcentaje}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pie-ingresos">
                <Star size={17} />
                Información actualizada
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
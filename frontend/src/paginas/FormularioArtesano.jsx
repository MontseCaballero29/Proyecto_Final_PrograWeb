import { UserRound } from "lucide-react";

import "./FormularioArtesano.css";

function FormularioArtesano({
  formulario,
  errores,
  usuarios,
  comunidades,
  especialidades,
  modoEdicion,
  nombreUsuario,
  correoUsuario,
  deshabilitado,
  onChange,
  onEspecialidad,
}) {
  return (
    <div className="campos-formulario-artesano">
      {modoEdicion ? (
        <div className="usuario-artesano-seleccionado">
          <div className="icono-usuario-artesano">
            <UserRound size={24} />
          </div>
          <div>
            <span>Usuario vinculado</span>
            <strong>{nombreUsuario}</strong>
            <small>{correoUsuario}</small>
          </div>
        </div>
      ) : (
        <div className="campo-artesano campo-artesano-completo">
          <label htmlFor="usuarioId">
            Usuario visitante <strong>*</strong>
          </label>
          <select
            id="usuarioId"
            name="usuarioId"
            value={formulario.usuarioId}
            onChange={onChange}
            disabled={deshabilitado}
            className={errores.usuarioId ? "campo-con-error" : ""}
          >
            <option value="">Selecciona un usuario</option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombre} — {usuario.correo}
              </option>
            ))}
          </select>
          {errores.usuarioId && (
            <small className="mensaje-error-campo">
              {errores.usuarioId}
            </small>
          )}
          {usuarios.length === 0 && (
            <small className="ayuda-campo-artesano">
              No hay usuarios visitantes disponibles. Primero debe
              registrarse una cuenta de visitante.
            </small>
          )}
        </div>
      )}

      <div className="campo-artesano">
        <label htmlFor="comunidadId">
          Comunidad <strong>*</strong>
        </label>
        <select
          id="comunidadId"
          name="comunidadId"
          value={formulario.comunidadId}
          onChange={onChange}
          disabled={deshabilitado}
          className={errores.comunidadId ? "campo-con-error" : ""}
        >
          <option value="">Selecciona una comunidad</option>
          {comunidades.map((comunidad) => (
            <option key={comunidad.id} value={comunidad.id}>
              {comunidad.nombre}
            </option>
          ))}
        </select>
        {errores.comunidadId && (
          <small className="mensaje-error-campo">
            {errores.comunidadId}
          </small>
        )}
      </div>

      <div className="campo-artesano">
        <label htmlFor="curp">CURP</label>
        <input
          id="curp"
          name="curp"
          type="text"
          value={formulario.curp}
          onChange={onChange}
          maxLength={18}
          placeholder="18 caracteres"
          disabled={deshabilitado}
          className={errores.curp ? "campo-con-error" : ""}
        />
        {errores.curp && (
          <small className="mensaje-error-campo">
            {errores.curp}
          </small>
        )}
      </div>

      <div className="campo-artesano">
        <label htmlFor="aniosOficio">Años de oficio</label>
        <input
          id="aniosOficio"
          name="aniosOficio"
          type="number"
          min="0"
          max="100"
          step="1"
          value={formulario.aniosOficio}
          onChange={onChange}
          placeholder="Ej. 15"
          disabled={deshabilitado}
          className={errores.aniosOficio ? "campo-con-error" : ""}
        />
        {errores.aniosOficio && (
          <small className="mensaje-error-campo">
            {errores.aniosOficio}
          </small>
        )}
      </div>

      <div className="campo-artesano">
        <label htmlFor="lengua">Lengua originaria</label>
        <input
          id="lengua"
          name="lengua"
          type="text"
          value={formulario.lengua}
          onChange={onChange}
          maxLength={80}
          placeholder="Ej. Zapoteco"
          disabled={deshabilitado}
          className={errores.lengua ? "campo-con-error" : ""}
        />
        {errores.lengua && (
          <small className="mensaje-error-campo">
            {errores.lengua}
          </small>
        )}
      </div>

      <div className="campo-artesano campo-artesano-completo">
        <label htmlFor="biografia">Biografía</label>
        <textarea
          id="biografia"
          name="biografia"
          rows="5"
          value={formulario.biografia}
          onChange={onChange}
          maxLength={2000}
          placeholder="Describe su trayectoria, técnicas y experiencia."
          disabled={deshabilitado}
          className={errores.biografia ? "campo-con-error" : ""}
        />
        <div className="pie-campo-artesano">
          {errores.biografia ? (
            <small className="mensaje-error-campo">
              {errores.biografia}
            </small>
          ) : (
            <span />
          )}
          <small>{formulario.biografia.length}/2000</small>
        </div>
      </div>

      <fieldset
        className="campo-especialidades-artesano"
        disabled={deshabilitado}
      >
        <legend>Especialidades</legend>
        <p>Selecciona una o varias especialidades.</p>
        <div className="lista-especialidades-artesano">
          {especialidades.map((especialidad) => {
            const seleccionada = formulario.especialidadIds.includes(
              String(especialidad.id),
            );

            return (
              <label
                className={`opcion-especialidad-artesano ${
                  seleccionada
                    ? "opcion-especialidad-seleccionada"
                    : ""
                }`}
                key={especialidad.id}
              >
                <input
                  type="checkbox"
                  checked={seleccionada}
                  onChange={() =>
                    onEspecialidad(String(especialidad.id))
                  }
                />
                <span>{especialidad.nombre}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

export default FormularioArtesano;

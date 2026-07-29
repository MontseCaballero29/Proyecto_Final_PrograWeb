export const API_ARTESANOS =
  "http://localhost:8090/api/artesanos";
export const API_COMUNIDADES =
  "http://localhost:8090/api/comunidades";
export const API_ESPECIALIDADES =
  "http://localhost:8090/api/especialidades";
export const API_USUARIOS_DISPONIBLES =
  "http://localhost:8090/api/usuarios/disponibles-artesano";

export const FORMULARIO_ARTESANO_INICIAL = {
  usuarioId: "",
  comunidadId: "",
  curp: "",
  biografia: "",
  aniosOficio: "",
  lengua: "",
  especialidadIds: [],
};

export function extraerLista(datos) {
  if (Array.isArray(datos)) {
    return datos;
  }

  if (Array.isArray(datos?.content)) {
    return datos.content;
  }

  return [];
}

export async function obtenerMensajeError(
  respuesta,
  mensajePredeterminado,
) {
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

export function validarFormularioArtesano(
  formulario,
  requiereUsuario,
) {
  const errores = {};
  const curp = formulario.curp.trim().toUpperCase();
  const biografia = formulario.biografia.trim();
  const lengua = formulario.lengua.trim();
  const anios = formulario.aniosOficio;

  if (requiereUsuario && !formulario.usuarioId) {
    errores.usuarioId = "Selecciona un usuario visitante.";
  }

  if (!formulario.comunidadId) {
    errores.comunidadId = "Selecciona una comunidad.";
  }

  if (
    curp &&
    !/^[A-Z]{4}[0-9]{6}[A-Z]{6}[A-Z0-9]{2}$/.test(curp)
  ) {
    errores.curp = "Escribe un CURP válido de 18 caracteres.";
  }

  if (biografia.length > 2000) {
    errores.biografia =
      "La biografía no puede exceder 2000 caracteres.";
  }

  if (anios !== "") {
    const numeroAnios = Number(anios);

    if (
      !Number.isInteger(numeroAnios) ||
      numeroAnios < 0 ||
      numeroAnios > 100
    ) {
      errores.aniosOficio =
        "Los años de oficio deben ser un entero entre 0 y 100.";
    }
  }

  if (lengua.length > 80) {
    errores.lengua =
      "La lengua no puede exceder 80 caracteres.";
  }

  return errores;
}

export function crearPeticionArtesano(formulario) {
  return {
    usuarioId: Number(formulario.usuarioId),
    comunidadId: Number(formulario.comunidadId),
    curp: formulario.curp.trim()
      ? formulario.curp.trim().toUpperCase()
      : null,
    biografia: formulario.biografia.trim() || null,
    aniosOficio:
      formulario.aniosOficio === ""
        ? null
        : Number(formulario.aniosOficio),
    lengua: formulario.lengua.trim() || null,
    especialidadIds: formulario.especialidadIds.map(Number),
  };
}

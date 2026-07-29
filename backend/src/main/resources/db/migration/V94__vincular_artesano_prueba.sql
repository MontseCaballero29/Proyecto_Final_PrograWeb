INSERT INTO artesano (
    usuario_id,
    comunidad_id,
    biografia,
    anios_oficio,
    lengua,
    estado_validacion
)
SELECT
    usuario.id,
    1,
    'Perfil artesanal de prueba para gestión de talleres y artesanías',
    8,
    'Español',
    'APROBADO'
FROM usuario
WHERE usuario.correo = 'artesano@aripo.gob.mx'
  AND NOT EXISTS (
      SELECT 1
      FROM artesano
      WHERE artesano.usuario_id = usuario.id
  );

INSERT IGNORE INTO artesano_taller (taller_id, artesano_id)
SELECT 1, artesano.id
FROM artesano
INNER JOIN usuario
    ON usuario.id = artesano.usuario_id
WHERE usuario.correo = 'artesano@aripo.gob.mx';

INSERT IGNORE INTO artesano_especialidad (
    artesano_id,
    especialidad_id
)
SELECT artesano.id, 1
FROM artesano
INNER JOIN usuario
    ON usuario.id = artesano.usuario_id
WHERE usuario.correo = 'artesano@aripo.gob.mx';

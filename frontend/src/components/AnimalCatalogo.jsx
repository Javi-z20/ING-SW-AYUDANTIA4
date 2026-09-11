import { useState, useEffect } from 'react';
import { API_URL } from '../api/config';

function AnimalCatalogo() {
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [especies, setEspecies] = useState([]);
  const [recintos, setRecintos] = useState([]);

  const [especieId, setEspecieId] = useState('');
  const [recintoId, setRecintoId] = useState('');

  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [promedio, setPromedio] = useState(null);

  // Estados del formulario de comentarios
  const [autor, setAutor] = useState('');
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [errorComentario, setErrorComentario] = useState('');
  const [mensajeComentario, setMensajeComentario] = useState('');

  // Obtener animales
  useEffect(() => {
    const params = new URLSearchParams();

    if (especieId) {
      params.append('especieId', especieId);
    }

    if (recintoId) {
      params.append('recintoId', recintoId);
    }

    fetch(`${API_URL}/animals?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setAnimales(data);
        setCargando(false);
      })
      .catch(() => {
        setError('No se pudo conectar con el servidor');
        setCargando(false);
      });
  }, [especieId, recintoId]);

  // Obtener especies y recintos
  useEffect(() => {
    fetch(`${API_URL}/especies`)
      .then((res) => res.json())
      .then((data) => {
        setEspecies(data);
      })
      .catch(() => {
        setError('No se pudieron cargar las especies');
      });

    fetch(`${API_URL}/recintos`)
      .then((res) => res.json())
      .then((data) => {
        setRecintos(data);
      })
      .catch(() => {
        setError('No se pudieron cargar los recintos');
      });
  }, []);

  // Obtener comentarios del animal seleccionado
  useEffect(() => {
    if (!animalSeleccionado) {
      setComentarios([]);
      setPromedio(null);
      return;
    }

    fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`)
      .then((res) => res.json())
      .then((data) => {
        setComentarios(data.comentarios);
        setPromedio(data.averageRating);
      })
      .catch(() => {
        setError('No se pudieron cargar los comentarios');
      });
  }, [animalSeleccionado]);

  // Crear comentario
  const handleCrearComentario = (e) => {
    e.preventDefault();

    setErrorComentario('');
    setMensajeComentario('');

    fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        autor,
        calificacion: Number(calificacion),
        comentario,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.detalles?.[0]?.mensaje || 'No se pudo crear el comentario'
          );
        }

        return data;
      })
      .then((data) => {
        // Agregar el nuevo comentario a la lista
        setComentarios((comentariosAnteriores) => [
          data,
          ...comentariosAnteriores,
        ]);

        // Limpiar formulario
        setAutor('');
        setCalificacion(5);
        setComentario('');

        setMensajeComentario('¡Comentario creado correctamente!');

        // Volver a obtener comentarios para actualizar el promedio
        return fetch(
          `${API_URL}/animals/${animalSeleccionado.id}/comments`
        );
      })
      .then((res) => res.json())
      .then((data) => {
        setComentarios(data.comentarios);
        setPromedio(data.averageRating);
      })
      .catch((err) => {
        setErrorComentario(err.message);
      });
  };

  if (cargando) return <p>Cargando animales...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Animales</h2>

      {/* Filtro por especie */}
      <div>
        <label>Filtrar por especie: </label>

        <select
          value={especieId}
          onChange={(e) => setEspecieId(e.target.value)}
        >
          <option value="">Todas las especies</option>

          {especies.map((especie) => (
            <option key={especie.id} value={especie.id}>
              {especie.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por recinto */}
      <div>
        <label>Filtrar por recinto: </label>

        <select
          value={recintoId}
          onChange={(e) => setRecintoId(e.target.value)}
        >
          <option value="">Todos los recintos</option>

          {recintos.map((recinto) => (
            <option key={recinto.id} value={recinto.id}>
              {recinto.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de animales */}
      <ul>
        {animales.map((animal) => (
          <li
            key={animal.id}
            onClick={() => {
              setAnimalSeleccionado(animal);
              setErrorComentario('');
              setMensajeComentario('');
            }}
            style={{ cursor: 'pointer' }}
          >
            {animal.nombre}
          </li>
        ))}
      </ul>

      {/* Detalle del animal seleccionado */}
      {animalSeleccionado && (
        <div>
          <h2>Detalle del animal</h2>

          <p>
            <strong>Nombre:</strong> {animalSeleccionado.nombre}
          </p>

          <p>
            <strong>Edad:</strong> {animalSeleccionado.edad}
          </p>

          <p>
            <strong>Peso:</strong> {animalSeleccionado.peso}
          </p>

          <p>
            <strong>Disponible:</strong>{' '}
            {animalSeleccionado.disponible ? 'Sí' : 'No'}
          </p>

          <p>
            <strong>Especie:</strong>{' '}
            {animalSeleccionado.especie?.nombre}
          </p>

          <p>
            <strong>Recinto:</strong>{' '}
            {animalSeleccionado.recinto?.nombre}
          </p>

          <h3>Comentarios</h3>

          {promedio !== null && (
            <p>
              <strong>Calificación promedio:</strong> {promedio}
            </p>
          )}

          {comentarios.length === 0 ? (
            <p>Este animal todavía no tiene comentarios.</p>
          ) : (
            <ul>
              {comentarios.map((comentario) => (
                <li key={comentario.id}>
                  <strong>{comentario.autor}</strong>
                  {' — '}
                  ⭐ {comentario.calificacion}
                  <p>{comentario.comentario}</p>
                </li>
              ))}
            </ul>
          )}

          {/* Formulario para crear comentario */}
          <h3>Agregar comentario</h3>

          <form onSubmit={handleCrearComentario}>
            <div>
              <label>Nombre: </label>
              <input
                type="text"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>

            <br />

            <div>
              <label>Calificación: </label>
              <select
                value={calificacion}
                onChange={(e) => setCalificacion(e.target.value)}
              >
                <option value="1">⭐ 1</option>
                <option value="2">⭐ 2</option>
                <option value="3">⭐ 3</option>
                <option value="4">⭐ 4</option>
                <option value="5">⭐ 5</option>
              </select>
            </div>

            <br />

            <div>
              <label>Comentario: </label>
              <br />

              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe tu comentario"
                rows="4"
                cols="40"
              />
            </div>

            <br />

            <button type="submit">
              Publicar comentario
            </button>
          </form>

          {/* Mensaje de éxito */}
          {mensajeComentario && (
            <p style={{ color: 'green' }}>
              {mensajeComentario}
            </p>
          )}

          {/* Error 400 de Zod */}
          {errorComentario && (
            <p style={{ color: 'red' }}>
              Error: {errorComentario}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default AnimalCatalogo;

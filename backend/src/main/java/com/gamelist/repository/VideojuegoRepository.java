package com.gamelist.repository;

import com.gamelist.model.EstadoJuego;
import com.gamelist.model.Videojuego;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideojuegoRepository extends JpaRepository<Videojuego, Long> {

    List<Videojuego> findByTituloContainingIgnoreCase(String titulo);

    List<Videojuego> findByEstado(EstadoJuego estado);

    List<Videojuego> findByCategoriaId(Long categoriaId);

    List<Videojuego> findByPlataformaId(Long plataformaId);

    List<Videojuego> findByTituloContainingIgnoreCaseAndEstado(String titulo, EstadoJuego estado);

    List<Videojuego> findByTituloContainingIgnoreCaseAndCategoriaId(String titulo, Long categoriaId);

    List<Videojuego> findByEstadoAndCategoriaId(EstadoJuego estado, Long categoriaId);

    List<Videojuego> findByTituloContainingIgnoreCaseAndEstadoAndCategoriaId(String titulo, EstadoJuego estado, Long categoriaId);
}

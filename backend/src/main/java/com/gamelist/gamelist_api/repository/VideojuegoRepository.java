package com.gamelist.gamelist_api.repository;

import com.gamelist.gamelist_api.model.Videojuego;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideojuegoRepository extends JpaRepository<Videojuego, Long> {

    List<Videojuego> findByCategoriaId(Long categoriaId);
}

package com.gamelist.gamelist_api.repository;

import com.gamelist.gamelist_api.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}

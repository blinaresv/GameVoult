package com.gamelist.gamelist_api.service;

import com.gamelist.gamelist_api.model.Videojuego;
import com.gamelist.gamelist_api.repository.VideojuegoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VideojuegoService {

    private final VideojuegoRepository videojuegoRepository;

    public VideojuegoService(VideojuegoRepository videojuegoRepository) {
        this.videojuegoRepository = videojuegoRepository;
    }

    // LISTAR TODOS
    public List<Videojuego> listarVideojuegos() {
        return videojuegoRepository.findAll();
    }

    // CREAR
    public Videojuego crearVideojuego(Videojuego videojuego) {
        return videojuegoRepository.save(videojuego);
    }

    // OBTENER POR ID
    public Videojuego obtenerPorId(Long id) {
        return videojuegoRepository.findById(id).orElse(null);
    }

    // ACTUALIZAR (AQUÍ ESTABA TU ERROR)
    public Videojuego actualizarVideojuego(Long id, Videojuego nuevo) {

        Optional<Videojuego> optional = videojuegoRepository.findById(id);

        if (optional.isPresent()) {
            Videojuego existente = optional.get();

            existente.setTitulo(nuevo.getTitulo());
            existente.setPlataforma(nuevo.getPlataforma());
            existente.setAnio(nuevo.getAnio());
            existente.setEstado(nuevo.getEstado());

            // MUY IMPORTANTE (esto te daba el error 500)
            if (nuevo.getCategoria() != null) {
                existente.setCategoria(nuevo.getCategoria());
            }

            return videojuegoRepository.save(existente);
        }

        return null;
    }

    // ELIMINAR
    public void eliminarVideojuego(Long id) {
        videojuegoRepository.deleteById(id);
    }

    // FILTRAR POR CATEGORIA
    public List<Videojuego> listarPorCategoria(Long categoriaId) {
        return videojuegoRepository.findByCategoriaId(categoriaId);
    }
}
package com.gamelist.controller;

import com.gamelist.model.EstadoJuego;
import com.gamelist.model.Videojuego;
import com.gamelist.repository.VideojuegoRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/videojuegos")
public class VideojuegoController {

    private final VideojuegoRepository repo;

    public VideojuegoController(VideojuegoRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Videojuego> listar(
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) EstadoJuego estado,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Long plataformaId) {

        if (titulo != null && estado != null && categoriaId != null) {
            return repo.findByTituloContainingIgnoreCaseAndEstadoAndCategoriaId(titulo, estado, categoriaId);
        }
        if (titulo != null && estado != null) {
            return repo.findByTituloContainingIgnoreCaseAndEstado(titulo, estado);
        }
        if (titulo != null && categoriaId != null) {
            return repo.findByTituloContainingIgnoreCaseAndCategoriaId(titulo, categoriaId);
        }
        if (titulo != null) {
            return repo.findByTituloContainingIgnoreCase(titulo);
        }
        if (estado != null && categoriaId != null) {
            return repo.findByEstadoAndCategoriaId(estado, categoriaId);
        }
        if (estado != null) {
            return repo.findByEstado(estado);
        }
        if (categoriaId != null) {
            return repo.findByCategoriaId(categoriaId);
        }
        if (plataformaId != null) {
            return repo.findByPlataformaId(plataformaId);
        }
        return repo.findAll();
    }

    @GetMapping("/estadisticas")
    public Map<String, Long> estadisticas() {
        List<Videojuego> todos = repo.findAll();
        Map<String, Long> conteo = new java.util.LinkedHashMap<>();
        for (EstadoJuego estado : EstadoJuego.values()) {
            long count = todos.stream().filter(v -> v.getEstado() == estado).count();
            conteo.put(estado.name(), count);
        }
        conteo.put("TOTAL", (long) todos.size());
        return conteo;
    }

    @GetMapping("/{id}")
    public Videojuego obtener(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Videojuego con id " + id + " no encontrado"));
    }

    @PostMapping
    public ResponseEntity<Videojuego> crear(@Valid @RequestBody Videojuego videojuego) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(videojuego));
    }

    @PutMapping("/{id}")
    public Videojuego actualizar(@PathVariable Long id, @Valid @RequestBody Videojuego datos) {
        Videojuego existente = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Videojuego con id " + id + " no encontrado"));

        existente.setTitulo(datos.getTitulo());
        existente.setAnio(datos.getAnio());
        existente.setDescripcion(datos.getDescripcion());
        existente.setImagenUrl(datos.getImagenUrl());
        existente.setEstado(datos.getEstado());
        existente.setCategoria(datos.getCategoria());
        existente.setPlataforma(datos.getPlataforma());
        return repo.save(existente);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Videojuego con id " + id + " no encontrado");
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

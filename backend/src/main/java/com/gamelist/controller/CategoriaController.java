package com.gamelist.controller;

import com.gamelist.model.Categoria;
import com.gamelist.repository.CategoriaRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaRepository repo;

    public CategoriaController(CategoriaRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Categoria> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Categoria obtener(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Categoría con id " + id + " no encontrada"));
    }

    @PostMapping
    public ResponseEntity<Categoria> crear(@Valid @RequestBody Categoria categoria) {
        repo.findByNombreIgnoreCase(categoria.getNombre()).ifPresent(existing -> {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Ya existe una categoría con el nombre '" + categoria.getNombre() + "'");
        });
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(categoria));
    }

    @PutMapping("/{id}")
    public Categoria actualizar(@PathVariable Long id, @Valid @RequestBody Categoria datos) {
        Categoria existente = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Categoría con id " + id + " no encontrada"));

        repo.findByNombreIgnoreCase(datos.getNombre())
                .filter(c -> !c.getId().equals(id))
                .ifPresent(c -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT, "Ya existe una categoría con el nombre '" + datos.getNombre() + "'");
                });

        existente.setNombre(datos.getNombre());
        return repo.save(existente);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Categoría con id " + id + " no encontrada");
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

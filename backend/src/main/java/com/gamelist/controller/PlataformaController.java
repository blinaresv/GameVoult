package com.gamelist.controller;

import com.gamelist.model.Plataforma;
import com.gamelist.repository.PlataformaRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/plataformas")
public class PlataformaController {

    private final PlataformaRepository repo;

    public PlataformaController(PlataformaRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Plataforma> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Plataforma obtener(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Plataforma con id " + id + " no encontrada"));
    }

    @PostMapping
    public ResponseEntity<Plataforma> crear(@Valid @RequestBody Plataforma plataforma) {
        repo.findByNombreIgnoreCase(plataforma.getNombre()).ifPresent(existing -> {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Ya existe una plataforma con el nombre '" + plataforma.getNombre() + "'");
        });
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(plataforma));
    }

    @PutMapping("/{id}")
    public Plataforma actualizar(@PathVariable Long id, @Valid @RequestBody Plataforma datos) {
        Plataforma existente = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Plataforma con id " + id + " no encontrada"));

        repo.findByNombreIgnoreCase(datos.getNombre())
                .filter(p -> !p.getId().equals(id))
                .ifPresent(p -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT, "Ya existe una plataforma con el nombre '" + datos.getNombre() + "'");
                });

        existente.setNombre(datos.getNombre());
        existente.setFabricante(datos.getFabricante());
        return repo.save(existente);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Plataforma con id " + id + " no encontrada");
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

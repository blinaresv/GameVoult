package com.gamelist.controller;

import com.gamelist.model.Resena;
import com.gamelist.model.Videojuego;
import com.gamelist.repository.ResenaRepository;
import com.gamelist.repository.VideojuegoRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/resenas")
public class ResenaController {

    private final ResenaRepository resenaRepo;
    private final VideojuegoRepository videojuegoRepo;

    public ResenaController(ResenaRepository resenaRepo, VideojuegoRepository videojuegoRepo) {
        this.resenaRepo = resenaRepo;
        this.videojuegoRepo = videojuegoRepo;
    }

    @GetMapping("/videojuego/{videojuegoId}")
    public List<Resena> listarPorVideojuego(@PathVariable Long videojuegoId) {
        if (!videojuegoRepo.existsById(videojuegoId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Videojuego con id " + videojuegoId + " no encontrado");
        }
        return resenaRepo.findByVideojuegoId(videojuegoId);
    }

    @PostMapping
    public ResponseEntity<Resena> crear(@Valid @RequestBody ResenaRequest request) {
        Videojuego videojuego = videojuegoRepo.findById(request.videojuegoId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Videojuego con id " + request.videojuegoId() + " no encontrado"));

        Resena resena = new Resena();
        resena.setComentario(request.comentario());
        resena.setAutor(request.autor());
        resena.setPuntuacion(request.puntuacion());
        resena.setVideojuego(videojuego);

        return ResponseEntity.status(HttpStatus.CREATED).body(resenaRepo.save(resena));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!resenaRepo.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Reseña con id " + id + " no encontrada");
        }
        resenaRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    record ResenaRequest(
            Long videojuegoId,
            @jakarta.validation.constraints.NotBlank String comentario,
            @jakarta.validation.constraints.NotBlank String autor,
            @jakarta.validation.constraints.Min(1) @jakarta.validation.constraints.Max(10) Integer puntuacion
    ) {}
}

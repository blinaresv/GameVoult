package com.gamelist.gamelist_api.controller;

import com.gamelist.gamelist_api.model.Videojuego;
import com.gamelist.gamelist_api.service.VideojuegoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/videojuegos")
@CrossOrigin(origins = "*")
public class VideojuegoController {

    private final VideojuegoService videojuegoService;

    public VideojuegoController(VideojuegoService videojuegoService) {
        this.videojuegoService = videojuegoService;
    }

    // GET TODOS
    @GetMapping
    public List<Videojuego> listar() {
        return videojuegoService.listarVideojuegos();
    }

    // GET POR ID
    @GetMapping("/{id}")
    public Videojuego obtener(@PathVariable Long id) {
        return videojuegoService.obtenerPorId(id);
    }

    // POST
    @PostMapping
    public Videojuego crear(@RequestBody Videojuego videojuego) {
        return videojuegoService.crearVideojuego(videojuego);
    }

    // PUT (ACTUALIZAR)
    @PutMapping("/{id}")
    public Videojuego actualizar(@PathVariable Long id, @RequestBody Videojuego videojuego) {
        return videojuegoService.actualizarVideojuego(id, videojuego);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        videojuegoService.eliminarVideojuego(id);
    }

    // GET POR CATEGORIA
    @GetMapping("/categoria/{categoriaId}")
    public List<Videojuego> listarPorCategoria(@PathVariable Long categoriaId) {
        return videojuegoService.listarPorCategoria(categoriaId);
    }
}
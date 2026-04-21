package com.gamelist.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@NoArgsConstructor
@Entity
@Table(name = "resena")
public class Resena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El comentario es obligatorio")
    @Column(length = 2000)
    private String comentario;

    @NotBlank(message = "El autor es obligatorio")
    private String autor;

    @NotNull
    @Min(value = 1, message = "La puntuación mínima es 1")
    @Max(value = 10, message = "La puntuación máxima es 10")
    private Integer puntuacion;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "videojuego_id", nullable = false)
    private Videojuego videojuego;
}

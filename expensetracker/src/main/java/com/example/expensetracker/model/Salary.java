package com.example.expensetracker.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

// Salary.java
@Entity
@Getter
@Setter
public class Salary {
    @Id
    private Long id = 1L; // Singleton salary row
    private Double amount;

    // Getters & setters
}

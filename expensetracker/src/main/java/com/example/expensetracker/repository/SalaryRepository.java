package com.example.expensetracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.expensetracker.model.Salary;

// SalaryRepository.java
public interface SalaryRepository extends JpaRepository<Salary, Long> {}

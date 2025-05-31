package com.example.expensetracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.expensetracker.model.Salary;
import com.example.expensetracker.repository.SalaryRepository;

// SalaryService.java
@Service
public class SalaryService {
    @Autowired
    private SalaryRepository repo;

    public Salary getSalary() {
        return repo.findById(1L).orElseGet(() -> {
            Salary s = new Salary();
            s.setAmount(0.0);
            repo.save(s);
            return s;
        });
    }
    public Salary updateSalary(Double amount) {
        Salary s = getSalary();
        s.setAmount(amount);
        return repo.save(s);
    }
}

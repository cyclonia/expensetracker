package com.example.expensetracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.expensetracker.model.Salary;
import com.example.expensetracker.service.SalaryService;

// SalaryController.java
@RestController
@RequestMapping("/api/salary")
@CrossOrigin(origins = "http://localhost:3000")
public class SalaryController {
	@Autowired
	private SalaryService salaryService;

	@GetMapping
	public Salary getSalary() {
		return salaryService.getSalary();
	}

	@PostMapping
	public Salary setSalary(@RequestBody Salary salary) {
		return salaryService.updateSalary(salary.getAmount());
	}

	// Add this PUT mapping for update
	@PutMapping
	public Salary updateSalary(@RequestBody Salary salary) {
		return salaryService.updateSalary(salary.getAmount());
	}
}

package com.example.expensetracker.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.expensetracker.model.Expense;
import com.example.expensetracker.service.ExpenseService;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*") // Allow frontend access
public class ExpenseController {

	private final ExpenseService service;

	public ExpenseController(ExpenseService service) {
		this.service = service;
	}

	@GetMapping
	public List<Expense> getAllExpenses() {
		return service.getAllExpenses();
	}

	@PostMapping
	public Expense addExpense(@RequestBody Expense expense) {
		return service.addExpense(expense);
	}

	@DeleteMapping
	public ResponseEntity<Void> deleteAllExpenses() {
		service.deleteAll();
		return ResponseEntity.noContent().build();
	}

}

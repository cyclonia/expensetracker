package com.example.expensetracker.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.expensetracker.model.Expense;
import com.example.expensetracker.repository.ExpenseRepository;

@Service
public class ExpenseService {

	private final ExpenseRepository repository;

	public ExpenseService(ExpenseRepository repository) {
		this.repository = repository;
	}

	public List<Expense> getAllExpenses() {
		return repository.findAll();
	}

	public Expense addExpense(Expense expense) {
		return repository.save(expense);
	}

	public void deleteAll() {
		repository.deleteAll();
	}

	public Optional<Expense> getById(Long id) {
		return repository.findById(id);
	}

	public Expense save(Expense expense) {
		return repository.save(expense);
	}

	public void delete(Long id) {
		repository.deleteById(id);
	}

}

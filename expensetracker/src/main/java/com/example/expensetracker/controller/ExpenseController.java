package com.example.expensetracker.controller;

import java.awt.Color;
import java.util.List;
import java.util.Optional;
import java.util.function.BiFunction;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.expensetracker.model.Expense;
import com.example.expensetracker.model.Salary;
import com.example.expensetracker.service.ExpenseService;
import com.example.expensetracker.service.SalaryService;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*") // Allow frontend access
public class ExpenseController {
	@Autowired
	private final ExpenseService service;
	@Autowired
	private SalaryService salaryService;
	

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

	@PutMapping("/{id}")
	public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense updatedExpense) {
		Optional<Expense> optionalExpense = service.getById(id);
		if (optionalExpense.isPresent()) {
			Expense expense = optionalExpense.get();
			expense.setDescription(updatedExpense.getDescription());
			expense.setAmount(updatedExpense.getAmount());
			expense.setDate(updatedExpense.getDate());
			service.save(expense);
			return ResponseEntity.ok(expense);
		} else {
			return ResponseEntity.notFound().build();
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
		service.delete(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/report/pdf")
	public void downloadPdfReport(HttpServletResponse response) throws Exception {
		response.setContentType("application/pdf");
		response.setHeader("Content-Disposition", "attachment; filename=expense-report.pdf");

		List<Expense> expenses = service.getAllExpenses();
		double totalAmount = expenses.stream().mapToDouble(Expense::getAmount).sum();

		// ---- You must fetch salary and calculate remaining (adapt to your service/db)
		// ----
		double salary = 0;
		if (salaryService != null) { // replace with your way of fetching salary
			Salary s = salaryService.getSalary();
			salary = s != null ? s.getAmount() : 0;
		}
		double remaining = salary - totalAmount;
		// ----------------------------------------------------------------------------

		Document document = new Document();
		PdfWriter.getInstance(document, response.getOutputStream());
		document.open();

		// Helper to make a "tile" cell
		BiFunction<String, Color, PdfPTable> makeTile = (text, color) -> {
			PdfPTable table = new PdfPTable(1);
			table.setWidthPercentage(100);
			PdfPCell cell = new PdfPCell(
					new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.WHITE)));
			cell.setHorizontalAlignment(Element.ALIGN_CENTER);
			cell.setPadding(18f);
			cell.setBackgroundColor(color);
			cell.setBorder(Rectangle.NO_BORDER);
			table.addCell(cell);
			table.setSpacingAfter(16f);
			return table;
		};

		// Salary Tile (blue)
		document.add(makeTile.apply("Salary: ₹" + String.format("%.2f", salary), new Color(37, 99, 235))); // Tailwind
																											// blue-600
		// Remaining Tile (gold/green)
		document.add(makeTile.apply("Remaining: ₹" + String.format("%.2f", remaining),
				remaining >= 0 ? new Color(16, 185, 129) : new Color(251, 191, 36))); // green or gold

		// Expense Tiles (use nice pastel colors)
		Color[] colors = { new Color(255, 173, 173), // red
				new Color(173, 216, 230), // light blue
				new Color(196, 255, 191), // green
				new Color(255, 214, 165), // orange
				new Color(189, 178, 255), // purple
				new Color(255, 198, 255), // pink
				new Color(250, 255, 180) // yellow
		};
		int i = 0;
		for (Expense exp : expenses) {
			Color bg = colors[i++ % colors.length];
			String expText = exp.getDescription() + "\n₹" + String.format("%.2f", exp.getAmount()) + "   |   "
					+ exp.getDate();
			document.add(makeTile.apply(expText, bg));
		}

		document.close();
	}

}

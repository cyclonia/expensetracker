import html2pdf from 'html2pdf.js';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
	const [expenses, setExpenses] = useState([]);
	const [description, setDescription] = useState('');
	const [amount, setAmount] = useState('');
	const [searchText, setSearchText] = useState('');
	const [salary, setSalary] = useState(0);
	const [salaryInput, setSalaryInput] = useState('');
	const [editMode, setEditMode] = useState(false);
	const [editId, setEditId] = useState(null);
	const [editDescription, setEditDescription] = useState('');
	const [editAmount, setEditAmount] = useState('');
	const [editDate, setEditDate] = useState('');
	const [showConfirm, setShowConfirm] = useState(false);
	const [expenseToDelete, setExpenseToDelete] = useState(null);
	const [exporting, setExporting] = useState(false);




	useEffect(() => {
		fetchSalary();
		fetchExpenses();
	}, []);

	const fetchExpenses = async () => {
		try {
			const res = await axios.get('http://localhost:8080/api/expenses');
			setExpenses(Array.isArray(res.data) ? res.data : []);
		} catch (error) {
			console.error('Failed to fetch expenses:', error);
		}
	};

	const fetchSalary = async () => {
		try {
			const res = await axios.get('http://localhost:8080/api/salary');
			setSalary(res.data.amount || 0);
		} catch (error) {
			console.error('Failed to fetch salary:', error);
		}
	};

	const setNewSalary = async () => {
		try {
			await axios.post('http://localhost:8080/api/salary', { amount: parseFloat(salaryInput) || 0 });
			setSalary(parseFloat(salaryInput) || 0);
			setSalaryInput('');
		} catch (error) {
			console.error('Failed to set salary:', error);
		}
	};

	const updateSalary = async () => {
		try {
			await axios.put('http://localhost:8080/api/salary', { amount: parseFloat(salaryInput) || 0 });
			setSalary(parseFloat(salaryInput) || 0);
			setSalaryInput('');
			setEditMode(false);
		} catch (error) {
			console.error('Failed to update salary:', error);
		}
	};



	const addExpense = async () => {
		if (!description || isNaN(parseFloat(amount))) return;

		try {
			const newExpense = {
				description,
				amount: parseFloat(amount),
				date: new Date().toISOString().split('T')[0],
			};
			await axios.post('http://localhost:8080/api/expenses', newExpense);
			setDescription('');
			setAmount('');
			fetchExpenses();
		} catch (error) {
			console.error('Failed to add expense:', error);
		}
	};

	const totalAmount = expenses.reduce((sum, exp) => {
		return sum + (parseFloat(exp.amount) || 0);
	}, 0);
	const remaining = salary - totalAmount;
	// Data for the summary bar
	const summaryChartData = [
		{
			name: "Account",
			Spent: totalAmount,
			Remaining: remaining > 0 ? remaining : 0,
		}
	];

	const pieChartData = [
		{ name: "Spent", value: totalAmount },
		{ name: "Remaining", value: remaining > 0 ? remaining : 0 },
	];


	const monthlyData = expenses.reduce((acc, exp) => {
		const month = new Date(exp.date).toLocaleString('default', { month: 'short' });
		acc[month] = (acc[month] || 0) + (parseFloat(exp.amount) || 0);
		return acc;
	}, {});

	const clearAllExpenses = async () => {
		try {
			await axios.delete('http://localhost:8080/api/expenses');
			setExpenses([]);
		} catch (error) {
			console.error('Failed to clear expenses:', error);
		}
	};





	const chartData = Object.entries(monthlyData).map(([name, amount]) => ({
		name,
		amount,
	}));

	const getRandomColor = () => {
		const colors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#a0c4ff', '#bdb2ff', '#ffc6ff'];
		return colors[Math.floor(Math.random() * colors.length)];
	};
	const filteredExpenses = expenses.filter((exp) =>
		exp.description.toLowerCase().includes(searchText.toLowerCase())
	);


	const startEdit = (exp) => {
		setEditId(exp.id || exp._id);
		setEditDescription(exp.description);
		setEditAmount(exp.amount);
		setEditDate(exp.date);
	};

	const cancelEdit = () => {
		setEditId(null);
		setEditDescription('');
		setEditAmount('');
		setEditDate('');
	};

	const saveEdit = async (id) => {
		try {
			await axios.put(`http://localhost:8080/api/expenses/${id}`, {
				description: editDescription,
				amount: parseFloat(editAmount),
				date: editDate,
			});
			cancelEdit();
			fetchExpenses();
		} catch (error) {
			console.error('Failed to update expense:', error);
		}
	};

	const deleteExpense = async (id, confirm = true) => {
		if (confirm && !window.confirm('Delete this expense?')) return;
		try {
			await axios.delete(`http://localhost:8080/api/expenses/${id}`);
			fetchExpenses();
		} catch (error) {
			console.error('Failed to delete expense:', error);
		}
	};




	const reportRef = useRef();

	const downloadPdf = () => {
		setExporting(true);         // 1. Enable export mode
		setTimeout(() => {          // 2. Give React time to render Pie inside report
			if (reportRef.current) {
				html2pdf()
					.set({
						margin: 0.3,
						filename: 'expense-report.pdf',
						image: { type: 'jpeg', quality: 0.98 },
						html2canvas: { scale: 2, useCORS: true },
						jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
					})
					.from(reportRef.current)
					.save()
					.then(() => setExporting(false));  // 3. Restore normal mode after PDF
			}
		}, 250);
	};





	return (
		<div className="app-container">
			<h2>Expense Tracker</h2>

			<div ref={reportRef}>


				{exporting && (
					<div style={{ margin: "30px auto", width: 320, background: "#fff", borderRadius: 16 }}>
						<ResponsiveContainer width={300} height={210}>
							<PieChart>
								<Pie
									data={pieChartData}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={90}
									innerRadius={45}
									label
								>
									<Cell key="spent" fill="#f87171" />
									<Cell key="remaining" fill="#34d399" />
								</Pie>
								<Tooltip />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</div>
				)}


				<div className="salary-bar">
					<button onClick={downloadPdf} className="pdf-download-btn">
						Download PDF Report
					</button>


					{editMode ? (
						<>
							<input
								type="number"
								placeholder="Enter salary"
								value={salaryInput}
								onChange={(e) => setSalaryInput(e.target.value)}
								className="salary-input"
							/>
							<button onClick={updateSalary} className="set-salary-btn">Update Salary</button>
							<button onClick={() => setEditMode(false)} className="set-salary-btn" style={{ background: '#ccc', color: '#222' }}>Cancel</button>
						</>
					) : (
						<>
							<span className="salary-display">Current Salary: ₹{salary.toFixed(2)}</span>
							<button onClick={() => setEditMode(true)} className="set-salary-btn">Edit Salary</button>
						</>
					)}
				</div>

				<div className="remaining-tile">
					Remaining: ₹{remaining.toFixed(2)}
				</div>



				<div className="main-content">
					<div className="left-pane">
						<div className="expense-form">
							<input
								type="text"
								placeholder="Description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
							<input
								type="number"
								placeholder="Amount"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
							/>
							<button onClick={addExpense}>Add</button>
							<button onClick={clearAllExpenses} className="clear-button">Clear All</button>
						</div>


						<div className="total-tile">
							Total Spent: ₹{totalAmount.toFixed(2)}
						</div>
						<div className="piechart-corner">
							<ResponsiveContainer width={210} height={210}>
								<PieChart>
									<Pie
										data={pieChartData}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										outerRadius={90}
										innerRadius={45}
										label
									>
										<Cell key="spent" fill="#f87171" />
										<Cell key="remaining" fill="#34d399" />
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>

				<div className="search-bar">
					<input
						type="text"
						placeholder="Search expenses..."
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
					/>
				</div>


				<div className="right-pane">
					<div className="expense-tiles">
						{filteredExpenses.map((exp, index) =>
							(editId === (exp.id || exp._id)) ? (
								<div
									key={exp.id || exp._id || index}
									className="expense-card expense-card-editing"
									style={{
										backgroundColor: '#f1f5f9', // Subtle highlight
										boxShadow: '0 4px 16px rgba(37,99,235,0.08)'
									}}
								>
									<input
										type="text"
										value={editDescription}
										onChange={(e) => setEditDescription(e.target.value)}
										className="edit-input"
										placeholder="Description"
										autoFocus
									/>
									<input
										type="number"
										value={editAmount}
										onChange={(e) => setEditAmount(e.target.value)}
										className="edit-input"
										placeholder="Amount"
									/>
									<input
										type="date"
										value={editDate}
										onChange={(e) => setEditDate(e.target.value)}
										className="edit-input"
										placeholder="Date"
									/>
									<div className="edit-actions">
										<button onClick={() => saveEdit(exp.id || exp._id)} className="edit-save">Save</button>
										<button onClick={cancelEdit} className="edit-cancel">Cancel</button>
									</div>
								</div>
							) : (
								<div
									key={exp.id || exp._id || index}
									className="expense-card"
									style={{ backgroundColor: getRandomColor(), cursor: 'pointer', position: 'relative' }}
									onClick={() => startEdit(exp)}
									title="Click to edit"
								>
									{/* Delete Button */}
									<button
										className="delete-expense-btn"
										onClick={e => {
											e.stopPropagation();
											setExpenseToDelete(exp.id || exp._id);
											setShowConfirm(true);
										}}

										title="Delete expense"
									>×</button>
									<strong>{exp.description}</strong>
									<p className="expense-amount">₹{parseFloat(exp.amount) || 0}</p>
									<small>{exp.date}</small>
								</div>
							)
						)}




					</div>
				</div>

				{showConfirm && (
					<div className="confirm-overlay">
						<div className="confirm-dialog">
							<p>Are you sure you want to delete this expense?</p>
							<div className="confirm-actions">
								<button
									className="confirm-btn confirm-yes"
									onClick={async () => {
										await deleteExpense(expenseToDelete, false); // false: skip confirm
										setShowConfirm(false);
										setExpenseToDelete(null);
									}}
								>Yes, Delete</button>
								<button
									className="confirm-btn confirm-no"
									onClick={() => {
										setShowConfirm(false);
										setExpenseToDelete(null);
									}}
								>Cancel</button>
							</div>
						</div>
					</div>
				)}


			</div>
		</div >
	);
}

export default App;

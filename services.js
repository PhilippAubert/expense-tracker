import Table from "cli-table3";

import { writeFile } from "fs/promises";
import { initializeEntity, loadExpenses } from "./modules.js";
import { getMonth, validateAmount, addAllAmounts } from "./utils.js";

export const saveExpense = async (options) => {

	if (!(await validateAmount(options.amount))) {
		return;
	}

	const expensesFromFile = await loadExpenses();

	if (expensesFromFile.length === 0) {
		const initializedEntity = await initializeEntity(options);
		await writeFile("./expenses.json", JSON.stringify(initializedEntity, null, 2));
	}

	const latestId = expensesFromFile[expensesFromFile.length - 1];
	const newId = latestId ? latestId.id + 1 : 1;

	const newExpense = {
		id: newId,
		...options,
		time: new Date().toISOString()
	};

	if (newExpense) {
		expensesFromFile.push(newExpense);
		try {
		  await writeFile("./expenses.json", JSON.stringify(expensesFromFile, null, 2));
		  process.stdout.write("Expense added!\n");
		} catch (err) {
		  console.error("Could not save expense:", err);
		}
	}
};

export const deleteExpense = async (options) => {
	const allExpenses = await loadExpenses();
	const idToDelete = Number(options.id);
	const filteredExpenses = allExpenses.filter(expense => expense.id !== idToDelete);
	await writeFile("./expenses.json", JSON.stringify(filteredExpenses, null, 2));
	process.stdout.write("Expense deleted successfully \n");
}


export const listAll = async () => {
	const allExpenses = await loadExpenses();
	const table = new Table({
		head: ["ID", "Date", "Description", "Amount"],
	});

	allExpenses.forEach(e => {
		table.push([
			e.id,
			e.time.slice(0,10),
			e.description,
			e.amount
		]);
	});
  	process.stdout.write(table.toString());
};

export const sumExpensesByMonth = (allExpenses, month) => {

	const monthNum = Number(month);
	const expensesByMonth = allExpenses.filter(
		expense => getMonth(expense.time) === monthNum
	);

	if (!expensesByMonth.length) {
		return process.stdout.write("No expenses for this month!\n");
	}

	const sum = addAllAmounts(expensesByMonth);
	process.stdout.write(`Total expenses for this month: ${sum}\n`);
};

export const sumExpenses = async (options) => {
	const allExpenses = await loadExpenses();

	if (!allExpenses.length) {
		return process.stdout.write("No expenses found\n");
	}

	if (options.month) {
		return sumExpensesByMonth(allExpenses, options.month);
	}

	const sum = addAllAmounts(allExpenses);
	process.stdout.write(`Total expenses so far: ${sum}\n`);
};

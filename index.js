#!/usr/bin/env node

import { Command } from "commander";
import Table from "cli-table3";

import { writeFile, readFile } from "fs/promises";

const program = new Command();

const initializeEntity = async (options) => {
	try {			
		return  {
			id: 1,
			...options,
			time: new Date().toISOString()
		  };			
	} catch (e) {
		process.stderr.write(e);
		process.stderr.write("error while writing file");
		return [];
	}
};

const validateAmount = async amount => 
	isNaN(amount) ? (console.error("enter a valid numeric amount!"), false) : true;


const getMonth = ts => new Date(ts).getMonth() + 1;
  

const saveExpense = async (options) => {

	if (!(await validateAmount(options.amount))) {
		return;
	}

	const expensesFromFile = await loadExpenses();

	if (!expensesFromFile) {
		const initializedEntity = await initializeEntity(options);
		await writeFile("./expenses.json", JSON.stringify(initializedEntity, null, 2));
	}

	const newExpense = {
		id: expensesFromFile.length + 1,
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

const loadExpenses = async () => {
	try {
		const fileContentRaw = await readFile("./expenses.json");
		try {
			const content = JSON.parse(fileContentRaw);
			return content;
		} catch(e) {
			if (!content || typeof content !== "File structure damaged \n") {
				process.stderr.write(e);
				return [];
			}
		}
	} catch (e) {
		if (e.code === "ENOENT") {
			process.stdout.write("File Expenses.json doesn't exist \n");
			return []; 
		} 
		process.stderr.write("Unexpected error trying to import file! \n")
	}
};


const deleteExpense = async (options) => {
	const allExpenses = await loadExpenses();
	const idToDelete = Number(options.id);
	const filteredExpenses = allExpenses.filter(expense => expense.id !== idToDelete);
	await writeFile("./expenses.json", JSON.stringify(filteredExpenses, null, 2));
	process.stdout.write("Expense deleted successfully \n");
}


const listAll = async () => {
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

const addAllAmounts = (expenses) =>
	expenses.reduce((total, { amount }) => total + Number(amount), 0);

const sumExpensesByMonth = (allExpenses, month) => {
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

const sumExpenses = async (options) => {
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

program
	.command("add")
	.description("create something")
	.option("--description <expense>")
	.option("--amount, <amount>")
	.action((options)=> saveExpense(options))

program
	.command("delete")
	.description("delete one expense")
	.option("--id, <id>")
	.action((options) => deleteExpense(options));

program
	.command("list")
	.description("list all expenses")
	.action(()=>listAll());

program
	.command("summary")
	.description("sum all expenses")
	.option("--month, <month>")
	.action((options)=>sumExpenses(options));



program.parse();



#!/usr/bin/env node

import { Command } from 'commander';

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
		console.error(e);
		console.error("error while writing file");
		return [];
	}
}

const saveExpense = async (options) => {
	const expensesFromFile = await loadExpenses();

	if (!expensesFromFile) {
		const initializedEntity = await initializeEntity(options);
		await writeFile("./expenses.json", JSON.stringify(initializedEntity));
	}

	const newExpense = {
		id: expensesFromFile.length + 1,
		...options,
		time: new Date().toISOString()
	};

	if (newExpense) {
		expensesFromFile.push(newExpense)
		await writeFile("./expenses.json", JSON.stringify(expensesFromFile, null, 2));
		console.log("Expense added!")
	}
}

const loadExpenses = async () => {
	try {
		const fileContentRaw = await readFile("./expenses.json");
		try {
			const content = JSON.parse(fileContentRaw);
			return content;
		} catch(e) {
			if (!content || typeof content !== 'File structure damaged') {
				console.error(e);
				return [];
			  }

		}
	} catch (e) {
		if (e.code === 'ENOENT') {
			console.log("File doesn't exist");
			return [];
		  } 
		  console.error("Unexpected error trying to import file!")
	} 
}

program
	.command('add')
	.description('create something')
	.option('--description <expense>')
	.option('--amount, <amount>')
	.action((options)=> saveExpense(options))

program.parse();


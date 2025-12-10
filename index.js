#!/usr/bin/env node

import { Command } from "commander";

import { 
	deleteExpense, 
	listAll, 
	saveExpense,
	sumExpenses 
} from "./services.js";

const program = new Command();

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
import { readFile } from "fs/promises";

export const initializeEntity = async (options) => {
	try {			
		return [
			{
				id: 1,
				...options,
				amount: Number(options.amount),
				time: new Date().toISOString(),
			}
		];		
	} catch (e) {
		process.stderr.write(e);
		process.stderr.write("error while writing file");
		return [];
	}
};

export const loadExpenses = async () => {
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
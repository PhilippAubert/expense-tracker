export const getMonth = ts => new Date(ts).getMonth() + 1;


export const validateAmount = async amount => 
	isNaN(amount) ? (console.error("enter a valid numeric amount!"), false) : true;


export const addAllAmounts = (expenses) =>
	expenses.reduce((total, { amount }) => total + Number(amount), 0);

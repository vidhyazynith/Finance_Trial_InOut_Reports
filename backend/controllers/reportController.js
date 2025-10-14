// import Income from "../models/Income.js";
// import Expense from "../models/Expense.js";

// // Income report
// export const getIncomeReport = async (req, res) => {
//   const { from, to } = req.query;
//   const incomes = await Income.find({
//     date: { $gte: new Date(from), $lte: new Date(to) },
//   });
//   res.json(incomes);
// };

// // Expense report
// export const getExpenseReport = async (req, res) => {
//   const { from, to } = req.query;
//   const expenses = await Expense.find({
//     date: { $gte: new Date(from), $lte: new Date(to) },
//   });
//   res.json(expenses);
// };

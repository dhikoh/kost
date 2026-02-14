import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/database';

@Injectable()
export class FinanceService {

    // Create Expense
    async createExpense(tenantId: string, data: any) {
        return prisma.expense.create({
            data: {
                tenantId,
                title: data.title,
                amount: data.amount,
                category: data.category, // e.g., 'Maintenance', 'Utilities', 'Salary'
                expenseDate: new Date(data.expenseDate || new Date()),
            }
        });
    }

    // List Expenses
    async findAllExpenses(tenantId: string) {
        return prisma.expense.findMany({
            where: { tenantId },
            orderBy: { expenseDate: 'desc' }
        });
    }

    // Get Financial Summary (Revenue vs Expense)
    async getSummary(tenantId: string) {
        // 1. Calculate Total Revenue (Paid Invoices)
        // Note: SQLite doesn't support aggregate well with complex where, fetching all for manual sum is safer for now
        const paidInvoices = await prisma.invoice.findMany({
            where: { tenantId, status: 'PAID' },
            select: { amount: true }
        });
        const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

        // 2. Calculate Total Expenses
        const expenses = await prisma.expense.findMany({
            where: { tenantId },
            select: { amount: true }
        });
        const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

        return {
            revenue: totalRevenue,
            expense: totalExpense,
            profit: totalRevenue - totalExpense
        };
    }
}

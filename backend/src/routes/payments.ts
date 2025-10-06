import { Router } from 'express';
import { TreasuryService } from '../services/treasury.service';
import { StacksService } from '../services/stacks.service';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const stacksService = new StacksService();
const treasuryService = new TreasuryService(prisma, stacksService);

// Create new payment
router.post('/create', async (req, res) => {
  try {
    const { businessId, amount, customerEmail, description } = req.body;
    
    // Validation
    if (!businessId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment data' });
    }

    const payment = await treasuryService.processPayment({
      businessId,
      amount: parseFloat(amount),
      customerEmail,
      description
    });

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Get payments for business
router.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const whereClause: any = { businessId };
    if (status) {
      whereClause.status = status;
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        business: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const total = await prisma.payment.count({
      where: whereClause
    });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get single payment
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        business: {
          select: {
            name: true,
            email: true,
            walletAddress: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Confirm payment
router.post('/:paymentId/confirm', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await treasuryService.confirmPayment(paymentId);

    res.json({
      success: true,
      data: payment
    });
  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    if (error.message === 'Payment not found') {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Refund payment
router.post('/:paymentId/refund', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { 
        status: 'REFUNDED',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Payment refund error:', error);
    res.status(500).json({ error: 'Failed to refund payment' });
  }
});

// Get payment analytics
router.get('/business/:businessId/analytics', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 365;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    const analytics = await prisma.payment.groupBy({
      by: ['status'],
      where: {
        businessId,
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    const totalAmount = analytics.reduce((sum, group) => sum + (group._sum.amount || 0), 0);
    const totalCount = analytics.reduce((sum, group) => sum + group._count.id, 0);

    res.json({
      success: true,
      data: {
        period,
        totalAmount,
        totalCount,
        averageAmount: totalCount > 0 ? totalAmount / totalCount : 0,
        byStatus: analytics.map(group => ({
          status: group.status,
          amount: group._sum.amount || 0,
          count: group._count.id
        }))
      }
    });
  } catch (error) {
    console.error('Payment analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch payment analytics' });
  }
});

export default router;
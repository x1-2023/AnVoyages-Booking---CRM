import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async overview() {
    const [bookings, leads, customers] = await Promise.all([
      this.prisma.booking.findMany({
        include: { property: { include: { location: true } }, customer: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.findMany({ include: { customer: true, property: true } }),
      this.prisma.customer.findMany(),
    ]);

    const revenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const profit = bookings.reduce((sum, booking) => sum + booking.profit, 0);
    const leadSources = this.countBy(leads, (lead) => lead.source ?? 'unknown');
    const destinationBookings = this.countBy(bookings, (booking) => booking.locationId);
    const conversionRate = leads.length
      ? Math.round((leads.filter((lead) => lead.status === 'confirmed').length / leads.length) * 100)
      : 0;

    return {
      totals: {
        bookings: bookings.length,
        leads: leads.length,
        customers: customers.length,
        revenue,
        profit,
        conversionRate,
      },
      leadSources,
      destinationBookings,
      recentBookings: bookings.slice(0, 10),
      topCustomers: customers
        .map((customer) => ({
          ...customer,
          totalSpent: bookings
            .filter((booking) => booking.customerId === customer.id)
            .reduce((sum, booking) => sum + booking.totalPrice, 0),
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5),
    };
  }

  private countBy<T>(items: T[], getKey: (item: T) => string) {
    return items.reduce<Record<string, number>>((result, item) => {
      const key = getKey(item);
      result[key] = (result[key] ?? 0) + 1;
      return result;
    }, {});
  }
}

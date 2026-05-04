import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  findAll(status?: string) {
    return this.prisma.lead.findMany({
      where: status ? { status } : undefined,
      include: { customer: true, property: { include: { location: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(body: any) {
    let customerId = body.customerId;
    if (!customerId && body.customer) {
      const customer = body.customer.phone
        ? await this.prisma.customer.upsert({
            where: { phone: body.customer.phone },
            update: body.customer,
            create: body.customer,
          })
        : await this.prisma.customer.create({ data: body.customer });
      customerId = customer.id;
    }

    return this.prisma.lead.create({
      data: {
        customerId,
        propertyId: body.propertyId,
        status: body.status ?? 'new',
        travelDate: body.travelDate ? new Date(`${body.travelDate}T00:00:00.000Z`) : undefined,
        numPeople: Number(body.numPeople ?? 1),
        budget: body.budget ? Number(body.budget) : undefined,
        source: body.source ?? 'manual',
        notes: body.notes,
        assignedTo: body.assignedTo,
      },
      include: { customer: true, property: true },
    });
  }

  async update(id: string, body: any) {
    await this.ensure(id);
    return this.prisma.lead.update({
      where: { id },
      data: {
        ...body,
        travelDate: body.travelDate ? new Date(`${body.travelDate}T00:00:00.000Z`) : undefined,
      },
      include: { customer: true, property: true },
    });
  }

  async remove(id: string) {
    await this.ensure(id);
    await this.prisma.lead.delete({ where: { id } });
    return { message: 'Lead deleted successfully' };
  }

  private async ensure(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }
}

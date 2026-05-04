import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  private readonly customerInclude = {
    bookings: { include: { property: true }, orderBy: { createdAt: 'desc' as const } },
    leads: { include: { property: true }, orderBy: { createdAt: 'desc' as const } },
    communications: { orderBy: { createdAt: 'desc' as const } },
  };

  findAll(q?: string) {
    return this.prisma.customer.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q } },
              { phone: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : undefined,
      include: this.customerInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: this.customerInclude,
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  create(body: any) {
    return this.prisma.customer.create({ data: body });
  }

  async update(id: string, body: any) {
    await this.findOne(id);
    return this.prisma.customer.update({ where: { id }, data: body, include: this.customerInclude });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.customer.delete({ where: { id } });
    return { message: 'Customer deleted successfully' };
  }

  async createCommunication(customerId: string, body: any) {
    await this.findOne(customerId);

    const content = String(body.content ?? '').trim();
    if (!content) throw new BadRequestException('Communication content is required');

    const type = ['note', 'call', 'message'].includes(body.type) ? body.type : 'note';
    const direction = ['internal', 'inbound', 'outbound'].includes(body.direction)
      ? body.direction
      : type === 'note'
        ? 'internal'
        : 'outbound';

    return this.prisma.communication.create({
      data: {
        customerId,
        type,
        direction,
        content,
      },
    });
  }
}

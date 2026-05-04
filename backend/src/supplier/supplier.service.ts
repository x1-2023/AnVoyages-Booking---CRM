import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.supplier.findMany({
      include: { properties: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(body: any) {
    return this.prisma.supplier.create({ data: body });
  }

  async update(id: string, body: any) {
    await this.ensure(id);
    return this.prisma.supplier.update({ where: { id }, data: body });
  }

  async remove(id: string) {
    await this.ensure(id);
    await this.prisma.supplier.delete({ where: { id } });
    return { message: 'Supplier deleted successfully' };
  }

  private async ensure(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }
}

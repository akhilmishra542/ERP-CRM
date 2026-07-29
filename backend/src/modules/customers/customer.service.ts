import { Prisma, CustomerStatus, CustomerType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
}

export async function listCustomers(params: ListParams) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.CustomerWhereInput = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.customerType ? { customerType: params.customerType } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" } },
            { mobile: { contains: params.search, mode: "insensitive" } },
            { businessName: { contains: params.search, mode: "insensitive" } },
            { email: { contains: params.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      followUpNotes: { orderBy: { createdAt: "desc" } },
      challans: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!customer) throw ApiError.notFound("Customer not found");
  return customer;
}

export async function createCustomer(data: Prisma.CustomerCreateInput, createdById?: string) {
  return prisma.customer.create({
    data: {
      ...data,
      ...(createdById ? { createdBy: { connect: { id: createdById } } } : {}),
    },
  });
}

export async function updateCustomer(id: string, data: Prisma.CustomerUpdateInput) {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Customer not found");

  return prisma.customer.update({ where: { id }, data });
}

export async function addFollowUpNote(customerId: string, note: string, userId?: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw ApiError.notFound("Customer not found");

  return prisma.followUpNote.create({
    data: {
      customerId,
      note,
      ...(userId ? { userId } : {}),
    },
  });
}

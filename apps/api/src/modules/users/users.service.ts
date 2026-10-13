import { Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { DbService } from "../../db/db.service";
import { addresses, users, type AddressRow, type UserRow } from "../../db/schema";

@Injectable()
export class UsersService {
  constructor(private readonly db: DbService) {}

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string; location?: string; sellerName?: string },
  ): Promise<UserRow> {
    const [updated] = await this.db.db
      .update(users)
      .set({
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone.trim() || null } : {}),
        ...(data.location !== undefined ? { location: data.location.trim() || null } : {}),
        ...(data.sellerName !== undefined ? { sellerName: data.sellerName.trim() || null } : {}),
      })
      .where(eq(users.id, userId))
      .returning();
    if (!updated) {
      throw new NotFoundException("El usuario no existe");
    }
    return updated;
  }

  async listAddresses(userId: string): Promise<AddressRow[]> {
    return this.db.db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
  }

  async createAddress(
    userId: string,
    data: Omit<AddressRow, "id" | "userId" | "createdAt">,
  ): Promise<AddressRow> {
    if (data.isDefault) {
      await this.db.db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
    }
    const [created] = await this.db.db
      .insert(addresses)
      .values({ ...data, userId })
      .returning();
    return created;
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const [address] = await this.db.db
      .select({ id: addresses.id })
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .limit(1);
    if (!address) {
      throw new NotFoundException("La dirección no existe");
    }
    await this.db.db.delete(addresses).where(eq(addresses.id, addressId));
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<AddressRow> {
    const [address] = await this.db.db
      .select({ id: addresses.id })
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .limit(1);
    if (!address) {
      throw new NotFoundException("La dirección no existe");
    }
    await this.db.db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
    const [updated] = await this.db.db
      .update(addresses)
      .set({ isDefault: true })
      .where(eq(addresses.id, addressId))
      .returning();
    return updated;
  }
}

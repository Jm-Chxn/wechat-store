import { describe, expect, it } from "vitest";
import {
  computeStats,
  fetchServerCart,
  getOrder,
  getProduct,
  listActivities,
  listOrders,
  listProducts,
  listUsers,
  placeOrder,
} from "@/lib/repository";

describe("repository (HTTP via MSW)", () => {
  it("listProducts maps backend DTOs into frontend Product shape", async () => {
    const products = await listProducts();
    expect(products).toHaveLength(1);
    const [p] = products;
    expect(p.slug).toBe("longjing-tea");
    expect(p.descriptionEn).toBe("Fragrant green tea.");
    expect(p.dietaryTags).toEqual(["VEGAN"]);
    expect(p.imageUrl).toBe("/img/tea.jpg");
  });

  it("getProduct delegates to /products/{slug}", async () => {
    const p = await getProduct("longjing-tea");
    expect(p?.id).toBe("p1");
  });

  it("listOrders + getOrder map cents/totals correctly", async () => {
    const orders = await listOrders("u1");
    expect(orders).toHaveLength(1);
    expect(orders[0].subtotal).toBe(9000);
    expect(orders[0].total).toBe(9500);
    expect(orders[0].items[0].unitPrice).toBe(4500);

    const single = await getOrder("o1");
    expect(single?.id).toBe("o1");
  });

  it("placeOrder POSTs and returns mapped order", async () => {
    const order = await placeOrder({
      userOpenid: "u1",
      items: [{ productId: "p1", quantity: 2 }],
      pickupCommunityEn: "Riverside",
      pickupCommunityZh: "河滨",
    });
    expect(order.status).toBe("PENDING");
    expect(order.items[0].quantity).toBe(2);
  });

  it("fetchServerCart returns the cart", async () => {
    const cart = await fetchServerCart();
    expect(cart?.cartId).toBe("c1");
    expect(cart?.items[0].productId).toBe("p1");
  });

  it("listActivities and listUsers tolerate empty arrays", async () => {
    expect(await listActivities()).toEqual([]);
    expect(await listUsers()).toEqual([]);
  });

  it("computeStats returns admin stats", async () => {
    const s = await computeStats();
    expect(s.totalUsers).toBe(1);
    expect(s.ordersToday).toBe(1);
  });
});

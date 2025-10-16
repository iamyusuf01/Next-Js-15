import { TrendingUp } from "lucide-react";
import Sidebar from "../components/sidebar";
import { getCurrentUser } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import ProductChart from "../components/product-chart";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user.id;

  const [totalProduct, lowStack, allProduct] = await Promise.all([
    prisma.product.count({ where: { userId } }),
    prisma.product.count({
      where: { userId, lowStockAt: { not: null }, quantity: { lte: 5 } },
    }),
    prisma.product.findMany({
      where: { userId },
      select: { price: true, quantity: true, createdAt: true },
    }),
  ]);

  const totalValue = allProduct.reduce(
    (sum, product) => sum + Number(product.price) * Number(product.quantity),
    0
  );

  const inStockCount = allProduct.filter((p) => Number(p.quantity) > 5).length;
  const lowStockCount = allProduct.filter(
    (p) => Number(p.quantity) <= 5 && Number(p.quantity) >= 1
  ).length;
  const outOfStockCount = allProduct.filter(
    (p) => Number(p.quantity) > 5
  ).length;

  const inStockPercentage =
    totalProduct > 0 ? Math.round((inStockCount / totalProduct) * 100) : 0;
  const lowStockPercentage =
    totalProduct > 0 ? Math.round((lowStockCount / totalProduct) * 100) : 0;
  const outOfStockPercentage =
    totalProduct > 0 ? Math.round((outOfStockCount / totalProduct) * 100) : 0;

  const recent = await prisma.product.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const now = new Date();

  const weeklyProductData = [];

  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 1 * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekLable = `${String(weekStart.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(weekStart.getDate() + 1).padStart(2, "0")}`;

    const weekProducts = allProduct.filter((product) => {
      const productDate = new Date(product.createdAt);
      return productDate >= weekStart && productDate <= weekEnd;
    });

    weeklyProductData.push({
      week: weekLable,
      product: weekProducts.length,
    });
  }

  console.log(totalValue);
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/dashboard" />
      <main className="ml-64 p-8">
        {/* {Header} */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Welcome back! Here is an overview of your inventory
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Key Matrics */}

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Key Matrics
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {totalProduct}
                </div>
                <div className="text-sm text-gray-600">Total Product</div>
                <div className="flex items-center justify-center mt-1">
                  <span className="text-sm text-green-600 ml-1">
                    {totalProduct}
                  </span>
                  <TrendingUp />
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  ${totalValue}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
                <div className="flex items-center justify-center mt-1">
                  <span className="text-sm text-green-600 ml-1">
                    ${Number(totalValue).toFixed(0)}
                  </span>
                  <TrendingUp />
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {lowStack}
                </div>
                <div className="text-sm text-gray-600">Low Stack</div>
                <div className="flex items-center justify-center mt-1">
                  <span className="text-sm text-green-600 ml-1">
                    {lowStack}
                  </span>
                  <TrendingUp />
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Over Time */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2>New product per week</h2>
            </div>
            <div className="h-48">
              <ProductChart data={weeklyProductData} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* {Stock Level} */}
          <div className="bg-white rounded-lg border border-gray200 p6">
            <div className="flex items-center justify-between m-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Stoke Levels
              </h2>
            </div>
            <div className="space-y-1">
              {recent.map((product, key) => {
                const stockLevel =
                  product.quantity === 0
                    ? 0
                    : product.quantity <= (product.lowStockAt || 5)
                    ? 1
                    : 2;
                const bgColor = ["bg-red-600", "bg-yellow-600", "bg-green-600"];
                const textColor = [
                  "text-red-600",
                  "text-yellow-600",
                  "text-green-600",
                ];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${bgColor[stockLevel]}`}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                    <div
                      className={`text-sm font-medium ${textColor[stockLevel]}`}
                    >
                      {product.quantity} Units
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Effinciency */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 ">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {" "}
                Efficiency
              </h2>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <div
                  className="absolute inset-0 rounded-full border-8 border-purple-600"
                  style={{
                    clipPath:
                      "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {inStockPercentage}%
                    </div>
                    <div className="text-sm text-gray-600">In Stock</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-2000" />
                  <span>In Stock ({inStockPercentage}%)</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-2000" />
                    <span>Low Stock ({lowStockPercentage}%)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-2000" />
                    <span>Out Stock ({outOfStockPercentage}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

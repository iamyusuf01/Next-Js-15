import { TrendingUp } from "lucide-react";
import Sidebar from "../components/sidebar";
import { getCurrentUser } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

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

  const recent = await prisma.product.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* {Stock Level} */}
          <div className="bg-white rounded-lg border border-gray200 p6">
            <div className="flex items-center justify-between mb-6">
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
                  <div key={key}>
                    <div>
                      <div className={`w-3 h-3 rounded-full ${bgColor}`}/>
                      <span>{product.name}</span>
                    </div>
                    <div>{product.quantity} Units</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

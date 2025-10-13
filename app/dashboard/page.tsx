import Sidebar from "../components/sidebar";
import { getCurrentUser } from "../lib/auth";
import { prisma } from "../lib/prisma";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user.id;

  const totalProduct = await prisma.product.count({ where: { userId } });
  console.log(totalProduct);
  
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
              <p className="text-sm to-gray-500">
                Welcome back! Here is an overview of your inventory
              </p>
            </div>
          </div>
        </div>

        {/* Key Matrics */}
      </main>
    </div>
  );
}

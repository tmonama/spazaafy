import React from 'react';
import { Link } from 'react-router-dom';
import { SpazaShop } from '../types';

interface ShopListItemAdminProps {
    shop: Omit<SpazaShop, 'distance'>;
}

const ShopListItemAdmin: React.FC<ShopListItemAdminProps> = ({ shop }) => {
    const getBusinessAge = (dateString: string) => {
        const now = new Date();
        const registeredDate = new Date(dateString);
        const diffInMonths = (now.getFullYear() - registeredDate.getFullYear()) * 12 + (now.getMonth() - registeredDate.getMonth());
        if (diffInMonths < 12) return `${diffInMonths} months`;
        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} year${diffInYears > 1 ? 's' : ''}`;
    }

    return (
        <Link to={`/admin/shops/${shop.id}`} className="block p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h4 className="font-bold text-lg text-primary dark:text-primary-light">{shop.shopName}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{shop.location.address}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Owner: {shop.firstName} {shop.lastName} ({shop.email})
                    </p>
                </div>
                <div className="mt-3 sm:mt-0 flex sm:flex-col sm:items-end space-x-4 sm:space-x-0 sm:space-y-1">
                    <div>
                    {shop.isVerified ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Verified
                        </span>
                    ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            Unverified
                        </span>
                    )}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                    Age: <span className="font-semibold">{getBusinessAge(shop.registeredAt)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ShopListItemAdmin;
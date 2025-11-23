import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    BuildingStorefrontIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    BuildingStorefrontIcon as BuildingStorefrontIconSolid,
    ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
    ChartBarIcon as ChartBarIconSolid,
    UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid';

const BottomNav = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Home', icon: HomeIcon, iconSolid: HomeIconSolid },
        { path: '/farm', label: 'Farm', icon: BuildingStorefrontIcon, iconSolid: BuildingStorefrontIconSolid },
        { path: '/tasks', label: 'Tasks', icon: ClipboardDocumentListIcon, iconSolid: ClipboardDocumentListIconSolid },
        { path: '/reports', label: 'Reports', icon: ChartBarIcon, iconSolid: ChartBarIconSolid },
        { path: '/profile', label: 'Profile', icon: UserCircleIcon, iconSolid: UserCircleIconSolid },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50 md:hidden"
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = active ? item.iconSolid : item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full touch-manipulation transition-colors ${active
                                    ? 'text-farm-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            aria-label={item.label}
                            aria-current={active ? 'page' : undefined}
                        >
                            <Icon className="h-6 w-6 mb-1" aria-hidden="true" />
                            <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;

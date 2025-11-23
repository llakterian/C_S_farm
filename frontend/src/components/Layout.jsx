import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
    Bars3Icon,
    HomeIcon,
    UsersIcon,
    XMarkIcon,
    ClipboardDocumentListIcon,
    BanknotesIcon,
    TruckIcon,
    BeakerIcon,
    CloudIcon,
    BellAlertIcon
} from '@heroicons/react/24/outline'
import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Tea Plucking', href: '/plucking', icon: ClipboardDocumentListIcon },
    { name: 'Dairy', href: '/dairy', icon: BeakerIcon },
    { name: 'Livestock', href: '/livestock', icon: UsersIcon },
    { name: 'Poultry', href: '/poultry', icon: CloudIcon },
    { name: 'Avocado', href: '/avocado', icon: CloudIcon },
    { name: 'Labor Log', href: '/labor', icon: UsersIcon },
    { name: 'Payroll', href: '/payroll', icon: BanknotesIcon },
    { name: 'Expenses', href: '/expenses', icon: BanknotesIcon },
    { name: 'Reports', href: '/reports', icon: ClipboardDocumentListIcon },
    { name: 'Notifications', href: '/notifications', icon: BellAlertIcon },
    { name: 'Workers', href: '/workers', icon: UsersIcon },
    { name: 'Factories', href: '/factories', icon: TruckIcon },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()
    const logout = useAuthStore((state) => state.logout)

    return (
        <>
            <div>
                <Transition.Root show={sidebarOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-900/80" />
                        </Transition.Child>

                        <div className="fixed inset-0 flex">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-in-out duration-300"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                        leave="ease-in-out duration-300"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                            <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                                                <span className="sr-only">Close sidebar</span>
                                                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </Transition.Child>
                                    {/* Sidebar component, swap this element with another sidebar if you like */}
                                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-farm-600 px-6 pb-4">
                                        <div className="flex h-16 shrink-0 items-center">
                                            <h1 className="text-white text-xl font-bold">C. Sambu Farm</h1>
                                        </div>
                                        <nav className="flex flex-1 flex-col">
                                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                                <li>
                                                    <ul role="list" className="-mx-2 space-y-1">
                                                        {navigation.map((item) => (
                                                            <li key={item.name}>
                                                                <Link
                                                                    to={item.href}
                                                                    className={classNames(
                                                                        location.pathname === item.href
                                                                            ? 'bg-farm-700 text-white'
                                                                            : 'text-farm-200 hover:text-white hover:bg-farm-700',
                                                                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                                                    )}
                                                                >
                                                                    <item.icon
                                                                        className={classNames(
                                                                            location.pathname === item.href ? 'text-white' : 'text-farm-200 group-hover:text-white',
                                                                            'h-6 w-6 shrink-0'
                                                                        )}
                                                                        aria-hidden="true"
                                                                    />
                                                                    {item.name}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </li>
                                                <li className="mt-auto">
                                                    <button
                                                        onClick={logout}
                                                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-farm-200 hover:bg-farm-700 hover:text-white"
                                                    >
                                                        <span className="truncate">Log out</span>
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition.Root>

                {/* Static sidebar for desktop */}
                <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-farm-600 px-6 pb-4">
                        <div className="flex h-16 shrink-0 items-center">
                            <h1 className="text-white text-xl font-bold">C. Sambu Farm</h1>
                        </div>
                        <nav className="flex flex-1 flex-col">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                <li>
                                    <ul role="list" className="-mx-2 space-y-1">
                                        {navigation.map((item) => (
                                            <li key={item.name}>
                                                <Link
                                                    to={item.href}
                                                    className={classNames(
                                                        location.pathname === item.href
                                                            ? 'bg-farm-700 text-white'
                                                            : 'text-farm-200 hover:text-white hover:bg-farm-700',
                                                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                                    )}
                                                >
                                                    <item.icon
                                                        className={classNames(
                                                            location.pathname === item.href ? 'text-white' : 'text-farm-200 group-hover:text-white',
                                                            'h-6 w-6 shrink-0'
                                                        )}
                                                        aria-hidden="true"
                                                    />
                                                    {item.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li className="mt-auto">
                                    <button
                                        onClick={logout}
                                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-farm-200 hover:bg-farm-700 hover:text-white"
                                    >
                                        <span className="truncate">Log out</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="lg:pl-72">
                    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        </button>

                        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                            <div className="flex flex-1"></div>
                        </div>
                    </div>

                    <main className="py-10">
                        <div className="px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}

import { useState, useEffect } from 'react'
import { dbService } from '../services/db'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'

const ROLES = ['Plucker', 'Dairy', 'Watchman', 'Supervisor', 'Casual']

export default function Workers() {
    const [workers, setWorkers] = useState([])
    const [newName, setNewName] = useState('')
    const [newPhone, setNewPhone] = useState('')
    const [newRole, setNewRole] = useState('Plucker')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingWorker, setEditingWorker] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    useEffect(() => {
        fetchWorkers()
    }, [])

    const fetchWorkers = async () => {
        const data = await dbService.getAll('workers')
        setWorkers(data)
    }

    const handleEdit = (worker) => {
        setEditingWorker(worker)
        setNewName(worker.name)
        setNewPhone(worker.phone)
        setNewRole(worker.role || 'Plucker')
        setIsModalOpen(true)
    }

    const handleDelete = async (workerId) => {
        await dbService.delete('workers', workerId)
        setDeleteConfirm(null)
        fetchWorkers()
    }

    const handleSaveWorker = async (e) => {
        e.preventDefault()
        if (editingWorker) {
            // Update existing worker
            await dbService.put('workers', {
                ...editingWorker,
                name: newName,
                phone: newPhone,
                role: newRole
            })
        } else {
            // Add new worker
            await dbService.add('workers', {
                name: newName,
                phone: newPhone,
                role: newRole
            })
        }
        setNewName('')
        setNewPhone('')
        setNewRole('Plucker')
        setIsModalOpen(false)
        setEditingWorker(null)
        fetchWorkers()
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Workers Management</CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">Manage your farm workers and their roles</p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingWorker(null);
                            setNewName('');
                            setNewPhone('');
                            setNewRole('Plucker');
                            setIsModalOpen(true);
                        }}
                    >
                        Add Worker
                    </Button>
                </CardHeader>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 text-sm font-semibold">Name</th>
                                    <th className="text-left p-4 text-sm font-semibold">Role</th>
                                    <th className="text-left p-4 text-sm font-semibold">Phone</th>
                                    <th className="text-left p-4 text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workers.map((worker) => (
                                    <tr key={worker.id} className="border-b">
                                        <td className="p-4 font-medium">{worker.name}</td>
                                        <td className="p-4">
                                            <Badge variant="secondary">
                                                {worker.role || 'Plucker'}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{worker.phone}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleEdit(worker)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm"
                                                    onClick={() => setDeleteConfirm(worker)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {isModalOpen && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-lg bg-background px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                            <h3 className="text-base font-semibold leading-6 text-foreground">{editingWorker ? 'Edit Worker' : 'Add Worker'}</h3>
                            <div className="mt-2 space-y-3">
                                <Input
                                    type="text"
                                    placeholder="Name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                                <select
                                    className="w-full"
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                >
                                    {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                                <Input
                                    type="text"
                                    placeholder="Phone"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                />
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                <Button
                                    type="button"
                                    onClick={handleSaveWorker}
                                >
                                    {editingWorker ? 'Save' : 'Add'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingWorker(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-lg bg-background px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <h3 className="text-base font-semibold leading-6 text-foreground">Delete Worker</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-muted-foreground">
                                            Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(deleteConfirm.id)}
                                >
                                    Delete
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteConfirm(null)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

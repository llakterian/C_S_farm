import React from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import EmptyState from '../components/EmptyState';

const TasksPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-farm-600" aria-hidden="true" />
                    Tasks
                </h1>
                <p className="mt-2 text-base text-gray-600">
                    Manage your daily farm tasks and schedules
                </p>
            </div>

            <EmptyState
                illustration="📋"
                title="No tasks yet"
                description="Start by creating your first task. You can schedule plucking, feeding, or any other farm activity."
                actionLabel="Create First Task"
                onAction={() => alert('Task creation coming soon!')}
            />
        </div>
    );
};

export default TasksPage;

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearch } from '@/components/layout/AppLayout';
import { AttendancePanel } from '@/components/attendance/AttendancePanel';
import { PaymentsPanel } from '@/components/payments/PaymentsPanel';
import { EventsPanel } from '@/components/events/EventsPanel';
import { GroupsPanel } from '@/components/groups/GroupsPanel';
import { TeachersPanel } from '@/components/teachers/TeachersPanel';
import { ExportsPanel } from '@/components/exports/ExportsPanel';
import { ActivityPanel } from '@/components/activity/ActivityPanel';
import ErrorBoundary from '@/components/layout/ErrorBoundary';

interface OperationsProps {
  searchQuery?: string;
}

export function Operations({ searchQuery: _searchQuery }: OperationsProps) {
  const { searchQuery } = useSearch();
  const [activeTab, setActiveTab] = useState('attendance');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Operations & Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage daily operations: attendance, payments, events, and more.</p>
        </div>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="mt-6">
            <ErrorBoundary label="Attendance panel crashed">
              <AttendancePanel />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <ErrorBoundary label="Payments panel crashed">
              <PaymentsPanel />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <ErrorBoundary label="Events panel crashed">
              <EventsPanel />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            <ErrorBoundary label="Groups panel crashed">
              <GroupsPanel />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="teachers" className="mt-6">
            <ErrorBoundary label="Teachers panel crashed">
              <TeachersPanel />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="exports" className="mt-6">
            <ErrorBoundary label="Exports panel crashed">
              <ExportsPanel />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <ErrorBoundary label="Activity log crashed">
              <ActivityPanel />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

export default Operations;

import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { notifyUser } from '@/lib/notifications'
import { eq, and } from 'drizzle-orm'
import { toISOString } from '@/lib/date-utils'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { approvedById, approvedByName } = await req.json()

    if (!approvedById) {
      return NextResponse.json({ success: false, error: 'Approver ID is required' }, { status: 400 })
    }

    // Get the task to approve
    const tasks = await db
      .select()
      .from(dbSchema.tasks)
      .where(eq(dbSchema.tasks.id, id))

    if (tasks.length === 0) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }

    const task = tasks[0]

    // Check if task is pending
    if (task.approvalStatus !== 'pending') {
      return NextResponse.json({ 
        success: false, 
        error: 'Task is not pending approval' 
      }, { status: 400 })
    }

    // Update task approval status
    await db
      .update(dbSchema.tasks)
      .set({
        approvalStatus: 'approved',
        approvedAt: new Date(),
        approvedById,
        rejectionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(dbSchema.tasks.id, id))

    // Get updated task
    const updatedTasks = await db
      .select()
      .from(dbSchema.tasks)
      .where(eq(dbSchema.tasks.id, id))

    const updatedTask = updatedTasks[0]

    // Send notifications
    try {
      // Notify the task creator
      await notifyUser({
        userId: task.createdById,
        type: 'task_approved',
        title: task.title,
        message: `Your task "${task.title}" has been approved by ${approvedByName || 'a project lead'}.`,
        relatedId: id,
        relatedType: 'task',
        topic: 'projectUpdates',
      })

      // Notify task assignees
      const assignees = await db
        .select({ userId: dbSchema.taskAssignees.userId })
        .from(dbSchema.taskAssignees)
        .where(eq(dbSchema.taskAssignees.taskId, id))

      const assigneeIds = assignees
        .map((row: any) => row.userId)
        .filter((uid: string) => uid !== task.createdById && uid !== approvedById)

      if (assigneeIds.length > 0) {
        await Promise.all(
          assigneeIds.map((uid: string) =>
            notifyUser({
              userId: uid,
              type: 'task_approved',
              title: task.title,
              message: `Task "${task.title}" has been approved and is ready to work on.`,
              relatedId: id,
              relatedType: 'task',
              topic: 'projectUpdates',
            })
          )
        )
      }
    } catch (notificationError) {
      console.warn('Failed to send approval notifications:', notificationError)
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: updatedTask.id,
        approvalStatus: updatedTask.approvalStatus,
        approvedAt: toISOString(updatedTask.approvedAt),
        approvedById: updatedTask.approvedById,
      }
    })

  } catch (error) {
    console.error('Task approval error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to approve task' 
    }, { status: 500 })
  }
}

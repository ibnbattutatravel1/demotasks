import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { notifyUser } from '@/lib/notifications'
import { eq } from 'drizzle-orm'
import { toISOString } from '@/lib/date-utils'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { approvedById, approvedByName, rejectionReason } = await req.json()

    if (!approvedById) {
      return NextResponse.json({ success: false, error: 'Rejecter ID is required' }, { status: 400 })
    }

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Rejection reason is required' 
      }, { status: 400 })
    }

    // Get the task to reject
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

    // Update task rejection status
    await db
      .update(dbSchema.tasks)
      .set({
        approvalStatus: 'rejected',
        approvedAt: new Date(),
        approvedById,
        rejectionReason: rejectionReason.trim(),
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
        type: 'task_rejected',
        title: task.title,
        message: `Your task "${task.title}" has been rejected by ${approvedByName || 'an admin'}. Reason: ${rejectionReason}`,
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
              type: 'task_rejected',
              title: task.title,
              message: `Task "${task.title}" has been rejected. Reason: ${rejectionReason}`,
              relatedId: id,
              relatedType: 'task',
              topic: 'projectUpdates',
            })
          )
        )
      }
    } catch (notificationError) {
      console.warn('Failed to send rejection notifications:', notificationError)
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: updatedTask.id,
        approvalStatus: updatedTask.approvalStatus,
        approvedAt: toISOString(updatedTask.approvedAt),
        approvedById: updatedTask.approvedById,
        rejectionReason: updatedTask.rejectionReason,
      }
    })

  } catch (error) {
    console.error('Task rejection error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to reject task' 
    }, { status: 500 })
  }
}

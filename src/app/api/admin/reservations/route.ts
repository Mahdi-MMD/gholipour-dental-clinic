import { NextResponse } from 'next/server';
import {
  getAllReservations,
  getReservationById,
  updateReservationStatus,
  deleteReservation,
} from '@/lib/reservationsStore';
import { verifyAdminSession } from '@/lib/adminAuth';

export async function GET(request: Request) {
  try {
    const session = verifyAdminSession(request);
    if (!session.authorized) {
      return NextResponse.json(
        { success: false, message: session.reason || 'دسترسی غیرمجاز.' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      const reservation = await getReservationById(id);
      if (!reservation) {
        return NextResponse.json(
          { success: false, message: 'نوبت مورد نظر یافت نشد.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, reservation });
    }

    const reservations = await getAllReservations();
    return NextResponse.json({ success: true, reservations });
  } catch (error) {
    console.error('Failed to get reservations:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت لیست نوبت‌ها' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = verifyAdminSession(request);
    if (!session.authorized) {
      return NextResponse.json(
        { success: false, message: session.reason || 'دسترسی غیرمجاز.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, isConfirmed } = body;

    if (!id || typeof isConfirmed !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'شناسه نوبت و وضعیت تایید الزامی است.' },
        { status: 400 }
      );
    }

    const updated = await updateReservationStatus(id, isConfirmed);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'نوبت مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, reservation: updated });
  } catch (error) {
    console.error('Failed to update reservation status:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در به‌روزرسانی وضعیت نوبت' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = verifyAdminSession(request);
    if (!session.authorized) {
      return NextResponse.json(
        { success: false, message: session.reason || 'دسترسی غیرمجاز.' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    let id = url.searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // query param was empty and body not provided or not JSON
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه نوبت جهت حذف الزامی است.' },
        { status: 400 }
      );
    }

    const success = await deleteReservation(id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'نوبت مورد نظر یافت نشد یا حذف ناموفق بود.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'نوبت با موفقیت حذف شد.' });
  } catch (error) {
    console.error('Failed to delete reservation:', error);
    return NextResponse.json({ success: false, message: 'خطا در حذف نوبت' }, { status: 500 });
  }
}

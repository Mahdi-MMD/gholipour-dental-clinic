import { NextResponse } from 'next/server';
import { addReservation, hasActiveReservationInLast24Hours } from '@/lib/reservationsStore';
import {
  validate_persian_name,
  normalize_and_validate_iran_phone,
  ALREADY_RESERVED_MESSAGE,
} from '@/lib/reservationValidators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, service, visitedBefore, proposedDate, notes } = body;

    // 1. Patient Name Validation
    const nameValidation = validate_persian_name(name);
    if (!nameValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: nameValidation.error || 'لطفاً نام و نام خانوادگی را به درستی وارد نمایید.',
        },
        { status: 400 }
      );
    }

    // 2. Phone Number Validation & Normalization
    const phoneValidation = normalize_and_validate_iran_phone(phone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: phoneValidation.error || 'لطفاً شماره تماس را به درستی وارد نمایید.',
        },
        { status: 400 }
      );
    }

    // 3. Service Validation
    if (!service || typeof service !== 'string' || !service.trim()) {
      return NextResponse.json(
        { success: false, message: 'لطفاً خدمت مورد نظر را مشخص نمایید.' },
        { status: 400 }
      );
    }

    // 4. Booking Frequency & User Eligibility (1 active reservation per 24 hours per phone)
    const isAlreadyBooked = await hasActiveReservationInLast24Hours(
      phoneValidation.normalizedPhone
    );
    if (isAlreadyBooked) {
      return NextResponse.json(
        {
          success: false,
          code: 'ALREADY_RESERVED_MESSAGE',
          message: ALREADY_RESERVED_MESSAGE,
        },
        { status: 429 }
      );
    }

    const createdReservation = await addReservation({
      patientName: name.trim(),
      phone: phoneValidation.normalizedPhone,
      service,
      visitedBefore: visitedBefore === 'yes' ? 'yes' : visitedBefore === 'no' ? 'no' : null,
      proposedDate: proposedDate || '',
      notes: notes || '',
    });

    return NextResponse.json({
      success: true,
      message: 'درخواست نوبت شما با موفقیت ثبت شد.',
      reservation: createdReservation,
    });
  } catch (err) {
    console.error('Error creating reservation:', err);
    return NextResponse.json(
      { success: false, message: 'خطا در ثبت نوبت. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}

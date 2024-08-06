import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db_connect_util';
import  { PropertyService } from '@/services/property_service';
import { authMiddleware } from '@/middlewares/auth_middleware';
import { ExtendedNextRequest } from '@/types/extended_next_request';
import { validateModelData } from '@/utils/validation_util';

export async function POST(req: ExtendedNextRequest) {
  await dbConnect();
  const property_service=new PropertyService()

  const isAuthenticated = await authMiddleware(req);

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user_id = req.user?.id; // Extract user ID from authenticated user

    if (!user_id) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    } 
    
    

    const propertyData = { 
      ...await req.json(), // req.body is not valid in Next.js API routes, use req.json() instead
      user_id: user_id, // Attach user ID to property data
    };

    // check if user input data correct and data type

    const modelName = 'Property'; 
    const validationError = await validateModelData(modelName, propertyData);

    if (validationError) {
      return NextResponse.json({
        error: 'Bad Request',
        message: validationError,
      }, { status: 400 });
    }

    const property = await property_service.addNewProperty(propertyData); // Save property to database
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

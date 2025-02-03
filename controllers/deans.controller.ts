import { Request, Response, NextFunction } from 'express';
import { getDeansFunc, insertDeansFunc, updateDeansFunc, deleteDeansFunc, assignDeansFunc, getAssignDeansFunc, deleteAssignDeansFunc, getDeansById, findDeansByName } from '../services/deans.services';
import { deansValidation, handleValidationError } from '../util/validation';


export const getDeans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const data = await getDeansFunc();
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

export const insertDeans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const body = req.body;
  try {
    const { error, value } = deansValidation.insert(body);
    if (error) {
      next(error)
    }

    const existingDeans = await findDeansByName(value.first_name, value.last_name, value.middle_name);
    if (existingDeans) {
      return res.status(409).json({ message: "Deans already exists" });
    }

    const response = await insertDeansFunc(value);
    return res.status(201).json({
      message: 'Dean created successfully',
      data: response,
    });
  } catch (err) {
    next(err);
  }
};

export const updatedDeans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id;
  const body = req.body;
  try {
    const { error, value } = deansValidation.update(body);
    if (error) {
      next(error)
    }

    const existingDeans = await getDeansById(Number(req.params.id));
    if (!existingDeans) {
      return res.status(404).json({ message: "Deans not found" });
    }

    if (
      value.first_name !== existingDeans.first_name &&
      value.last_name !== existingDeans.last_name &&
      value.middle_name !== existingDeans.middle_name
    ) {
      const existingDeans = await findDeansByName(value.first_name, value.last_name, value.middle_name);
      if (existingDeans) {
        return res.status(409).json({ message: "Deans already exists" });
      }
    }

    const response = await updateDeansFunc(id, value);
    return res.status(200).json({
      message: 'Deans updated successfully',
      data: response,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteDeans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id;
  try {
    await deleteDeansFunc(id);
    return res.status(201).json({
      message: 'Dean deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const assignDeans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const body = req.body;
  try {
    const response = await assignDeansFunc(body);
    return res.status(201).json({
      message: 'Successfully assigned course',
      data: response,
    });
  } catch (err) {
    next(err)
  }
};

export const getAssignDeans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id;
  try {
    const data = await getAssignDeansFunc(id);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

export const deleteAssignDeans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const deansId = req.params.deansId;
  const courseId = req.params.courseId;
  try {
    const response = await deleteAssignDeansFunc(deansId, courseId);
    return res.status(200).json({
      message: 'Deleted successfully',
      data: response,
    });
  } catch (err) {
    next(err)
  }
};
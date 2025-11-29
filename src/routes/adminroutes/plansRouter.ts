import { Router } from "express";
import { addplan } from "../../adminController/plansController";
import { showplan } from "../../adminController/plansController";
import { updateplan } from "../../adminController/plansController";
import { deleteplan } from "../../adminController/plansController";
import { verifyAdmin } from "../../middlewares/verifyAdmin";
export const plansRouter = Router();


/**
 * @swagger
 * tags:
 *   name: AdminPlans
 *   description: Admin plan management (CRUD)
 */

/**
 * @swagger
 * /admin/plans:
 *   post:
 *     summary: Create a new subscription plan
 *     description: Adds a new plan to the system.
 *     tags: [AdminPlans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - duration
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Plan"
 *               price:
 *                 type: number
 *                 example: 499
 *               duration:
 *                 type: number
 *                 example: 30
 *     responses:
 *       201:
 *         description: Plan created successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized (Admin only)
 *       500:
 *         description: Server error
 */
plansRouter.post("/", verifyAdmin, addplan);

/**
 * @swagger
 * /admin/plans:
 *   get:
 *     summary: Get all subscription plans
 *     description: Returns all plans created by admin.
 *     tags: [AdminPlans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
plansRouter.get("/", showplan);

/**
 * @swagger
 * /admin/plans/{id}:
 *   put:
 *     summary: Update an existing plan
 *     description: Updates name, price, or duration of a plan.
 *     tags: [AdminPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Premium Plan"
 *               price:
 *                 type: number
 *                 example: 599
 *               duration:
 *                 type: number
 *                 example: 45
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       400:
 *         description: Invalid update data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
plansRouter.put("/:id", verifyAdmin, updateplan);

/**
 * @swagger
 * /admin/plans/{id}:
 *   delete:
 *     summary: Delete a subscription plan
 *     description: Removes a plan based on ID.
 *     tags: [AdminPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
plansRouter.delete("/:id", verifyAdmin, deleteplan);

                                                                                                      
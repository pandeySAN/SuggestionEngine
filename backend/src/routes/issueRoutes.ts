import { Router } from 'express';
import { body } from 'express-validator';
import issueController from '../controllers/issueController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { upload } from '../middleware/upload';
import { suggestionLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/',
  authenticate,
  upload.array('images', 5),
  validate([
    body('description').notEmpty().withMessage('Description is required'),
  ]),
  suggestionLimiter,
  issueController.createIssue
);

router.get('/', authenticate, issueController.listIssues);

router.get('/:id', authenticate, issueController.getIssue);

router.patch(
  '/:id/status',
  authenticate,
  validate([
    body('status')
      .isIn(['open', 'in_progress', 'resolved', 'closed'])
      .withMessage('Invalid status'),
  ]),
  issueController.updateStatus
);

router.post(
  '/:issueId/suggestions/:suggestionId/select',
  authenticate,
  issueController.selectSuggestion
);

export default router;

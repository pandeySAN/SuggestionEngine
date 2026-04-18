import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import issueService from '../services/issue/issueService';

export class IssueController {
  async createIssue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const images = req.files ? (req.files as Express.Multer.File[]).map(f => f.path) : [];
      
      // Parse location if it's a string (from form-data)
      let location = req.body.location;
      if (typeof location === 'string') {
        try {
          location = JSON.parse(location);
        } catch (e) {
          location = undefined;
        }
      }

      const issueData = {
        description: req.body.description,
        category: req.body.category,
        urgency: req.body.urgency,
        images,
        location,
      };

      const issue = await issueService.createIssue(req.user!.id, issueData);

      res.status(201).json({
        status: 'success',
        message: 'Issue created successfully. AI suggestions will be generated shortly.',
        data: issue,
      });
    } catch (error) {
      next(error);
    }
  }

  async getIssue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await issueService.getIssue(req.params.id);

      res.status(200).json({
        status: 'success',
        data: issue,
      });
    } catch (error) {
      next(error);
    }
  }

  async listIssues(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        category: req.query.category as string,
        urgency: req.query.urgency as string,
        userId: req.query.userId as string,
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0,
      };

      const issues = await issueService.listIssues(filters);

      res.status(200).json({
        status: 'success',
        data: issues,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await issueService.updateIssueStatus(
        req.params.id,
        req.body.status,
        req.user!.id
      );

      res.status(200).json({
        status: 'success',
        data: issue,
      });
    } catch (error) {
      next(error);
    }
  }

  async selectSuggestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await issueService.selectSuggestion(
        req.params.issueId,
        req.params.suggestionId,
        req.user!.id
      );

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new IssueController();
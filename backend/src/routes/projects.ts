import Router from '@koa/router'
import { Project } from '../database';

const router = new Router({
  prefix: '/api/projects',
});

// Get all projects
router.get('/', async (ctx) => {
  try {
    const projects = await Project.findAll({
      order: [['order', 'ASC']],
    });
    ctx.body = projects;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch projects' };
  }
});

// Get single project
router.get('/:id', async (ctx) => {
  try {
    const project = await Project.findByPk(ctx.params.id);
    if (!project) {
      ctx.status = 404;
      ctx.body = { error: 'Project not found' };
      return;
    }
    ctx.body = project;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch project' };
  }
});

// Create project (admin only - simplified for demo)
router.post('/', async (ctx) => {
  try {
    const project = await Project.create(ctx.request.body);
    ctx.body = project;
    ctx.status = 201;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: 'Failed to create project' };
  }
});

// Update project
router.put('/:id', async (ctx) => {
  try {
    const project = await Project.findByPk(ctx.params.id);
    if (!project) {
      ctx.status = 404;
      ctx.body = { error: 'Project not found' };
      return;
    }
    await project.update(ctx.request.body);
    ctx.body = project;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: 'Failed to update project' };
  }
});

// Delete project
router.delete('/:id', async (ctx) => {
  try {
    const project = await Project.findByPk(ctx.params.id);
    if (!project) {
      ctx.status = 404;
      ctx.body = { error: 'Project not found' };
      return;
    }
    await project.destroy();
    ctx.status = 204;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: 'Failed to delete project' };
  }
});

export default router;

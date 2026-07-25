import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Criar tarefa' })
  async create(@Req() req: any, @Body() body: any) {
    return this.tasksService.create(req.tenant.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tarefas' })
  async findAll(
    @Req() req: any,
    @Query('assignee') assignee?: string,
    @Query('status') status?: string,
    @Query('leadId') leadId?: string,
  ) {
    return this.tasksService.findAll(req.tenant.id, { assignee, status, leadId });
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Próximas tarefas (7 dias)' })
  async getUpcoming(@Req() req: any, @Query('days') days?: number) {
    return this.tasksService.getUpcoming(req.tenant.id, days || 7);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tarefa' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.tasksService.findOne(req.tenant.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar tarefa' })
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(req.tenant.id, id, body);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Completar tarefa' })
  async complete(@Req() req: any, @Param('id') id: string) {
    return this.tasksService.complete(req.tenant.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar tarefa' })
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.tasksService.delete(req.tenant.id, id);
  }
}